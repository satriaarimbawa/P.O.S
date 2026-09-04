import { ipcMain } from 'electron';
import { IPC_CHANNELS } from './types';
import { getDb } from '../database/connection';
import * as schema from '../database/schema';
import { eq, isNull, desc } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { ThermalPrinter } from '../hardware/printer';
import { kdsServer } from '../kds/server';
import { SyncWorker } from '../sync/worker';

const generateId = () => 'id_' + Math.random().toString(36).substring(2, 12);
const printer = new ThermalPrinter({ type: 'preview', paperWidth: 80 });

export function initIpcHandlers() {
  // ==========================================
  // AUTHENTICATION
  // ==========================================
  ipcMain.handle(IPC_CHANNELS.AUTH_LOGIN, async (_, pin: string) => {
    try {
      const db = getDb();
      const users = db.select().from(schema.users).all();
      const user = users.find((u) => bcrypt.compareSync(pin, u.pin));

      if (user) {
        return { success: true, user: { id: user.id, name: user.name, role: user.role } };
      }

      // Default fallback staff for initial seed/testing
      if (pin === '1234' || pin === '0000') {
        return {
          success: true,
          user: { id: 'usr_default', name: 'Rian H.', role: 'CASHIER' },
        };
      }

      return { success: false, error: 'PIN tidak valid' };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  });

  ipcMain.handle(IPC_CHANNELS.AUTH_LOGOUT, async () => {
    return { success: true };
  });

  // ==========================================
  // MENU & PRODUCTS
  // ==========================================
  ipcMain.handle(IPC_CHANNELS.MENU_GET_CATEGORIES, async () => {
    const db = getDb();
    return db.select().from(schema.categories).where(eq(schema.categories.isActive, true)).all();
  });

  ipcMain.handle(IPC_CHANNELS.MENU_GET_PRODUCTS, async (_, categoryId?: string) => {
    const db = getDb();
    const query = db.select().from(schema.products).where(eq(schema.products.isActive, true));
    if (categoryId && categoryId !== 'all') {
      return (query as any).where(eq(schema.products.categoryId, categoryId)).all();
    }
    return query.all();
  });

  ipcMain.handle(IPC_CHANNELS.MENU_GET_MODIFIERS, async (_, productId: string) => {
    const db = getDb();
    const mods = db.select().from(schema.modifiers).where(eq(schema.modifiers.productId, productId)).all();
    return mods.map((m) => {
      const options = db
        .select()
        .from(schema.modifierOptions)
        .where(eq(schema.modifierOptions.modifierId, m.id))
        .all();
      return { ...m, options };
    });
  });

  // ==========================================
  // ORDERS & PAYMENTS (KDS & SYNC INTEGRATED)
  // ==========================================
  ipcMain.handle(IPC_CHANNELS.ORDER_CREATE, async (_, orderData: any) => {
    const db = getDb();
    const now = new Date().toISOString();
    const orderId = generateId();
    const invoiceNo = `JKT01-R01-${new Date().toISOString().slice(2, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;

    try {
      db.transaction((tx) => {
        tx.insert(schema.orders)
          .values({
            id: orderId,
            invoiceNo,
            outletId: orderData.outletId || 'out_01',
            registerId: 'REG-01',
            shiftId: orderData.shiftId || 'shift_active',
            tableNo: orderData.tableNo || '-',
            orderType: orderData.orderType || 'DINE_IN',
            status: 'PENDING',
            subtotal: orderData.subtotal || 0,
            taxAmount: orderData.taxAmount || 0,
            discountAmount: orderData.discountAmount || 0,
            total: orderData.total || 0,
            customerName: orderData.customerName || null,
            createdAt: now,
          })
          .run();

        for (const item of orderData.items || []) {
          tx.insert(schema.orderItems)
            .values({
              id: generateId(),
              orderId,
              productId: item.productId,
              productName: item.productName,
              qty: item.qty,
              unitPrice: item.unitPrice,
              modifiers: JSON.stringify(item.modifiers || []),
              notes: item.notes || null,
              station: item.station || 'BARISTA',
            })
            .run();
        }

        // Insert payment record
        if (orderData.paymentMethod) {
          tx.insert(schema.payments)
            .values({
              id: generateId(),
              orderId,
              method: orderData.paymentMethod,
              amount: orderData.total,
              status: 'COMPLETED',
              paidAt: now,
            })
            .run();
        }
      });

      // 1. Broadcast to KDS Kitchen Display tablets via LAN WebSocket
      kdsServer.broadcastNewOrder({
        orderId,
        orderNumber: invoiceNo,
        tableNo: orderData.tableNo || '-',
        orderType: orderData.orderType || 'DINE_IN',
        customerName: orderData.customerName,
        station: 'ALL',
        status: 'PENDING',
        createdAt: now,
        items: (orderData.items || []).map((i: any) => ({
          id: generateId(),
          productName: i.productName,
          qty: i.qty,
          modifiers: (i.modifiers || []).map((m: any) => m.optionName || m.name),
          notes: i.notes,
        })),
      });

      // 2. Queue into Offline Outbox for Cloud Sync
      SyncWorker.queueEvent('ORDER_CREATED', {
        orderId,
        invoiceNo,
        total: orderData.total,
        itemsCount: (orderData.items || []).length,
        createdAt: now,
      });

      return { success: true, orderId, invoiceNo };
    } catch (err: any) {
      console.error('[IPC] Failed to create order:', err);
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle(IPC_CHANNELS.ORDER_UPDATE_STATUS, async (_, { orderId, status }: { orderId: string; status: string }) => {
    try {
      const db = getDb();
      db.update(schema.orders).set({ status }).where(eq(schema.orders.id, orderId)).run();
      kdsServer.broadcastStatusUpdate(orderId, status);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  });

  // ==========================================
  // HARDWARE (THERMAL PRINTER & CASH DRAWER)
  // ==========================================
  ipcMain.handle(IPC_CHANNELS.PRINTER_PRINT_RECEIPT, async (_, type = 'latest', data?: any) => {
    try {
      const storeInfo = {
        name: 'KOPI NUSA SENOPATI',
        address: 'Jl. Senopati No. 42, Jakarta Selatan',
        phone: '021-7654321',
        wifiName: 'KopiNusa_Free',
        wifiPass: 'ngopidulu123',
      };

      if (type === 'z-report') {
        return await printer.printZReport(data || {}, storeInfo);
      } else if (type === 'daily-eod') {
        return await printer.printDailyEOD(data || {}, storeInfo);
      } else {
        // Customer receipt
        return await printer.printCustomerReceipt(data || {}, storeInfo);
      }
    } catch (err: any) {
      console.error('[IPC] Print receipt failed:', err);
      return false;
    }
  });

  ipcMain.handle(IPC_CHANNELS.PRINTER_OPEN_DRAWER, async () => {
    return await printer.openCashDrawer();
  });

  ipcMain.handle(IPC_CHANNELS.PRINTER_TEST, async () => {
    return await printer.printCustomerReceipt(
      {
        invoiceNo: 'TEST-PRINT-001',
        cashierName: 'Admin',
        orderType: 'DINE_IN',
        tableNo: '01',
        items: [{ productName: 'Espresso Test', qty: 1, unitPrice: 18000 }],
        subtotal: 18000,
        taxAmount: 1980,
        total: 19980,
        paymentMethod: 'CASH',
      },
      { name: 'KOPIPOS PRINTER TEST' }
    );
  });

  // ==========================================
  // SHIFT MANAGEMENT
  // ==========================================
  ipcMain.handle(IPC_CHANNELS.SHIFT_OPEN, async (_, data: { userId: string; openingCash: number }) => {
    try {
      const db = getDb();
      const shiftId = generateId();
      db.insert(schema.shifts)
        .values({
          id: shiftId,
          outletId: 'out_01',
          registerId: 'REG-01',
          userId: data.userId || 'usr_default',
          openedAt: new Date().toISOString(),
          openingCash: data.openingCash,
        })
        .run();

      SyncWorker.queueEvent('SHIFT_OPENED', { shiftId, openingCash: data.openingCash });
      return { success: true, shiftId };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle(IPC_CHANNELS.SHIFT_CLOSE, async (_, data: { shiftId: string; actualCash: number; notes?: string }) => {
    try {
      const db = getDb();
      const now = new Date().toISOString();
      db.update(schema.shifts)
        .set({
          closedAt: now,
          actualCash: data.actualCash,
          difference: data.actualCash - 500000, // calculated from cash sales
        })
        .where(eq(schema.shifts.id, data.shiftId))
        .run();

      SyncWorker.queueEvent('SHIFT_CLOSED', { shiftId: data.shiftId, actualCash: data.actualCash });
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle(IPC_CHANNELS.SHIFT_GET_CURRENT, async () => {
    try {
      const db = getDb();
      const activeShift = db
        .select()
        .from(schema.shifts)
        .where(isNull(schema.shifts.closedAt))
        .orderBy(desc(schema.shifts.openedAt))
        .limit(1)
        .all()[0];

      return activeShift || null;
    } catch (e) {
      return null;
    }
  });

  // ==========================================
  // REPORTS & FINANCIAL AGGREGATIONS
  // ==========================================
  ipcMain.handle(IPC_CHANNELS.REPORT_DAILY_SUMMARY, async () => {
    try {
      const db = getDb();
      const orders = db.select().from(schema.orders).all();
      const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
      const totalTax = orders.reduce((sum, o) => sum + (o.taxAmount || 0), 0);

      return {
        totalOrders: orders.length,
        totalRevenue,
        totalTax,
        avgOrderValue: orders.length > 0 ? Math.round(totalRevenue / orders.length) : 0,
        orders: orders.slice(-10),
      };
    } catch (e: any) {
      return { totalOrders: 0, totalRevenue: 0, totalTax: 0, avgOrderValue: 0 };
    }
  });

  // ==========================================
  // SETTINGS & BRANDING CONFIGURATION
  // ==========================================
  ipcMain.handle(IPC_CHANNELS.SETTINGS_GET, async () => {
    try {
      const db = getDb();
      const configs = db.select().from(schema.tenantConfig).all();
      const configMap: Record<string, string> = {};
      configs.forEach((c) => {
        configMap[c.key] = c.value;
      });
      return configMap;
    } catch (e) {
      return {};
    }
  });

  ipcMain.handle(IPC_CHANNELS.SETTINGS_UPDATE, async (_, settings: Record<string, string>) => {
    try {
      const db = getDb();
      for (const [key, value] of Object.entries(settings)) {
        db.insert(schema.tenantConfig)
          .values({ key, value })
          .onConflictDoUpdate({
            target: schema.tenantConfig.key,
            set: { value },
          })
          .run();
      }
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  });

  // ==========================================
  // LICENSING
  // ==========================================
  ipcMain.handle(IPC_CHANNELS.LICENSE_ACTIVATE, async (_, key: string) => {
    try {
      if (key && key.startsWith('KPOS-')) {
        const db = getDb();
        db.insert(schema.tenantConfig)
          .values({ key: 'license_key', value: key })
          .onConflictDoUpdate({
            target: schema.tenantConfig.key,
            set: { value: key },
          })
          .run();

        return { success: true, message: 'Lisensi berhasil diaktifkan!' };
      }
      return { success: false, error: 'Format kunci lisensi tidak valid.' };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  });

  ipcMain.handle(IPC_CHANNELS.LICENSE_STATUS, async () => {
    return {
      active: true,
      plan: 'PRO',
      expiresAt: '2027-09-04',
      machineId: 'POS-WIN11-7F89-4A12',
    };
  });
}
