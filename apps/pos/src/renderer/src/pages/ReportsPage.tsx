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
  Sliders
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

// ==========================================
// 1. DATA ANALITIK PENJUALAN
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

const PAYMENT_METHOD_DATA = [
  { name: 'QRIS Dinamis', value: 2350400, percent: 52, color: '#0ea5e9' },
  { name: 'Tunai (Cash)', value: 1250000, percent: 28, color: '#10b981' },
  { name: 'Debit / Kartu EDC', value: 542000, percent: 12, color: '#8b5cf6' },
  { name: 'E-Wallet (Gopay/OVO)', value: 377600, percent: 8, color: '#f59e0b' },
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

// ==========================================
// 2. MODEL BAHAN BAKU & STOK OPNAME
// ==========================================

export interface RawMaterialStock {
  id: string;
  name: string;
  category: 'Kopi' | 'Dairy' | 'Sirup' | 'Bubuk' | 'Pastry' | 'Packaging';
  unit: string;
  unitCost: number; // HPP per satuan (IDR)
  startStock: number; // Stok Awal Hari Ini
  stockIn: number; // Stok Masuk / Pembelian
  usedSystem: number; // Terpakai Berdasarkan Penjualan POS (Teoretis)
  actualPhysicalStock: number; // Stok Fisik Opname (Inputan Aktual)
  alertThreshold: number; // Batas Minimum Stok
}

const INITIAL_RAW_MATERIALS: RawMaterialStock[] = [
  {
    id: 'mat_1',
    name: 'Biji Kopi House Blend (Espresso)',
    category: 'Kopi',
    unit: 'kg',
    unitCost: 160000,
    startStock: 6.00,
    stockIn: 0.00,
    usedSystem: 2.84,
    actualPhysicalStock: 3.10, // Sisa sistem: 3.16 -> Selisih: -0.06 kg (-Rp 9.600)
    alertThreshold: 1.5,
  },
  {
    id: 'mat_2',
    name: 'Fresh Milk Pasteurisasi',
    category: 'Dairy',
    unit: 'Liter',
    unitCost: 22000,
    startStock: 20.0,
    stockIn: 10.0,
    usedSystem: 14.2,
    actualPhysicalStock: 15.0, // Sisa sistem: 15.8 -> Selisih: -0.8 L (-Rp 17.600)
    alertThreshold: 5.0,
  },
  {
    id: 'mat_3',
    name: 'Oat Milk Barista Edition',
    category: 'Dairy',
    unit: 'Liter',
    unitCost: 45000,
    startStock: 10.0,
    stockIn: 0.0,
    usedSystem: 3.5,
    actualPhysicalStock: 6.5, // Sisa sistem: 6.5 -> Selisih: 0 L
    alertThreshold: 2.0,
  },
  {
    id: 'mat_4',
    name: 'Sirup Gula Aren Cair Organik',
    category: 'Sirup',
    unit: 'Liter',
    unitCost: 35000,
    startStock: 5.0,
    stockIn: 0.0,
    usedSystem: 2.1,
    actualPhysicalStock: 2.8, // Sisa sistem: 2.9 -> Selisih: -0.1 L (-Rp 3.500)
    alertThreshold: 1.0,
  },
  {
    id: 'mat_5',
    name: 'Matcha Powder Ceremonial Uji',
    category: 'Bubuk',
    unit: 'Gram',
    unitCost: 600, // Rp 600/g = Rp 600.000/kg
    startStock: 1000,
    stockIn: 0,
    usedSystem: 360,
    actualPhysicalStock: 630, // Sisa sistem: 640 -> Selisih: -10 g (-Rp 6.000)
    alertThreshold: 200,
  },
  {
    id: 'mat_6',
    name: 'Butter Croissant Dough (Frozen)',
    category: 'Pastry',
    unit: 'Pcs',
    unitCost: 12000,
    startStock: 40,
    stockIn: 0,
    usedSystem: 26,
    actualPhysicalStock: 14, // Sisa sistem: 14 -> Selisih: 0 pcs
    alertThreshold: 10,
  },
  {
    id: 'mat_7',
    name: 'Cup PET 16oz + Lid + Paper Straw',
    category: 'Packaging',
    unit: 'Set',
    unitCost: 1500,
    startStock: 300,
    stockIn: 0,
    usedSystem: 130,
    actualPhysicalStock: 168, // Sisa sistem: 170 -> Selisih: -2 set (-Rp 3.000)
    alertThreshold: 50,
  },
];

export default function ReportsPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isManager = user?.role === 'MANAGER' || user?.role === 'ADMIN';

  useEffect(() => {
    if (!isManager) {
      navigate('/');
    }
  }, [isManager, navigate]);

  // Tab State
  const [activeTab, setActiveTab] = useState<'sales' | 'stock' | 'pnl'>('sales');
  const [period, setPeriod] = useState<'Harian' | 'Mingguan' | 'Bulanan'>('Harian');
  const [chartMetric, setChartMetric] = useState<'revenue' | 'orders'>('revenue');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Stock Tracking & Opname State
  const [materials, setMaterials] = useState<RawMaterialStock[]>(INITIAL_RAW_MATERIALS);
  const [selectedMaterialForEdit, setSelectedMaterialForEdit] = useState<RawMaterialStock | null>(null);
  const [editPhysicalInput, setEditPhysicalInput] = useState<string>('');
  const [showOpnameModal, setShowOpnameModal] = useState<boolean>(false);

  if (!isManager) {
    return null;
  }

  // ==========================================
  // KALKULASI LABA RUGI & HPP REAL-TIME
  // ==========================================
  const grossSales = 4670000;
  const discounts = 150000;
  const netRevenue = grossSales - discounts; // Rp 4.520.000

  // Hitung HPP Teoretis (Resep POS) & Kerugian Selisih Stok (Wastage)
  let theoreticalCOGS = 0;
  let totalWastageCost = 0;
  let totalRemainingSystemValue = 0;
  let totalActualPhysicalValue = 0;

  materials.forEach((mat) => {
    const sisaSistem = mat.startStock + mat.stockIn - mat.usedSystem;
    const selisihQty = mat.actualPhysicalStock - sisaSistem;
    const hppTerpakai = mat.usedSystem * mat.unitCost;
    
    theoreticalCOGS += hppTerpakai;
    totalRemainingSystemValue += sisaSistem * mat.unitCost;
    totalActualPhysicalValue += mat.actualPhysicalStock * mat.unitCost;

    if (selisihQty < 0) {
      // Selisih kurang = Kerugian Bahan Baku (Spillage / Wastage)
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

  // P&L Waterfall / Step Data for Recharts
  const PNL_CHART_DATA = [
    { name: '1. Omset Bersih', value: netRevenue, type: 'revenue', color: '#10b981' },
    { name: '2. HPP Resep POS', value: -theoreticalCOGS, type: 'cogs', color: '#f59e0b' },
    { name: '3. Selisih/Wastage', value: -totalWastageCost, type: 'wastage', color: '#ef4444' },
    { name: '4. Laba Kotor', value: grossProfit, type: 'profit', color: '#8b5cf6' },
    { name: '5. Biaya OPEX', value: -totalOPEX, type: 'opex', color: '#f97316' },
    { name: '6. Laba Bersih (EBIT)', value: netProfit, type: 'netprofit', color: '#0ea5e9' },
  ];

  // Stock Comparison Bar Chart Data
  const STOCK_COMPARISON_CHART_DATA = materials.map((mat) => {
    return {
      name: mat.name.length > 14 ? mat.name.slice(0, 13) + '…' : mat.name,
      'Stok Awal': mat.startStock + mat.stockIn,
      'Terpakai (POS)': mat.usedSystem,
      'Stok Fisik': mat.actualPhysicalStock,
      unit: mat.unit,
    };
  });

  // Handler Update Opname Fisik
  const handleSaveOpname = () => {
    if (!selectedMaterialForEdit) return;
    const parsedVal = parseFloat(editPhysicalInput);
    if (isNaN(parsedVal) || parsedVal < 0) {
      setToastMsg('⚠️ Jumlah stok fisik harus berupa angka valid.');
      setTimeout(() => setToastMsg(null), 3000);
      return;
    }

    setMaterials(prev => prev.map(item => {
      if (item.id === selectedMaterialForEdit.id) {
        return { ...item, actualPhysicalStock: parsedVal };
      }
      return item;
    }));

    setShowOpnameModal(false);
    setSelectedMaterialForEdit(null);
    setToastMsg(`✅ Stok fisik ${selectedMaterialForEdit.name} berhasil diperbarui! Laba rugi telah direkalkulasi.`);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Handler Export CSV
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
    } else if (activeTab === 'stock') {
      const csvContent = "data:text/csv;charset=utf-8," 
        + "ID,Nama Bahan Baku,Kategori,Satuan,HPP Unit,Stok Awal,Stok Masuk,Terpakai POS,Sisa Sistem,Stok Fisik Opname,Selisih Qty,Nilai Selisih (IDR),Status\n"
        + materials.map(m => {
          const sisa = m.startStock + m.stockIn - m.usedSystem;
          const diff = m.actualPhysicalStock - sisa;
          const diffRp = diff * m.unitCost;
          const statusStr = Math.abs(diff) === 0 ? 'Cocok' : diff < 0 ? 'Selisih Kurang (Wastage)' : 'Surplus';
          return `"${m.id}","${m.name}","${m.category}","${m.unit}",${m.unitCost},${m.startStock},${m.stockIn},${m.usedSystem},${sisa.toFixed(2)},${m.actualPhysicalStock},${diff.toFixed(2)},${diffRp.toFixed(0)},"${statusStr}"`;
        }).join("\n");
      
      const link = document.createElement("a");
      link.setAttribute("href", encodeURI(csvContent));
      link.setAttribute("download", `Laporan_Stok_Opname_${period}_${new Date().toISOString().slice(0, 10)}.csv`);
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
        + `Biaya Selisih Stok (Wastage/Spillage),-${totalWastageCost.toFixed(0)},-${((totalWastageCost/netRevenue)*100).toFixed(1)}%\n`
        + `TOTAL HPP AKTUAL,-${actualTotalCOGS.toFixed(0)},-${((actualTotalCOGS/netRevenue)*100).toFixed(1)}%\n`
        + `LABA KOTOR (GROSS PROFIT),${grossProfit.toFixed(0)},${grossProfitMargin}%\n`
        + `Beban Gaji & Upah,-${opexSalaries},-9.9%\n`
        + `Beban Listrik & Utilitas,-${opexUtilities},-2.6%\n`
        + `Beban Pemeliharaan & Alat,-${opexMaintenance},-1.1%\n`
        + `TOTAL BEBAN OPERASIONAL (OPEX),-${totalOPEX},-13.7%\n`
        + `LABA BERSIH ESTIMASI (EBIT),${netProfit.toFixed(0)},${netProfitMargin}%\n`;
      
      const link = document.createElement("a");
      link.setAttribute("href", encodeURI(csvContent));
      link.setAttribute("download", `Laporan_Laba_Rugi_PnL_${period}_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    setToastMsg('📊 File CSV berhasil diunduh.');
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
      {/* 2. TAB NAVIGASI OWNER DASHBOARD                         */}
      {/* ======================================================== */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('sales')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-xs sm:text-sm transition-all ${
            activeTab === 'sales'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <BarChart3 size={16} />
          <span>📈 Ringkasan & Grafik Penjualan</span>
        </button>

        <button
          onClick={() => setActiveTab('stock')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-xs sm:text-sm transition-all ${
            activeTab === 'stock'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <Package size={16} />
          <span>📦 Pelacakan Stok & Opname Bahan</span>
          {totalWastageCost > 0 && (
            <span className="bg-rose-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-black animate-pulse">
              -Rp {(totalWastageCost / 1000).toFixed(0)}k
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('pnl')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-xs sm:text-sm transition-all ${
            activeTab === 'pnl'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <Calculator size={16} />
          <span>💰 Analisis Laba Rugi (P&L & HPP)</span>
          <span className="bg-emerald-500/20 text-emerald-800 border border-emerald-400/40 text-[10px] px-2 py-0.5 rounded-full font-black">
            {grossProfitMargin}% Margin
          </span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: RINGKASAN & GRAFIK PENJUALAN                     */}
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

          {/* CHARTS GRID: HOURLY SALES & WEEKLY TREND */}
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

                {/* Metric Selector Toggle */}
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

              {/* Area Chart Container */}
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

                {/* Donut Chart */}
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

              {/* Legend List */}
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

          {/* 7-DAY SALES COMPARISON BAR CHART */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
              <div>
                <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <BarChart3 size={18} className="text-indigo-600" />
                  Tren Penjualan 7 Hari Terakhir
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Perbandingan omset dan volume pesanan harian dari Senin hingga hari ini
                </p>
              </div>
            </div>

            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={WEEKLY_SALES_DATA} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis 
                    stroke="#94a3b8" 
                    fontSize={11} 
                    tickLine={false} 
                    tickFormatter={(val) => `Rp ${val / 1000000}M`}
                  />
                  <Tooltip 
                    formatter={(val: any) => [`Rp ${Number(val).toLocaleString('id-ID')}`, 'Total Omset']}
                    contentStyle={{ backgroundColor: '#1e293b', borderRadius: '16px', color: '#fff', border: 'none', fontSize: '12px' }}
                  />
                  <Bar dataKey="revenue" fill="#6366f1" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
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

            {/* AUDIT SHIFT KASIR & REKONSILIASI KAS (1 COL) */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 pb-3 mb-3 border-b border-slate-100">
                  <Users size={18} className="text-indigo-600" />
                  <h3 className="font-black text-slate-900 text-sm uppercase tracking-wider">
                    Rekonsiliasi Shift & Laci Kas
                  </h3>
                </div>

                <div className="space-y-4 text-xs">
                  {/* Shift 1 (Pagi) */}
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

                  {/* Shift 2 (Sore/Malam) */}
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

              {/* Total Summary Footer */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center text-xs">
                <span className="text-slate-500 font-bold">Total Transaksi Kasir:</span>
                <span className="font-mono font-black text-slate-900">142 Trx • Rp 4.520.000</span>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: PELACAKAN STOK & OPNAME BAHAN BAKU               */}
      {/* ======================================================== */}
      {activeTab === 'stock' && (
        <div className="space-y-6 animate-fade-in">
          
          {/* STOCK KPI SUMMARY */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Total System Stock Value */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nilai Stok Sisa (Sistem)</span>
                <div className="w-9 h-9 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Package size={18} />
                </div>
              </div>
              <div className="text-2xl font-black text-slate-900 tracking-tight">
                Rp {totalRemainingSystemValue.toLocaleString('id-ID')}
              </div>
              <p className="text-[11px] text-slate-500 mt-1 font-semibold">
                Berdasarkan hitungan otomatis resep POS
              </p>
            </div>

            {/* Total Physical Stock Value */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nilai Stok Fisik (Opname)</span>
                <div className="w-9 h-9 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <CheckCircle2 size={18} />
                </div>
              </div>
              <div className="text-2xl font-black text-slate-900 tracking-tight">
                Rp {totalActualPhysicalValue.toLocaleString('id-ID')}
              </div>
              <p className="text-[11px] text-emerald-700 mt-1 font-semibold">
                Nilai riil bahan baku di gudang & bar
              </p>
            </div>

            {/* Theoretical COGS Used */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Bahan Terpakai Hari Ini</span>
                <div className="w-9 h-9 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Coffee size={18} />
                </div>
              </div>
              <div className="text-2xl font-black text-slate-900 tracking-tight">
                Rp {theoreticalCOGS.toLocaleString('id-ID')}
              </div>
              <p className="text-[11px] text-amber-700 mt-1 font-semibold">
                HPP bahan baku dari 142 pesanan POS
              </p>
            </div>

            {/* Total Wastage / Selisih Kerugian */}
            <div className={`bg-white rounded-3xl p-5 border shadow-xs ${totalWastageCost > 0 ? 'border-rose-300 bg-rose-50/20' : 'border-slate-200'}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-rose-700 uppercase tracking-wider">Kerugian Selisih (Wastage)</span>
                <div className="w-9 h-9 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
                  <AlertTriangle size={18} />
                </div>
              </div>
              <div className="text-2xl font-black text-rose-600 tracking-tight">
                -Rp {totalWastageCost.toLocaleString('id-ID')}
              </div>
              <p className="text-[11px] text-rose-600 mt-1 font-semibold">
                {totalWastageCost > 0 ? 'Spillage, kalibrasi espresso & tumpahan' : 'Semua bahan sesuai (0 Wastage)'}
              </p>
            </div>

          </div>

          {/* STOCK COMPARISON CHART */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
              <div>
                <h3 className="font-black text-slate-900 text-sm uppercase tracking-wider flex items-center gap-2">
                  <BarChart3 size={18} className="text-indigo-600" />
                  Grafik Komparasi Stok Awal vs Terpakai vs Stok Fisik
                </h3>
                <p className="text-xs text-slate-500">Melihat konsumsi bahan baku vs sisa stok di bar</p>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={STOCK_COMPARISON_CHART_DATA} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <Tooltip 
                    formatter={(val: any, name: any, item: any) => [
                      `${val} ${item.payload.unit}`,
                      name
                    ]}
                    contentStyle={{ backgroundColor: '#1e293b', borderRadius: '16px', color: '#fff', border: 'none', fontSize: '12px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <Bar dataKey="Stok Awal" fill="#cbd5e1" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="Terpakai (POS)" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="Stok Fisik" fill="#10b981" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* RAW MATERIALS COMPARISON TABLE & STOCK OPNAME INPUT */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-slate-100 gap-3">
              <div>
                <h3 className="font-black text-slate-900 text-sm uppercase tracking-wider flex items-center gap-2">
                  <Layers size={18} className="text-indigo-600" />
                  Tabel Komparasi Stok & Stock Opname Harian
                </h3>
                <p className="text-xs text-slate-500">
                  Klik tombol <strong>"Ubah Fisik"</strong> untuk menginput hasil opname kasir/barista
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-semibold">Status Stok:</span>
                <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  🟢 Cocok
                </span>
                <span className="flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                  🔴 Ada Selisih
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-black uppercase tracking-wider bg-slate-50/50">
                    <th className="p-3">Bahan Baku</th>
                    <th className="p-3">Kategori</th>
                    <th className="p-3 text-right">HPP / Unit</th>
                    <th className="p-3 text-center">Stok Awal</th>
                    <th className="p-3 text-center">Masuk (+)</th>
                    <th className="p-3 text-center bg-amber-50/60 text-amber-900">Terpakai (POS)</th>
                    <th className="p-3 text-center bg-slate-100/70">Sisa Sistem</th>
                    <th className="p-3 text-center bg-indigo-50/60 text-indigo-950 font-black">Stok Fisik (Opname)</th>
                    <th className="p-3 text-center">Selisih (Wastage)</th>
                    <th className="p-3 text-right">Nilai Selisih (Rp)</th>
                    <th className="p-3 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {materials.map((mat) => {
                    const sisaSistem = Number((mat.startStock + mat.stockIn - mat.usedSystem).toFixed(2));
                    const selisihQty = Number((mat.actualPhysicalStock - sisaSistem).toFixed(2));
                    const selisihRp = selisihQty * mat.unitCost;
                    const isAccurate = Math.abs(selisihQty) === 0;
                    const isDeficit = selisihQty < 0;

                    return (
                      <tr key={mat.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3 font-bold text-slate-900">
                          <div className="flex items-center gap-1.5">
                            {isAccurate ? (
                              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
                            ) : (
                              <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0"></span>
                            )}
                            <span>{mat.name}</span>
                          </div>
                        </td>
                        <td className="p-3">
                          <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-bold text-[10px]">
                            {mat.category}
                          </span>
                        </td>
                        <td className="p-3 text-right font-mono font-semibold text-slate-700">
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
                        <td className="p-3 text-center font-mono font-black text-indigo-900 bg-indigo-50/30">
                          <span className="bg-indigo-100/70 border border-indigo-200 px-2 py-1 rounded-lg">
                            {mat.actualPhysicalStock} {mat.unit}
                          </span>
                        </td>
                        <td className="p-3 text-center font-mono font-bold">
                          {isAccurate ? (
                            <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                              0 {mat.unit}
                            </span>
                          ) : isDeficit ? (
                            <span className="text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md">
                              {selisihQty} {mat.unit}
                            </span>
                          ) : (
                            <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                              +{selisihQty} {mat.unit}
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-right font-mono font-black">
                          {isAccurate ? (
                            <span className="text-emerald-700">Rp 0</span>
                          ) : isDeficit ? (
                            <span className="text-rose-600">-Rp {Math.abs(selisihRp).toLocaleString('id-ID')}</span>
                          ) : (
                            <span className="text-blue-600">+Rp {selisihRp.toLocaleString('id-ID')}</span>
                          )}
                        </td>
                        <td className="p-3 text-center">
                          <button
                            onClick={() => {
                              setSelectedMaterialForEdit(mat);
                              setEditPhysicalInput(String(mat.actualPhysicalStock));
                              setShowOpnameModal(true);
                            }}
                            className="bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 px-2.5 py-1.5 rounded-xl font-bold transition-all border border-slate-200 text-[11px] flex items-center gap-1 mx-auto"
                            title="Input / Koreksi Stok Fisik"
                          >
                            <Edit3 size={13} />
                            <span>Opname</span>
                          </button>
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

      {/* ======================================================== */}
      {/* TAB 3: ANALISIS LABA RUGI & HPP (P&L STATEMENT)          */}
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
                    <span>Biaya Selisih Stok Fisik & Wastage (Spillage/Tumpah/Kalibrasi)</span>
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

      {/* ======================================================== */}
      {/* MODAL INPUT STOCK OPNAME                                */}
      {/* ======================================================== */}
      {showOpnameModal && selectedMaterialForEdit && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-scale-up">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Package size={20} />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base">Input Stock Opname</h3>
                  <p className="text-xs text-slate-500">{selectedMaterialForEdit.name}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-1.5 font-semibold">
                <div className="flex justify-between text-slate-600">
                  <span>Stok Awal + Masuk:</span>
                  <span className="font-mono text-slate-900 font-bold">{selectedMaterialForEdit.startStock + selectedMaterialForEdit.stockIn} {selectedMaterialForEdit.unit}</span>
                </div>
                <div className="flex justify-between text-amber-700">
                  <span>Terpakai Resep POS:</span>
                  <span className="font-mono font-bold">-{selectedMaterialForEdit.usedSystem} {selectedMaterialForEdit.unit}</span>
                </div>
                <div className="flex justify-between text-slate-900 pt-1.5 border-t border-slate-200 font-black">
                  <span>Sisa Menurut Sistem POS:</span>
                  <span className="font-mono text-indigo-600 text-sm">
                    {(selectedMaterialForEdit.startStock + selectedMaterialForEdit.stockIn - selectedMaterialForEdit.usedSystem).toFixed(2)} {selectedMaterialForEdit.unit}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1.5">
                  Jumlah Stok Fisik Riil Hasil Hitung / Timbang ({selectedMaterialForEdit.unit}):
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={editPhysicalInput}
                  onChange={(e) => setEditPhysicalInput(e.target.value)}
                  className="w-full text-lg font-mono font-black p-3 bg-white border-2 border-indigo-500 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/20 text-slate-900"
                  placeholder={`Contoh: ${(selectedMaterialForEdit.startStock + selectedMaterialForEdit.stockIn - selectedMaterialForEdit.usedSystem).toFixed(2)}`}
                  autoFocus
                />
              </div>

              {/* Preview Difference Calculation */}
              {editPhysicalInput !== '' && !isNaN(parseFloat(editPhysicalInput)) && (
                <div className="p-3 bg-slate-100 rounded-2xl text-xs space-y-1">
                  {(() => {
                    const parsed = parseFloat(editPhysicalInput);
                    const sisa = selectedMaterialForEdit.startStock + selectedMaterialForEdit.stockIn - selectedMaterialForEdit.usedSystem;
                    const diff = parsed - sisa;
                    const diffRp = diff * selectedMaterialForEdit.unitCost;

                    if (Math.abs(diff) === 0) {
                      return (
                        <p className="text-emerald-700 font-bold flex items-center gap-1.5">
                          <CheckCircle2 size={15} /> Stok fisik 100% cocok dengan resep POS!
                        </p>
                      );
                    } else if (diff < 0) {
                      return (
                        <p className="text-rose-600 font-bold flex items-center gap-1.5">
                          <AlertTriangle size={15} /> Selisih Kurang: {diff.toFixed(2)} {selectedMaterialForEdit.unit} (-Rp {Math.abs(diffRp).toLocaleString('id-ID')})
                        </p>
                      );
                    } else {
                      return (
                        <p className="text-blue-600 font-bold flex items-center gap-1.5">
                          <Info size={15} /> Surplus Fisik: +{diff.toFixed(2)} {selectedMaterialForEdit.unit} (+Rp {diffRp.toLocaleString('id-ID')})
                        </p>
                      );
                    }
                  })()}
                </div>
              )}

            </div>

            <div className="flex items-center gap-2.5 mt-6 pt-3 border-t border-slate-100">
              <button
                onClick={() => {
                  setShowOpnameModal(false);
                  setSelectedMaterialForEdit(null);
                }}
                className="flex-1 py-2.5 rounded-2xl font-bold text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleSaveOpname}
                className="flex-1 py-2.5 rounded-2xl font-bold text-xs bg-indigo-600 hover:bg-indigo-700 text-white transition-all shadow-md shadow-indigo-600/20 active:scale-95"
              >
                Simpan & Update Laba Rugi
              </button>
            </div>
          </div>
        </div>
      )}

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
