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
  CalendarDays,
  Send,
  XCircle,
  Clock3,
  Search,
  X
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
import { useInventoryStore, RawMaterial, StockRequest } from '../stores/useInventoryStore';

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
    stockRequests,
    addStaffStockIn,
    updateStockRequestStatus,
    fulfillStockRequest 
  } = useInventoryStore();

  useEffect(() => {
    if (!isManager) {
      navigate('/');
    }
  }, [isManager, navigate]);

  // Tab State: 'sales' | 'requests' | 'stock-in' | 'stock-take' | 'pnl'
  const [activeTab, setActiveTab] = useState<'sales' | 'requests' | 'stock-in' | 'stock-take' | 'pnl'>('sales');
  const [period, setPeriod] = useState<'Harian' | 'Mingguan' | 'Bulanan'>('Harian');
  const [chartMetric, setChartMetric] = useState<'revenue' | 'orders'>('revenue');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // ==========================================
  // STATE MASTER-DETAIL REVIEW REQUEST STOK
  // ==========================================
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [requestFilter, setRequestFilter] = useState<'ALL' | 'PENDING' | 'ORDERED' | 'RECEIVED' | 'REJECTED'>('ALL');
  const [requestSearch, setRequestSearch] = useState<string>('');
  const [editDoNumber, setEditDoNumber] = useState<string>('');
  const [editItems, setEditItems] = useState<{ materialId: string; qtyRequested: number }[]>([]);

  // ==========================================
  // STATE INPUT STOK MASUK SEDERHANA (STAFF / OWNER)
  // ==========================================
  const [supplierName, setSupplierName] = useState('');
  const [invoiceNo, setInvoiceNo] = useState('');
  const [receiverName, setReceiverName] = useState(user?.name || 'Sari N. (Store Staff)');
  const [stockInNotes, setStockInNotes] = useState('');
  const [stockInSearch, setStockInSearch] = useState('');
  const [stockInItems, setStockInItems] = useState<{ materialId: string; qty: number }[]>([
    { materialId: materials[0]?.id || 'mat_1', qty: 5 }
  ]);

  // ==========================================
  // STATE LAPORAN AUDIT STOK & SELISIH (OWNER READ-ONLY)
  // ==========================================
  const [stockAuditSearch, setStockAuditSearch] = useState<string>('');
  const [stockAuditCategory, setStockAuditCategory] = useState<string>('ALL');
  const [stockAuditSubTab, setStockAuditSubTab] = useState<'materials' | 'logs'>('materials');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  if (!isManager) {
    return null;
  }

  // ==========================================
  // KALKULASI LABA RUGI & HPP REAL-TIME
  // ==========================================
  const grossSales = 4670000;
  const discounts = 150000;
  const netRevenue = grossSales - discounts; // Rp 4.520.000

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

  const opexSalaries = 450000;
  const opexUtilities = 120000;
  const opexMaintenance = 50000;
  const totalOPEX = opexSalaries + opexUtilities + opexMaintenance; // Rp 620.000

  const netProfit = grossProfit - totalOPEX;
  const netProfitMargin = ((netProfit / netRevenue) * 100).toFixed(1);

  const PNL_CHART_DATA = [
    { name: '1. Omset Bersih', value: netRevenue, color: '#10b981' },
    { name: '2. HPP Resep POS', value: -theoreticalCOGS, color: '#f59e0b' },
    { name: '3. Selisih/Wastage', value: -totalWastageCost, color: '#ef4444' },
    { name: '4. Laba Kotor', value: grossProfit, color: '#8b5cf6' },
    { name: '5. Biaya OPEX', value: -totalOPEX, color: '#f97316' },
    { name: '6. Laba Bersih', value: netProfit, color: '#0ea5e9' },
  ];

  const pendingRequestsCount = stockRequests.filter(r => r.status === 'PENDING').length;
  const orderedRequestsCount = stockRequests.filter(r => r.status === 'ORDERED').length;
  const receivedRequestsCount = stockRequests.filter(r => r.status === 'RECEIVED').length;
  const rejectedRequestsCount = stockRequests.filter(r => r.status === 'REJECTED').length;

  // ==========================================
  // HANDLERS: MASTER-DETAIL & MODIFIKASI REQUEST OLEH OWNER
  // ==========================================
  const handleOpenRequestDetail = (reqId: string) => {
    const req = stockRequests.find(r => r.id === reqId);
    if (!req) return;
    setSelectedRequestId(reqId);
    const defaultDO = req.doNumber || `DO-${new Date().getFullYear()}/${String(new Date().getMonth() + 1).padStart(2, '0')}/${req.id.slice(-4)}`;
    setEditDoNumber(defaultDO);
    setEditItems(req.items.map(it => ({ materialId: it.materialId, qtyRequested: it.qtyRequested })));
  };

  const handleBackToList = () => {
    setSelectedRequestId(null);
  };

  const handleAddEditItemRow = () => {
    const defaultMat = materials[0]?.id || 'mat_1';
    setEditItems(prev => [...prev, { materialId: defaultMat, qtyRequested: 1 }]);
  };

  const handleRemoveEditItemRow = (index: number) => {
    setEditItems(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleSaveAndApproveEditedRequest = (requestId: string) => {
    if (editItems.length === 0) {
      setToastMsg('⚠️ Tambahkan minimal 1 bahan baku yang akan dikirim.');
      setTimeout(() => setToastMsg(null), 3000);
      return;
    }

    const hasInvalid = editItems.some(i => i.qtyRequested <= 0);
    if (hasInvalid) {
      setToastMsg('⚠️ Jumlah pengiriman bahan harus lebih dari 0.');
      setTimeout(() => setToastMsg(null), 3000);
      return;
    }

    const doNo = editDoNumber.trim() || `DO-${new Date().getFullYear()}/${String(new Date().getMonth() + 1).padStart(2, '0')}/${requestId.slice(-4)}`;
    updateStockRequestStatus(requestId, 'ORDERED', user?.name || 'Owner', doNo, editItems);
    setToastMsg(`🚀 Request disetujui! DO #${doNo} berhasil diterbitkan dengan kuantitas modifikasi.`);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleQuickApproveRequest = (req: StockRequest) => {
    const generatedDO = editDoNumber.trim() || req.doNumber || `DO-${new Date().getFullYear()}/${String(new Date().getMonth() + 1).padStart(2, '0')}/${req.id.slice(-4)}`;
    updateStockRequestStatus(req.id, 'ORDERED', user?.name || 'Owner', generatedDO);
    setToastMsg(`🚚 Request disetujui! DO #${generatedDO} diterbitkan.`);
    setTimeout(() => setToastMsg(null), 2500);
  };

  const handleRejectRequest = (reqId: string) => {
    updateStockRequestStatus(reqId, 'REJECTED', user?.name || 'Owner');
    setToastMsg('❌ Permintaan stok ditolak.');
    setTimeout(() => setToastMsg(null), 2500);
  };

  // ==========================================
  // HANDLERS
  // ==========================================

  const handleAddStockInRow = () => {
    setStockInItems(prev => [
      ...prev,
      { materialId: materials[0]?.id || 'mat_1', qty: 1 }
    ]);
  };

  const handleRemoveStockInRow = (index: number) => {
    setStockInItems(prev => prev.filter((_, idx) => idx !== index));
  };

  // Simpan Stok Masuk Sederhana (Tanpa Perhitungan Uang)
  const handleSubmitStockIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (stockInItems.length === 0) {
      setToastMsg('⚠️ Tambahkan minimal 1 bahan baku yang diterima.');
      setTimeout(() => setToastMsg(null), 3000);
      return;
    }

    const hasInvalidQty = stockInItems.some(i => i.qty <= 0);
    if (hasInvalidQty) {
      setToastMsg('⚠️ Jumlah Qty masuk harus lebih dari 0.');
      setTimeout(() => setToastMsg(null), 3000);
      return;
    }

    addStaffStockIn({
      supplierName: supplierName || 'Supplier Langganan',
      invoiceNo,
      receivedBy: receiverName,
      notes: stockInNotes,
      items: stockInItems,
    });

    setSupplierName('');
    setInvoiceNo('');
    setStockInNotes('');
    setStockInItems([{ materialId: materials[0]?.id || 'mat_1', qty: 5 }]);

    setToastMsg('✅ Stok masuk berhasil dicatat & stok bahan langsung bertambah!');
    setTimeout(() => setToastMsg(null), 3500);
  };

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
        + "ID,Nama Bahan,Kategori,Satuan,HPP Unit,Stok Awal,Masuk,Terpakai POS,Sisa Sistem,Fisik Terkini (Opname Staf),Selisih Qty,Kerugian Selisih (IDR),Status Audit\n"
        + materials.map(m => {
          const sisa = Number((m.startStock + m.stockIn - m.usedSystem).toFixed(2));
          const diff = Number((m.actualPhysicalStock - sisa).toFixed(2));
          const diffRp = diff * m.unitCost;
          const status = diff === 0 ? 'Cocok' : diff < 0 ? 'Defisit (Wastage)' : 'Surplus';
          return `"${m.id}","${m.name}","${m.category}","${m.unit}",${m.unitCost},${m.startStock},${m.stockIn},${m.usedSystem},${sisa},${m.actualPhysicalStock},${diff},${diffRp.toFixed(0)},"${status}"`;
        }).join("\n");
      
      const link = document.createElement("a");
      link.setAttribute("href", encodeURI(csvContent));
      link.setAttribute("download", `Laporan_Audit_Stok_${period}_${new Date().toISOString().slice(0, 10)}.csv`);
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
      {/* 2. TAB NAVIGASI OWNER DASHBOARD (5 TABS)                 */}
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

        {/* Tab 2: Review Request Stok Staff */}
        <button
          onClick={() => setActiveTab('requests')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-xs sm:text-sm transition-all ${
            activeTab === 'requests'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <Send size={16} />
          <span>📝 1. Request Stok Staff</span>
          {pendingRequestsCount > 0 && (
            <span className="bg-amber-500 text-slate-950 text-[10px] px-2 py-0.5 rounded-full font-black animate-pulse">
              {pendingRequestsCount} Request Baru
            </span>
          )}
        </button>

        {/* Tab 3: Stok Masuk & Pembelian */}
        <button
          onClick={() => setActiveTab('stock-in')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-xs sm:text-sm transition-all ${
            activeTab === 'stock-in'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <Truck size={16} />
          <span>📥 2. Stok Masuk & Pembelian</span>
          <span className="bg-slate-100 text-slate-700 text-[10px] px-1.5 py-0.5 rounded-full font-bold">
            {stockInLogs.length} Surat Jalan
          </span>
        </button>

        {/* Tab 4: Laporan Audit Stok (Opname) */}
        <button
          onClick={() => setActiveTab('stock-take')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-xs sm:text-sm transition-all ${
            activeTab === 'stock-take'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <ClipboardList size={16} />
          <span>📋 3. Laporan Audit Stok</span>
          {totalWastageCost > 0 ? (
            <span className="bg-rose-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-black animate-pulse">
              -Rp {(totalWastageCost / 1000).toFixed(0)}k
            </span>
          ) : (
            <span className="bg-emerald-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-black">
              100% Akurat
            </span>
          )}
        </button>

        {/* Tab 5: Laba Rugi P&L */}
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
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
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

          {/* LEADERBOARD */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
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
      {/* TAB 2: REVIEW PERMINTAAN STOK DARI STAFF (MASTER-DETAIL) */}
      {/* ======================================================== */}
      {activeTab === 'requests' && (
        <div className="space-y-6 animate-fade-in">
          
          {selectedRequestId ? (
            /* ====================================================== */
            /* SUB-VIEW A: DETAIL PO TERPILIH (FOKUS KE PO INI)       */
            /* ====================================================== */
            (() => {
              const currentReq = stockRequests.find(r => r.id === selectedRequestId);
              if (!currentReq) return null;

              return (
                <div className="space-y-6 animate-fade-in">
                  
                  {/* Header Navigasi Kembali & Ringkasan */}
                  <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={handleBackToList}
                        className="flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3.5 py-2.5 rounded-2xl transition-all cursor-pointer shadow-xs active:scale-95"
                        title="Kembali ke Daftar Permintaan"
                      >
                        <ArrowLeft size={16} />
                        <span>Kembali ke Daftar Request</span>
                      </button>

                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-base sm:text-lg font-black text-slate-900">
                            Detail Request #{currentReq.id.slice(-4)}
                          </h2>
                          {currentReq.doNumber && (
                            <span className="text-xs font-mono font-bold bg-indigo-100 text-indigo-900 px-2.5 py-0.5 rounded-lg border border-indigo-200">
                              📄 {currentReq.doNumber}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Diajukan oleh: <strong>{currentReq.requestedBy}</strong> • Outlet: <strong>Kopi Nusa Senopati</strong>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-black px-3 py-1.5 rounded-xl ${
                        currentReq.urgency === 'URGENT' ? 'bg-rose-100 text-rose-900 border border-rose-200 animate-pulse' : 'bg-slate-100 text-slate-800'
                      }`}>
                        {currentReq.urgency === 'URGENT' ? '🔴 Mendesak (Habis Hari Ini)' : '🟢 Normal (Restock Rutin)'}
                      </span>

                      <span className={`text-xs font-black px-3.5 py-1.5 rounded-xl ${
                        currentReq.status === 'PENDING' ? 'bg-amber-100 text-amber-950 border border-amber-300' :
                        currentReq.status === 'ORDERED' ? 'bg-blue-100 text-blue-950 border border-blue-300' :
                        currentReq.status === 'RECEIVED' ? 'bg-emerald-100 text-emerald-950 border border-emerald-300' :
                        'bg-rose-100 text-rose-950 border border-rose-300'
                      }`}>
                        {currentReq.status === 'PENDING' ? '⏳ Menunggu Persetujuan Owner' :
                         currentReq.status === 'ORDERED' ? '🚚 DO Diterbitkan (Sedang Dikirim)' :
                         currentReq.status === 'RECEIVED' ? '✅ Barang Sudah Diterima Staf' :
                         '❌ Ditolak'}
                      </span>
                    </div>
                  </div>

                  {/* Konten Utama Detail PO */}
                  <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
                    
                    {/* INFO STATUS KHUSUS UNTUK ORDERED / RECEIVED / REJECTED */}
                    {currentReq.status === 'ORDERED' && (
                      <div className="p-4 bg-blue-50/80 border border-blue-200 rounded-2xl flex items-start gap-3 text-xs text-blue-900">
                        <Truck size={20} className="text-blue-600 shrink-0 mt-0.5" />
                        <div className="space-y-1">
                          <p className="font-black text-sm text-blue-950">
                            Surat Jalan ({currentReq.doNumber}) Sedang Dalam Pengiriman ke Outlet
                          </p>
                          <p className="text-blue-800">
                            Owner telah menyetujui pengiriman ini. Begitu barang fisik tiba di outlet, staf kasir/barista yang bertugas akan melakukan verifikasi dan konfirmasi penerimaan fisik via POS (Menu 2: Stok Masuk).
                          </p>
                          <p className="text-[11px] text-blue-700 pt-1">
                            Disetujui oleh: <strong>{currentReq.reviewedBy || 'Owner'}</strong> ({currentReq.reviewedAt ? new Date(currentReq.reviewedAt).toLocaleString('id-ID') : '-'})
                          </p>
                        </div>
                      </div>
                    )}

                    {currentReq.status === 'RECEIVED' && (
                      <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-2xl flex items-start gap-3 text-xs text-emerald-900">
                        <CheckCircle2 size={20} className="text-emerald-600 shrink-0 mt-0.5" />
                        <div className="space-y-1">
                          <p className="font-black text-sm text-emerald-950">
                            Barang Telah Diverifikasi & Masuk ke Stok Aktif Toko
                          </p>
                          <p className="text-emerald-800">
                            Staf di outlet ({currentReq.reviewedBy || 'Staf Toko'}) telah memeriksa fisik barang dan mengonfirmasi stok masuk. Angka stok outlet telah terupdate secara otomatis.
                          </p>
                        </div>
                      </div>
                    )}

                    {currentReq.status === 'REJECTED' && (
                      <div className="p-4 bg-rose-50/80 border border-rose-200 rounded-2xl flex items-start gap-3 text-xs text-rose-900">
                        <XCircle size={20} className="text-rose-600 shrink-0 mt-0.5" />
                        <div className="space-y-1">
                          <p className="font-black text-sm text-rose-950">
                            Pengajuan Permintaan Stok Ini Ditolak
                          </p>
                          <p className="text-rose-800">
                            Ditolak oleh Owner ({currentReq.reviewedBy || 'Owner'}) pada {currentReq.reviewedAt ? new Date(currentReq.reviewedAt).toLocaleString('id-ID') : '-'}.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* JIKA STATUS PENDING: FORM MODIFIKASI & PERSETUJUAN */}
                    {currentReq.status === 'PENDING' ? (
                      <div className="space-y-6">
                        
                        {/* Box Header Form Edit */}
                        <div className="p-4 bg-indigo-50/60 border border-indigo-100 rounded-2xl space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="font-black text-xs text-indigo-950 flex items-center gap-1.5">
                              <Edit3 size={15} className="text-indigo-600" />
                              <span>Form Persetujuan & Penyesuaian Pengiriman Barang (Owner)</span>
                            </span>
                            <span className="text-[11px] text-indigo-700 font-semibold">
                              Sesuaikan jumlah barang sebelum menerbitkan Surat Jalan (DO)
                            </span>
                          </div>

                          <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-2 border-t border-indigo-100">
                            <label className="text-xs font-bold text-slate-700 sm:w-48 shrink-0">
                              Nomor Surat Jalan (DO):
                            </label>
                            <input
                              type="text"
                              value={editDoNumber}
                              onChange={(e) => setEditDoNumber(e.target.value)}
                              className="flex-1 text-xs font-mono font-bold p-2.5 bg-white border border-slate-300 rounded-xl focus:border-indigo-500 focus:outline-none text-slate-900 shadow-2xs"
                              placeholder="Contoh: DO-2026/09/02-12"
                            />
                          </div>
                        </div>

                        {/* Tabel Modifikasi Item */}
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                                Daftar Bahan Baku yang Akan Dikirim:
                              </h3>
                              <p className="text-[11px] text-slate-500">
                                Anda dapat mengubah kuantitas atau menambah bahan baku lain untuk dikirimkan bersamaan.
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={handleAddEditItemRow}
                              className="flex items-center gap-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-xl border border-indigo-200 transition-colors cursor-pointer shadow-xs"
                            >
                              <Plus size={14} /> + Tambah Bahan Lain ke DO
                            </button>
                          </div>

                          <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                              <thead>
                                <tr className="border-b border-slate-200 text-slate-500 font-black uppercase tracking-wider bg-slate-50">
                                  <th className="p-3">Bahan Baku</th>
                                  <th className="p-3">Sisa di Bar saat Req</th>
                                  <th className="p-3 text-center">Permintaan Staf</th>
                                  <th className="p-3 text-center w-48">Qty Disetujui Kirim (DO)</th>
                                  <th className="p-3 text-center w-16">Hapus</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100 font-medium">
                                {editItems.map((item, idx) => {
                                  const selectedMat = materials.find(m => m.id === item.materialId) || materials[0];
                                  const origItem = currentReq.items.find(it => it.materialId === item.materialId);
                                  const curSisa = Number((selectedMat?.startStock + selectedMat?.stockIn - selectedMat?.usedSystem).toFixed(2));

                                  return (
                                    <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                                      <td className="p-3">
                                        <select
                                          value={item.materialId}
                                          onChange={(e) => {
                                            const newId = e.target.value;
                                            setEditItems(prev => prev.map((it, i) => i === idx ? { ...it, materialId: newId } : it));
                                          }}
                                          className="w-full text-xs font-bold p-2 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-indigo-500"
                                        >
                                          {materials.map((m) => (
                                            <option key={m.id} value={m.id}>
                                              {m.name} ({m.category})
                                            </option>
                                          ))}
                                        </select>
                                      </td>

                                      <td className="p-3 font-mono font-semibold text-slate-600">
                                        ~{curSisa} {selectedMat?.unit}
                                      </td>

                                      <td className="p-3 text-center">
                                        {origItem ? (
                                          <span className="font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-lg">
                                            {origItem.qtyRequested} {origItem.unit}
                                          </span>
                                        ) : (
                                          <span className="text-[10px] text-indigo-600 italic bg-indigo-50 px-2 py-0.5 rounded-md font-bold">
                                            + Bahan Tambahan Owner
                                          </span>
                                        )}
                                      </td>

                                      <td className="p-3">
                                        <div className="flex items-center justify-center gap-1.5">
                                          <input
                                            type="number"
                                            min="0.1"
                                            step="0.1"
                                            value={item.qtyRequested}
                                            onChange={(e) => {
                                              const val = parseFloat(e.target.value) || 0;
                                              setEditItems(prev => prev.map((it, i) => i === idx ? { ...it, qtyRequested: val } : it));
                                            }}
                                            className="w-28 text-xs font-mono font-black p-2 bg-white border-2 border-indigo-400 rounded-xl text-indigo-950 text-center focus:bg-indigo-50/30 outline-none shadow-2xs"
                                            placeholder="Qty"
                                          />
                                          <span className="text-[11px] font-bold text-slate-500 w-10 shrink-0">{selectedMat?.unit}</span>
                                        </div>
                                      </td>

                                      <td className="p-3 text-center">
                                        <button
                                          type="button"
                                          onClick={() => handleRemoveEditItemRow(idx)}
                                          className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                                          title="Hapus bahan dari DO"
                                        >
                                          <Trash2 size={16} />
                                        </button>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </div>

                        {/* ACTION BUTTONS PANEL */}
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-200">
                          <button
                            type="button"
                            onClick={() => handleRejectRequest(currentReq.id)}
                            className="w-full sm:w-auto px-4 py-2.5 bg-white hover:bg-rose-50 text-rose-700 font-bold rounded-2xl border border-slate-300 transition-all cursor-pointer text-xs"
                          >
                            ❌ Tolak Permintaan
                          </button>

                          <div className="flex items-center gap-2.5 w-full sm:w-auto">
                            <button
                              type="button"
                              onClick={() => handleQuickApproveRequest(currentReq)}
                              className="flex-1 sm:flex-initial px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-2xl transition-all cursor-pointer text-xs active:scale-95"
                              title="Gunakan kuantitas asli yang diminta staf"
                            >
                              ⚡ Setujui Sesuai Request Staf
                            </button>

                            <button
                              type="button"
                              onClick={() => handleSaveAndApproveEditedRequest(currentReq.id)}
                              className="flex-1 sm:flex-initial px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-lg shadow-indigo-600/20 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer text-xs"
                            >
                              <Send size={15} />
                              <span>Setujui & Terbitkan DO ({editDoNumber.trim() || `DO-${currentReq.id.slice(-4)}`})</span>
                            </button>
                          </div>
                        </div>

                      </div>
                    ) : (
                      /* JIKA STATUS SUDAH ORDERED / RECEIVED / REJECTED: TAMPILKAN TABEL DETAIL READ-ONLY */
                      <div className="space-y-4">
                        <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                          Rincian Bahan Baku Surat Jalan (DO):
                        </h3>

                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs">
                            <thead>
                              <tr className="border-b border-slate-200 text-slate-500 font-black uppercase tracking-wider bg-slate-50">
                                <th className="p-3">Nama Bahan Baku</th>
                                <th className="p-3">Kategori</th>
                                <th className="p-3 text-right">Kuantitas Tertera di Surat Jalan</th>
                                <th className="p-3">Satuan</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 font-medium">
                              {currentReq.items.map((item, idx) => {
                                const selectedMat = materials.find(m => m.id === item.materialId);
                                return (
                                  <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                                    <td className="p-3 font-bold text-slate-900">{item.materialName}</td>
                                    <td className="p-3">
                                      <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md text-[10px] font-bold">
                                        {selectedMat?.category || 'Bahan'}
                                      </span>
                                    </td>
                                    <td className="p-3 text-right font-mono font-black text-indigo-700">
                                      {item.qtyRequested}
                                    </td>
                                    <td className="p-3 font-bold text-slate-500">{item.unit}</td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                  </div>

                </div>
              );
            })()
          ) : (
            /* ====================================================== */
            /* SUB-VIEW B: DAFTAR RINGKASAN REQUEST (MASTER LIST)     */
            /* ====================================================== */
            <div className="space-y-6">
              
              {/* Filter Tabs & Search Bar */}
              <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                      <Send size={18} className="text-indigo-600" />
                      <span>Daftar Permintaan Stok Bahan (Purchase Orders)</span>
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Klik salah satu request untuk masuk ke detail PO dan memodifikasi jumlah sebelum disetujui.
                    </p>
                  </div>

                  {/* Search Input */}
                  <div className="relative w-full sm:w-72">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={requestSearch}
                      onChange={(e) => setRequestSearch(e.target.value)}
                      placeholder="Cari ID, No DO, atau Bahan..."
                      className="w-full pl-8 pr-7 py-2 bg-slate-50 focus:bg-white border border-slate-200 focus:border-indigo-500 rounded-xl text-xs font-mono outline-none transition-all placeholder:font-sans"
                    />
                    {requestSearch && (
                      <button
                        type="button"
                        onClick={() => setRequestSearch('')}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full"
                      >
                        <X size={12} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Filter Buttons */}
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setRequestFilter('ALL')}
                    className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
                      requestFilter === 'ALL'
                        ? 'bg-slate-900 text-white shadow-xs font-black'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Semua ({stockRequests.length})
                  </button>

                  <button
                    type="button"
                    onClick={() => setRequestFilter('PENDING')}
                    className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                      requestFilter === 'PENDING'
                        ? 'bg-amber-500 text-white shadow-xs font-black'
                        : 'bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-200'
                    }`}
                  >
                    <span>⏳ Menunggu Tindakan</span>
                    <span className="text-[10px] bg-white/30 px-1.5 py-0.2 rounded-full font-black">
                      {pendingRequestsCount}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRequestFilter('ORDERED')}
                    className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                      requestFilter === 'ORDERED'
                        ? 'bg-blue-600 text-white shadow-xs font-black'
                        : 'bg-blue-50 text-blue-900 hover:bg-blue-100 border border-blue-200'
                    }`}
                  >
                    <span>🚚 Sedang Dikirim (DO)</span>
                    <span className="text-[10px] bg-white/30 px-1.5 py-0.2 rounded-full font-black">
                      {orderedRequestsCount}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRequestFilter('RECEIVED')}
                    className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                      requestFilter === 'RECEIVED'
                        ? 'bg-emerald-600 text-white shadow-xs font-black'
                        : 'bg-emerald-50 text-emerald-900 hover:bg-emerald-100 border border-emerald-200'
                    }`}
                  >
                    <span>✅ Selesai Diterima</span>
                    <span className="text-[10px] bg-white/30 px-1.5 py-0.2 rounded-full font-black">
                      {receivedRequestsCount}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRequestFilter('REJECTED')}
                    className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
                      requestFilter === 'REJECTED'
                        ? 'bg-rose-600 text-white shadow-xs font-black'
                        : 'bg-rose-50 text-rose-900 hover:bg-rose-100 border border-rose-200'
                    }`}
                  >
                    ❌ Ditolak ({rejectedRequestsCount})
                  </button>
                </div>
              </div>

              {/* Table / List of Requests */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
                {(() => {
                  const filtered = stockRequests.filter((req) => {
                    const matchesFilter = requestFilter === 'ALL' || req.status === requestFilter;
                    const q = requestSearch.trim().toLowerCase();
                    const matchesSearch = !q || (
                      req.id.toLowerCase().includes(q) ||
                      (req.doNumber && req.doNumber.toLowerCase().includes(q)) ||
                      req.requestedBy.toLowerCase().includes(q) ||
                      req.items.some(i => i.materialName.toLowerCase().includes(q))
                    );
                    return matchesFilter && matchesSearch;
                  });

                  if (filtered.length === 0) {
                    return (
                      <div className="text-center py-12 text-slate-400 text-xs">
                        <Package size={36} className="mx-auto mb-2 opacity-40" />
                        <p>
                          {requestSearch.trim()
                            ? `Tidak ditemukan pengajuan dengan kata kunci "${requestSearch}".`
                            : 'Tidak ada pengajuan pada kategori filter ini.'}
                        </p>
                      </div>
                    );
                  }

                  return (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-slate-200 text-slate-500 font-black uppercase tracking-wider bg-slate-50">
                            <th className="p-3">ID & Surat Jalan</th>
                            <th className="p-3">Waktu & Pemohon</th>
                            <th className="p-3">Urgensi</th>
                            <th className="p-3">Ringkasan Bahan</th>
                            <th className="p-3">Status</th>
                            <th className="p-3 text-right">Aksi</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium">
                          {filtered.map((req) => (
                            <tr 
                              key={req.id} 
                              onClick={() => handleOpenRequestDetail(req.id)}
                              className="hover:bg-indigo-50/40 transition-colors cursor-pointer group"
                            >
                              <td className="p-3">
                                <div className="flex flex-col">
                                  <span className="font-mono font-black text-slate-900 group-hover:text-indigo-600 transition-colors">
                                    Request #{req.id.slice(-4)}
                                  </span>
                                  {req.doNumber ? (
                                    <span className="text-[10px] font-mono text-indigo-700 font-bold">
                                      {req.doNumber}
                                    </span>
                                  ) : (
                                    <span className="text-[10px] text-slate-400 italic">Belum ada DO</span>
                                  )}
                                </div>
                              </td>

                              <td className="p-3">
                                <div className="flex flex-col">
                                  <span className="font-bold text-slate-800">{req.requestedBy}</span>
                                  <span className="text-[10px] text-slate-400">
                                    {new Date(req.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })} • {new Date(req.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                                  </span>
                                </div>
                              </td>

                              <td className="p-3">
                                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                                  req.urgency === 'URGENT' ? 'bg-rose-100 text-rose-800 animate-pulse' : 'bg-slate-100 text-slate-700'
                                }`}>
                                  {req.urgency === 'URGENT' ? '🔴 Mendesak' : '🟢 Normal'}
                                </span>
                              </td>

                              <td className="p-3 text-slate-700">
                                <div className="flex flex-wrap gap-1 max-w-xs">
                                  {req.items.map((it, i) => (
                                    <span key={i} className="bg-slate-100 px-2 py-0.5 rounded-md text-[10px] font-bold text-slate-800">
                                      {it.materialName}: <strong>{it.qtyRequested} {it.unit}</strong>
                                    </span>
                                  ))}
                                </div>
                              </td>

                              <td className="p-3">
                                <span className={`text-[11px] font-black px-2.5 py-1 rounded-xl ${
                                  req.status === 'PENDING' ? 'bg-amber-100 text-amber-900 animate-pulse' :
                                  req.status === 'ORDERED' ? 'bg-blue-100 text-blue-900 font-bold' :
                                  req.status === 'RECEIVED' ? 'bg-emerald-100 text-emerald-900' :
                                  'bg-rose-100 text-rose-900'
                                }`}>
                                  {req.status === 'PENDING' ? '⏳ Menunggu Tindakan' :
                                   req.status === 'ORDERED' ? '🚚 Sedang Dikirim' :
                                   req.status === 'RECEIVED' ? '✅ Selesai Diterima' :
                                   '❌ Ditolak'}
                                </span>
                              </td>

                              <td className="p-3 text-right">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenRequestDetail(req.id);
                                  }}
                                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs inline-flex items-center gap-1 shadow-xs active:scale-95 transition-all cursor-pointer"
                                >
                                  <span>Buka Detail PO</span>
                                  <ChevronRight size={14} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  );
                })()}
              </div>

            </div>
          )}

        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: STOK MASUK & PEMBELIAN (MENU 2 OWNER)              */}
      {/* ======================================================== */}
      {activeTab === 'stock-in' && (
        <div className="space-y-6 animate-fade-in">
          
          {/* 1. FORMULIR STOK MASUK */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100">
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <Truck size={20} className="text-emerald-600" />
                  Pencatatan Cepat Barang Masuk (Direct Inbound)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Cukup isi jumlah barang fisik yang diterima tanpa perlu perhitungan harga atau HPP
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmitStockIn} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nama Supplier / Pengirim:</label>
                  <input
                    type="text"
                    value={supplierName}
                    onChange={(e) => setSupplierName(e.target.value)}
                    placeholder="Contoh: PT Nusa Roastery / Cimory"
                    className="w-full text-xs font-bold p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">No Surat Jalan (Opsional):</label>
                  <input
                    type="text"
                    value={invoiceNo}
                    onChange={(e) => setInvoiceNo(e.target.value)}
                    placeholder="Contoh: SJ-2026-09"
                    className="w-full text-xs font-mono font-bold p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nama Petugas Penerima:</label>
                  <input
                    type="text"
                    value={receiverName}
                    onChange={(e) => setReceiverName(e.target.value)}
                    className="w-full text-xs font-bold p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none text-slate-900"
                  />
                </div>
              </div>

              {/* Daftar Bahan Masuk */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="font-bold text-slate-700">Daftar Bahan yang Diterima:</label>
                  <button
                    type="button"
                    onClick={handleAddStockInRow}
                    className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200"
                  >
                    <Plus size={13} /> Tambah Baris Bahan
                  </button>
                </div>

                <div className="space-y-2">
                  {stockInItems.map((item, idx) => {
                    const selectedMat = materials.find(m => m.id === item.materialId) || materials[0];

                    return (
                      <div key={idx} className="flex items-center gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-2xl">
                        <div className="flex-1">
                          <select
                            value={item.materialId}
                            onChange={(e) => {
                              const newId = e.target.value;
                              setStockInItems(prev => prev.map((it, i) => i === idx ? { ...it, materialId: newId } : it));
                            }}
                            className="w-full text-xs font-bold p-2 bg-white border border-slate-300 rounded-xl text-slate-900"
                          >
                            {materials.map((m) => (
                              <option key={m.id} value={m.id}>
                                {m.name} ({m.unit})
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="w-36 flex items-center gap-1">
                          <input
                            type="number"
                            min="0.1"
                            step="0.1"
                            value={item.qty}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value) || 0;
                              setStockInItems(prev => prev.map((it, i) => i === idx ? { ...it, qty: val } : it));
                            }}
                            className="w-full text-xs font-mono font-black p-2 bg-white border border-slate-300 rounded-xl text-slate-900 text-center"
                            placeholder="Qty"
                          />
                          <span className="text-[10px] font-bold text-slate-500">{selectedMat?.unit}</span>
                        </div>

                        {stockInItems.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveStockInRow(idx)}
                            className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-6 py-2.5 rounded-2xl shadow-md shadow-emerald-600/20 active:scale-95 transition-all cursor-pointer"
                >
                  Simpan Barang Masuk
                </button>
              </div>
            </form>
          </div>

          {/* 2. RIWAYAT STOK MASUK */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-4 border-b border-slate-100 gap-3">
              <h3 className="font-black text-slate-900 text-sm uppercase tracking-wider flex items-center gap-2">
                <FileText size={18} className="text-indigo-600" />
                Riwayat Surat Jalan & Pembelian Stok Masuk
              </h3>

              {/* Search bar No Surat Jalan */}
              <div className="relative w-full sm:w-64">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={stockInSearch}
                  onChange={(e) => setStockInSearch(e.target.value)}
                  placeholder="Cari No Surat Jalan..."
                  className="w-full pl-8 pr-7 py-1.5 bg-slate-50 focus:bg-white border border-slate-200 focus:border-indigo-500 rounded-xl text-xs font-mono outline-none transition-all placeholder:font-sans"
                />
                {stockInSearch && (
                  <button
                    type="button"
                    onClick={() => setStockInSearch('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
            </div>

            <div className="overflow-x-auto">
              {(() => {
                const filteredLogs = stockInLogs.filter((log) =>
                  log.invoiceNo.toLowerCase().includes(stockInSearch.trim().toLowerCase())
                );

                if (filteredLogs.length === 0) {
                  return (
                    <div className="text-center py-10 text-slate-400">
                      <Truck size={36} className="mx-auto mb-2 opacity-30" />
                      <p className="text-xs">
                        {stockInSearch.trim()
                          ? `Tidak ditemukan surat jalan dengan nomor "${stockInSearch}".`
                          : 'Belum ada riwayat stok masuk.'}
                      </p>
                    </div>
                  );
                }

                return (
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500 font-black uppercase tracking-wider bg-slate-50/50">
                        <th className="p-3">Waktu & Tanggal</th>
                        <th className="p-3">Supplier Vendor</th>
                        <th className="p-3">No Surat Jalan / PO</th>
                        <th className="p-3">Rincian Bahan Masuk</th>
                        <th className="p-3">Penerima</th>
                        <th className="p-3 text-right">Nilai Pembelian (IDR)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {filteredLogs.map((log) => (
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
                );
              })()}
            </div>
          </div>

        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: LAPORAN AUDIT STOK & SELISIH (OWNER READ-ONLY)    */}
      {/* ======================================================== */}
      {activeTab === 'stock-take' && (
        <div className="space-y-6 animate-fade-in">
          
          {/* Header & Sub-Tab Switcher */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <ClipboardList size={22} className="text-indigo-600" />
                    <span>Laporan Audit Stok & Selisih Opname</span>
                  </h2>
                  <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-slate-200">
                    Mode Pemantauan Owner
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Audit perbandingan sisa sistem POS vs hasil hitung fisik staf toko, analisis kerugian selisih (*wastage*), dan riwayat log per shift.
                </p>
              </div>

              {/* Sub-tab Pill Switcher */}
              <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs font-bold shrink-0">
                <button
                  type="button"
                  onClick={() => setStockAuditSubTab('materials')}
                  className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                    stockAuditSubTab === 'materials'
                      ? 'bg-white text-slate-900 shadow-xs font-black'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Package size={14} />
                  <span>Komparasi Bahan ({materials.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setStockAuditSubTab('logs')}
                  className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                    stockAuditSubTab === 'logs'
                      ? 'bg-white text-slate-900 shadow-xs font-black'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Clock size={14} />
                  <span>Riwayat Shift ({stockTakeLogs.length})</span>
                </button>
              </div>
            </div>

            {/* Notice Info Banner */}
            <div className="p-3.5 bg-indigo-50/60 border border-indigo-100 rounded-2xl flex items-center gap-3 text-xs text-indigo-950 font-medium">
              <ShieldAlert size={18} className="text-indigo-600 shrink-0" />
              <span>
                <strong>Info Owner:</strong> Penginputan opname fisik dilakukan langsung oleh staf operasional toko di menu <em>Stock Opname (Shift)</em> pada aplikasi POS kasir.
              </span>
            </div>

            {/* Ringkasan Metrik 4 Kartu */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
              
              {/* Card 1: Total Kerugian Selisih */}
              <div className="bg-rose-50/60 border border-rose-200 rounded-2xl p-4.5">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-black uppercase tracking-wider text-rose-800">
                    Total Kerugian Selisih (Wastage)
                  </span>
                  <AlertTriangle size={16} className="text-rose-600" />
                </div>
                <div className="text-xl sm:text-2xl font-black text-rose-700 font-mono">
                  -Rp {totalWastageCost.toLocaleString('id-ID')}
                </div>
                <p className="text-[11px] text-rose-800 mt-1 font-semibold">
                  {materials.filter(m => (m.actualPhysicalStock - Number((m.startStock + m.stockIn - m.usedSystem).toFixed(2))) < 0).length} bahan mengalami selisih minus
                </p>
              </div>

              {/* Card 2: Nilai Fisik Bahan */}
              <div className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-4.5">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-black uppercase tracking-wider text-emerald-800">
                    Nilai Stok Fisik Terkini
                  </span>
                  <Coins size={16} className="text-emerald-600" />
                </div>
                <div className="text-xl sm:text-2xl font-black text-emerald-800 font-mono">
                  Rp {totalActualPhysicalValue.toLocaleString('id-ID')}
                </div>
                <p className="text-[11px] text-emerald-700 mt-1 font-semibold">
                  Sisa teoretis: Rp {totalRemainingSystemValue.toLocaleString('id-ID')}
                </p>
              </div>

              {/* Card 3: Akurasi Stok */}
              <div className="bg-indigo-50/60 border border-indigo-200 rounded-2xl p-4.5">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-black uppercase tracking-wider text-indigo-800">
                    Akurasi Stok Bar
                  </span>
                  <CheckCircle2 size={16} className="text-indigo-600" />
                </div>
                <div className="text-xl sm:text-2xl font-black text-indigo-700 font-mono">
                  {materials.length > 0 ? ((materials.filter(m => Math.abs(m.actualPhysicalStock - Number((m.startStock + m.stockIn - m.usedSystem).toFixed(2))) === 0).length / materials.length) * 100).toFixed(0) : '100'}%
                </div>
                <p className="text-[11px] text-indigo-700 mt-1 font-semibold">
                  {materials.filter(m => Math.abs(m.actualPhysicalStock - Number((m.startStock + m.stockIn - m.usedSystem).toFixed(2))) === 0).length} dari {materials.length} bahan 100% cocok
                </p>
              </div>

              {/* Card 4: Total Belanja Inbound */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4.5">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-700">
                    Total Belanja Masuk
                  </span>
                  <Truck size={16} className="text-slate-600" />
                </div>
                <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono">
                  Rp {totalPurchasesToday.toLocaleString('id-ID')}
                </div>
                <p className="text-[11px] text-slate-500 mt-1 font-semibold">
                  {stockInLogs.length} surat jalan diterima
                </p>
              </div>

            </div>
          </div>

          {/* SUB-VIEW 1: TABEL KOMPARASI BAHAN (READ-ONLY) */}
          {stockAuditSubTab === 'materials' && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <h3 className="font-black text-slate-900 text-sm uppercase tracking-wider flex items-center gap-2">
                  <Package size={18} className="text-indigo-600" />
                  <span>Komparasi Rinci Stok Fisik (Opname Staf) vs Sistem POS</span>
                </h3>

                {/* Search & Category Filter */}
                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative w-full sm:w-56">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={stockAuditSearch}
                      onChange={(e) => setStockAuditSearch(e.target.value)}
                      placeholder="Cari nama bahan..."
                      className="w-full pl-8 pr-7 py-1.5 bg-slate-50 focus:bg-white border border-slate-200 focus:border-indigo-500 rounded-xl text-xs font-mono outline-none transition-all placeholder:font-sans"
                    />
                    {stockAuditSearch && (
                      <button
                        type="button"
                        onClick={() => setStockAuditSearch('')}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full"
                      >
                        <X size={12} />
                      </button>
                    )}
                  </div>

                  <select
                    value={stockAuditCategory}
                    onChange={(e) => setStockAuditCategory(e.target.value)}
                    className="text-xs font-bold p-1.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
                  >
                    <option value="ALL">Semua Kategori</option>
                    <option value="Kopi">Kopi</option>
                    <option value="Dairy">Dairy</option>
                    <option value="Sirup">Sirup</option>
                    <option value="Bubuk">Bubuk</option>
                    <option value="Pastry">Pastry</option>
                    <option value="Packaging">Packaging</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>
              </div>

              {/* Table of materials */}
              <div className="overflow-x-auto">
                {(() => {
                  const filteredMaterials = materials.filter((mat) => {
                    const matchesSearch = !stockAuditSearch.trim() || mat.name.toLowerCase().includes(stockAuditSearch.trim().toLowerCase());
                    const matchesCategory = stockAuditCategory === 'ALL' || mat.category === stockAuditCategory;
                    return matchesSearch && matchesCategory;
                  });

                  if (filteredMaterials.length === 0) {
                    return (
                      <div className="text-center py-10 text-slate-400">
                        <Package size={36} className="mx-auto mb-2 opacity-30" />
                        <p className="text-xs">
                          {stockAuditSearch.trim()
                            ? `Tidak ditemukan bahan dengan kata kunci "${stockAuditSearch}".`
                            : 'Tidak ada bahan pada kategori ini.'}
                        </p>
                      </div>
                    );
                  }

                  return (
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-200 text-slate-500 font-black uppercase tracking-wider bg-slate-50/70">
                          <th className="p-3">Bahan Baku</th>
                          <th className="p-3">Kategori</th>
                          <th className="p-3 text-right">HPP / Unit</th>
                          <th className="p-3 text-center">Stok Awal</th>
                          <th className="p-3 text-center">Masuk (+)</th>
                          <th className="p-3 text-center bg-amber-50/50 text-amber-900">Terpakai (POS)</th>
                          <th className="p-3 text-center bg-slate-100/70 font-bold">Sisa Sistem</th>
                          <th className="p-3 text-center bg-indigo-50/80 text-indigo-950 font-black">
                            Fisik Terkini (Opname Staf)
                          </th>
                          <th className="p-3 text-center">Selisih Qty</th>
                          <th className="p-3 text-right">Nilai Selisih (Rp)</th>
                          <th className="p-3 text-center">Status Audit</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium">
                        {filteredMaterials.map((mat) => {
                          const sisaSistem = Number((mat.startStock + mat.stockIn - mat.usedSystem).toFixed(2));
                          const selisihQty = Number((mat.actualPhysicalStock - sisaSistem).toFixed(2));
                          const selisihRp = selisihQty * mat.unitCost;
                          const isAccurate = Math.abs(selisihQty) === 0;
                          const isDeficit = selisihQty < 0;

                          return (
                            <tr key={mat.id} className="hover:bg-slate-50/80 transition-colors">
                              <td className="p-3 font-bold text-slate-900">
                                <div>
                                  <span>{mat.name}</span>
                                  <span className="block text-[10px] font-mono text-slate-400">{mat.id}</span>
                                </div>
                              </td>
                              <td className="p-3">
                                <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-bold text-[10px]">
                                  {mat.category}
                                </span>
                              </td>
                              <td className="p-3 text-right font-mono text-slate-600 font-semibold">
                                Rp {mat.unitCost.toLocaleString('id-ID')}/{mat.unit}
                              </td>
                              <td className="p-3 text-center font-mono text-slate-600">{mat.startStock} {mat.unit}</td>
                              <td className="p-3 text-center font-mono text-emerald-600 font-bold">
                                {mat.stockIn > 0 ? `+${mat.stockIn}` : '0'} {mat.unit}
                              </td>
                              <td className="p-3 text-center font-mono font-bold text-amber-800 bg-amber-50/30">
                                {mat.usedSystem} {mat.unit}
                              </td>
                              <td className="p-3 text-center font-mono font-black text-slate-800 bg-slate-50/60">
                                {sisaSistem} {mat.unit}
                              </td>
                              
                              {/* FISIK TERKINI (READ-ONLY WITH CLEAN BADGE) */}
                              <td className="p-3 text-center bg-indigo-50/30">
                                <span className="font-mono font-black text-indigo-900 bg-indigo-100/70 border border-indigo-200 px-3 py-1 rounded-xl text-xs inline-block">
                                  {mat.actualPhysicalStock} {mat.unit}
                                </span>
                              </td>

                              <td className="p-3 text-center font-mono font-bold">
                                {isAccurate ? (
                                  <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">0</span>
                                ) : isDeficit ? (
                                  <span className="text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md">{selisihQty}</span>
                                ) : (
                                  <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">+{selisihQty}</span>
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

                              <td className="p-3 text-center font-bold">
                                {isAccurate ? (
                                  <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                                    <CheckCircle2 size={12} /> Cocok
                                  </span>
                                ) : isDeficit ? (
                                  <span className="bg-rose-100 text-rose-800 text-[10px] px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                                    <AlertTriangle size={12} /> Defisit (Wastage)
                                  </span>
                                ) : (
                                  <span className="bg-blue-100 text-blue-800 text-[10px] px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                                    <Info size={12} /> Surplus
                                  </span>
                                )}
                              </td>

                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  );
                })()}
              </div>

              <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-3">
                <div className="text-xs text-slate-500 font-semibold flex items-center gap-2">
                  <ShieldAlert size={16} className="text-amber-600" />
                  <span>Kerugian selisih bahan otomatis terintegrasi ke <strong>Laporan Laba Rugi (P&L)</strong> sebagai penambah HPP aktual.</span>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">Total Kerugian Selisih (Wastage)</span>
                  <span className="font-mono text-lg font-black text-rose-600">
                    -Rp {totalWastageCost.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>

            </div>
          )}

          {/* SUB-VIEW 2: RIWAYAT LOG AUDIT PER SHIFT (LOGS) */}
          {stockAuditSubTab === 'logs' && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="font-black text-slate-900 text-sm uppercase tracking-wider flex items-center gap-2">
                    <Clock size={18} className="text-indigo-600" />
                    <span>Riwayat Sesi Stock Opname Staf Toko (Per Shift & Closing)</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Catatan rekonsiliasi fisik yang dikirim oleh staf toko saat serah terima shift atau tutup gerai.
                  </p>
                </div>
              </div>

              {stockTakeLogs.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <ClipboardList size={36} className="mx-auto mb-2 opacity-30" />
                  <p className="text-xs">Belum ada riwayat sesi stock taking yang disubmit oleh staf toko.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {stockTakeLogs.map((log) => {
                    const isExpanded = expandedLogId === log.id;
                    const logDate = new Date(log.date);

                    return (
                      <div key={log.id} className="border border-slate-200 rounded-2xl overflow-hidden hover:border-slate-300 transition-all bg-slate-50/50">
                        <div 
                          onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                          className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:bg-slate-100/70 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                              <ClipboardList size={18} />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-900 text-xs sm:text-sm">{log.shiftName}</span>
                                <span className="text-[10px] font-mono text-slate-400">({log.id})</span>
                              </div>
                              <p className="text-[11px] text-slate-500 mt-0.5">
                                Petugas: <strong className="text-slate-700">{log.conductedBy}</strong> • {logDate.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })} pk {logDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                              </p>
                              {log.notes && (
                                <p className="text-[11px] text-slate-600 italic mt-1 bg-white/70 px-2 py-0.5 rounded-md border border-slate-200 inline-block">
                                  "{log.notes}"
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                            <div className="text-left sm:text-right">
                              <span className="text-[10px] text-slate-400 font-bold block uppercase">Selisih Kerugian</span>
                              <span className={`font-mono text-xs sm:text-sm font-black ${
                                (log.totalDeficitCost || 0) > 0 ? 'text-rose-600' : 'text-emerald-700'
                              }`}>
                                {(log.totalDeficitCost || 0) > 0 
                                  ? `-Rp ${log.totalDeficitCost.toLocaleString('id-ID')}`
                                  : 'Rp 0 (Akurat)'}
                              </span>
                            </div>

                            <span className="text-xs font-bold text-indigo-600 bg-white border border-indigo-200 px-2.5 py-1 rounded-xl shadow-xs">
                              {isExpanded ? 'Tutup Rincian ▲' : 'Buka Rincian ▼'}
                            </span>
                          </div>
                        </div>

                        {/* Breakdown entries */}
                        {isExpanded && (
                          <div className="p-4 bg-white border-t border-slate-200 text-xs">
                            <h4 className="font-bold text-slate-700 mb-2 uppercase text-[10px] tracking-wider">
                              Rincian Hasil Audit Bahan Baku Sesi Ini ({log.entries.length} Bahan):
                            </h4>
                            <div className="overflow-x-auto">
                              <table className="w-full text-left">
                                <thead>
                                  <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px] bg-slate-50">
                                    <th className="p-2">Nama Bahan</th>
                                    <th className="p-2 text-right">HPP Unit</th>
                                    <th className="p-2 text-center">Sistem Teoretis</th>
                                    <th className="p-2 text-center bg-indigo-50/50">Fisik Terhitung</th>
                                    <th className="p-2 text-center">Selisih Qty</th>
                                    <th className="p-2 text-right">Nilai Selisih</th>
                                    <th className="p-2 text-center">Status</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 font-medium">
                                  {log.entries.map((ent, idx) => (
                                    <tr key={idx} className="hover:bg-slate-50/50">
                                      <td className="p-2 font-bold text-slate-800">{ent.materialName}</td>
                                      <td className="p-2 text-right font-mono text-slate-600">Rp {ent.unitCost.toLocaleString('id-ID')}</td>
                                      <td className="p-2 text-center font-mono">{ent.systemExpectedStock} {ent.unit}</td>
                                      <td className="p-2 text-center font-mono font-bold text-indigo-900 bg-indigo-50/30">
                                        {ent.actualCountedStock} {ent.unit}
                                      </td>
                                      <td className="p-2 text-center font-mono font-bold">
                                        {ent.varianceQty === 0 ? (
                                          <span className="text-emerald-600">0</span>
                                        ) : ent.varianceQty < 0 ? (
                                          <span className="text-rose-600">{ent.varianceQty}</span>
                                        ) : (
                                          <span className="text-blue-600">+{ent.varianceQty}</span>
                                        )}
                                      </td>
                                      <td className="p-2 text-right font-mono font-black">
                                        {ent.varianceCost === 0 ? (
                                          <span className="text-emerald-700">Rp 0</span>
                                        ) : ent.varianceCost < 0 ? (
                                          <span className="text-rose-600">-Rp {Math.abs(ent.varianceCost).toLocaleString('id-ID')}</span>
                                        ) : (
                                          <span className="text-blue-600">+Rp {ent.varianceCost.toLocaleString('id-ID')}</span>
                                        )}
                                      </td>
                                      <td className="p-2 text-center">
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                                          ent.status === 'accurate' ? 'bg-emerald-100 text-emerald-800' :
                                          ent.status === 'deficit' ? 'bg-rose-100 text-rose-800' :
                                          'bg-blue-100 text-blue-800'
                                        }`}>
                                          {ent.status === 'accurate' ? 'Cocok' : ent.status === 'deficit' ? 'Wastage' : 'Surplus'}
                                        </span>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}

                      </div>
                    );
                  })}
                </div>
              )}

            </div>
          )}

        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: ANALISIS LABA RUGI & HPP (P&L STATEMENT)          */}
      {/* ======================================================== */}
      {activeTab === 'pnl' && (
        <div className="space-y-6 animate-fade-in">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pendapatan Bersih</span>
              <div className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight mt-1">
                Rp {netRevenue.toLocaleString('id-ID')}
              </div>
              <p className="text-xs text-slate-500 mt-1 font-semibold">
                Gross: Rp {grossSales.toLocaleString('id-ID')} (Diskon Rp {discounts.toLocaleString('id-ID')})
              </p>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs">
              <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">Total HPP Aktual (COGS)</span>
              <div className="text-2xl lg:text-3xl font-black text-amber-600 tracking-tight mt-1">
                Rp {actualTotalCOGS.toLocaleString('id-ID')}
              </div>
              <p className="text-xs text-amber-800 mt-1 font-semibold">
                {((actualTotalCOGS / netRevenue) * 100).toFixed(1)}% dari Omset (Termasuk Wastage Rp {(totalWastageCost/1000).toFixed(0)}k)
              </p>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs">
              <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider">Laba Kotor (Gross Profit)</span>
              <div className="text-2xl lg:text-3xl font-black text-indigo-700 tracking-tight mt-1">
                Rp {grossProfit.toLocaleString('id-ID')}
              </div>
              <p className="text-xs text-indigo-600 mt-1 font-bold">
                Margin Kotor: <strong>{grossProfitMargin}%</strong>
              </p>
            </div>

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

          {/* P&L WATERFALL CHART */}
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

          {/* FORMAL P&L STATEMENT TABLE */}
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

              <div className="p-3 bg-indigo-50/70 border border-indigo-200 rounded-2xl flex justify-between items-center text-sm font-black text-indigo-950">
                <span>LABA KOTOR USAHA (GROSS PROFIT)</span>
                <div className="text-right">
                  <span className="font-mono text-indigo-900 text-base">Rp {grossProfit.toLocaleString('id-ID')}</span>
                  <span className="text-xs font-bold text-indigo-600 block">Margin: {grossProfitMargin}%</span>
                </div>
              </div>

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
