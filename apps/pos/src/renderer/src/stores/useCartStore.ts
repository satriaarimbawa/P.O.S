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
  discountAmount: number;
  addItem: (item: Omit<CartItem, 'id'>) => void;
  removeItem: (id: string) => void;
  updateQty: (id: string, qty: number) => void;
  updateNotes: (id: string, notes: string) => void;
  setOrderType: (type: OrderType) => void;
  setTableNo: (tableNo: string | null) => void;
  setCustomerName: (name: string | null) => void;
  setDiscountAmount: (discount: number) => void;
  clearCart: () => void;
  subtotal: number;
  taxAmount: number;
  total: number;
  itemCount: number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  orderType: 'DINE_IN',
  tableNo: '04',
  customerName: null,
  discountAmount: 0,
  
  addItem: (item) => set((state) => {
    const existing = state.items.find((i) => 
      i.productId === item.productId && 
      JSON.stringify(i.modifiers) === JSON.stringify(item.modifiers) &&
      (i.notes || '') === (item.notes || '')
    );
    
    if (existing) {
      return {
        items: state.items.map((i) => 
          i.id === existing.id ? { ...i, qty: i.qty + item.qty } : i
        )
      };
    }
    
    return {
      items: [...state.items, { ...item, id: 'item_' + Math.random().toString(36).substring(2, 9) }]
    };
  }),
  
  removeItem: (id) => set((state) => ({
    items: state.items.filter((i) => i.id !== id)
  })),
  
  updateQty: (id, qty) => set((state) => {
    if (qty <= 0) {
      return { items: state.items.filter((i) => i.id !== id) };
    }
    return {
      items: state.items.map((i) => (i.id === id ? { ...i, qty } : i))
    };
  }),
  
  updateNotes: (id, notes) => set((state) => ({
    items: state.items.map((i) => (i.id === id ? { ...i, notes } : i))
  })),
  
  setOrderType: (orderType) => set({ orderType }),
  setTableNo: (tableNo) => set({ tableNo }),
  setCustomerName: (customerName) => set({ customerName }),
  setDiscountAmount: (discountAmount) => set({ discountAmount }),
  
  clearCart: () => set({ items: [], discountAmount: 0, customerName: null }),
  
  get subtotal() {
    return get().items.reduce((sum, item) => {
      const modTotal = (item.modifiers || []).reduce((mSum, m) => mSum + m.priceAdd, 0);
      return sum + (item.unitPrice + modTotal) * item.qty;
    }, 0);
  },
  get taxAmount() {
    const net = Math.max(0, get().subtotal - get().discountAmount);
    return Math.round(net * 0.11); // 11% PPN
  },
  get total() {
    const net = Math.max(0, get().subtotal - get().discountAmount);
    return net + get().taxAmount;
  },
  get itemCount() {
    return get().items.reduce((sum, item) => sum + item.qty, 0);
  }
}));
