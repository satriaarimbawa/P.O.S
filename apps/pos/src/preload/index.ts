import { contextBridge, ipcRenderer } from 'electron';
import { IPC_CHANNELS } from '../main/ipc/types';

const posAPI = {
  // Auth
  login: (pin: string) => ipcRenderer.invoke(IPC_CHANNELS.AUTH_LOGIN, pin),
  logout: () => ipcRenderer.invoke(IPC_CHANNELS.AUTH_LOGOUT),

  // Menu
  getCategories: () => ipcRenderer.invoke(IPC_CHANNELS.MENU_GET_CATEGORIES),
  getProducts: (categoryId?: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.MENU_GET_PRODUCTS, categoryId),
  getModifiers: (productId: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.MENU_GET_MODIFIERS, productId),

  // Orders
  createOrder: (order: any) => ipcRenderer.invoke(IPC_CHANNELS.ORDER_CREATE, order),
  updateOrderStatus: (orderId: string, status: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.ORDER_UPDATE_STATUS, orderId, status),
  voidOrder: (orderId: string, reason: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.ORDER_VOID, orderId, reason),
  getOrder: (orderId: string) => ipcRenderer.invoke(IPC_CHANNELS.ORDER_GET_BY_ID, orderId),
  getOrders: (filters?: any) => ipcRenderer.invoke(IPC_CHANNELS.ORDER_GET_LIST, filters),

  // Payments
  processPayment: (payment: any) => ipcRenderer.invoke(IPC_CHANNELS.PAYMENT_PROCESS, payment),

  // Hardware
  printReceipt: (orderId: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.PRINTER_PRINT_RECEIPT, orderId),
  openCashDrawer: () => ipcRenderer.invoke(IPC_CHANNELS.PRINTER_OPEN_DRAWER),
  testPrinter: () => ipcRenderer.invoke(IPC_CHANNELS.PRINTER_TEST),
  onBarcodeScanned: (callback: (barcode: string) => void) => {
    const handler = (_: any, code: string) => callback(code);
    ipcRenderer.on(IPC_CHANNELS.SCANNER_DATA, handler);
    return () => ipcRenderer.removeListener(IPC_CHANNELS.SCANNER_DATA, handler);
  },

  // Shift
  openShift: (data: { userId: string; openingCash: number }) =>
    ipcRenderer.invoke(IPC_CHANNELS.SHIFT_OPEN, data),
  closeShift: (data: { closingCash: number; notes?: string }) =>
    ipcRenderer.invoke(IPC_CHANNELS.SHIFT_CLOSE, data),
  getCurrentShift: () => ipcRenderer.invoke(IPC_CHANNELS.SHIFT_GET_CURRENT),

  // Reports
  getDailySummary: (date: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.REPORT_DAILY_SUMMARY, date),
  getProductMix: (dateRange: { from: string; to: string }) =>
    ipcRenderer.invoke(IPC_CHANNELS.REPORT_PRODUCT_MIX, dateRange),
  getHourlySales: (date: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.REPORT_HOURLY_SALES, date),
  exportPDF: (reportType: string, params: any) =>
    ipcRenderer.invoke(IPC_CHANNELS.REPORT_EXPORT_PDF, reportType, params),

  // Settings
  getSettings: () => ipcRenderer.invoke(IPC_CHANNELS.SETTINGS_GET),
  updateSettings: (settings: any) =>
    ipcRenderer.invoke(IPC_CHANNELS.SETTINGS_UPDATE, settings),

  // License
  activateLicense: (key: string) => ipcRenderer.invoke(IPC_CHANNELS.LICENSE_ACTIVATE, key),
  getLicenseStatus: () => ipcRenderer.invoke(IPC_CHANNELS.LICENSE_STATUS),
};

contextBridge.exposeInMainWorld('posAPI', posAPI);
