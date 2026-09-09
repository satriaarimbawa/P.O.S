import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Download, 
  TrendingUp, 
  BarChart3, 
  Coffee, 
  Users, 
  ArrowLeft, 
  CheckCircle2,
  DollarSign,
  ShoppingBag,
  CreditCard,
  Layers,
  PieChart as PieIcon,
  Sparkles,
  ArrowUpRight,
  Printer,
  ChevronRight,
  Clock,
  Coins,
  Package,
  AlertTriangle,
  FileText,
  Calculator,
  Edit3,
  RefreshCw,
  Plus,
  ShieldAlert,
  Info,
  Sliders,
  Truck,
  ClipboardList,
  Trash2,
  Check,
  Building2,
  CalendarDays
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/useAuthStore';
import { useInventoryStore, RawMaterial } from '../stores/useInventoryStore';

// ==========================================
// 1. DATA ANALITIK PENJUALAN MOCK
// ==========================================

const HOURLY_SALES_DATA = [
  { hour: '07:00', revenue: 180000, orders: 6 },
  { hour: '08:00', revenue: 490000, orders: 16 },
  { hour: '09:00', revenue: 620000, orders: 20 },
  { hour: '10:00', revenue: 380000, orders: 12 },
  { hour: '11:00', revenue: 260000, orders: 8 },
  { hour: '12:00', revenue: 540000, orders: 17 },
  { hour: '13:00', revenue: 420000, orders: 13 },
  { hour: '14:00', revenue: 210000, orders: 7 },
  { hour: '15:00', revenue: 190000, orders: 6 },
  { hour: '16:00', revenue: 310000, orders: 10 },
  { hour: '17:00', revenue: 450000, orders: 14 },
  { hour: '18:00', revenue: 680000, orders: 21 },
  { hour: '19:00', revenue: 750000, orders: 23 },
  { hour: '20:00', revenue: 580000, orders: 18 },
  { hour: '21:00', revenue: 340000, orders: 11 },
  { hour: '22:00', revenue: 120000, orders: 4 },
];

const WEEKLY_SALES_DATA = [
  { day: 'Senin (03/09)', revenue: 3850000, orders: 124 },
  { day: 'Selasa (04/09)', revenue: 4120000, orders: 132 },
  { day: 'Rabu (05/09)', revenue: 3980000, orders: 128 },
  { day: 'Kamis (06/09)', revenue: 4350000, orders: 139 },
  { day: 'Jumat (07/09)', revenue: 5620000, orders: 178 },
  { day: 'Sabtu (08/09)', revenue: 6840000, orders: 215 },
  { day: 'Minggu (Hari Ini)', revenue: 4520000, orders: 142 },
];

const CATEGORY_SALES_DATA = [
  { name: 'Kopi (Espresso & Milk)', value: 2350000, percent: 52, color: '#8b5cf6' },
  { name: 'Non-Kopi (Matcha & Tea)', value: 994000, percent: 22, color: '#10b981' },
  { name: 'Pastry & Bakery', value: 723000, percent: 16, color: '#f59e0b' },
  { name: 'Makanan & Snack', value: 453000, percent: 10, color: '#ef4444' },
];

const TOP_PRODUCTS_DATA = [
  { rank: 1, name: 'Kopi Susu Gula Aren', category: 'Kopi', qty: 48, revenue: 1344000, share: 29.7 },
  { rank: 2, name: 'Iced Latte', category: 'Kopi', qty: 32, revenue: 1024000, share: 22.6 },
  { rank: 3, name: 'Croissant Butter', category: 'Pastry', qty: 26, revenue: 650000, share: 14.4 },
  { rank: 4, name: 'Matcha Latte', category: 'Non-Kopi', qty: 18, revenue: 684000, share: 15.1 },
  { rank: 5, name: 'Americano', category: 'Kopi', qty: 16, revenue: 352000, share: 7.8 },
  { rank: 6, name: 'Nasi Goreng Spesial', category: 'Makanan', qty: 12, revenue: 420000, share: 9.3 },
  { rank: 7, name: 'Kentang Goreng', category: 'Snack', qty: 10, revenue: 250000, share: 5.5 },
  { rank: 8, name: 'Caramel Macchiato', category: 'Kopi', qty: 8, revenue: 288000, share: 6.4 },
];

export default function ReportsPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isManager = user?.role === 'MANAGER' || user?.role === 'ADMIN';

  // Inventory Store
  const { 
    materials, 
    stockInLogs, 
    stockTakeLogs, 
    addStockIn, 
    submitDailyStockTake 
  } = useInventoryStore();

  useEffect(() => {
    if (!isManager) {
      navigate('/');
    }
  }, [isManager, navigate]);

  // Tab State: 'sales' | 'stock-in' | 'stock-take' | 'pnl'
  const [activeTab, setActiveTab] = useState<'sales' | 'stock-in' | 'stock-take' | 'pnl'>('sales');
  const [period, setPeriod] = useState<'Harian' | 'Mingguan' | 'Bulanan'>('Harian');
  const [chartMetric, setChartMetric] = useState<'revenue' | 'orders'>('revenue');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // ==========================================
  // STATE INPUT STOK MASUK (STOCK IN)
  // ==========================================
  const [supplierName, setSupplierName] = useState('');
  const [invoiceNo, setInvoiceNo] = useState('');
  const [receiverName, setReceiverName] = useState(user?.name || 'Sari N. (Store Manager)');
  const [stockInNotes, setStockInNotes] = useState('');
  const [stockInItems, setStockInItems] = useState<{ materialId: string; qty: number; unitCost: number }[]>([
    { materialId: materials[0]?.id || 'mat_1', qty: 5, unitCost: materials[0]?.unitCost || 160000 }
  ]);

  // ==========================================
  // STATE DAILY STOCK TAKING (OPNAME)
  // ==========================================
  const [shiftName, setShiftName] = useState('Closing Harian');
  const [conductorName, setConductorName] = useState(user?.name || 'Sari N. (Supervisor)');
  const [stockTakeNotes, setStockTakeNotes] = useState('');
  const [tempCountedStocks, setTempCountedStocks] = useState<{ [materialId: string]: string }>({});

  // Inisialisasi input stock take dari actualPhysicalStock saat pertama kali load
  useEffect(() => {
    const initialCounts: { [materialId: string]: string } = {};
    materials.forEach((mat) => {
      initialCounts[mat.id] = String(mat.actualPhysicalStock);
    });
    setTempCountedStocks(initialCounts);
  }, [materials]);

  if (!isManager) {
    return null;
  }

  // ==========================================
  // KALKULASI LABA RUGI & HPP REAL-TIME
  // ==========================================
  const grossSales = 4670000;
  const discounts = 150000;
  const netRevenue = grossSales - discounts; // Rp 4.520.000

  // Hitung HPP Teoretis (Resep POS) & Kerugian Selisih Stok (Wastage) dari Store
  let theoreticalCOGS = 0;
  let totalWastageCost = 0;
  let totalRemainingSystemValue = 0;
  let totalActualPhysicalValue = 0;
  let totalPurchasesToday = 0;

  materials.forEach((mat) => {
    const sisaSistem = mat.startStock + mat.stockIn - mat.usedSystem;
    const selisihQty = mat.actualPhysicalStock - sisaSistem;
    const hppTerpakai = mat.usedSystem * mat.unitCost;
    
    theoreticalCOGS += hppTerpakai;
    totalRemainingSystemValue += sisaSistem * mat.unitCost;
    totalActualPhysicalValue += mat.actualPhysicalStock * mat.unitCost;
    totalPurchasesToday += mat.stockIn * mat.unitCost;

    if (selisihQty < 0) {
      totalWastageCost += Math.abs(selisihQty) * mat.unitCost;
    }
  });

  const actualTotalCOGS = theoreticalCOGS + totalWastageCost;
  const grossProfit = netRevenue - actualTotalCOGS;
  const grossProfitMargin = ((grossProfit / netRevenue) * 100).toFixed(1);

  // Beban Operasional Harian (OPEX Estimasi)
  const opexSalaries = 450000; // Gaji barista & kasir (alokasi harian)
  const opexUtilities = 120000; // Listrik, gas mesin espresso, air
  const opexMaintenance = 50000; // Pemeliharaan alat & kebersihan
  const totalOPEX = opexSalaries + opexUtilities + opexMaintenance; // Rp 620.000

  const netProfit = grossProfit - totalOPEX;
  const netProfitMargin = ((netProfit / netRevenue) * 100).toFixed(1);

  // P&L Waterfall Chart Data
  const PNL_CHART_DATA = [
    { name: '1. Omset Bersih', value: netRevenue, color: '#10b981' },
    { name: '2. HPP Resep POS', value: -theoreticalCOGS, color: '#f59e0b' },
    { name: '3. Selisih/Wastage', value: -totalWastageCost, color: '#ef4444' },
    { name: '4. Laba Kotor', value: grossProfit, color: '#8b5cf6' },
    { name: '5. Biaya OPEX', value: -totalOPEX, color: '#f97316' },
    { name: '6. Laba Bersih', value: netProfit, color: '#0ea5e9' },
  ];

  // ==========================================
  // HANDLER AKSI
  // ==========================================

  // 1. Tambah Baris Bahan di Stok Masuk
  const handleAddStockInRow = () => {
    setStockInItems(prev => [
      ...prev,
      { materialId: materials[0]?.id || 'mat_1', qty: 1, unitCost: materials[0]?.unitCost || 0 }
    ]);
  };

  // 2. Hapus Baris Bahan di Stok Masuk
  const handleRemoveStockInRow = (index: number) => {
    setStockInItems(prev => prev.filter((_, idx) => idx !== index));
  };

  // 3. Simpan Formulir Stok Masuk
  const handleSubmitStockIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierName.trim()) {
      setToastMsg('⚠️ Mohon isi Nama Supplier pengirim bahan.');
      setTimeout(() => setToastMsg(null), 3000);
      return;
    }

    if (stockInItems.length === 0) {
      setToastMsg('⚠️ Tambahkan minimal 1 jenis bahan baku yang masuk.');
      setTimeout(() => setToastMsg(null), 3000);
      return;
    }

    // Validasi Qty > 0
    const hasInvalidQty = stockInItems.some(i => i.qty <= 0);
    if (hasInvalidQty) {
      setToastMsg('⚠️ Jumlah Qty masuk harus lebih dari 0.');
      setTimeout(() => setToastMsg(null), 3000);
      return;
    }

    addStockIn({
      supplierName,
      invoiceNo,
      receivedBy: receiverName,
      notes: stockInNotes,
      items: stockInItems,
    });

    // Reset Form
    setSupplierName('');
    setInvoiceNo('');
    setStockInNotes('');
    setStockInItems([{ materialId: materials[0]?.id || 'mat_1', qty: 5, unitCost: materials[0]?.unitCost || 160000 }]);

    setToastMsg('✅ Stok Masuk berhasil dicatat & stok bahan langsung bertambah!');
    setTimeout(() => setToastMsg(null), 3500);
  };

  // 4. Quick Fill Sisa Sistem untuk Opname Harian
  const handleQuickFillSystemStock = () => {
    const filled: { [materialId: string]: string } = {};
    materials.forEach((mat) => {
      const sisaSistem = Number((mat.startStock + mat.stockIn - mat.usedSystem).toFixed(2));
      filled[mat.id] = String(sisaSistem);
    });
    setTempCountedStocks(filled);
    setToastMsg('⚡ Input fisik otomatis diisi sesuai Sisa Sistem.');
    setTimeout(() => setToastMsg(null), 2500);
  };

  // 5. Simpan Hasil Daily Stock Taking (Opname)
  const handleSubmitDailyStockTake = () => {
    const parsedCounts: { [materialId: string]: number } = {};
    for (const mat of materials) {
      const inputStr = tempCountedStocks[mat.id];
      const val = parseFloat(inputStr);
      if (isNaN(val) || val < 0) {
        setToastMsg(`⚠️ Jumlah fisik untuk "${mat.name}" tidak valid.`);
        setTimeout(() => setToastMsg(null), 3000);
        return;
      }
      parsedCounts[mat.id] = val;
    }

    const log = submitDailyStockTake({
      shiftName,
      conductedBy: conductorName,
      notes: stockTakeNotes,
      countedStocks: parsedCounts,
    });

    setToastMsg(`🔒 Stock Taking "${shiftName}" berhasil disimpan & Laba Rugi terkoreksi!`);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // 6. Handler Export CSV
  const handleExportCSV = () => {
    if (activeTab === 'sales') {
      const csvContent = "data:text/csv;charset=utf-8," 
        + "Peringkat,Nama Menu,Kategori,Kuantitas Terjual,Total Omset (IDR),Kontribusi (%)\n"
        + TOP_PRODUCTS_DATA.map(p => `${p.rank},"${p.name}","${p.category}",${p.qty},${p.revenue},${p.share}%`).join("\n");
      
      const link = document.createElement("a");
      link.setAttribute("href", encodeURI(csvContent));
      link.setAttribute("download", `Laporan_Penjualan_${period}_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (activeTab === 'stock-in') {
      const csvContent = "data:text/csv;charset=utf-8," 
        + "ID Faktur,Tanggal,Supplier,No Surat Jalan,Penerima,Item Masuk,Total Belanja (IDR)\n"
        + stockInLogs.map(l => {
          const itemsStr = l.items.map(i => `${i.materialName} (${i.qty} ${i.unit})`).join(" | ");
          return `"${l.id}","${new Date(l.date).toLocaleString('id-ID')}","${l.supplierName}","${l.invoiceNo}","${l.receivedBy}","${itemsStr}",${l.totalAmount}`;
        }).join("\n");
      
      const link = document.createElement("a");
      link.setAttribute("href", encodeURI(csvContent));
      link.setAttribute("download", `Riwayat_Stok_Masuk_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (activeTab === 'stock-take') {
      const csvContent = "data:text/csv;charset=utf-8," 
        + "ID,Nama Bahan,Kategori,Satuan,HPP Unit,Stok Awal,Masuk,Terpakai POS,Sisa Sistem,Fisik Opname,Selisih Qty,Kerugian Selisih (IDR)\n"
        + materials.map(m => {
          const sisa = m.startStock + m.stockIn - m.usedSystem;
          const diff = m.actualPhysicalStock - sisa;
          const diffRp = diff * m.unitCost;
          return `"${m.id}","${m.name}","${m.category}","${m.unit}",${m.unitCost},${m.startStock},${m.stockIn},${m.usedSystem},${sisa.toFixed(2)},${m.actualPhysicalStock},${diff.toFixed(2)},${diffRp.toFixed(0)}`;
        }).join("\n");
      
      const link = document.createElement("a");
      link.setAttribute("href", encodeURI(csvContent));
      link.setAttribute("download", `Hasil_Stock_Taking_Harian_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      const csvContent = "data:text/csv;charset=utf-8," 
        + "Komponen Laba Rugi,Nilai (IDR),Persentase (%)\n"
        + `Penjualan Kotor,${grossSales},103.3%\n`
        + `Diskon & Promosi,-${discounts},-3.3%\n`
        + `PENDAPATAN BERSIH,${netRevenue},100.0%\n`
        + `HPP Bahan Baku Teoretis,-${theoreticalCOGS.toFixed(0)},-${((theoreticalCOGS/netRevenue)*100).toFixed(1)}%\n`
        + `Biaya Selisih Stok (Wastage),-${totalWastageCost.toFixed(0)},-${((totalWastageCost/netRevenue)*100).toFixed(1)}%\n`
        + `TOTAL HPP AKTUAL,-${actualTotalCOGS.toFixed(0)},-${((actualTotalCOGS/netRevenue)*100).toFixed(1)}%\n`
        + `LABA KOTOR (GROSS PROFIT),${grossProfit.toFixed(0)},${grossProfitMargin}%\n`
        + `Beban Gaji & Staff,-${opexSalaries},-9.9%\n`
        + `Beban Listrik & Utilitas,-${opexUtilities},-2.6%\n`
        + `Beban Maintenance & Alat,-${opexMaintenance},-1.1%\n`
        + `TOTAL BEBAN OPERASIONAL,-${totalOPEX},-13.7%\n`
        + `LABA BERSIH ESTIMASI (EBIT),${netProfit.toFixed(0)},${netProfitMargin}%\n`;
      
      const link = document.createElement("a");
      link.setAttribute("href", encodeURI(csvContent));
      link.setAttribute("download", `Laporan_Laba_Rugi_PnL_${period}_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    setToastMsg('📊 File CSV berhasil diekspor.');
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handlePrintDocument = () => {
    window.print();
  };

  return (
    <div className="h-screen w-full overflow-y-auto bg-slate-100 text-slate-800 p-4 sm:p-6 lg:p-8 font-sans select-none pb-24">
      <div className="max-w-7xl mx-auto space-y-6">
      
      {/* ======================================================== */}
      {/* 1. HEADER & ACTION CONTROLS                             */}
      {/* ======================================================== */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-3xl shadow-xs border border-slate-200">
        <div className="flex items-center gap-3.5">
          <button 
            onClick={() => navigate('/')} 
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl transition-colors border border-slate-200"
            title="Kembali ke Layar Kasir"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Laporan & Analitik Owner
              </h1>
              <span className="bg-amber-400/20 text-amber-800 border border-amber-400/40 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full">
                👑 Akses Owner
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              Outlet: <strong>Kopi Nusa Senopati (Flagship)</strong> • Terakhir diperbarui: {new Date().toLocaleTimeString('id-ID')} WIB
            </p>
          </div>
        </div>

        {/* Period Switcher & Export */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Period Tabs */}
          <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs font-bold">
            {(['Harian', 'Mingguan', 'Bulanan'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3.5 py-1.5 rounded-xl transition-all ${
                  period === p 
                    ? 'bg-white text-slate-900 shadow-xs font-black' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {p === 'Harian' ? '📅 Hari Ini' : p === 'Mingguan' ? '📆 7 Hari' : '🗓️ 30 Hari'}
              </button>
            ))}
          </div>

          {/* Export Buttons */}
          <div className="flex items-center gap-2">
            <button 
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-xs active:scale-95"
              title="Unduh file Excel / CSV"
            >
              <Download size={15} className="text-emerald-600" />
              <span>Ekspor CSV</span>
            </button>
            <button 
              onClick={handlePrintDocument}
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/20 active:scale-95"
              title="Cetak Laporan Format A4 / PDF"
            >
              <Printer size={15} />
              <span>Cetak Laporan A4</span>
            </button>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. TAB NAVIGASI OWNER DASHBOARD (4 TABS)                 */}
      {/* ======================================================== */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2">
        
        {/* Tab 1: Penjualan */}
        <button
          onClick={() => setActiveTab('sales')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-xs sm:text-sm transition-all ${
            activeTab === 'sales'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <BarChart3 size={16} />
          <span>📈 Penjualan & Jam Sibuk</span>
        </button>

        {/* Tab 2: Input Stok Masuk (Stock In) */}
        <button
          onClick={() => setActiveTab('stock-in')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-xs sm:text-sm transition-all ${
            activeTab === 'stock-in'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <Truck size={16} />
          <span>📥 Input Stok Masuk (Stock In)</span>
          {stockInLogs.length > 0 && (
            <span className="bg-emerald-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-black">
              {stockInLogs.length} Faktur
            </span>
          )}
        </button>

        {/* Tab 3: Daily Stock Taking (Opname) */}
        <button
          onClick={() => setActiveTab('stock-take')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-xs sm:text-sm transition-all ${
            activeTab === 'stock-take'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <ClipboardList size={16} />
          <span>📋 Stock Taking Harian (Opname)</span>
          {totalWastageCost > 0 && (
            <span className="bg-rose-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-black animate-pulse">
              -Rp {(totalWastageCost / 1000).toFixed(0)}k
            </span>
          )}
        </button>

        {/* Tab 4: Laba Rugi P&L */}
        <button
          onClick={() => setActiveTab('pnl')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-xs sm:text-sm transition-all ${
            activeTab === 'pnl'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <Calculator size={16} />
          <span>💰 Laporan Laba Rugi (P&L)</span>
          <span className="bg-emerald-500/20 text-emerald-800 border border-emerald-400/40 text-[10px] px-2 py-0.5 rounded-full font-black">
            {grossProfitMargin}% Margin
          </span>
        </button>

      </div>

      {/* ======================================================== */}
      {/* TAB 1: PENJUALAN & JAM SIBUK                            */}
      {/* ======================================================== */}
      {activeTab === 'sales' && (
        <div className="space-y-6 animate-fade-in">
          
          {/* EXECUTIVE KPI CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Net Revenue */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs relative overflow-hidden group hover:border-indigo-300 transition-all">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Omset Penjualan Bersih</span>
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <DollarSign size={20} />
                </div>
              </div>
              <div className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">
                Rp {netRevenue.toLocaleString('id-ID')}
              </div>
              <div className="flex items-center gap-1.5 mt-2 text-xs font-bold text-emerald-600">
                <ArrowUpRight size={14} />
                <span>+14.8% vs hari kemarin</span>
              </div>
            </div>

            {/* Total Orders */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs relative overflow-hidden group hover:border-emerald-300 transition-all">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Transaksi</span>
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <ShoppingBag size={20} />
                </div>
              </div>
              <div className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">
                142 <span className="text-sm font-semibold text-slate-500">Trx</span>
              </div>
              <div className="flex items-center gap-1.5 mt-2 text-xs font-bold text-slate-500">
                <span>Rata-rata: <strong>Rp 31.830 / pesanan</strong></span>
              </div>
            </div>

            {/* Gross Profit & Margin */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs relative overflow-hidden group hover:border-amber-300 transition-all">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Estimasi Laba Kotor (GP)</span>
                <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Sparkles size={20} />
                </div>
              </div>
              <div className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">
                Rp {grossProfit.toLocaleString('id-ID')}
              </div>
              <div className="flex items-center gap-1.5 mt-2 text-xs font-bold text-amber-700">
                <span>Margin Kotor: <strong>{grossProfitMargin}%</strong> (HPP Rp {(actualTotalCOGS/1000).toFixed(0)}k)</span>
              </div>
            </div>

            {/* Non-Cash Share */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs relative overflow-hidden group hover:border-blue-300 transition-all">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Adopsi Non-Tunai</span>
                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <CreditCard size={20} />
                </div>
              </div>
              <div className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">
                72% <span className="text-sm font-semibold text-slate-500">Digital</span>
              </div>
              <div className="flex items-center gap-1.5 mt-2 text-xs font-bold text-blue-600">
                <span>QRIS Dinamis 52% • EDC 12% • E-Wallet 8%</span>
              </div>
            </div>

          </div>

          {/* CHARTS GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* HOURLY SALES AREA CHART (2 COLS) */}
            <div className="lg:col-span-2 bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-slate-100 gap-3">
                <div>
                  <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                    <TrendingUp size={18} className="text-indigo-600" />
                    Grafik Jam Sibuk & Tren Penjualan Jam ke Jam
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Lonjakan jam sibuk pagi (08:00 - 10:00) & malam (18:00 - 20:00)
                  </p>
                </div>

                <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-bold">
                  <button
                    onClick={() => setChartMetric('revenue')}
                    className={`px-3 py-1 rounded-lg transition-all ${
                      chartMetric === 'revenue' 
                        ? 'bg-white text-indigo-700 shadow-xs font-black' 
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Omset (Rp)
                  </button>
                  <button
                    onClick={() => setChartMetric('orders')}
                    className={`px-3 py-1 rounded-lg transition-all ${
                      chartMetric === 'orders' 
                        ? 'bg-white text-indigo-700 shadow-xs font-black' 
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Jumlah Order (Trx)
                  </button>
                </div>
              </div>

              <div className="h-72 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={HOURLY_SALES_DATA} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="hour" stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <YAxis 
                      stroke="#94a3b8" 
                      fontSize={11} 
                      tickLine={false}
                      tickFormatter={(val) => chartMetric === 'revenue' ? `${val / 1000}k` : `${val}`}
                    />
                    <Tooltip 
                      formatter={(val: any) => [
                        chartMetric === 'revenue' ? `Rp ${Number(val).toLocaleString('id-ID')}` : `${val} Order`,
                        chartMetric === 'revenue' ? 'Omset Penjualan' : 'Jumlah Transaksi'
                      ]}
                      labelFormatter={(label) => `Pukul ${label} WIB`}
                      contentStyle={{ backgroundColor: '#1e293b', borderRadius: '16px', color: '#fff', border: 'none', fontSize: '12px' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey={chartMetric} 
                      stroke="#7c3aed" 
                      strokeWidth={3} 
                      fillOpacity={1} 
                      fill="url(#colorMetric)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* CATEGORY SHARE DONUT PIE CHART (1 COL) */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-100">
                  <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                    <PieIcon size={18} className="text-emerald-600" />
                    Kontribusi Kategori
                  </h2>
                  <span className="text-[11px] font-bold text-slate-500">Berdasarkan Omset</span>
                </div>

                <div className="h-48 w-full relative flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={CATEGORY_SALES_DATA}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={75}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {CATEGORY_SALES_DATA.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(val: any) => [`Rp ${Number(val).toLocaleString('id-ID')}`, 'Omset']}
                        contentStyle={{ backgroundColor: '#1e293b', borderRadius: '12px', color: '#fff', border: 'none', fontSize: '11px' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-xs font-bold text-slate-400">Total Kopi</span>
                    <span className="text-base font-black text-slate-900">52%</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2 mt-2">
                {CATEGORY_SALES_DATA.map((cat, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }}></span>
                      <span className="font-bold text-slate-700">{cat.name}</span>
                    </div>
                    <span className="font-mono font-black text-slate-900">{cat.percent}%</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* LEADERBOARD & SHIFT CASH RECONCILIATION */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* TOP 8 BEST SELLERS (2 COLS) */}
            <div className="lg:col-span-2 bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
                <div>
                  <h3 className="font-black text-slate-900 text-sm uppercase tracking-wider flex items-center gap-2">
                    <Coffee size={18} className="text-amber-600" />
                    Top 8 Menu Terlaris Hari Ini
                  </h3>
                  <p className="text-xs text-slate-500">Ranking produk dengan kontribusi omset tertinggi</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                      <th className="pb-2.5">Rank</th>
                      <th className="pb-2.5">Menu</th>
                      <th className="pb-2.5">Kategori</th>
                      <th className="pb-2.5 text-center">Terjual</th>
                      <th className="pb-2.5 text-right">Total Omset</th>
                      <th className="pb-2.5 text-right">Kontribusi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {TOP_PRODUCTS_DATA.map((item) => (
                      <tr key={item.rank} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 font-black">
                          <span className={`w-6 h-6 rounded-full inline-flex items-center justify-center text-xs ${
                            item.rank === 1 ? 'bg-amber-400 text-amber-950 font-black' :
                            item.rank === 2 ? 'bg-slate-200 text-slate-800 font-black' :
                            item.rank === 3 ? 'bg-amber-700/20 text-amber-800 font-black' :
                            'text-slate-500 font-semibold'
                          }`}>
                            {item.rank}
                          </span>
                        </td>
                        <td className="py-3 font-bold text-slate-900">{item.name}</td>
                        <td className="py-3">
                          <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-bold text-[10px]">
                            {item.category}
                          </span>
                        </td>
                        <td className="py-3 text-center font-mono font-bold text-slate-800">{item.qty} cup</td>
                        <td className="py-3 text-right font-mono font-black text-slate-900">
                          Rp {item.revenue.toLocaleString('id-ID')}
                        </td>
                        <td className="py-3 text-right">
                          <span className="font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                            {item.share}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* AUDIT SHIFT KASIR (1 COL) */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 pb-3 mb-3 border-b border-slate-100">
                  <Users size={18} className="text-indigo-600" />
                  <h3 className="font-black text-slate-900 text-sm uppercase tracking-wider">
                    Rekonsiliasi Shift & Laci Kas
                  </h3>
                </div>

                <div className="space-y-4 text-xs">
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="font-black text-slate-900">Shift 1 (Pagi) • 07:00 - 15:00</span>
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-md">Selesai</span>
                    </div>
                    <p className="text-slate-500 text-[11px] mb-2">Kasir: <strong>Sari N.</strong> • 68 Transaksi</p>
                    <div className="flex justify-between text-slate-700 pt-1.5 border-t border-slate-200/60 font-semibold">
                      <span>Total Penjualan:</span>
                      <span className="font-mono font-black text-slate-900">Rp 2.150.000</span>
                    </div>
                    <div className="flex justify-between text-emerald-700 text-[11px] font-bold mt-1">
                      <span>Kas Fisik Laci:</span>
                      <span>🟢 Kas Akurat (Selisih Rp 0)</span>
                    </div>
                  </div>

                  <div className="p-3 bg-indigo-50/50 rounded-2xl border border-indigo-100">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="font-black text-indigo-950">Shift 2 (Malam) • 15:00 - 22:00</span>
                      <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-md animate-pulse">Sedang Berjalan</span>
                    </div>
                    <p className="text-slate-500 text-[11px] mb-2">Kasir: <strong>Budi K.</strong> • 74 Transaksi</p>
                    <div className="flex justify-between text-slate-700 pt-1.5 border-t border-indigo-200/60 font-semibold">
                      <span>Total Penjualan:</span>
                      <span className="font-mono font-black text-indigo-950">Rp 2.370.000</span>
                    </div>
                    <div className="flex justify-between text-slate-600 text-[11px] font-bold mt-1">
                      <span>Status Laci Kas:</span>
                      <span>🟢 Kas Awal Rp 500.000</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center text-xs">
                <span className="text-slate-500 font-bold">Total Transaksi:</span>
                <span className="font-mono font-black text-slate-900">142 Trx • Rp 4.520.000</span>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: INPUT STOK MASUK (STOCK IN / RECEIVING)           */}
      {/* ======================================================== */}
      {activeTab === 'stock-in' && (
        <div className="space-y-6 animate-fade-in">
          
          {/* FORMULIR PENERIMAAN STOK DARI SUPPLIER */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <Truck size={22} className="text-indigo-600" />
                  Formulir Penerimaan Stok Masuk (Stock In)
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Input surat jalan & faktur pembelian bahan baku dari supplier untuk menambah stok aktif
                </p>
              </div>
              <span className="text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 px-3 py-1.5 rounded-xl">
                📦 Belanja Bahan Hari Ini: <strong>Rp {totalPurchasesToday.toLocaleString('id-ID')}</strong>
              </span>
            </div>

            <form onSubmit={handleSubmitStockIn} className="space-y-6">
              
              {/* Header Info Supplier & Faktur */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Nama Supplier / Vendor: <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={supplierName}
                    onChange={(e) => setSupplierName(e.target.value)}
                    placeholder="Contoh: PT Nusa Roastery / Cimory"
                    className="w-full text-xs font-bold p-3 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
                  />
                  {/* Quick suggestions */}
                  <div className="flex gap-1.5 mt-1.5 flex-wrap">
                    {['PT Nusa Roastery', 'Cimory Fresh Dairy', 'Toffin Sirup', 'Indo Packaging'].map((sup) => (
                      <button
                        type="button"
                        key={sup}
                        onClick={() => setSupplierName(sup)}
                        className="text-[10px] bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 px-2 py-0.5 rounded-lg border border-slate-200 font-semibold"
                      >
                        +{sup}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Nomor Faktur / Surat Jalan (PO):
                  </label>
                  <input
                    type="text"
                    value={invoiceNo}
                    onChange={(e) => setInvoiceNo(e.target.value)}
                    placeholder="Contoh: INV-PO-202609-01"
                    className="w-full text-xs font-mono font-bold p-3 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Nama Penerima (Staff / Manager):
                  </label>
                  <input
                    type="text"
                    value={receiverName}
                    onChange={(e) => setReceiverName(e.target.value)}
                    placeholder="Nama Staff Penerima"
                    className="w-full text-xs font-bold p-3 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
                  />
                </div>

              </div>

              {/* Tabel Item Bahan Masuk */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-black uppercase text-slate-700 tracking-wider">
                    Daftar Bahan Baku yang Diterima:
                  </label>
                  <button
                    type="button"
                    onClick={handleAddStockInRow}
                    className="flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-3 py-1.5 rounded-xl border border-indigo-200 active:scale-95 transition-all"
                  >
                    <Plus size={14} />
                    <span>Tambah Baris Bahan</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {stockInItems.map((item, idx) => {
                    const selectedMat = materials.find(m => m.id === item.materialId) || materials[0];
                    const subtotal = item.qty * item.unitCost;

                    return (
                      <div key={idx} className="flex flex-col sm:flex-row items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200">
                        
                        {/* Pilih Bahan */}
                        <div className="flex-1 w-full">
                          <label className="block text-[10px] font-bold text-slate-500 mb-1">Nama Bahan Baku:</label>
                          <select
                            value={item.materialId}
                            onChange={(e) => {
                              const newMatId = e.target.value;
                              const found = materials.find(m => m.id === newMatId);
                              setStockInItems(prev => prev.map((it, i) => i === idx ? {
                                ...it,
                                materialId: newMatId,
                                unitCost: found ? found.unitCost : it.unitCost,
                              } : it));
                            }}
                            className="w-full text-xs font-bold p-2.5 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
                          >
                            {materials.map((m) => (
                              <option key={m.id} value={m.id}>
                                {m.name} ({m.unit}) - HPP Default: Rp {m.unitCost.toLocaleString('id-ID')}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Jumlah Qty Masuk */}
                        <div className="w-full sm:w-36">
                          <label className="block text-[10px] font-bold text-slate-500 mb-1">
                            Qty Masuk ({selectedMat?.unit}):
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            min="0.01"
                            value={item.qty}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value) || 0;
                              setStockInItems(prev => prev.map((it, i) => i === idx ? { ...it, qty: val } : it));
                            }}
                            className="w-full text-xs font-mono font-bold p-2.5 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
                          />
                        </div>

                        {/* Harga Beli Satuan (HPP Aktual) */}
                        <div className="w-full sm:w-44">
                          <label className="block text-[10px] font-bold text-slate-500 mb-1">
                            Harga Beli (Rp / {selectedMat?.unit}):
                          </label>
                          <input
                            type="number"
                            step="100"
                            min="0"
                            value={item.unitCost}
                            onChange={(e) => {
                              const val = parseInt(e.target.value, 10) || 0;
                              setStockInItems(prev => prev.map((it, i) => i === idx ? { ...it, unitCost: val } : it));
                            }}
                            className="w-full text-xs font-mono font-bold p-2.5 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
                          />
                        </div>

                        {/* Subtotal */}
                        <div className="w-full sm:w-40 text-right sm:pt-4">
                          <span className="text-[10px] text-slate-400 font-bold block sm:hidden">Subtotal:</span>
                          <span className="font-mono font-black text-indigo-950 text-xs sm:text-sm">
                            Rp {subtotal.toLocaleString('id-ID')}
                          </span>
                        </div>

                        {/* Tombol Hapus Baris */}
                        {stockInItems.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveStockInRow(idx)}
                            className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors sm:mt-4"
                            title="Hapus Baris"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}

                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Catatan & Tombol Simpan */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100">
                <div className="w-full sm:max-w-md">
                  <input
                    type="text"
                    value={stockInNotes}
                    onChange={(e) => setStockInNotes(e.target.value)}
                    placeholder="Catatan pengiriman / kondisi fisik kemasan..."
                    className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:outline-none text-slate-800"
                  />
                </div>

                <div className="flex items-center gap-4 w-full sm:w-auto justify-end">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 font-bold uppercase block">Total Faktur Pembelian</span>
                    <span className="font-mono text-lg font-black text-slate-900">
                      Rp {stockInItems.reduce((acc, it) => acc + (it.qty * it.unitCost), 0).toLocaleString('id-ID')}
                    </span>
                  </div>

                  <button
                    type="submit"
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-6 py-3.5 rounded-2xl shadow-lg shadow-indigo-600/20 active:scale-95 transition-all"
                  >
                    <Check size={16} />
                    <span>Simpan Penerimaan Stok</span>
                  </button>
                </div>
              </div>

            </form>
          </div>

          {/* RIWAYAT SURAT JALAN & FAKTUR PEMBELIAN STOK */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
              <div>
                <h3 className="font-black text-slate-900 text-sm uppercase tracking-wider flex items-center gap-2">
                  <FileText size={18} className="text-indigo-600" />
                  Riwayat Surat Jalan & Pembelian Stok Masuk
                </h3>
                <p className="text-xs text-slate-500">Daftar penerimaan barang yang telah dicatat ke sistem</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-black uppercase tracking-wider bg-slate-50/50">
                    <th className="p-3">Waktu & Tanggal</th>
                    <th className="p-3">Supplier Vendor</th>
                    <th className="p-3">No Surat Jalan / PO</th>
                    <th className="p-3">Rincian Bahan Masuk</th>
                    <th className="p-3">Penerima</th>
                    <th className="p-3 text-right">Total Biaya (IDR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {stockInLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3 font-mono text-slate-600">
                        {new Date(log.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })} • {new Date(log.date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                      </td>
                      <td className="p-3 font-bold text-slate-900 flex items-center gap-1.5">
                        <Building2 size={14} className="text-slate-400" />
                        <span>{log.supplierName}</span>
                      </td>
                      <td className="p-3 font-mono font-semibold text-indigo-700 bg-indigo-50/40 rounded-lg">
                        {log.invoiceNo}
                      </td>
                      <td className="p-3 text-slate-700">
                        <div className="flex flex-wrap gap-1">
                          {log.items.map((it, i) => (
                            <span key={i} className="bg-slate-100 px-2 py-0.5 rounded-md text-[10px] font-bold text-slate-800">
                              {it.materialName}: <strong>+{it.qty} {it.unit}</strong>
                            </span>
                          ))}
                        </div>
                        {log.notes && <p className="text-[10px] text-slate-400 italic mt-0.5">"{log.notes}"</p>}
                      </td>
                      <td className="p-3 text-slate-600 font-semibold">{log.receivedBy}</td>
                      <td className="p-3 text-right font-mono font-black text-slate-900">
                        Rp {log.totalAmount.toLocaleString('id-ID')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: STOCK TAKING HARIAN (DAILY OPNAME)                */}
      {/* ======================================================== */}
      {activeTab === 'stock-take' && (
        <div className="space-y-6 animate-fade-in">
          
          {/* DAILY STOCK TAKING FORM & INPUT TABLE */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-6 border-b border-slate-100 gap-4">
              <div>
                <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <ClipboardList size={22} className="text-indigo-600" />
                  Lembar Stock Taking Harian (Opname Fisik Bar)
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Hitung fisik sisa bahan baku di akhir shift untuk mengaudit selisih (*variance*) dan kerugian (*wastage*)
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleQuickFillSystemStock}
                  className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border border-slate-200 active:scale-95"
                  title="Isi seluruh input dengan nilai sisa sistem"
                >
                  <RefreshCw size={14} />
                  <span>⚡ Quick Fill Sisa Sistem</span>
                </button>

                <button
                  type="button"
                  onClick={handleSubmitDailyStockTake}
                  className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/20 active:scale-95"
                >
                  <CheckCircle2 size={15} />
                  <span>🔒 Simpan & Kunci Opname</span>
                </button>
              </div>
            </div>

            {/* Shift & Conductor Header Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
              <div>
                <label className="block font-bold text-slate-600 mb-1">Nama Sesi / Shift:</label>
                <select
                  value={shiftName}
                  onChange={(e) => setShiftName(e.target.value)}
                  className="w-full font-bold p-2 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Shift 1 (Pagi)">Shift 1 (Pagi) • 07:00 - 15:00</option>
                  <option value="Shift 2 (Malam)">Shift 2 (Malam) • 15:00 - 22:00</option>
                  <option value="Closing Harian">Closing Harian (Tutup Outlet)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-600 mb-1">Petugas Pemeriksa:</label>
                <input
                  type="text"
                  value={conductorName}
                  onChange={(e) => setConductorName(e.target.value)}
                  className="w-full font-bold p-2 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-600 mb-1">Catatan Opname (Opsional):</label>
                <input
                  type="text"
                  value={stockTakeNotes}
                  onChange={(e) => setStockTakeNotes(e.target.value)}
                  placeholder="Contoh: Kalibrasi grinder 3 shot tumpah..."
                  className="w-full p-2 bg-white border border-slate-300 rounded-xl focus:outline-none text-slate-800"
                />
              </div>
            </div>

            {/* TABEL INPUT STOCK TAKING */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-black uppercase tracking-wider bg-slate-50/50">
                    <th className="p-3">Bahan Baku</th>
                    <th className="p-3">Kategori</th>
                    <th className="p-3 text-right">HPP / Unit</th>
                    <th className="p-3 text-center">Stok Awal</th>
                    <th className="p-3 text-center">Masuk (+)</th>
                    <th className="p-3 text-center bg-amber-50/50 text-amber-900">Terpakai (POS)</th>
                    <th className="p-3 text-center bg-slate-100/70 font-bold">Sisa Sistem</th>
                    <th className="p-3 text-center bg-indigo-50 text-indigo-950 font-black w-36">
                      Hitung Fisik (Opname)
                    </th>
                    <th className="p-3 text-center">Selisih Qty</th>
                    <th className="p-3 text-right">Nilai Selisih (Rp)</th>
                    <th className="p-3 text-center">Status Audit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {materials.map((mat) => {
                    const sisaSistem = Number((mat.startStock + mat.stockIn - mat.usedSystem).toFixed(2));
                    const currentInput = tempCountedStocks[mat.id] !== undefined ? tempCountedStocks[mat.id] : String(mat.actualPhysicalStock);
                    const parsedVal = parseFloat(currentInput) || 0;
                    const selisihQty = Number((parsedVal - sisaSistem).toFixed(2));
                    const selisihRp = selisihQty * mat.unitCost;
                    const isAccurate = Math.abs(selisihQty) === 0;
                    const isDeficit = selisihQty < 0;

                    return (
                      <tr key={mat.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3 font-bold text-slate-900">
                          {mat.name}
                        </td>
                        <td className="p-3">
                          <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-bold text-[10px]">
                            {mat.category}
                          </span>
                        </td>
                        <td className="p-3 text-right font-mono text-slate-600 font-semibold">
                          Rp {mat.unitCost.toLocaleString('id-ID')}/{mat.unit}
                        </td>
                        <td className="p-3 text-center font-mono text-slate-600">
                          {mat.startStock} {mat.unit}
                        </td>
                        <td className="p-3 text-center font-mono text-emerald-600 font-bold">
                          {mat.stockIn > 0 ? `+${mat.stockIn}` : '0'} {mat.unit}
                        </td>
                        <td className="p-3 text-center font-mono font-bold text-amber-800 bg-amber-50/30">
                          {mat.usedSystem} {mat.unit}
                        </td>
                        <td className="p-3 text-center font-mono font-black text-slate-800 bg-slate-50/60">
                          {sisaSistem} {mat.unit}
                        </td>
                        
                        {/* Kolom Input Hitung Fisik */}
                        <td className="p-2.5 text-center bg-indigo-50/30">
                          <div className="flex items-center justify-center gap-1">
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={currentInput}
                              onChange={(e) => {
                                const val = e.target.value;
                                setTempCountedStocks(prev => ({ ...prev, [mat.id]: val }));
                              }}
                              className="w-24 text-center font-mono font-black text-xs p-1.5 bg-white border-2 border-indigo-400 rounded-xl focus:border-indigo-600 focus:outline-none text-slate-900"
                            />
                            <span className="text-[10px] text-slate-500 font-bold">{mat.unit}</span>
                          </div>
                        </td>

                        {/* Selisih Qty */}
                        <td className="p-3 text-center font-mono font-bold">
                          {isAccurate ? (
                            <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">0</span>
                          ) : isDeficit ? (
                            <span className="text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md">{selisihQty}</span>
                          ) : (
                            <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">+{selisihQty}</span>
                          )}
                        </td>

                        {/* Nilai Selisih Rupiah */}
                        <td className="p-3 text-right font-mono font-black">
                          {isAccurate ? (
                            <span className="text-emerald-700">Rp 0</span>
                          ) : isDeficit ? (
                            <span className="text-rose-600">-Rp {Math.abs(selisihRp).toLocaleString('id-ID')}</span>
                          ) : (
                            <span className="text-blue-600">+Rp {selisihRp.toLocaleString('id-ID')}</span>
                          )}
                        </td>

                        {/* Status Badge */}
                        <td className="p-3 text-center font-bold">
                          {isAccurate ? (
                            <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                              <CheckCircle2 size={12} /> Cocok
                            </span>
                          ) : isDeficit ? (
                            <span className="bg-rose-100 text-rose-800 text-[10px] px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                              <AlertTriangle size={12} /> Wastage
                            </span>
                          ) : (
                            <span className="bg-blue-100 text-blue-800 text-[10px] px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                              <Info size={12} /> Surplus
                            </span>
                          )}
                        </td>

                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Total Wastage Summary Footer */}
            <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-3">
              <div className="text-xs text-slate-500 font-semibold flex items-center gap-2">
                <ShieldAlert size={16} className="text-amber-600" />
                <span>Selisih minus otomatis dihitung sebagai biaya <strong>Kerugian Bahan / Wastage</strong> pada laporan Laba Rugi.</span>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">Total Kerugian Selisih (Wastage)</span>
                  <span className="font-mono text-lg font-black text-rose-600">
                    -Rp {totalWastageCost.toLocaleString('id-ID')}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleSubmitDailyStockTake}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-5 py-3 rounded-2xl shadow-md shadow-indigo-600/20 active:scale-95 transition-all"
                >
                  Simpan & Kunci Opname
                </button>
              </div>
            </div>

          </div>

          {/* RIWAYAT AUDIT STOCK TAKING */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
              <div>
                <h3 className="font-black text-slate-900 text-sm uppercase tracking-wider flex items-center gap-2">
                  <FileText size={18} className="text-indigo-600" />
                  Riwayat Audit Stock Taking (Opname Log)
                </h3>
                <p className="text-xs text-slate-500">Log audit pemeriksaan fisik per shift dan total selisihnya</p>
              </div>
            </div>

            <div className="space-y-3">
              {stockTakeLogs.map((log) => (
                <div key={log.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center pb-2 mb-2 border-b border-slate-200/60 gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-slate-900 text-sm">{log.shiftName}</span>
                      <span className="bg-slate-200 text-slate-800 text-[10px] font-bold px-2 py-0.5 rounded-md">
                        {new Date(log.date).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })} WIB
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-slate-500">Pemeriksa: <strong>{log.conductedBy}</strong></span>
                      <span className={`font-mono font-black text-xs px-2.5 py-1 rounded-xl ${
                        log.totalDeficitCost > 0 ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {log.totalDeficitCost > 0 ? `Wastage: -Rp ${log.totalDeficitCost.toLocaleString('id-ID')}` : '🟢 100% Akurat (Rp 0)'}
                      </span>
                    </div>
                  </div>

                  {/* Summary of items in log */}
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {log.entries.map((entry, idx) => (
                      <span key={idx} className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border ${
                        entry.varianceQty === 0 ? 'bg-white text-slate-600 border-slate-200' :
                        entry.varianceQty < 0 ? 'bg-rose-50 text-rose-700 border-rose-200 font-bold' :
                        'bg-blue-50 text-blue-700 border-blue-200 font-bold'
                      }`}>
                        {entry.materialName}: {entry.actualCountedStock} {entry.unit} ({entry.varianceQty === 0 ? 'Cocok' : `${entry.varianceQty} ${entry.unit}`})
                      </span>
                    ))}
                  </div>
                  {log.notes && <p className="text-[10px] text-slate-500 italic mt-2">"{log.notes}"</p>}
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: ANALISIS LABA RUGI & HPP (P&L STATEMENT)          */}
      {/* ======================================================== */}
      {activeTab === 'pnl' && (
        <div className="space-y-6 animate-fade-in">
          
          {/* PNL HEADLINE KPI CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Omset Penjualan */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pendapatan Bersih</span>
              <div className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight mt-1">
                Rp {netRevenue.toLocaleString('id-ID')}
              </div>
              <p className="text-xs text-slate-500 mt-1 font-semibold">
                Gross: Rp {grossSales.toLocaleString('id-ID')} (Diskon Rp {discounts.toLocaleString('id-ID')})
              </p>
            </div>

            {/* Total HPP Aktual */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs">
              <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">Total HPP Aktual (COGS)</span>
              <div className="text-2xl lg:text-3xl font-black text-amber-600 tracking-tight mt-1">
                Rp {actualTotalCOGS.toLocaleString('id-ID')}
              </div>
              <p className="text-xs text-amber-800 mt-1 font-semibold">
                {((actualTotalCOGS / netRevenue) * 100).toFixed(1)}% dari Omset (Termasuk Wastage Rp {(totalWastageCost/1000).toFixed(0)}k)
              </p>
            </div>

            {/* Laba Kotor (Gross Profit) */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs">
              <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider">Laba Kotor (Gross Profit)</span>
              <div className="text-2xl lg:text-3xl font-black text-indigo-700 tracking-tight mt-1">
                Rp {grossProfit.toLocaleString('id-ID')}
              </div>
              <p className="text-xs text-indigo-600 mt-1 font-bold">
                Margin Kotor: <strong>{grossProfitMargin}%</strong>
              </p>
            </div>

            {/* Laba Bersih Usaha (Net Profit) */}
            <div className="bg-emerald-50 rounded-3xl p-5 border border-emerald-200 shadow-xs">
              <span className="text-xs font-black text-emerald-800 uppercase tracking-wider">Laba Bersih Estimasi (EBIT)</span>
              <div className="text-2xl lg:text-3xl font-black text-emerald-900 tracking-tight mt-1">
                Rp {netProfit.toLocaleString('id-ID')}
              </div>
              <p className="text-xs text-emerald-700 mt-1 font-black">
                Margin Bersih: <strong>{netProfitMargin}%</strong> (Setelah OPEX)
              </p>
            </div>

          </div>

          {/* P&L WATERFALL BREAKDOWN BAR CHART */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
              <div>
                <h3 className="font-black text-slate-900 text-sm uppercase tracking-wider flex items-center gap-2">
                  <BarChart3 size={18} className="text-indigo-600" />
                  Diagram Dekomposisi Laba Rugi (Pendapatan & Pengeluaran)
                </h3>
                <p className="text-xs text-slate-500">Visualisasi aliran omset menuju pembentukan laba bersih outlet</p>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={PNL_CHART_DATA} margin={{ top: 10, right: 10, left: -5, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis 
                    stroke="#94a3b8" 
                    fontSize={11} 
                    tickLine={false}
                    tickFormatter={(val) => `Rp ${Math.abs(val) / 1000000}M`}
                  />
                  <Tooltip 
                    formatter={(val: any) => [`Rp ${Number(val).toLocaleString('id-ID')}`, 'Nominal']}
                    contentStyle={{ backgroundColor: '#1e293b', borderRadius: '16px', color: '#fff', border: 'none', fontSize: '12px' }}
                  />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                    {PNL_CHART_DATA.map((entry, index) => (
                      <Cell key={`cell-pnl-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* FORMAL ACCOUNTING P&L STATEMENT TABLE */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between pb-4 mb-6 border-b-2 border-slate-900">
              <div>
                <h2 className="text-lg font-black text-slate-900 tracking-tight">
                  LAPORAN LABA RUGI OPERASIONAL (PROFIT & LOSS STATEMENT)
                </h2>
                <p className="text-xs text-slate-500">
                  Kopi Nusa Senopati • Periode: {period === 'Harian' ? 'Hari Ini (09 September 2026)' : period === 'Mingguan' ? '7 Hari Terakhir' : '30 Hari Terakhir'}
                </p>
              </div>
              <span className="bg-slate-100 text-slate-700 font-mono text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-200">
                Mata Uang: IDR (Rp)
              </span>
            </div>

            <div className="space-y-4 text-xs font-medium text-slate-800">
              
              {/* 1. PENDAPATAN */}
              <div>
                <div className="font-black text-slate-900 text-sm mb-2 flex items-center justify-between bg-slate-100 p-2.5 rounded-xl">
                  <span>1. PENDAPATAN PENJUALAN (REVENUE)</span>
                  <span></span>
                </div>
                <div className="pl-4 pr-2 space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Penjualan Kotor (Gross Sales - 142 Transaksi)</span>
                    <span className="font-mono font-semibold">Rp {grossSales.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between text-rose-600">
                    <span>Potongan / Diskon Promosi</span>
                    <span className="font-mono font-semibold">-Rp {discounts.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between font-black text-slate-900 pt-1.5 border-t border-slate-200 text-xs sm:text-sm">
                    <span>TOTAL PENDAPATAN BERSIH (NET REVENUE)</span>
                    <span className="font-mono text-emerald-700">Rp {netRevenue.toLocaleString('id-ID')}</span>
                  </div>
                </div>
              </div>

              {/* 2. HPP (HARGA POKOK PENJUALAN) */}
              <div className="pt-2">
                <div className="font-black text-slate-900 text-sm mb-2 flex items-center justify-between bg-slate-100 p-2.5 rounded-xl">
                  <span>2. HARGA POKOK PENJUALAN (COGS / BAHAN BAKU)</span>
                  <span className="text-xs font-bold text-amber-700">{((actualTotalCOGS/netRevenue)*100).toFixed(1)}% dari Omset</span>
                </div>
                <div className="pl-4 pr-2 space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-600">HPP Bahan Baku Teoretis (Konsumsi Resep POS)</span>
                    <span className="font-mono font-semibold">Rp {theoreticalCOGS.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between text-rose-600">
                    <span>Biaya Kerugian Selisih Stok & Wastage (Hasil Stock Taking)</span>
                    <span className="font-mono font-semibold">+Rp {totalWastageCost.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between font-black text-amber-900 pt-1.5 border-t border-slate-200 text-xs sm:text-sm">
                    <span>TOTAL HARGA POKOK PENJUALAN (ACTUAL COGS)</span>
                    <span className="font-mono text-amber-700">Rp {actualTotalCOGS.toLocaleString('id-ID')}</span>
                  </div>
                </div>
              </div>

              {/* 3. LABA KOTOR */}
              <div className="p-3 bg-indigo-50/70 border border-indigo-200 rounded-2xl flex justify-between items-center text-sm font-black text-indigo-950">
                <span>LABA KOTOR USAHA (GROSS PROFIT)</span>
                <div className="text-right">
                  <span className="font-mono text-indigo-900 text-base">Rp {grossProfit.toLocaleString('id-ID')}</span>
                  <span className="text-xs font-bold text-indigo-600 block">Margin: {grossProfitMargin}%</span>
                </div>
              </div>

              {/* 4. BEBAN OPERASIONAL (OPEX) */}
              <div className="pt-2">
                <div className="font-black text-slate-900 text-sm mb-2 flex items-center justify-between bg-slate-100 p-2.5 rounded-xl">
                  <span>3. BEBAN OPERASIONAL HARIAN (OPEX)</span>
                  <span className="text-xs font-bold text-slate-600">{((totalOPEX/netRevenue)*100).toFixed(1)}% dari Omset</span>
                </div>
                <div className="pl-4 pr-2 space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Gaji & Upah Barista / Kasir (Alokasi Shift)</span>
                    <span className="font-mono font-semibold">Rp {opexSalaries.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Beban Listrik, Gas Mesin Espresso & Air Bersih</span>
                    <span className="font-mono font-semibold">Rp {opexUtilities.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Penyusutan Alat, Kebersihan & Maintenance</span>
                    <span className="font-mono font-semibold">Rp {opexMaintenance.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between font-black text-slate-900 pt-1.5 border-t border-slate-200 text-xs sm:text-sm">
                    <span>TOTAL BEBAN OPERASIONAL (OPEX)</span>
                    <span className="font-mono text-slate-800">Rp {totalOPEX.toLocaleString('id-ID')}</span>
                  </div>
                </div>
              </div>

              {/* 5. LABA BERSIH (NET PROFIT / EBIT) */}
              <div className="p-4 bg-emerald-600 text-white rounded-3xl flex justify-between items-center shadow-lg shadow-emerald-600/20">
                <div>
                  <span className="text-xs font-black uppercase tracking-wider text-emerald-200 block">HASIL AKHIR</span>
                  <span className="text-base sm:text-lg font-black tracking-tight">LABA BERSIH ESTIMASI (NET PROFIT / EBIT)</span>
                </div>
                <div className="text-right">
                  <span className="font-mono text-xl sm:text-2xl font-black block">Rp {netProfit.toLocaleString('id-ID')}</span>
                  <span className="text-xs font-bold text-emerald-200">Net Profit Margin: {netProfitMargin}%</span>
                </div>
              </div>

            </div>
          </div>

        </div>
      )}

      </div>

      {/* TOAST FEEDBACK */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-3 border border-emerald-500/40 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <p className="text-xs font-bold">{toastMsg}</p>
        </div>
      )}

    </div>
  );
}
