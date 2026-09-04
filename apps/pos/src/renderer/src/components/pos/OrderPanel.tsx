import React, { useState } from 'react';
import { Trash2, Plus, Minus, CreditCard, ShoppingBag, Utensils, Bike, User, Edit3 } from 'lucide-react';
import { useCartStore, OrderType } from '../../stores/useCartStore';

interface OrderPanelProps {
  onOpenPayment: () => void;
}

export default function OrderPanel({ onOpenPayment }: OrderPanelProps) {
  const {
    items,
    orderType,
    setOrderType,
    tableNo,
    setTableNo,
    customerName,
    setCustomerName,
    subtotal,
    taxAmount,
    discountAmount,
    total,
    updateQty,
    removeItem,
    clearCart,
    itemCount,
  } = useCartStore();

  const [isEditingNotes, setIsEditingNotes] = useState<string | null>(null);

  const orderTypes: { type: OrderType; label: string; icon: any }[] = [
    { type: 'DINE_IN', label: 'Dine-In', icon: Utensils },
    { type: 'TAKE_AWAY', label: 'Take Away', icon: ShoppingBag },
    { type: 'DELIVERY', label: 'Delivery', icon: Bike },
  ];

  return (
    <div className="w-[380px] bg-white border-l border-slate-200 flex flex-col h-full select-none shrink-0 shadow-lg z-20">
      
      {/* Order Header */}
      <div className="p-4 border-b border-slate-100 bg-slate-50">
        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Antrean Aktif</span>
            <h2 className="text-base font-bold text-slate-800">Order #INV-0042</h2>
          </div>
          <span className="px-2.5 py-1 bg-emerald-50 text-emerald-600 text-xs font-bold rounded-lg border border-emerald-200">
            {itemCount} Produk
          </span>
        </div>

        {/* Order Type Selector */}
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-200/70 rounded-xl">
          {orderTypes.map((ot) => {
            const Icon = ot.icon;
            const isSelected = orderType === ot.type;
            return (
              <button
                key={ot.type}
                type="button"
                onClick={() => setOrderType(ot.type)}
                className={`py-1.5 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                  isSelected
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{ot.label}</span>
              </button>
            );
          })}
        </div>

        {/* Table No and Customer Info */}
        <div className="grid grid-cols-2 gap-2 mt-3">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Nomor Meja
            </label>
            <input
              type="text"
              value={tableNo || ''}
              onChange={(e) => setTableNo(e.target.value)}
              placeholder="Contoh: 04"
              className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:border-[#e94560]"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Nama Pelanggan
            </label>
            <input
              type="text"
              value={customerName || ''}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Optional"
              className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-[#e94560]"
            />
          </div>
        </div>
      </div>

      {/* Cart Items List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 divide-y divide-slate-100">
        {items.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
            <ShoppingBag className="w-12 h-12 mb-2 text-slate-300 stroke-[1.5]" />
            <p className="font-bold text-slate-600 text-sm">Pesanan Kosong</p>
            <p className="text-xs text-slate-400 mt-1 max-w-[200px]">
              Ketuk salah satu menu di sebelah kiri untuk menambahkan item.
            </p>
          </div>
        ) : (
          items.map((item) => {
            const modTotal = (item.modifiers || []).reduce((sum, m) => sum + m.priceAdd, 0);
            const lineTotal = (item.unitPrice + modTotal) * item.qty;

            return (
              <div key={item.id} className="pt-2 first:pt-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1 pr-2">
                    <h4 className="text-xs font-bold text-slate-800 leading-snug">
                      {item.productName}
                    </h4>
                    
                    {/* Modifiers List */}
                    {item.modifiers && item.modifiers.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {item.modifiers.map((mod, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] font-medium bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded"
                          >
                            {mod.optionName}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Notes */}
                    {item.notes && (
                      <p className="text-[10px] text-amber-700 italic mt-0.5">
                        * {item.notes}
                      </p>
                    )}

                    <div className="text-xs font-mono font-bold text-[#e94560] mt-1">
                      Rp {lineTotal.toLocaleString('id-ID')}
                    </div>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg shrink-0">
                    <button
                      type="button"
                      onClick={() => updateQty(item.id, item.qty - 1)}
                      className="w-6 h-6 rounded bg-white hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors active:scale-95 shadow-sm"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-5 text-center text-xs font-bold text-slate-800">
                      {item.qty}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQty(item.id, item.qty + 1)}
                      className="w-6 h-6 rounded bg-white hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors active:scale-95 shadow-sm"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Bill Calculation & Action Buttons */}
      <div className="p-4 border-t border-slate-200 bg-slate-50 space-y-3">
        <div className="space-y-1.5 text-xs">
          <div className="flex justify-between text-slate-500">
            <span>Subtotal</span>
            <span className="font-mono font-medium">Rp {subtotal.toLocaleString('id-ID')}</span>
          </div>
          {discountAmount > 0 && (
            <div className="flex justify-between text-emerald-600 font-medium">
              <span>Diskon</span>
              <span className="font-mono">-Rp {discountAmount.toLocaleString('id-ID')}</span>
            </div>
          )}
          <div className="flex justify-between text-slate-500">
            <span>PPN 11%</span>
            <span className="font-mono font-medium">Rp {taxAmount.toLocaleString('id-ID')}</span>
          </div>
          <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline">
            <span className="text-sm font-black text-slate-900">TOTAL</span>
            <span className="text-xl font-black text-[#e94560] font-mono">
              Rp {total.toLocaleString('id-ID')}
            </span>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-2 pt-1">
          <button
            type="button"
            onClick={clearCart}
            disabled={items.length === 0}
            className="p-3 bg-white hover:bg-red-50 border border-slate-200 text-slate-400 hover:text-red-500 rounded-xl transition-all disabled:opacity-40"
            title="Kosongkan Keranjang"
          >
            <Trash2 className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={onOpenPayment}
            disabled={items.length === 0}
            className="flex-1 py-3.5 bg-[#e94560] hover:bg-[#d03b53] disabled:opacity-40 text-white font-bold rounded-xl shadow-lg shadow-[#e94560]/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          >
            <CreditCard className="w-4 h-4" />
            <span>PROSES BAYAR</span>
          </button>
        </div>
      </div>

    </div>
  );
}
