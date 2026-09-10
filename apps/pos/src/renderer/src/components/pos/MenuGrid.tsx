import React, { useState } from 'react';
import { 
  Search, 
  Sparkles, 
  Plus, 
  ArrowLeft, 
  Layers, 
  ChevronRight, 
  X,
  Coffee,
  Utensils,
  Cookie,
  CupSoda
} from 'lucide-react';
import { useCartStore } from '../../stores/useCartStore';
import { useCatalogStore } from '../../stores/useCatalogStore';
import { ProductItem } from './ModifierModal';

interface MenuGridProps {
  onSelectProduct: (product: ProductItem) => void;
}

export interface CategoryData {
  id: string;
  name: string;
  emoji: string;
  icon: any;
  colorTheme: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
  badgeBg: string;
  station: string;
  description: string;
}

export default function MenuGrid({ onSelectProduct }: MenuGridProps) {
  // selectedCategory null means cashier is at Category Cards Overview
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { items: cartItems, addItem } = useCartStore();
  const { categories: CATEGORIES, products: PRODUCTS_DATA } = useCatalogStore();

  const activeCategoryObj = CATEGORIES.find((c) => c.id === selectedCategory);

  // Filter products by selected category and search query
  const filteredProducts = PRODUCTS_DATA.filter((item) => {
    const matchCat = selectedCategory ? item.categoryId === selectedCategory : true;
    const matchSearch = searchQuery.trim() === '' || item.name.toLowerCase().includes(searchQuery.toLowerCase());
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

  // Helper to count how many of this product are in the cart
  const getCartQty = (productId: string) => {
    return cartItems
      .filter((i) => i.productId === productId)
      .reduce((sum, i) => sum + i.qty, 0);
  };

  // Helper to count total products in a category
  const getCategoryCount = (catId: string) => {
    return PRODUCTS_DATA.filter((p) => p.categoryId === catId).length;
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-100 overflow-hidden select-none">
      
      {/* Search & Breadcrumb Bar */}
      <div className="p-3.5 bg-white border-b border-slate-200 flex items-center justify-between gap-3 shrink-0">
        
        {/* Left: Navigation / Back Button */}
        {selectedCategory ? (
          <button
            type="button"
            onClick={() => setSelectedCategory(null)}
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-all active:scale-95 shadow-sm"
          >
            <ArrowLeft className="w-4 h-4 text-slate-600" />
            <span>Kategori Menu</span>
          </button>
        ) : (
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 px-1">
            <Layers className="w-4 h-4 text-slate-500" />
            <span>Pilih Kategori Menu</span>
          </div>
        )}

        {/* Center/Right: Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari menu (misal: Latte, Nasi, Croissant)..."
            className="w-full pl-10 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#e94560] focus:bg-white transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* TABLET HORIZONTAL CATEGORY SWIPE BAR */}
      <div className="px-3.5 py-2 bg-white border-b border-slate-200/80 flex items-center gap-2 overflow-x-auto shrink-0 shadow-xs">
        <button
          type="button"
          onClick={() => {
            setSelectedCategory(null);
            setSearchQuery('');
          }}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 active:scale-95 ${
            selectedCategory === null && searchQuery === ''
              ? 'bg-[#1a1a2e] text-white shadow-sm'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
          }`}
        >
          <span>✨</span>
          <span>Semua Kategori</span>
        </button>

        {CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat.id;
          const count = getCategoryCount(cat.id);
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => {
                setSelectedCategory(cat.id);
                setSearchQuery('');
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 active:scale-95 ${
                isActive
                  ? 'bg-[#e94560] text-white shadow-md shadow-[#e94560]/20 ring-2 ring-[#e94560]/30'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              <span className="text-sm">{cat.emoji}</span>
              <span>{cat.name}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-normal ${
                isActive ? 'bg-white/20 text-white' : 'bg-slate-200/80 text-slate-500'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Speed Dial / Top Favorites Bar */}
      <div className="px-4 py-1.5 bg-slate-50 border-b border-slate-200/70 flex items-center gap-2 overflow-x-auto shrink-0">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1 shrink-0">
          <Sparkles className="w-3 h-3 text-amber-500" /> Cepat:
        </span>
        {favorites.map((fav) => {
          const qty = getCartQty(fav.id);
          return (
            <button
              key={fav.id}
              type="button"
              onClick={() => handleProductClick(fav)}
              className="px-2.5 py-1 bg-white hover:bg-slate-100 active:scale-95 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 shadow-xs shrink-0 flex items-center gap-1.5 transition-all"
            >
              <span>{fav.name}</span>
              <span className="text-slate-400 text-[10px] font-mono">Rp {fav.price.toLocaleString('id-ID')}</span>
              {qty > 0 && (
                <span className="w-4 h-4 rounded-full bg-[#e94560] text-white text-[9px] font-black flex items-center justify-center">
                  {qty}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 overflow-y-auto p-4">

        {/* 1. VIEW JIKA SEDANG CARI MENU DENGAN TEXT SEARCH */}
        {searchQuery.trim() !== '' ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-600 bg-white px-4 py-2.5 rounded-xl border border-slate-200">
              <span>
                Hasil pencarian untuk <strong className="text-slate-900 font-bold">"{searchQuery}"</strong> ({filteredProducts.length} menu ditemukan)
              </span>
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-[#e94560] font-bold hover:underline text-[11px]"
              >
                Hapus Pencarian
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {filteredProducts.map((product) => {
                const isBeverage = product.categoryId.includes('kopi');
                const qty = getCartQty(product.id);
                const parentCat = CATEGORIES.find((c) => c.id === product.categoryId);

                return (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => handleProductClick(product)}
                    className="bg-white rounded-2xl p-3.5 border border-slate-200 hover:border-[#e94560] hover:shadow-md transition-all flex flex-col justify-between text-left group active:scale-[0.98] relative overflow-hidden"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                        {parentCat?.name || product.station}
                      </span>
                      {product.hasModifiers && (
                        <span className="text-[10px] font-medium text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                          Varian
                        </span>
                      )}
                    </div>

                    <div className="my-1.5">
                      <div className="text-2xl mb-1.5">
                        {isBeverage ? '☕' : product.categoryId === 'cat_makanan' ? '🍛' : '🥐'}
                      </div>
                      <h3 className="font-bold text-slate-800 text-sm leading-snug group-hover:text-[#e94560] line-clamp-2">
                        {product.name}
                      </h3>
                    </div>

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

        ) : selectedCategory === null ? (

          /* 2. LEVEL 1: GRID KARTU KATEGORI UTAMA (Belum ada kategori yang dipencet) */
          <div className="max-w-5xl mx-auto space-y-4">
            <div className="text-center py-2">
              <h2 className="text-lg font-black text-slate-900 tracking-tight">Pilih Kategori Menu</h2>
              <p className="text-xs text-slate-500 mt-0.5">Sentuh atau klik kategori di bawah untuk membuka daftar menu minuman & makanan.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {CATEGORIES.map((cat) => {
                const count = getCategoryCount(cat.id);

                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`p-6 rounded-3xl border-2 ${cat.bgColor} ${cat.borderColor} text-left transition-all duration-200 transform active:scale-95 hover:shadow-lg flex flex-col justify-between h-56 group relative overflow-hidden`}
                  >
                    {/* Top Row: Station Badge & Item Count */}
                    <div className="flex items-center justify-between w-full">
                      <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full ${cat.badgeBg}`}>
                        {cat.station === 'BARISTA' ? 'Barista' : cat.station === 'HOT_KITCHEN' ? 'Dapur Panas' : 'Pastry & Toast'}
                      </span>
                      <span className="text-xs font-bold text-slate-500 bg-white/80 px-2 py-0.5 rounded-lg border border-slate-200/60 font-mono">
                        {count} Menu
                      </span>
                    </div>

                    {/* Middle: Big Emoji & Category Title */}
                    <div className="my-auto py-2">
                      <div className="text-4xl mb-2 group-hover:scale-110 transition-transform">
                        {cat.emoji}
                      </div>
                      <h3 className={`text-lg font-black ${cat.textColor} tracking-tight group-hover:translate-x-0.5 transition-transform`}>
                        {cat.name}
                      </h3>
                      <p className="text-[11px] text-slate-500 line-clamp-2 mt-1 leading-snug">
                        {cat.description}
                      </p>
                    </div>

                    {/* Bottom: Action Hint */}
                    <div className="pt-2 border-t border-slate-200/50 flex items-center justify-between text-xs font-bold text-slate-600 group-hover:text-slate-900">
                      <span>Buka Menu</span>
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

        ) : (

          /* 3. LEVEL 2: DAFTAR PRODUK DALAM KATEGORI TERPILIH */
          <div className="space-y-4">
            
            {/* Active Category Header Bar */}
            <div className="flex items-center justify-between bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{activeCategoryObj?.emoji}</span>
                <div>
                  <h2 className="text-base font-black text-slate-900 leading-tight">
                    {activeCategoryObj?.name}
                  </h2>
                  <p className="text-[11px] text-slate-500">
                    Menampilkan {filteredProducts.length} pilihan menu • Station: {activeCategoryObj?.station}
                  </p>
                </div>
              </div>

              {/* Category Quick Switch Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto">
                {CATEGORIES.map((cat) => {
                  const isActive = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                        isActive
                          ? 'bg-[#1a1a2e] text-white shadow-md'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                      }`}
                    >
                      <span>{cat.emoji}</span>
                      <span className="hidden sm:inline">{cat.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Product Cards Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3.5">
              {filteredProducts.map((product) => {
                const isBeverage = product.categoryId.includes('kopi');
                const qty = getCartQty(product.id);

                return (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => handleProductClick(product)}
                    className="bg-white rounded-2xl p-4 border border-slate-200/90 hover:border-[#e94560] hover:shadow-md transition-all flex flex-col justify-between text-left group active:scale-[0.98] relative overflow-hidden"
                  >
                    {/* Top Row: Station Tag & Modifiers Badge */}
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
                    <div className="my-2">
                      <div className="text-3xl mb-1.5">
                        {isBeverage ? '☕' : product.categoryId === 'cat_makanan' ? '🍛' : '🥐'}
                      </div>
                      <h3 className="font-bold text-slate-800 text-sm leading-snug group-hover:text-[#e94560] line-clamp-2">
                        {product.name}
                      </h3>
                    </div>

                    {/* Price & Add Button */}
                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <span className="font-black text-[#e94560] text-sm font-mono block">
                          Rp {product.price.toLocaleString('id-ID')}
                        </span>
                        {qty > 0 && (
                          <span className="text-[10px] text-emerald-600 font-bold">
                            ✓ {qty} di keranjang
                          </span>
                        )}
                      </div>

                      <div className="w-7 h-7 rounded-xl bg-slate-100 group-hover:bg-[#e94560] text-slate-600 group-hover:text-white flex items-center justify-center transition-colors shadow-sm">
                        <Plus className="w-4 h-4" />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

          </div>
        )}

      </div>

      {/* Bottom Bar: Back to Categories button if inside category */}
      {selectedCategory && (
        <div className="p-3 bg-white border-t border-slate-200 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={() => setSelectedCategory(null)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all shadow-md active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Pilih Kategori Lain</span>
          </button>

          <span className="text-xs text-slate-500 font-medium">
            Kategori Aktif: <strong className="text-slate-800">{activeCategoryObj?.name}</strong>
          </span>
        </div>
      )}

    </div>
  );
}
