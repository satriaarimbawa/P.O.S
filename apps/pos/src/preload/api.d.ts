export interface PosAPI {
  login: (pin: string) => Promise<any>;
  logout: () => Promise<any>;
  
  getCategories: () => Promise<any>;
  getProducts: (categoryId?: string) => Promise<any>;
  getModifiers: (productId: string) => Promise<any>;
  
  createOrder: (order: any) => Promise<any>;
  updateOrderStatus: (orderId: string, status: string) => Promise<any>;
  voidOrder: (orderId: string, reason: string) => Promise<any>;
  getOrder: (orderId: string) => Promise<any>;
  getOrders: (filters?: any) => Promise<any>;
  
  processPayment: (payment: any) => Promise<any>;
  
  printReceipt: (orderId: string) => Promise<any>;
  openCashDrawer: () => Promise<any>;
  testPrinter: () => Promise<any>;
  onBarcodeScanned: (callback: (barcode: string) => void) => () => void;
  
  openShift: (data: { userId: string; openingCash: number }) => Promise<any>;
  closeShift: (data: { closingCash: number; notes?: string }) => Promise<any>;
  getCurrentShift: () => Promise<any>;
  
  getDailySummary: (date: string) => Promise<any>;
  getProductMix: (dateRange: { from: string; to: string }) => Promise<any>;
  getHourlySales: (date: string) => Promise<any>;
  exportPDF: (reportType: string, params: any) => Promise<any>;
  
  getSettings: () => Promise<any>;
  updateSettings: (settings: any) => Promise<any>;
  
  activateLicense: (key: string) => Promise<any>;
  getLicenseStatus: () => Promise<any>;
}

declare global {
  interface Window {
    posAPI: PosAPI;
  }
}
