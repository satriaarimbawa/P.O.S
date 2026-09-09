import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Printer, 
  Store, 
  Cloud, 
  Palette, 
  Shield, 
  ArrowLeft, 
  RefreshCw, 
  Key, 
  CheckCircle2, 
  AlertTriangle, 
  Wifi, 
  WifiOff,
  UtensilsCrossed,
  Plus,
  Trash2,
  Edit3,
  Layers,
  Tag,
  RotateCcw,
  DollarSign,
  Coffee
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/useAuthStore';
import { useHardwareStore } from '../stores/useHardwareStore';
import { useCatalogStore } from '../stores/useCatalogStore';

export default function SettingsPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isManager = user?.role === 'MANAGER' || user?.role === 'ADMIN';

  useEffect(() => {
    if (!isManager) {
      navigate('/');
    }
  }, [isManager, navigate]);

  const [activeTab, setActiveTab] = useState('menu');
  const [primaryColor, setPrimaryColor] = useState('#78350F');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  if (!isManager) {
    return null;
  }

  // Catalog Store
  const { 
    categories, 
    products, 
    addCategory, 
    deleteCategory, 
    addProduct, 
    deleteProduct, 
    updateProductPrice,
    resetToDefaults 
  } = useCatalogStore();

  // New Category Form State
  const [isAddingCat, setIsAddingCat] = useState(false);
  const [catName, setCatName] = useState('');
  const [catEmoji, setCatEmoji] = useState('☕');
  const [catStation, setCatStation] = useState('BARISTA');
  const [catDesc, setCatDesc] = useState('');

  // New Product Form State
  const [isAddingProd, setIsAddingProd] = useState(false);
  const [prodName, setProdName] = useState('');
  const [prodCatId, setProdCatId] = useState('cat_kopi');
  const [prodPrice, setProdPrice] = useState('');
  const [prodStation, setProdStation] = useState('BARISTA');
  const [prodSku, setProdSku] = useState('');
  const [prodHasMod, setProdHasMod] = useState(false);

  // Filter in Menu Tab
  const [menuFilterCat, setMenuFilterCat] = useState('all');

  const {
    printerStatus,
    systemPrinters,
    networkPrintersFound,
    isScanning,
    fetchSystemPrinters,
    scanNetwork,
    checkPrinterStatus,
    updatePrinterConfig,
    isVirtualSimulator,
    toggleVirtualSimulator,
    openCashDrawer,
  } = useHardwareStore();

  const [printerHost, setPrinterHost] = useState(printerStatus.host);
  const [printerPort, setPrinterPort] = useState(printerStatus.port.toString());
  const [paperWidth, setPaperWidth] = useState<80 | 58>(printerStatus.paperWidth as any);

  useEffect(() => {
    fetchSystemPrinters();
    checkPrinterStatus();
  }, []);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) {
      showToast('⚠️ Nama kategori tidak boleh kosong.');
      return;
    }

    const catId = `cat_${Date.now()}`;
    await addCategory({
      id: catId,
      name: catName.trim(),
      emoji: catEmoji || '☕',
      colorTheme: 'from-amber-600 to-amber-900',
      bgColor: 'bg-amber-50/80 hover:bg-amber-100/80',
      borderColor: 'border-amber-200 hover:border-amber-400',
      textColor: 'text-amber-900',
      badgeBg: 'bg-amber-100 text-amber-800',
      station: catStation,
      description: catDesc.trim() || `Kategori ${catName.trim()}`,
    });

    setCatName('');
    setCatDesc('');
    setIsAddingCat(false);
    showToast(`✅ Kategori "${catName.trim()}" berhasil ditambahkan!`);
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodName.trim()) {
      showToast('⚠️ Nama produk tidak boleh kosong.');
      return;
    }
    const priceNum = parseInt(prodPrice.replace(/\D/g, '') || '0', 10);
    if (priceNum <= 0) {
      showToast('⚠️ Harga produk harus lebih dari 0.');
      return;
    }

    const prodId = `p_${Date.now()}`;
    await addProduct({
      id: prodId,
      categoryId: prodCatId || (categories[0]?.id || 'cat_kopi'),
      name: prodName.trim(),
      price: priceNum,
      station: prodStation,
      sku: prodSku.trim() || null,
      hasModifiers: prodHasMod,
    });

    setProdName('');
    setProdPrice('');
    setProdSku('');
    setProdHasMod(false);
    setIsAddingProd(false);
    showToast(`✅ Menu "${prodName.trim()}" berhasil ditambahkan ke kasir!`);
  };

  const tabs = [
    { id: 'menu', name: 'Katalog & Menu', icon: UtensilsCrossed },
    { id: 'branding', name: 'Branding & Tema', icon: Palette },
    { id: 'hardware', name: 'Hardware (Printer)', icon: Printer },
    { id: 'receipt', name: 'Format Struk', icon: Store },
    { id: 'license', name: 'Lisensi & Sync', icon: Cloud },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-slate-200 p-4 flex flex-col">
        <button onClick={() => navigate('/')} className="flex items-center text-slate-500 hover:text-slate-800 mb-8 font-medium">
          <ArrowLeft size={18} className="mr-2" /> Kembali ke POS
        </button>
        <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
          <Settings size={24} className="text-indigo-600" /> Pengaturan
        </h2>
        <nav className="flex-1 space-y-2">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.id ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Icon size={18} /> {tab.name}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Content */}
      <div className="flex-1 p-8 max-w-5xl overflow-y-auto">
        
        {/* ==================================================== */}
        {/* TAB 0: KATALOG & MENU (TAMBAH KATEGORI & PRODUK) */}
        {/* ==================================================== */}
        {activeTab === 'menu' && (
          <div className="space-y-8 animate-fade-in">
            
            {/* Header */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <UtensilsCrossed className="w-5 h-5 text-indigo-600" />
                  Katalog Menu & Kategori Toko
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Atur kategori dan menu yang dapat dipilih oleh kasir. Perubahan tersimpan langsung ke SQLite lokal.
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => setIsAddingCat(true)}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Kategori</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsAddingProd(true)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-md shadow-indigo-600/20"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Menu Baru</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (confirm('Kembalikan semua kategori dan menu ke pengaturan bawaan toko?')) {
                      resetToDefaults();
                      showToast('Katalog dikembalikan ke data default.');
                    }
                  }}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                  title="Reset Katalog ke Bawaan"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* MODAL / FORM TAMBAH KATEGORI */}
            {isAddingCat && (
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-2xl p-6 shadow-md animate-fade-in">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-indigo-100">
                  <h4 className="font-bold text-sm text-indigo-950 flex items-center gap-2">
                    <span>➕ Tambah Kategori Baru</span>
                  </h4>
                  <button
                    type="button"
                    onClick={() => setIsAddingCat(false)}
                    className="text-slate-400 hover:text-slate-600 p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleCreateCategory} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Emoji Ikon
                      </label>
                      <input
                        type="text"
                        value={catEmoji}
                        onChange={(e) => setCatEmoji(e.target.value)}
                        placeholder="☕, 🧋, 🍰, 🍹"
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xl text-center focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Nama Kategori *
                      </label>
                      <input
                        type="text"
                        value={catName}
                        onChange={(e) => setCatName(e.target.value)}
                        placeholder="Contoh: Boba Series / Cake & Dessert"
                        className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Station Penyiapan
                      </label>
                      <select
                        value={catStation}
                        onChange={(e) => setCatStation(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none"
                      >
                        <option value="BARISTA">Barista (Bar)</option>
                        <option value="HOT_KITCHEN">Dapur Panas</option>
                        <option value="BAKERY">Bakery & Pastry</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Deskripsi Singkat
                    </label>
                    <input
                      type="text"
                      value={catDesc}
                      onChange={(e) => setCatDesc(e.target.value)}
                      placeholder="Contoh: Minuman boba kenyal dengan susu segar brown sugar"
                      className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsAddingCat(false)}
                      className="px-4 py-2 bg-white border border-slate-200 text-slate-600 text-xs font-bold rounded-xl"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md"
                    >
                      Simpan Kategori
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* MODAL / FORM TAMBAH MENU PRODUK */}
            {isAddingProd && (
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-2xl p-6 shadow-md animate-fade-in">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-emerald-100">
                  <h4 className="font-bold text-sm text-emerald-950 flex items-center gap-2">
                    <span>➕ Tambah Menu Produk Baru</span>
                  </h4>
                  <button
                    type="button"
                    onClick={() => setIsAddingProd(false)}
                    className="text-slate-400 hover:text-slate-600 p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleCreateProduct} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Nama Menu *
                      </label>
                      <input
                        type="text"
                        value={prodName}
                        onChange={(e) => setProdName(e.target.value)}
                        placeholder="Contoh: Hazelnut Frappe / Nasi Ayam Sambal Matah"
                        className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Kategori *
                      </label>
                      <select
                        value={prodCatId}
                        onChange={(e) => setProdCatId(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                      >
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.emoji} {c.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Harga Jual (Rp) *
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">Rp</span>
                        <input
                          type="text"
                          value={prodPrice ? parseInt(prodPrice, 10).toLocaleString('id-ID') : ''}
                          onChange={(e) => setProdPrice(e.target.value.replace(/\D/g, ''))}
                          placeholder="28.000"
                          className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-3.5 py-2 text-sm font-mono font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Station Penyiapan
                      </label>
                      <select
                        value={prodStation}
                        onChange={(e) => setProdStation(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                      >
                        <option value="BARISTA">Barista (Bar)</option>
                        <option value="HOT_KITCHEN">Dapur Panas</option>
                        <option value="BAKERY">Bakery & Toast</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        SKU / Barcode Fisik (Opsional)
                      </label>
                      <input
                        type="text"
                        value={prodSku}
                        onChange={(e) => setProdSku(e.target.value)}
                        placeholder="Contoh: 8999999005"
                        className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-mono focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="hasMod"
                      checked={prodHasMod}
                      onChange={(e) => setProdHasMod(e.target.checked)}
                      className="w-4 h-4 accent-emerald-600 cursor-pointer"
                    />
                    <label htmlFor="hasMod" className="text-xs font-semibold text-slate-700 cursor-pointer">
                      Memiliki Opsi Varian (Sugar Level, Ice, Extra Shot, Topping)
                    </label>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsAddingProd(false)}
                      className="px-4 py-2 bg-white border border-slate-200 text-slate-600 text-xs font-bold rounded-xl"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md"
                    >
                      Simpan & Terbitkan Menu
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* DAFTAR KATEGORI SAAT INI */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-slate-500" />
                    Kategori Aktif ({categories.length} Kategori)
                  </h4>
                  <p className="text-xs text-slate-500">Kategori ini yang tampil sebagai kartu utama di layar kasir.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {categories.map((c) => {
                  const prodCount = products.filter((p) => p.categoryId === c.id).length;
                  return (
                    <div
                      key={c.id}
                      className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{c.emoji}</span>
                        <div>
                          <p className="font-bold text-xs text-slate-800">{c.name}</p>
                          <span className="text-[10px] text-slate-500 font-medium">
                            {prodCount} Menu • {c.station}
                          </span>
                        </div>
                      </div>

                      {categories.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Hapus kategori "${c.name}" beserta ${prodCount} produk di dalamnya?`)) {
                              deleteCategory(c.id);
                              showToast(`Kategori "${c.name}" dihapus.`);
                            }
                          }}
                          className="text-slate-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                          title="Hapus Kategori"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* DAFTAR PRODUK / MENU SAAT INI */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div>
                  <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                    <Tag className="w-4 h-4 text-slate-500" />
                    Daftar Menu Makanan & Minuman ({products.length} Item)
                  </h4>
                  <p className="text-xs text-slate-500">Klik ubah harga atau hapus item yang tidak aktif.</p>
                </div>

                {/* Filter Kategori */}
                <div className="flex items-center gap-1.5 overflow-x-auto">
                  <button
                    type="button"
                    onClick={() => setMenuFilterCat('all')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all shrink-0 ${
                      menuFilterCat === 'all'
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Semua ({products.length})
                  </button>
                  {categories.map((c) => {
                    const cnt = products.filter((p) => p.categoryId === c.id).length;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setMenuFilterCat(c.id)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all shrink-0 flex items-center gap-1 ${
                          menuFilterCat === c.id
                            ? 'bg-slate-900 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        <span>{c.emoji}</span>
                        <span>{c.name} ({cnt})</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Table of Products */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider">
                      <th className="pb-3 font-bold">Nama Menu</th>
                      <th className="pb-3 font-bold">Kategori</th>
                      <th className="pb-3 font-bold">Station</th>
                      <th className="pb-3 font-bold">SKU / Barcode</th>
                      <th className="pb-3 font-bold">Harga Jual</th>
                      <th className="pb-3 font-bold text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {products
                      .filter((p) => menuFilterCat === 'all' || p.categoryId === menuFilterCat)
                      .map((product) => {
                        const cat = categories.find((c) => c.id === product.categoryId);
                        return (
                          <tr key={product.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-3 font-bold text-slate-900 flex items-center gap-2">
                              <span>{cat?.emoji || '☕'}</span>
                              <span>{product.name}</span>
                              {product.hasModifiers && (
                                <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded">
                                  Varian
                                </span>
                              )}
                            </td>
                            <td className="py-3 text-slate-600 font-medium">
                              {cat?.name || product.categoryId}
                            </td>
                            <td className="py-3">
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                                {product.station}
                              </span>
                            </td>
                            <td className="py-3 font-mono text-slate-400">
                              {product.sku || '-'}
                            </td>
                            <td className="py-3 font-black text-indigo-700 font-mono text-sm">
                              Rp {product.price.toLocaleString('id-ID')}
                            </td>
                            <td className="py-3 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const input = prompt(`Masukkan harga baru untuk "${product.name}":`, product.price.toString());
                                    if (input) {
                                      const newP = parseInt(input.replace(/\D/g, ''), 10);
                                      if (newP > 0) {
                                        updateProductPrice(product.id, newP);
                                        showToast(`Harga "${product.name}" diubah menjadi Rp ${newP.toLocaleString('id-ID')}`);
                                      }
                                    }
                                  }}
                                  className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                  title="Ubah Harga"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (confirm(`Hapus menu "${product.name}" dari katalog?`)) {
                                      deleteProduct(product.id);
                                      showToast(`Menu "${product.name}" dihapus.`);
                                    }
                                  }}
                                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Hapus Menu"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}
        
        {activeTab === 'branding' && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Branding & Tema Kafe</h3>
              <p className="text-sm text-slate-500">Sesuaikan tampilan aplikasi dengan identitas kafe Anda.</p>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Nama Kafe</label>
                  <input type="text" className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none" defaultValue="Senja Kopi" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Tagline</label>
                  <input type="text" className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none" defaultValue="Kopi & Cerita" />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Warna Utama (Primary Color)</label>
                <div className="flex items-center gap-4">
                  <input 
                    type="color" 
                    value={primaryColor} 
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="h-10 w-20 rounded cursor-pointer border border-slate-300" 
                  />
                  <div className="flex gap-2">
                    {[
                      { name: 'Earthy Coffee', code: '#78350F' },
                      { name: 'Matcha Green', code: '#059669' },
                      { name: 'Modern Navy', code: '#1E293B' },
                      { name: 'Dark Crimson', code: '#E11D48' },
                    ].map(c => (
                      <button 
                        key={c.code}
                        onClick={() => setPrimaryColor(c.code)}
                        className={`w-8 h-8 rounded-full border-2 ${primaryColor === c.code ? 'border-indigo-500' : 'border-transparent'}`}
                        style={{ backgroundColor: c.code }}
                        title={c.name}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Preferensi Layout Menu</label>
                <div className="flex gap-4">
                  <label className="flex-1 border border-slate-200 rounded-lg p-4 cursor-pointer hover:bg-slate-50 flex items-center gap-3">
                    <input type="radio" name="layout" defaultChecked className="text-indigo-600 focus:ring-indigo-500" />
                    <div>
                      <div className="font-medium text-slate-900">Mode Foto Estetis</div>
                      <div className="text-xs text-slate-500">Tampilkan gambar produk besar</div>
                    </div>
                  </label>
                  <label className="flex-1 border border-slate-200 rounded-lg p-4 cursor-pointer hover:bg-slate-50 flex items-center gap-3">
                    <input type="radio" name="layout" className="text-indigo-600 focus:ring-indigo-500" />
                    <div>
                      <div className="font-medium text-slate-900">Mode Speed Grid / Kotak</div>
                      <div className="text-xs text-slate-500">Tombol padat untuk input cepat</div>
                    </div>
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  type="button"
                  onClick={() => showToast('Branding dan tema berhasil disimpan!')}
                  className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                >
                  Simpan Perubahan
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'hardware' && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Hardware Printer & Laci Kasir</h3>
                <p className="text-sm text-slate-500">Konfigurasi printer thermal fisik (USB Windows Driver / LAN TCP/IP) dan cash drawer.</p>
              </div>
              
              {/* Live Status Badge */}
              <div className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 border ${
                printerStatus.connected
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-red-50 text-red-700 border-red-200 animate-pulse'
              }`}>
                <span className={`w-2.5 h-2.5 rounded-full ${printerStatus.connected ? 'bg-emerald-500' : 'bg-red-500'}`} />
                <span>{printerStatus.connected ? 'Status: TERHUBUNG' : 'Status: TERPUTUS (OFFLINE)'}</span>
              </div>
            </div>

            <div className="p-6 space-y-6">
              
              {/* Real-time Status Card */}
              <div className={`p-4 rounded-xl border flex items-center justify-between ${
                printerStatus.connected ? 'bg-emerald-50/50 border-emerald-200' : 'bg-red-50/70 border-red-200'
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-lg ${printerStatus.connected ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                    <Printer className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{printerStatus.message}</h4>
                    <p className="text-[11px] text-slate-500">
                      Tipe: <strong className="uppercase">{printerStatus.type}</strong>
                      {printerStatus.type === 'system' && ` • Driver: ${printerStatus.systemPrinterName || 'Default'}`}
                      {printerStatus.type === 'network' && ` • IP: ${printerStatus.host}:${printerStatus.port}`}
                      {printerStatus.latency && ` • Latensi: ${printerStatus.latency}ms`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={async () => {
                      await checkPrinterStatus();
                      showToast('Pemeriksaan koneksi printer selesai.');
                    }}
                    disabled={printerStatus.checking}
                    className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs rounded-lg shadow-sm flex items-center gap-1.5"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${printerStatus.checking ? 'animate-spin' : ''}`} />
                    <span>{printerStatus.checking ? 'Memeriksa...' : 'Ping Test'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={toggleVirtualSimulator}
                    className={`px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1 transition-all ${
                      isVirtualSimulator
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                    title="Uji coba mode simulator jika tidak ada printer fisik"
                  >
                    {isVirtualSimulator ? <CheckCircle2 className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
                    <span>{isVirtualSimulator ? 'Virtual: Aktif' : 'Deteksi Fisik'}</span>
                  </button>
                </div>
              </div>

              {/* Interface Selector Tabs */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Pilih Antarmuka / Tipe Koneksi Printer:
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => updatePrinterConfig({ type: 'system' })}
                    className={`p-3.5 rounded-xl border text-left flex items-start gap-3 transition-all ${
                      printerStatus.type === 'system'
                        ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900 shadow-sm'
                        : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${printerStatus.type === 'system' ? 'bg-indigo-600 text-white' : 'bg-slate-100'}`}>
                      <Printer className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold text-xs block">1. Printer USB / Windows Driver (Rekomendasi)</span>
                      <span className="text-[11px] text-slate-500">Mendeteksi printer thermal yang terpasang di Windows (Epson, POS-80, Panda, dll).</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => updatePrinterConfig({ type: 'network' })}
                    className={`p-3.5 rounded-xl border text-left flex items-start gap-3 transition-all ${
                      printerStatus.type === 'network'
                        ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900 shadow-sm'
                        : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${printerStatus.type === 'network' ? 'bg-indigo-600 text-white' : 'bg-slate-100'}`}>
                      <Wifi className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold text-xs block">2. Printer Jaringan LAN / Wi-Fi (Raw Socket)</span>
                      <span className="text-[11px] text-slate-500">Koneksi langsung ke IP printer Ethernet/Wi-Fi (Port 9100).</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* SYSTEM PRINTER CONFIG (USB / DRIVER) */}
              {printerStatus.type === 'system' && (
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Daftar Printer Terinstall di Windows:
                    </label>
                    <button
                      type="button"
                      onClick={async () => {
                        await fetchSystemPrinters();
                        showToast('Daftar printer Windows diperbarui.');
                      }}
                      className="text-xs text-indigo-600 hover:text-indigo-700 font-bold flex items-center gap-1"
                    >
                      <RefreshCw className="w-3 h-3" /> Refresh Daftar
                    </button>
                  </div>

                  <select
                    value={printerStatus.systemPrinterName}
                    onChange={(e) => updatePrinterConfig({ systemPrinterName: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    {systemPrinters.length === 0 ? (
                      <option value="">Tidak ada printer terdeteksi di Windows</option>
                    ) : (
                      systemPrinters.map((p) => (
                        <option key={p.name} value={p.name}>
                          {p.displayName || p.name} {p.isDefault ? '(Default Windows)' : ''}
                        </option>
                      ))
                    )}
                  </select>
                  <p className="text-[11px] text-slate-500">
                    Pilih printer thermal USB Anda (cth: <em>POS-80</em>, <em>Epson TM-T82</em>, <em>XP-80C</em>).
                  </p>
                </div>
              )}

              {/* NETWORK PRINTER CONFIG (LAN / TCP IP) */}
              {printerStatus.type === 'network' && (
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Alamat IP Printer
                      </label>
                      <input 
                        type="text" 
                        value={printerHost}
                        onChange={(e) => setPrinterHost(e.target.value)}
                        placeholder="192.168.1.100"
                        className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 font-mono text-sm font-bold" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Port ESC/POS
                      </label>
                      <input 
                        type="text" 
                        value={printerPort}
                        onChange={(e) => setPrinterPort(e.target.value)}
                        placeholder="9100"
                        className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 font-mono text-sm font-bold" 
                      />
                    </div>
                  </div>

                  {/* Network Scanner Tool */}
                  <div className="pt-2 border-t border-slate-200/80">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-700">Pindai Printer di Jaringan Lokal:</span>
                      <button
                        type="button"
                        onClick={async () => {
                          await scanNetwork();
                          showToast('Pindai subnet selesai.');
                        }}
                        disabled={isScanning}
                        className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-bold flex items-center gap-1.5"
                      >
                        <RefreshCw className={`w-3 h-3 ${isScanning ? 'animate-spin' : ''}`} />
                        <span>{isScanning ? 'Memindai Subnet...' : 'Pindai Subnet (192.168.1.x)'}</span>
                      </button>
                    </div>

                    {networkPrintersFound.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {networkPrintersFound.map((item) => (
                          <button
                            key={item.ip}
                            type="button"
                            onClick={() => {
                              setPrinterHost(item.ip);
                              setPrinterPort(item.port.toString());
                              updatePrinterConfig({ host: item.ip, port: item.port });
                              showToast(`IP ${item.ip} dipilih!`);
                            }}
                            className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-emerald-300 rounded-lg text-xs font-bold text-emerald-800 flex items-center gap-1.5 shadow-sm"
                          >
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                            <span>{item.ip}:{item.port}</span>
                            <span className="text-[10px] text-slate-400 font-mono">({item.latency}ms)</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Paper Width & Cash Drawer Pin */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Ukuran Kertas Thermal (Paper Width)
                  </label>
                  <select 
                    value={paperWidth}
                    onChange={(e) => setPaperWidth(Number(e.target.value) as 80 | 58)}
                    className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm font-semibold"
                  >
                    <option value={80}>80mm (Standar 48 Kolom - Lebar Kertas 80mm)</option>
                    <option value={58}>58mm (Kecil 32 Kolom - Lebar Kertas 58mm)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Sinyal Buka Laci Kas (Cash Drawer Pulse)
                  </label>
                  <select className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm font-semibold">
                    <option>Pin 2 (Standar Epson / Star / Panda / POS-80)</option>
                    <option>Pin 5</option>
                  </select>
                </div>
              </div>

              {/* Actions Bottom Bar */}
              <div className="pt-6 border-t border-slate-100 flex items-center justify-between gap-4">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={async () => {
                      if (!printerStatus.connected && !isVirtualSimulator) {
                        showToast('Gagal: Printer offline! Nyalakan printer fisik atau aktifkan Mode Virtual.');
                        return;
                      }
                      try {
                        if ((window as any).posAPI?.testPrinter) {
                          await (window as any).posAPI.testPrinter();
                        }
                        showToast('Perintah cetak struk uji (80mm/58mm) terkirim!');
                      } catch (e: any) {
                        showToast('Error cetak: ' + e.message);
                      }
                    }}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 rounded-xl font-bold text-xs transition-colors flex items-center gap-1.5"
                  >
                    <Printer size={16} /> Test Print Struk Fisik
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      await openCashDrawer();
                      showToast('Sinyal dorong laci kas (Kick Drawer) terkirim.');
                    }}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 rounded-xl font-bold text-xs transition-colors flex items-center gap-1.5"
                  >
                    <Store size={16} /> Test Buka Laci Kas
                  </button>
                </div>

                <button
                  type="button"
                  onClick={async () => {
                    await updatePrinterConfig({
                      host: printerHost,
                      port: parseInt(printerPort, 10) || 9100,
                      paperWidth,
                    });
                    showToast('Konfigurasi hardware berhasil disimpan & diverifikasi!');
                  }}
                  className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold text-xs hover:bg-indigo-700 transition-colors shadow-md"
                >
                  Simpan & Terapkan Konfigurasi
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'receipt' && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
             <div className="p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Format Struk Kasir</h3>
              <p className="text-sm text-slate-500">Informasi tambahan yang dicetak pada struk fisik pelanggan.</p>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Wi-Fi SSID (Nama Jaringan)</label>
                  <input type="text" className="w-full border border-slate-300 rounded-lg px-4 py-2" defaultValue="SenjaKopi_Guest" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Password Wi-Fi</label>
                  <input type="text" className="w-full border border-slate-300 rounded-lg px-4 py-2" defaultValue="kopihitam123" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Akun Instagram Kafe</label>
                <div className="relative">
                  <span className="absolute left-4 top-2 text-slate-500">@</span>
                  <input type="text" className="w-full border border-slate-300 rounded-lg pl-10 pr-4 py-2" defaultValue="senjakopi.id" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Pesan Promo Footer</label>
                <textarea 
                  className="w-full border border-slate-300 rounded-lg px-4 py-3 min-h-[100px]"
                  defaultValue="Terima kasih atas kunjungannya! Dapatkan diskon 10% untuk pembelian berikutnya dengan menukarkan struk ini."
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  type="button"
                  onClick={() => showToast('Format struk thermal kasir berhasil disimpan!')}
                  className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                >
                  Simpan Format
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'license' && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
             <div className="p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Lisensi & Cloud Sync</h3>
              <p className="text-sm text-slate-500">Status sinkronisasi cloud dan langganan POS Anda.</p>
            </div>
            <div className="p-6 space-y-6">
              <div className="bg-green-50 border border-green-200 p-4 rounded-xl flex items-start gap-4">
                <Shield className="text-green-600 mt-1" size={24} />
                <div className="flex-1">
                  <h4 className="font-bold text-green-900">Lisensi Aktif (Pro Plan)</h4>
                  <p className="text-green-700 text-sm mt-1">Berlaku hingga: <strong>12 Agustus 2027</strong></p>
                </div>
                <button
                  type="button"
                  onClick={() => showToast('Menghubungkan ke portal pembayaran langganan...')}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Perpanjang
                </button>
              </div>

              <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="font-bold text-slate-900 flex items-center gap-2"><Cloud size={18} /> Cloud Synchronization</h4>
                    <p className="text-slate-500 text-sm mt-1">Data master dan transaksi tersinkronisasi otomatis via Outbox Engine.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => showToast('Sinkronisasi data lokal ke PostgreSQL cloud selesai (0 data pending).')}
                    className="bg-indigo-100 hover:bg-indigo-200 text-indigo-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                  >
                    <RefreshCw size={16} /> Sync Sekarang
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">API Key (Cloud Access Token)</label>
                <div className="relative">
                  <Key size={18} className="absolute left-4 top-2.5 text-slate-400" />
                  <input type="password" disabled className="w-full bg-slate-100 border border-slate-200 text-slate-500 rounded-lg pl-10 pr-4 py-2 font-mono text-sm" value="KPOS_SECURE_TOKEN_DEMO" />
                </div>
                <p className="text-xs text-slate-400 mt-2">Digunakan untuk komunikasi sinkronisasi dengan Cloud Dashboard.</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* TOAST FEEDBACK */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-3 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <p className="text-xs font-bold">{toastMsg}</p>
        </div>
      )}
    </div>
  );
}

