export interface DailySummary {
  date: string;
  outletId: string;
  totalOrders: number;
  totalRevenue: number;
  totalTax: number;
  totalDiscount: number;
  netRevenue: number;
  averageOrderValue: number;
  paymentBreakdown: PaymentBreakdownItem[];
  topProducts: ProductSalesItem[];
  hourlySales: HourlySalesItem[];
}

export interface PaymentBreakdownItem {
  method: string;
  count: number;
  total: number;
}

export interface ProductSalesItem {
  productId: string;
  productName: string;
  qtySold: number;
  revenue: number;
  costOfGoods: number;
  margin: number;
  marginPercent: number;
}

export interface HourlySalesItem {
  hour: number; // 0-23
  orderCount: number;
  revenue: number;
}

export interface FinancialInsight {
  type: 'positive' | 'warning' | 'suggestion';
  title: string;
  description: string;
  metric?: string;
  change?: number; // percentage
}
