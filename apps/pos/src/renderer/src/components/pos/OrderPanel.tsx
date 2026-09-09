import React, { useState } from 'react';
import { 
  Trash2, 
  Plus, 
  Minus, 
  CreditCard, 
  ShoppingBag, 
  Utensils, 
  Bike, 
  User, 
  Edit3,
  Check,
  Sparkles,
  Hash,
  X
} from 'lucide-react';
import { useCartStore, OrderType } from '../../stores/useCartStore';

interface OrderPanelProps {
  onOpenPayment: () => void;
  onClose?: () => void;
}

const DINE_IN_TABLES = ['01', '02', '03', '04', '05', 'Outdoor', 'VIP'];
const DELIVERY_PLATFORMS = [
  { id: 'GoFood', name: 'GoFood', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
  { id: 'GrabFood', name: 'GrabFood', color: 'bg-green-100 text-green-800 border-green-300' },
  { id: 'ShopeeFood', name: 'ShopeeFood', color: 'bg-orange-100 text-orange-800 border-orange-300' },
  { id: 'Kurir Toko', name: 'Kurir Toko', color: 'bg-indigo-100 text-indigo-800 border-indigo-300' },
];

export default function OrderPanel({ onOpenPayment, onClose }: OrderPanelProps) {
  const {
    items,
    orderType,
    setOrderType,
    tableNo,
    setTableNo,
    customerName,
    setCustomerName,
    deliveryPlatform,
    setDeliveryPlatform,
    driverRefNo,
    setDriverRefNo,
    packagingFee,
    isPackagingFeeApplied,
    togglePackagingFee,
    itemsSubtotal,
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

  const orderTypes: { type: OrderType; label: string; icon: any; color: string }[] = [
    { type: 'DINE_IN', label: 'Dine-In', icon: Utensils, color: 'text-indigo-600' },
    { type: 'TAKE_AWAY', label: 'Take Away', icon: ShoppingBag, color: 'text-emerald-600' },
    { type: 'DELIVERY', label: 'Delivery', icon: Bike, color: 'text-amber-600' },
  ];

  const handleGenerateQueue = () => {
    const queueNum = `A-${Math.floor(10 + Math.random() * 90)}`;
    setCustomerName(`Antrean #${queueNum}`);
  };

  return (
    <div className="w-full lg:w-[390px] bg-white border-l border-slate-200 flex flex-col h-full select-none shrink-0 shadow-lg z-20">
      
      {/* Order Header */}
      <div className="p-4 border-b border-slate-100 bg-slate-50 space-y-3">
        
        {/* Title Bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div>
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Antrean Kasir</span>
              <h2 className="text-sm font-black text-slate-800">Pesanan Aktif</h2>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 bg-slate-900 text-white text-xs font-bold rounded-lg shadow-sm">
              {itemCount} Item
            </span>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 flex items-center justify-center transition-colors lg:hidden"
                title="Tutup Keranjang"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* 1. Order Type Switcher Tabs */}
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-200/80 rounded-xl">
          {orderTypes.map((ot) => {
            const Icon = ot.icon;
            const isSelected = orderType === ot.type;
            return (
              <button
                key={ot.type}
                type="button"
                onClick={() => setOrderType(ot.type)}
                className={`py-2 text-xs font-black rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                  isSelected
                    ? 'bg-white text-slate-900 shadow-md transform scale-[1.02]'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/50'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? ot.color : 'text-slate-400'}`} />
                <span>{ot.label}</span>
              </button>
            );
          })}
        </div>

        {/* 2. DYNAMIC FORM BERDASARKAN TIPE ORDER */}
        {orderType === 'DINE_IN' && (
          <div className="p-3 bg-white rounded-xl border border-indigo-100 shadow-sm space-y-2.5 animate-fade-in">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-extrabold text-indigo-900 flex items-center gap-1">
                <Utensils className="w-3.5 h-3.5 text-indigo-600" /> Pilih Meja Pelanggan:
              </span>
              <span className="text-[10px] text-slate-400">Makan di Tempat</span>
            </div>

            {/* Quick Table Selection Pills */}
            <div className="flex flex-wrap gap-1.5">
              {DINE_IN_TABLES.map((tbl) => (
                <button
                  key={tbl}
                  type="button"
                  onClick={() => setTableNo(tbl)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    tableNo === tbl
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {tbl}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Nomor Meja
                </label>
                <input
                  type="text"
                  value={tableNo || ''}
                  onChange={(e) => setTableNo(e.target.value)}
                  placeholder="04"
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-black text-slate-900 focus:outline-none focus:border-indigo-600 font-mono"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Nama Tamu (Opsional)
                </label>
                <input
                  type="text"
                  value={customerName || ''}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Bpk. Rian"
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-indigo-600"
                />
              </div>
            </div>
          </div>
        )}

        {orderType === 'TAKE_AWAY' && (
          <div className="p-3 bg-white rounded-xl border border-emerald-100 shadow-sm space-y-2.5 animate-fade-in">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-extrabold text-emerald-900 flex items-center gap-1">
                <ShoppingBag className="w-3.5 h-3.5 text-emerald-600" /> Bawa Pulang (Takeaway):
              </span>
              <button
                type="button"
                onClick={handleGenerateQueue}
                className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded hover:bg-emerald-100 flex items-center gap-1"
              >
                <Hash className="w-3 h-3" /> Buat #Antrean
              </button>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Nama Panggilan Pelanggan (Pick-up) *
              </label>
              <input
                type="text"
                value={customerName || ''}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Contoh: Kak Sarah / Antrean #A-12"
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-600"
                autoFocus
              />
            </div>

            {/* Packaging Fee Toggle */}
            <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs">
              <label htmlFor="packTakeaway" className="flex items-center gap-2 cursor-pointer text-slate-700 font-medium">
                <input
                  type="checkbox"
                  id="packTakeaway"
                  checked={isPackagingFeeApplied}
                  onChange={(e) => togglePackagingFee(e.target.checked)}
                  className="w-3.5 h-3.5 accent-emerald-600 cursor-pointer"
                />
                <span>Paper Bag Ramah Lingkungan</span>
              </label>
              <span className="font-bold text-emerald-700 font-mono text-[11px]">+Rp 2.000</span>
            </div>
          </div>
        )}

        {orderType === 'DELIVERY' && (
          <div className="p-3 bg-white rounded-xl border border-amber-200 shadow-sm space-y-2.5 animate-fade-in">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-extrabold text-amber-900 flex items-center gap-1">
                <Bike className="w-3.5 h-3.5 text-amber-600" /> Platform Pengantaran / Ojol:
              </span>
              <span className="text-[10px] text-amber-700 font-bold bg-amber-50 px-1.5 py-0.5 rounded">
                Cup Sealer
              </span>
            </div>

            {/* Platform Selector Chips */}
            <div className="grid grid-cols-2 gap-1.5">
              {DELIVERY_PLATFORMS.map((plat) => {
                const isSelected = deliveryPlatform === plat.id;
                return (
                  <button
                    key={plat.id}
                    type="button"
                    onClick={() => setDeliveryPlatform(plat.id)}
                    className={`px-2 py-1.5 rounded-lg text-xs font-bold border transition-all text-center ${
                      isSelected
                        ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {plat.name}
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  No. Order / PIN Driver *
                </label>
                <input
                  type="text"
                  value={driverRefNo || ''}
                  onChange={(e) => setDriverRefNo(e.target.value)}
                  placeholder="GF-10492"
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-900 focus:outline-none focus:border-amber-600 font-mono"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Nama Driver / Pemesan
                </label>
                <input
                  type="text"
                  value={customerName || ''}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Pak Agus (Driver)"
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-amber-600"
                />
              </div>
            </div>

            {/* Packaging Fee Toggle */}
            <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs">
              <label htmlFor="packDelivery" className="flex items-center gap-2 cursor-pointer text-slate-700 font-medium">
                <input
                  type="checkbox"
                  id="packDelivery"
                  checked={isPackagingFeeApplied}
                  onChange={(e) => togglePackagingFee(e.target.checked)}
                  className="w-3.5 h-3.5 accent-amber-600 cursor-pointer"
                />
                <span>Kemasan Delivery & Seal</span>
              </label>
              <span className="font-bold text-amber-700 font-mono text-[11px]">+Rp 2.000</span>
            </div>
          </div>
        )}

      </div>

      {/* Cart Items List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 divide-y divide-slate-100">
        {items.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
            <ShoppingBag className="w-12 h-12 mb-2 text-slate-300 stroke-[1.5]" />
            <p className="font-bold text-slate-600 text-sm">Pesanan Kosong</p>
            <p className="text-xs text-slate-400 mt-1 max-w-[220px]">
              Pilih salah satu menu di sebelah kiri untuk menambahkan item ke antrean.
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
            <span>Subtotal Item</span>
            <span className="font-mono font-medium">Rp {itemsSubtotal.toLocaleString('id-ID')}</span>
          </div>

          {isPackagingFeeApplied && (
            <div className="flex justify-between text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded">
              <span>Biaya Kemasan ({orderType === 'TAKE_AWAY' ? 'Paper Bag' : 'Delivery Seal'})</span>
              <span className="font-mono">+Rp {packagingFee.toLocaleString('id-ID')}</span>
            </div>
          )}

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
