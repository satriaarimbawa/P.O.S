import { create } from 'zustand';

export type OrderType = 'DINE_IN' | 'TAKE_AWAY' | 'DELIVERY';

export interface CartModifier {
  name: string;
  optionName: string;
  priceAdd: number;
}

export interface CartItem {
  id: string; // unique ID for cart item instance
  productId: string;
  productName: string;
  qty: number;
  unitPrice: number;
  modifiers: CartModifier[];
  notes?: string;
  station?: string;
}

interface CartState {
  items: CartItem[];
  orderType: OrderType;
  tableNo: string | null;
  customerName: string | null;
  deliveryPlatform: string | null;
  driverRefNo: string | null;
  packagingFee: number;
  isPackagingFeeApplied: boolean;
  discountAmount: number;
  itemsSubtotal: number;
  subtotal: number;
  taxAmount: number;
  total: number;
  itemCount: number;
  addItem: (item: Omit<CartItem, 'id'>) => void;
  removeItem: (id: string) => void;
  updateQty: (id: string, qty: number) => void;
  updateNotes: (id: string, notes: string) => void;
  setOrderType: (type: OrderType) => void;
  setTableNo: (tableNo: string | null) => void;
  setCustomerName: (name: string | null) => void;
  setDeliveryPlatform: (platform: string | null) => void;
  setDriverRefNo: (ref: string | null) => void;
  togglePackagingFee: (applied: boolean) => void;
  setDiscountAmount: (discount: number) => void;
  clearCart: () => void;
}

function calculateTotals(items: CartItem[], discountAmount: number, isPackagingFeeApplied: boolean, packagingFee: number) {
  const itemsSubtotal = items.reduce((sum, item) => {
    const modTotal = (item.modifiers || []).reduce((mSum, m) => mSum + (m.priceAdd || 0), 0);
    return sum + (item.unitPrice + modTotal) * item.qty;
  }, 0);

  const packFee = isPackagingFeeApplied ? packagingFee : 0;
  const subtotal = itemsSubtotal + packFee;
  const net = Math.max(0, subtotal - discountAmount);
  const taxAmount = Math.round(net * 0.11); // 11% PPN
  const total = net + taxAmount;
  const itemCount = items.reduce((sum, item) => sum + item.qty, 0);
  return { itemsSubtotal, subtotal, taxAmount, total, itemCount };
}

export const useCartStore = create<CartState>((set) => ({
  items: [],
  orderType: 'DINE_IN',
  tableNo: '04',
  customerName: null,
  deliveryPlatform: 'GoFood',
  driverRefNo: null,
  packagingFee: 2000,
  isPackagingFeeApplied: false,
  discountAmount: 0,
  itemsSubtotal: 0,
  subtotal: 0,
  taxAmount: 0,
  total: 0,
  itemCount: 0,
  
  addItem: (item) => set((state) => {
    const existingIndex = state.items.findIndex((i) => 
      i.productId === item.productId && 
      JSON.stringify(i.modifiers) === JSON.stringify(item.modifiers) &&
      (i.notes || '') === (item.notes || '')
    );
    
    let newItems: CartItem[];
    if (existingIndex > -1) {
      newItems = state.items.map((i, idx) => 
        idx === existingIndex ? { ...i, qty: i.qty + item.qty } : i
      );
    } else {
      newItems = [
        ...state.items,
        { ...item, id: 'item_' + Math.random().toString(36).substring(2, 9) }
      ];
    }
    
    const totals = calculateTotals(newItems, state.discountAmount, state.isPackagingFeeApplied, state.packagingFee);
    return { items: newItems, ...totals };
  }),
  
  removeItem: (id) => set((state) => {
    const newItems = state.items.filter((i) => i.id !== id);
    const totals = calculateTotals(newItems, state.discountAmount, state.isPackagingFeeApplied, state.packagingFee);
    return { items: newItems, ...totals };
  }),
  
  updateQty: (id, qty) => set((state) => {
    let newItems: CartItem[];
    if (qty <= 0) {
      newItems = state.items.filter((i) => i.id !== id);
    } else {
      newItems = state.items.map((i) => (i.id === id ? { ...i, qty } : i));
    }
    const totals = calculateTotals(newItems, state.discountAmount, state.isPackagingFeeApplied, state.packagingFee);
    return { items: newItems, ...totals };
  }),
  
  updateNotes: (id, notes) => set((state) => ({
    items: state.items.map((i) => (i.id === id ? { ...i, notes } : i))
  })),
  
  setOrderType: (orderType) => set((state) => {
    const shouldPack = orderType === 'TAKE_AWAY' || orderType === 'DELIVERY';
    const totals = calculateTotals(state.items, state.discountAmount, shouldPack, state.packagingFee);
    return { 
      orderType, 
      isPackagingFeeApplied: shouldPack,
      ...totals 
    };
  }),

  setTableNo: (tableNo) => set({ tableNo }),
  setCustomerName: (customerName) => set({ customerName }),
  setDeliveryPlatform: (deliveryPlatform) => set({ deliveryPlatform }),
  setDriverRefNo: (driverRefNo) => set({ driverRefNo }),
  
  togglePackagingFee: (isPackagingFeeApplied) => set((state) => {
    const totals = calculateTotals(state.items, state.discountAmount, isPackagingFeeApplied, state.packagingFee);
    return { isPackagingFeeApplied, ...totals };
  }),

  setDiscountAmount: (discountAmount) => set((state) => {
    const totals = calculateTotals(state.items, discountAmount, state.isPackagingFeeApplied, state.packagingFee);
    return { discountAmount, ...totals };
  }),
  
  clearCart: () => set({
    items: [],
    discountAmount: 0,
    customerName: null,
    driverRefNo: null,
    itemsSubtotal: 0,
    subtotal: 0,
    taxAmount: 0,
    total: 0,
    itemCount: 0
  })
}));

