export interface Order {
  id: string; // UUIDv7
  invoiceNo: string; // e.g. JKT01-R01-260904-0042
  outletId: string;
  registerId: string;
  shiftId: string;
  tableNo: string | null;
  orderType: OrderType;
  status: OrderStatus;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  total: number;
  customerName: string | null;
  createdAt: string;
  completedAt: string | null;
}

export type OrderType = 'DINE_IN' | 'TAKE_AWAY' | 'DELIVERY';
export type OrderStatus = 'DRAFT' | 'PENDING' | 'IN_PROGRESS' | 'READY' | 'COMPLETED' | 'VOIDED';

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  qty: number;
  unitPrice: number;
  modifiers: OrderItemModifier[];
  notes: string | null;
  station: string;
}

export interface OrderItemModifier {
  name: string;
  optionName: string;
  priceAdd: number;
}

export interface Payment {
  id: string;
  orderId: string;
  method: PaymentMethod;
  amount: number;
  referenceNo: string | null;
  status: PaymentStatus;
  paidAt: string | null;
}

export type PaymentMethod = 'CASH' | 'QRIS' | 'DEBIT' | 'CREDIT' | 'EWALLET' | 'TRANSFER';
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
