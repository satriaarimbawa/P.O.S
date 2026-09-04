export const IPC_CHANNELS = {
  // Menu
  MENU_GET_CATEGORIES: 'menu:get-categories',
  MENU_GET_PRODUCTS: 'menu:get-products',
  MENU_GET_MODIFIERS: 'menu:get-modifiers',
  
  // Orders
  ORDER_CREATE: 'order:create',
  ORDER_UPDATE_STATUS: 'order:update-status',
  ORDER_VOID: 'order:void',
  ORDER_GET_BY_ID: 'order:get-by-id',
  ORDER_GET_LIST: 'order:get-list',
  
  // Payments
  PAYMENT_PROCESS: 'payment:process',
  
  // Hardware
  PRINTER_PRINT_RECEIPT: 'printer:print-receipt',
  PRINTER_OPEN_DRAWER: 'printer:open-drawer',
  PRINTER_TEST: 'printer:test',
  SCANNER_DATA: 'scanner:data', // push event
  
  // Shift
  SHIFT_OPEN: 'shift:open',
  SHIFT_CLOSE: 'shift:close',
  SHIFT_GET_CURRENT: 'shift:get-current',
  
  // Auth
  AUTH_LOGIN: 'auth:login',
  AUTH_LOGOUT: 'auth:logout',
  
  // Reports
  REPORT_DAILY_SUMMARY: 'report:daily-summary',
  REPORT_PRODUCT_MIX: 'report:product-mix',
  REPORT_HOURLY_SALES: 'report:hourly-sales',
  REPORT_EXPORT_PDF: 'report:export-pdf',
  
  // Settings
  SETTINGS_GET: 'settings:get',
  SETTINGS_UPDATE: 'settings:update',
  
  // License
  LICENSE_ACTIVATE: 'license:activate',
  LICENSE_STATUS: 'license:status',
} as const;
