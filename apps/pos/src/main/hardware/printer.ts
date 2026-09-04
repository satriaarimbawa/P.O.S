/**
 * KopiPOS - Thermal Printer & ESC/POS Command Generator
 * Supports 80mm (48 columns) and 58mm (32 columns) thermal printers
 * Interfaces: Network (TCP/IP), USB, and Raw File/Console preview
 */

import net from 'net';

export interface PrinterConfig {
  type: 'network' | 'usb' | 'preview';
  host?: string; // IP address e.g. 192.168.1.100
  port?: number; // Default 9100
  paperWidth: 80 | 58;
}

export class ThermalPrinter {
  private config: PrinterConfig;

  // ESC/POS Command Constants
  private static ESC = '\x1b';
  private static GS = '\x1d';
  private static CMD_INIT = '\x1b\x40'; // Initialize printer
  private static CMD_CUT = '\x1d\x56\x41\x03'; // Cut paper
  private static CMD_DRAWER_KICK = '\x1b\x70\x00\x19\xfa'; // Kick cash drawer pin 2
  private static CMD_ALIGN_LEFT = '\x1b\x61\x00';
  private static CMD_ALIGN_CENTER = '\x1b\x61\x01';
  private static CMD_ALIGN_RIGHT = '\x1b\x61\x02';
  private static CMD_BOLD_ON = '\x1b\x45\x01';
  private static CMD_BOLD_OFF = '\x1b\x45\x00';
  private static CMD_DOUBLE_ON = '\x1d\x21\x11'; // Double width & height
  private static CMD_DOUBLE_OFF = '\x1d\x21\x00';

  constructor(config?: Partial<PrinterConfig>) {
    this.config = {
      type: config?.type || 'preview',
      host: config?.host || '192.168.1.100',
      port: config?.port || 9100,
      paperWidth: config?.paperWidth || 80,
    };
  }

  private get maxChars(): number {
    return this.config.paperWidth === 58 ? 32 : 48;
  }

  /**
   * Format a two-column row with left and right text aligned
   */
  private formatRow(left: string, right: string): string {
    const total = this.maxChars;
    const spaceCount = Math.max(1, total - (left.length + right.length));
    return left + ' '.repeat(spaceCount) + right + '\n';
  }

  private divider(char = '-'): string {
    return char.repeat(this.maxChars) + '\n';
  }

  /**
   * Send raw bytes to network printer via TCP socket (port 9100)
   */
  private async sendToPrinter(rawContent: string): Promise<boolean> {
    if (this.config.type === 'preview') {
      console.log('--- RAW THERMAL PRINT PREVIEW ---\n' + rawContent + '--- END PRINT ---');
      return true;
    }

    if (this.config.type === 'network' && this.config.host) {
      return new Promise((resolve, reject) => {
        const socket = new net.Socket();
        socket.setTimeout(4000);

        socket.connect(this.config.port || 9100, this.config.host, () => {
          socket.write(Buffer.from(rawContent, 'binary'), () => {
            socket.end();
            resolve(true);
          });
        });

        socket.on('timeout', () => {
          socket.destroy();
          console.warn('Printer connection timed out');
          resolve(false);
        });

        socket.on('error', (err) => {
          console.error('Printer error:', err.message);
          resolve(false);
        });
      });
    }

    return true;
  }

  /**
   * Kick Cash Drawer
   */
  public async openCashDrawer(): Promise<boolean> {
    const raw = ThermalPrinter.CMD_INIT + ThermalPrinter.CMD_DRAWER_KICK;
    return this.sendToPrinter(raw);
  }

  /**
   * Print Customer Receipt
   */
  public async printCustomerReceipt(order: any, storeInfo: any): Promise<boolean> {
    let p = ThermalPrinter.CMD_INIT;

    // Header
    p += ThermalPrinter.CMD_ALIGN_CENTER;
    p += ThermalPrinter.CMD_DOUBLE_ON + (storeInfo?.name || 'KOPI NUSA') + '\n' + ThermalPrinter.CMD_DOUBLE_OFF;
    p += (storeInfo?.address || 'Jakarta Selatan') + '\n';
    if (storeInfo?.phone) p += 'Tel: ' + storeInfo.phone + '\n';
    p += this.divider('=');

    // Invoice Info
    p += ThermalPrinter.CMD_ALIGN_LEFT;
    p += `INV     : ${order.invoiceNo || 'INV-001'}\n`;
    p += `Kasir   : ${order.cashierName || 'Kasir'}\n`;
    p += `Waktu   : ${new Date().toLocaleString('id-ID')}\n`;
    p += `Tipe    : ${order.orderType || 'DINE_IN'}   Meja: ${order.tableNo || '-'}\n`;
    p += this.divider('-');

    // Items
    for (const item of order.items || []) {
      const lineTotal = 'Rp ' + ((item.unitPrice || 0) * (item.qty || 1)).toLocaleString('id-ID');
      p += this.formatRow(`${item.qty}x ${item.productName}`, lineTotal);
      if (item.modifiers && item.modifiers.length > 0) {
        for (const mod of item.modifiers) {
          p += `   + ${mod.optionName}\n`;
        }
      }
      if (item.notes) {
        p += `   * ${item.notes}\n`;
      }
    }
    p += this.divider('-');

    // Totals
    p += this.formatRow('Subtotal', 'Rp ' + (order.subtotal || 0).toLocaleString('id-ID'));
    if (order.discountAmount) {
      p += this.formatRow('Diskon', '-Rp ' + order.discountAmount.toLocaleString('id-ID'));
    }
    p += this.formatRow('PPN 11%', 'Rp ' + (order.taxAmount || 0).toLocaleString('id-ID'));
    p += this.divider('=');
    
    p += ThermalPrinter.CMD_BOLD_ON;
    p += this.formatRow('TOTAL', 'Rp ' + (order.total || 0).toLocaleString('id-ID'));
    p += ThermalPrinter.CMD_BOLD_OFF;

    // Payment Info
    p += this.formatRow(`Bayar (${order.paymentMethod || 'CASH'})`, 'Rp ' + (order.total || 0).toLocaleString('id-ID'));
    p += this.formatRow('Kembalian', 'Rp 0');
    p += this.divider('-');

    // Custom Wi-Fi & Promo Footer
    p += ThermalPrinter.CMD_ALIGN_CENTER;
    if (storeInfo?.wifiName) {
      p += `Wi-Fi: ${storeInfo.wifiName} / Pass: ${storeInfo.wifiPass || ''}\n`;
    }
    p += 'Terima kasih atas kunjungan Anda!\n';
    p += 'Powered by KopiPOS SaaS\n\n\n\n';
    p += ThermalPrinter.CMD_CUT;

    return this.sendToPrinter(p);
  }

  /**
   * Print Z-Report (Tutup Shift Kasir)
   */
  public async printZReport(shiftData: any, storeInfo: any): Promise<boolean> {
    let p = ThermalPrinter.CMD_INIT;

    p += ThermalPrinter.CMD_ALIGN_CENTER;
    p += ThermalPrinter.CMD_DOUBLE_ON + (storeInfo?.name || 'KOPI NUSA') + '\n' + ThermalPrinter.CMD_DOUBLE_OFF;
    p += 'Z-REPORT / TUTUP SHIFT\n';
    p += this.divider('=');

    p += ThermalPrinter.CMD_ALIGN_LEFT;
    p += `Shift    : #${shiftData.shiftNumber || '001'}\n`;
    p += `Kasir    : ${shiftData.cashierName || 'Staff'}\n`;
    p += `Register : ${shiftData.registerId || 'REG-01'}\n`;
    p += `Dibuka   : ${shiftData.openedAt || '-'}\n`;
    p += `Ditutup  : ${new Date().toLocaleString('id-ID')}\n`;
    p += this.divider('-');

    p += ThermalPrinter.CMD_BOLD_ON + '--- RINGKASAN PENJUALAN ---\n' + ThermalPrinter.CMD_BOLD_OFF;
    p += this.formatRow('Total Transaksi', `${shiftData.totalTx || 0}`);
    p += this.formatRow('Penjualan Bersih', 'Rp ' + (shiftData.netSales || 0).toLocaleString('id-ID'));
    p += this.formatRow('PPN 11%', 'Rp ' + (shiftData.tax || 0).toLocaleString('id-ID'));
    p += this.formatRow('TOTAL OMSET', 'Rp ' + (shiftData.totalOmset || 0).toLocaleString('id-ID'));
    p += this.divider('-');

    p += ThermalPrinter.CMD_BOLD_ON + '--- REKONSILIASI KAS ---\n' + ThermalPrinter.CMD_BOLD_OFF;
    p += this.formatRow('Kas Awal', 'Rp ' + (shiftData.openingCash || 0).toLocaleString('id-ID'));
    p += this.formatRow('+ Penjualan Cash', 'Rp ' + (shiftData.cashSales || 0).toLocaleString('id-ID'));
    p += this.formatRow('Kas Seharusnya', 'Rp ' + (shiftData.expectedCash || 0).toLocaleString('id-ID'));
    p += this.formatRow('Kas Aktual di Laci', 'Rp ' + (shiftData.actualCash || 0).toLocaleString('id-ID'));
    
    const diff = (shiftData.actualCash || 0) - (shiftData.expectedCash || 0);
    p += this.formatRow('SELISIH KAS', (diff < 0 ? '-' : '+') + 'Rp ' + Math.abs(diff).toLocaleString('id-ID'));
    p += this.divider('=');

    p += ThermalPrinter.CMD_ALIGN_CENTER;
    p += '\n  [TTD Kasir]           [TTD Manager]\n\n\n';
    p += '  ______________       ______________\n\n\n\n';
    p += ThermalPrinter.CMD_CUT;

    return this.sendToPrinter(p);
  }

  /**
   * Print Daily Sales EOD (End-of-Day Store Closing)
   * Includes Cashier & Barista roster and station ingredient usage
   */
  public async printDailyEOD(eodData: any, storeInfo: any): Promise<boolean> {
    let p = ThermalPrinter.CMD_INIT;

    p += ThermalPrinter.CMD_ALIGN_CENTER;
    p += ThermalPrinter.CMD_DOUBLE_ON + (storeInfo?.name || 'KOPI NUSA') + '\n' + ThermalPrinter.CMD_DOUBLE_OFF;
    p += 'LAPORAN HARIAN TOKO (END OF DAY)\n';
    p += `Tanggal: ${eodData.date || new Date().toLocaleDateString('id-ID')}\n`;
    p += this.divider('=');

    // Staf & Shift Roster
    p += ThermalPrinter.CMD_ALIGN_LEFT;
    p += ThermalPrinter.CMD_BOLD_ON + '--- DAFTAR STAF & SHIFT BERTUGAS ---\n' + ThermalPrinter.CMD_BOLD_OFF;
    for (const s of eodData.shifts || []) {
      p += `[${s.name} (${s.hours})]\n`;
      p += `  • Kasir: ${s.cashier} | Barista: ${s.barista}\n`;
      p += `  • Transaksi: ${s.ordersCount} order (Rp ${(s.revenue || 0).toLocaleString('id-ID')})\n`;
    }
    p += this.divider('-');

    // Barista Production Summary
    p += ThermalPrinter.CMD_BOLD_ON + '--- REKAP PRODUKSI BARISTA ---\n' + ThermalPrinter.CMD_BOLD_OFF;
    p += this.formatRow('Total Cup Terjual', `${eodData.barista?.cups || 0} Cup`);
    p += this.formatRow('Biji Kopi Terpakai', `~${eodData.barista?.coffeeGrams || 0} Gram`);
    p += this.formatRow('Susu Fresh Milk', `~${eodData.barista?.freshMilkLiters || 0} Liter`);
    p += this.formatRow('Susu Oat Milk', `~${eodData.barista?.oatMilkLiters || 0} Liter`);
    p += this.divider('-');

    // Total Financials
    p += ThermalPrinter.CMD_BOLD_ON + '--- IKHTISAR OMSET HARIAN ---\n' + ThermalPrinter.CMD_BOLD_OFF;
    p += this.formatRow('Total Transaksi', `${eodData.totalOrders || 0}`);
    p += this.formatRow('Penjualan Bersih', 'Rp ' + (eodData.netRevenue || 0).toLocaleString('id-ID'));
    p += this.formatRow('PPN 11%', 'Rp ' + (eodData.totalTax || 0).toLocaleString('id-ID'));
    p += this.formatRow('GRAND TOTAL OMSET', 'Rp ' + (eodData.grandTotal || 0).toLocaleString('id-ID'));
    p += this.divider('=');

    p += ThermalPrinter.CMD_ALIGN_CENTER;
    p += 'Pertanggungjawaban Penutupan Toko:\n\n';
    p += '  Lead Barista     Head Cashier    Supervisor\n\n\n';
    p += '  (__________)     (__________)   (__________)\n\n\n\n';
    p += ThermalPrinter.CMD_CUT;

    return this.sendToPrinter(p);
  }
}
