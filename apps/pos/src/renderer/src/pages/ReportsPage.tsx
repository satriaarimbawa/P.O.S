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
  Coins
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
// MOCK DATA ANALITIK OWNER
// ==========================================

// 1. Tren Penjualan Jam ke Jam (Hourly Peak Hours)
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

// 2. Tren Penjualan 7 Hari Terakhir
const WEEKLY_SALES_DATA = [
  { day: 'Senin (03/09)', revenue: 3850000, orders: 124 },
  { day: 'Selasa (04/09)', revenue: 4120000, orders: 132 },
  { day: 'Rabu (05/09)', revenue: 3980000, orders: 128 },
  { day: 'Kamis (06/09)', revenue: 4350000, orders: 139 },
  { day: 'Jumat (07/09)', revenue: 5620000, orders: 178 },
  { day: 'Sabtu (08/09)', revenue: 6840000, orders: 215 },
  { day: 'Minggu (Hari Ini)', revenue: 4520000, orders: 142 },
];

// 3. Komposisi Penjualan Berdasarkan Kategori
const CATEGORY_SALES_DATA = [
  { name: 'Kopi (Espresso & Milk)', value: 2350000, percent: 52, color: '#8b5cf6' },
  { name: 'Non-Kopi (Matcha & Tea)', value: 994000, percent: 22, color: '#10b981' },
  { name: 'Pastry & Bakery', value: 723000, percent: 16, color: '#f59e0b' },
  { name: 'Makanan & Snack', value: 453000, percent: 10, color: '#ef4444' },
];

// 4. Metode Pembayaran
const PAYMENT_METHOD_DATA = [
  { name: 'QRIS Dinamis', value: 2350400, percent: 52, color: '#0ea5e9' },
  { name: 'Tunai (Cash)', value: 1250000, percent: 28, color: '#10b981' },
  { name: 'Debit / Kartu EDC', value: 542000, percent: 12, color: '#8b5cf6' },
  { name: 'E-Wallet (Gopay/OVO)', value: 377600, percent: 8, color: '#f59e0b' },
];

// 5. Leaderboard Produk Terlaris
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

  useEffect(() => {
    if (!isManager) {
      navigate('/');
    }
  }, [isManager, navigate]);

  const [period, setPeriod] = useState<'Harian' | 'Mingguan' | 'Bulanan'>('Harian');
  const [chartMetric, setChartMetric] = useState<'revenue' | 'orders'>('revenue');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  if (!isManager) {
    return null;
  }

  const handleExportCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Peringkat,Nama Menu,Kategori,Kuantitas Terjual,Total Omset (IDR),Kontribusi (%)\n"
      + TOP_PRODUCTS_DATA.map(p => `${p.rank},"${p.name}","${p.category}",${p.qty},${p.revenue},${p.share}%`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Laporan_Penjualan_KopiNusa_${period}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setToastMsg('📊 Laporan CSV/Excel berhasil diekspor.');
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handlePrintDocument = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 p-4 sm:p-6 lg:p-8 font-sans select-none">
      
      {/* ======================================================== */}
      {/* 1. HEADER & ACTION CONTROLS                             */}
      {/* ======================================================== */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4 bg-white p-4 sm:p-5 rounded-3xl shadow-xs border border-slate-200">
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
                Laporan & Analitik Penjualan Owner
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
              className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-xs active:scale-95"
              title="Cetak Dokumen Laporan Formal (A4)"
            >
              <Printer size={15} />
              <span>Cetak Laporan</span>
            </button>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. TOP EXECUTIVE KPI CARDS                              */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        
        {/* Total Omset */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="flex justify-between items-start mb-2">
            <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Total Omset Penjualan</span>
            <span className="flex items-center text-emerald-700 text-[11px] font-black bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              <TrendingUp size={12} className="mr-1" /> +14.8%
            </span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-slate-900 font-mono tracking-tight">
            Rp 4.520.000
          </h3>
          <div className="flex justify-between items-center text-[11px] text-slate-400 mt-2 pt-2 border-t border-slate-100 font-medium">
            <span>DPP: Rp 4.072.072</span>
            <span>PPN 11%: Rp 447.928</span>
          </div>
        </div>

        {/* Total Pesanan & AOV */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs">
          <div className="flex justify-between items-start mb-2">
            <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Total Transaksi (Orders)</span>
            <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
              142 Trx
            </span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
            142 <span className="text-sm font-semibold text-slate-500">Order</span>
          </h3>
          <div className="flex justify-between items-center text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-100 font-medium">
            <span>Rata-rata (AOV):</span>
            <span className="font-bold text-slate-800 font-mono">Rp 31.830 / Order</span>
          </div>
        </div>

        {/* Laba Kotor & Margin */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs">
          <div className="flex justify-between items-start mb-2">
            <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Estimasi Laba Kotor (Gross)</span>
            <span className="text-[11px] font-black text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
              Margin 68%
            </span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-indigo-900 font-mono">
            Rp 3.073.600
          </h3>
          <div className="flex justify-between items-center text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-100 font-medium">
            <span>Estimasi HPP (COGS):</span>
            <span className="font-bold text-rose-600 font-mono">Rp 1.446.400 (32%)</span>
          </div>
        </div>

        {/* Komposisi Kas di Laci vs Non-Tunai */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs">
          <div className="flex justify-between items-start mb-2">
            <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Metode Pembayaran</span>
            <span className="text-[11px] font-bold text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded-full">
              72% Non-Tunai
            </span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
            Rp 3.270.000
          </h3>
          <div className="flex justify-between items-center text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-100 font-medium font-mono">
            <span>Cash Laci: Rp 1.250k</span>
            <span>QRIS: Rp 2.350k</span>
          </div>
        </div>

      </div>

      {/* ======================================================== */}
      {/* 3. MAIN INTERACTIVE CHARTS AREA                         */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
        
        {/* LEFT CHART (8 cols): GRAFIK TREN PENJUALAN UTAMA */}
        <div className="lg:col-span-8 bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-slate-100 gap-3">
              <div>
                <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <BarChart3 className="text-[#e94560]" size={20} />
                  {period === 'Harian' 
                    ? 'Grafik Penjualan Jam ke Jam (Peak Hours Analitik)' 
                    : 'Grafik Tren Penjualan Harian'}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {period === 'Harian' 
                    ? 'Pantau jam sibuk pagi (Morning Rush) & malam (Evening Hangout) untuk optimasi staf' 
                    : 'Perbandingan omset dan volume pesanan selama 7 hari operasional toko'}
                </p>
              </div>

              {/* Metric Toggle */}
              <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setChartMetric('revenue')}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    chartMetric === 'revenue' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Omset (Rp)
                </button>
                <button
                  type="button"
                  onClick={() => setChartMetric('orders')}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    chartMetric === 'orders' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Jumlah Order
                </button>
              </div>
            </div>

            {/* RECHARTS VISUALIZATION */}
            <div className="w-full h-72 sm:h-80">
              <ResponsiveContainer width="100%" height="100%">
                {period === 'Harian' ? (
                  <AreaChart data={HOURLY_SALES_DATA} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#e94560" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#e94560" stopOpacity={0.0}/>
                      </linearGradient>
                      <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis 
                      dataKey="hour" 
                      stroke="#94a3b8" 
                      fontSize={11} 
                      tickLine={false} 
                      axisLine={{ stroke: '#e2e8f0' }}
                    />
                    <YAxis 
                      stroke="#94a3b8" 
                      fontSize={11} 
                      tickLine={false} 
                      axisLine={false}
                      tickFormatter={(val) => chartMetric === 'revenue' ? `${val / 1000}k` : val}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1e293b', 
                        borderColor: '#334155', 
                        borderRadius: '16px', 
                        color: '#fff', 
                        fontSize: '12px',
                        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)'
                      }}
                      formatter={(val: any) => [
                        chartMetric === 'revenue' ? `Rp ${Number(val).toLocaleString('id-ID')}` : `${val} Order`,
                        chartMetric === 'revenue' ? 'Omset Penjualan' : 'Jumlah Pesanan'
                      ]}
                      labelStyle={{ fontWeight: 'bold', color: '#94a3b8', marginBottom: '4px' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey={chartMetric === 'revenue' ? 'revenue' : 'orders'} 
                      stroke={chartMetric === 'revenue' ? '#e94560' : '#6366f1'} 
                      strokeWidth={3} 
                      fillOpacity={1} 
                      fill={`url(#${chartMetric === 'revenue' ? 'colorRevenue' : 'colorOrders'})`} 
                    />
                  </AreaChart>
                ) : (
                  <BarChart data={WEEKLY_SALES_DATA} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis 
                      dataKey="day" 
                      stroke="#94a3b8" 
                      fontSize={10} 
                      tickLine={false} 
                      axisLine={{ stroke: '#e2e8f0' }}
                    />
                    <YAxis 
                      stroke="#94a3b8" 
                      fontSize={11} 
                      tickLine={false} 
                      axisLine={false}
                      tickFormatter={(val) => chartMetric === 'revenue' ? `${val / 1000000}M` : val}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1e293b', 
                        borderColor: '#334155', 
                        borderRadius: '16px', 
                        color: '#fff', 
                        fontSize: '12px' 
                      }}
                      formatter={(val: any) => [
                        chartMetric === 'revenue' ? `Rp ${Number(val).toLocaleString('id-ID')}` : `${val} Order`,
                        chartMetric === 'revenue' ? 'Total Omset' : 'Volume Order'
                      ]}
                    />
                    <Bar 
                      dataKey={chartMetric === 'revenue' ? 'revenue' : 'orders'} 
                      fill="#e94560" 
                      radius={[8, 8, 0, 0]} 
                    />
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>

          {/* Peak Hours Insight Note */}
          <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span><strong>Jam Paling Ramai:</strong> 18:00 - 20:00 (Rp 1.430.000 • 44 Order)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              <span><strong>Jam Sepi (Promo Target):</strong> 14:00 - 16:00 (Rp 400.000 • 13 Order)</span>
            </div>
          </div>
        </div>

        {/* RIGHT CHART (4 cols): KOMPOSISI KATEGORI PENJUALAN */}
        <div className="lg:col-span-4 bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="pb-3 mb-3 border-b border-slate-100">
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                <PieIcon className="text-indigo-600" size={18} />
                Penjualan per Kategori
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Proporsi omset produk kopi vs non-kopi & makanan</p>
            </div>

            {/* DONUT PIE CHART */}
            <div className="w-full h-48 relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={CATEGORY_SALES_DATA}
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
                    contentStyle={{ backgroundColor: '#1e293b', borderRadius: '12px', color: '#fff', fontSize: '11px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xs font-bold text-slate-400">Total Kopi</span>
                <span className="text-base font-black text-slate-900">52%</span>
              </div>
            </div>

            {/* Category Breakdown List */}
            <div className="space-y-2 mt-2">
              {CATEGORY_SALES_DATA.map((cat) => (
                <div key={cat.name} className="flex items-center justify-between text-xs py-1.5 px-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-md" style={{ backgroundColor: cat.color }}></span>
                    <span className="font-bold text-slate-800 truncate max-w-[140px]">{cat.name}</span>
                  </div>
                  <div className="font-mono text-right">
                    <span className="font-extrabold text-slate-900">{cat.percent}%</span>
                    <span className="text-[10px] text-slate-400 ml-1.5 hidden sm:inline">
                      (Rp {(cat.value / 1000).toLocaleString('id-ID')}k)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-3 pt-2 text-[11px] text-slate-400 text-center font-medium">
            Kategori Kopi menyumbang lebih dari separuh omset kafe
          </div>
        </div>

      </div>

      {/* ======================================================== */}
      {/* 4. BEST SELLERS & SHIFT AUDIT                           */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEADERBOARD PRODUK TERLARIS (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Sparkles className="text-amber-500" size={18} />
              <h3 className="font-black text-slate-900 text-sm uppercase tracking-wider">
                Peringkat Produk Terlaris (Best Sellers)
              </h3>
            </div>
            <span className="text-xs text-indigo-600 font-bold bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100">
              Top 8 Menu
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3 rounded-l-xl">No</th>
                  <th className="py-2.5 px-3">Nama Menu</th>
                  <th className="py-2.5 px-3">Kategori</th>
                  <th className="py-2.5 px-3 text-center">Terjual</th>
                  <th className="py-2.5 px-3 text-right">Total Omset</th>
                  <th className="py-2.5 px-3 text-right rounded-r-xl">Kontribusi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {TOP_PRODUCTS_DATA.map((p) => (
                  <tr key={p.rank} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-3 font-bold text-slate-900">
                      <span className={`w-5 h-5 rounded-full inline-flex items-center justify-center text-[10px] font-black ${
                        p.rank === 1 ? 'bg-amber-400 text-slate-900 shadow-xs' :
                        p.rank === 2 ? 'bg-slate-300 text-slate-800' :
                        p.rank === 3 ? 'bg-amber-700/30 text-amber-900' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {p.rank}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-bold text-slate-900">{p.name}</td>
                    <td className="py-2.5 px-3">
                      <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-md">
                        {p.category}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-900">
                      {p.qty}x
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                      Rp {p.revenue.toLocaleString('id-ID')}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-black text-indigo-600">
                      {p.share}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* TIM SHIFT BERTUGAS & INGREDIENT USAGE (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* AUDIT SHIFT BERTUGAS */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs">
            <div className="flex items-center gap-2 pb-3 mb-3 border-b border-slate-100">
              <Users size={18} className="text-indigo-600" />
              <h3 className="font-black text-slate-900 text-sm uppercase tracking-wider">
                Audit Shift & Rekonsiliasi Kas Toko
              </h3>
            </div>

            <div className="space-y-3">
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="flex justify-between items-center mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                    <span className="font-black text-xs text-slate-800">Shift 1: Pagi (07:00 - 15:00)</span>
                  </div>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-full">
                    🟢 Kas Akurat (Rp 0)
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 font-medium">
                  <div>Kasir: <strong>Sari Novita</strong></div>
                  <div>Barista: <strong>Budi S.</strong></div>
                  <div>Transaksi: <strong>78 Order</strong></div>
                  <div>Omset: <strong className="font-mono text-slate-900">Rp 2.450.000</strong></div>
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="flex justify-between items-center mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                    <span className="font-black text-xs text-slate-800">Shift 2: Sore (15:00 - 23:00)</span>
                  </div>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-full">
                    🟢 Kas Akurat (Rp 0)
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 font-medium">
                  <div>Kasir: <strong>Rian Hidayat</strong></div>
                  <div>Barista: <strong>Dimas A.</strong></div>
                  <div>Transaksi: <strong>64 Order</strong></div>
                  <div>Omset: <strong className="font-mono text-slate-900">Rp 2.070.000</strong></div>
                </div>
              </div>
            </div>
          </div>

          {/* PEMAKAIAN BAHAN BAKU KRITIS (HPP) */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs">
            <div className="flex items-center gap-2 pb-3 mb-3 border-b border-slate-100">
              <Coffee size={18} className="text-amber-700" />
              <h3 className="font-black text-slate-900 text-sm uppercase tracking-wider">
                Pemakaian Bahan Baku Kritis
              </h3>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <div className="flex justify-between mb-1 font-semibold">
                  <span className="text-slate-700">Biji Kopi (Espresso Blend)</span>
                  <span className="font-mono font-black text-slate-900">2.84 kg (47% stok)</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-amber-800 h-2 rounded-full" style={{ width: '47%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1 font-semibold">
                  <span className="text-slate-700">Fresh Milk Pasteurisasi</span>
                  <span className="font-mono font-black text-slate-900">14.2 Liter (71% stok)</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: '71%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1 font-semibold">
                  <span className="text-slate-700">Oat Milk Premium</span>
                  <span className="font-mono font-black text-slate-900">3.5 Liter (87% stok)</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '87%' }}></div>
                </div>
              </div>
            </div>
          </div>

        </div>

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

