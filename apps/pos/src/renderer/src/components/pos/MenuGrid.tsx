import React, { useState } from 'react';
import { Search, Sparkles, Plus, Check } from 'lucide-react';
import { useCartStore } from '../../stores/useCartStore';
import { ProductItem } from './ModifierModal';

interface MenuGridProps {
  onSelectProduct: (product: ProductItem) => void;
}

const CATEGORIES = [
  { id: 'all', name: 'Semua Menu' },
  { id: 'cat_kopi', name: '☕ Kopi' },
  { id: 'cat_nonkopi', name: '🍵 Non-Kopi' },
  { id: 'cat_makanan', name: '🍛 Makanan' },
  { id: 'cat_snack', name: '🥐 Snack & Pastry' },
];

const PRODUCTS_DATA: ProductItem[] = [
  { id: 'p1', categoryId: 'cat_kopi', name: 'Iced Latte', price: 32000, station: 'BARISTA', hasModifiers: true },
  { id: 'p2', categoryId: 'cat_kopi', name: 'Americano', price: 22000, station: 'BARISTA', hasModifiers: true },
  { id: 'p3', categoryId: 'cat_kopi', name: 'Cappuccino', price: 32000, station: 'BARISTA', hasModifiers: true },
  { id: 'p4', categoryId: 'cat_kopi', name: 'Kopi Susu Gula Aren', price: 28000, station: 'BARISTA', hasModifiers: true },
  { id: 'p5', categoryId: 'cat_kopi', name: 'Espresso Single', price: 18000, station: 'BARISTA', hasModifiers: false },
  { id: 'p6', categoryId: 'cat_kopi', name: 'Caramel Macchiato', price: 35000, station: 'BARISTA', hasModifiers: true },
  { id: 'p7', categoryId: 'cat_nonkopi', name: 'Matcha Latte', price: 38000, station: 'BARISTA', hasModifiers: true },
  { id: 'p8', categoryId: 'cat_nonkopi', name: 'Coklat Klasik', price: 28000, station: 'BARISTA', hasModifiers: true },
  { id: 'p9', categoryId: 'cat_nonkopi', name: 'Teh Tarik Special', price: 22000, station: 'BARISTA', hasModifiers: false },
  { id: 'p10', categoryId: 'cat_makanan', name: 'Nasi Goreng Spesial', price: 35000, station: 'HOT_KITCHEN', hasModifiers: false },
  { id: 'p11', categoryId: 'cat_makanan', name: 'Indomie Goreng Telur', price: 25000, station: 'HOT_KITCHEN', hasModifiers: false },
  { id: 'p12', categoryId: 'cat_makanan', name: 'Roti Bakar Coklat Keju', price: 20000, station: 'HOT_KITCHEN', hasModifiers: false },
  { id: 'p13', categoryId: 'cat_snack', name: 'Croissant Butter', price: 25000, station: 'BAKERY', hasModifiers: false },
  { id: 'p14', categoryId: 'cat_snack', name: 'Kentang Goreng (Fries)', price: 22000, station: 'HOT_KITCHEN', hasModifiers: false },
  { id: 'p15', categoryId: 'cat_snack', name: 'Pisang Goreng Madu', price: 18000, station: 'HOT_KITCHEN', hasModifiers: false },
];

export default function MenuGrid({ onSelectProduct }: MenuGridProps) {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const { addItem } = useCartStore();

  const filteredProducts = PRODUCTS_DATA.filter((item) => {
    const matchCat = activeCategory === 'all' || item.categoryId === activeCategory;
    const matchSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const favorites = [PRODUCTS_DATA[0], PRODUCTS_DATA[3], PRODUCTS_DATA[1], PRODUCTS_DATA[12]];

  const handleProductClick = (item: ProductItem) => {
    if (item.hasModifiers) {
      onSelectProduct(item);
    } else {
      // Add directly
      addItem({
        productId: item.id,
        productName: item.name,
        qty: 1,
        unitPrice: item.price,
        modifiers: [],
        station: item.station,
      });
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-100 overflow-hidden select-none">
      
      {/* Search & Filter Top Row */}
      <div className="p-4 bg-white border-b border-slate-200/80 flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari menu kopi, makanan, snack... (Tekan '/' untuk cari)"
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#e94560] focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Speed Dial / Top Favorites Row */}
      <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200/60 flex items-center gap-2 overflow-x-auto">
        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1 shrink-0">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Cepat:
        </span>
        {favorites.map((fav) => (
          <button
            key={fav.id}
            onClick={() => handleProductClick(fav)}
            className="px-3 py-1 bg-white hover:bg-slate-100 active:scale-95 border border-slate-200/90 rounded-lg text-xs font-semibold text-slate-700 shadow-sm shrink-0 flex items-center gap-1.5 transition-all"
          >
            <span>{fav.name}</span>
            <span className="text-slate-400 text-[11px] font-mono">Rp {fav.price.toLocaleString('id-ID')}</span>
          </button>
        ))}
      </div>

      {/* Product Cards Grid */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {filteredProducts.map((product) => {
            const isBeverage = product.categoryId.includes('kopi');
            return (
              <button
                key={product.id}
                type="button"
                onClick={() => handleProductClick(product)}
                className="bg-white rounded-2xl p-3.5 border border-slate-200/80 hover:border-[#e94560] hover:shadow-md transition-all flex flex-col justify-between text-left group active:scale-[0.98] relative overflow-hidden"
              >
                {/* Station Tag */}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 group-hover:bg-[#e94560]/10 group-hover:text-[#e94560] transition-colors">
                    {product.station === 'BARISTA' ? 'BAR' : product.station === 'HOT_KITCHEN' ? 'DAPUR' : 'PASTRY'}
                  </span>
                  {product.hasModifiers && (
                    <span className="text-[10px] font-medium text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                      Varian
                    </span>
                  )}
                </div>

                {/* Product Emoji & Name */}
                <div className="my-1.5">
                  <div className="text-2xl mb-1.5">
                    {isBeverage ? '☕' : product.categoryId === 'cat_makanan' ? '🍛' : '🥐'}
                  </div>
                  <h3 className="font-bold text-slate-800 text-sm leading-snug group-hover:text-[#e94560] line-clamp-2">
                    {product.name}
                  </h3>
                </div>

                {/* Price & Add Button */}
                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                  <span className="font-black text-[#e94560] text-sm font-mono">
                    Rp {product.price.toLocaleString('id-ID')}
                  </span>
                  <div className="w-6 h-6 rounded-lg bg-slate-100 group-hover:bg-[#e94560] text-slate-600 group-hover:text-white flex items-center justify-center transition-colors">
                    <Plus className="w-3.5 h-3.5" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Category Tabs at Bottom */}
      <div className="p-3 bg-white border-t border-slate-200 flex items-center gap-2 overflow-x-auto">
        {CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                isActive
                  ? 'bg-[#1a1a2e] text-white shadow-md'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              {cat.name}
            </button>
          );
        })}
      </div>

    </div>
  );
}
