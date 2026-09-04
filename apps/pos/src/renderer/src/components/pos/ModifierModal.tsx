import React, { useState } from 'react';
import { X, Plus, Minus, Check } from 'lucide-react';
import { useCartStore, CartModifier } from '../../stores/useCartStore';

export interface ProductItem {
  id: string;
  categoryId: string;
  name: string;
  price: number;
  image?: string;
  station: string;
  hasModifiers?: boolean;
}

interface ModifierModalProps {
  product: ProductItem;
  onClose: () => void;
}

const MODIFIERS_CONFIG = [
  {
    name: 'Ukuran Cup',
    required: true,
    options: [
      { name: 'Regular', priceAdd: 0 },
      { name: 'Large (+Rp 5.000)', priceAdd: 5000 },
    ],
  },
  {
    name: 'Suhu',
    required: true,
    options: [
      { name: 'Iced (Dingin)', priceAdd: 0 },
      { name: 'Hot (Panas)', priceAdd: 0 },
    ],
  },
  {
    name: 'Pilihan Susu',
    required: false,
    options: [
      { name: 'Fresh Milk', priceAdd: 0 },
      { name: 'Oat Milk (+Rp 5.000)', priceAdd: 5000 },
      { name: 'Almond Milk (+Rp 7.000)', priceAdd: 7000 },
    ],
  },
  {
    name: 'Tingkat Gula',
    required: false,
    options: [
      { name: 'Normal Sugar (100%)', priceAdd: 0 },
      { name: 'Less Sugar (50%)', priceAdd: 0 },
      { name: 'No Sugar (0%)', priceAdd: 0 },
    ],
  },
];

export default function ModifierModal({ product, onClose }: ModifierModalProps) {
  const { addItem } = useCartStore();
  const [qty, setQty] = useState(1);
  const [notes, setNotes] = useState('');
  
  // Selected option index per modifier group
  const [selections, setSelections] = useState<Record<string, { optionName: string; priceAdd: number }>>({
    'Ukuran Cup': { optionName: 'Regular', priceAdd: 0 },
    'Suhu': { optionName: 'Iced (Dingin)', priceAdd: 0 },
    'Pilihan Susu': { optionName: 'Fresh Milk', priceAdd: 0 },
    'Tingkat Gula': { optionName: 'Normal Sugar (100%)', priceAdd: 0 },
  });

  const handleSelect = (groupName: string, optionName: string, priceAdd: number) => {
    setSelections((prev) => ({
      ...prev,
      [groupName]: { optionName, priceAdd },
    }));
  };

  const modifierTotal = Object.values(selections).reduce((sum, s) => sum + s.priceAdd, 0);
  const unitPriceTotal = product.price + modifierTotal;
  const grandTotal = unitPriceTotal * qty;

  const handleAddToCart = () => {
    const formattedModifiers: CartModifier[] = Object.entries(selections).map(([name, sel]) => ({
      name,
      optionName: sel.optionName,
      priceAdd: sel.priceAdd,
    }));

    addItem({
      productId: product.id,
      productName: product.name,
      qty,
      unitPrice: product.price,
      modifiers: formattedModifiers,
      notes: notes.trim() || undefined,
      station: product.station,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 select-none animate-fade-in">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-slate-100">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <h2 className="text-lg font-bold text-slate-900">{product.name}</h2>
            <p className="text-sm font-semibold text-[#e94560]">
              Harga Dasar: Rp {product.price.toLocaleString('id-ID')}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Modifier Options */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {MODIFIERS_CONFIG.map((group) => (
            <div key={group.name} className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  {group.name} {group.required && <span className="text-[#e94560]">*</span>}
                </span>
                <span className="text-[11px] text-slate-400">Pilih 1</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {group.options.map((opt) => {
                  const isSelected = selections[group.name]?.optionName === opt.name;
                  return (
                    <button
                      key={opt.name}
                      type="button"
                      onClick={() => handleSelect(group.name, opt.name, opt.priceAdd)}
                      className={`p-3 rounded-xl text-left border text-xs font-semibold flex items-center justify-between transition-all ${
                        isSelected
                          ? 'border-[#e94560] bg-[#e94560]/5 text-[#e94560] shadow-sm'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <span className="truncate pr-1">{opt.name}</span>
                      {isSelected && <Check className="w-4 h-4 shrink-0 text-[#e94560]" />}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Notes input for Barista */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Catatan Khusus Barista / Dapur
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Es sedikit, jangan terlalu manis..."
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#e94560] focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* Footer with Qty and Add to Cart */}
        <div className="p-5 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
            <button
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              className="w-9 h-9 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors active:scale-95"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-8 text-center font-bold text-slate-900 text-base">{qty}</span>
            <button
              onClick={() => setQty((q) => q + 1)}
              className="w-9 h-9 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors active:scale-95"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleAddToCart}
            className="flex-1 py-3.5 bg-[#e94560] hover:bg-[#d03b53] text-white font-bold rounded-xl shadow-lg shadow-[#e94560]/20 flex items-center justify-between px-5 transition-all active:scale-[0.98]"
          >
            <span>Tambah ke Pesanan</span>
            <span className="font-mono text-sm">Rp {grandTotal.toLocaleString('id-ID')}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
