import React, { useState, useEffect } from 'react';
import { 
  X, 
  Package, 
  Truck, 
  ClipboardList, 
  Plus, 
  Trash2, 
  Check, 
  AlertTriangle, 
  Clock, 
  CheckCircle2,
  Send,
  Building2,
  Info,
  Scale,
  Calendar,
  Search,
  ArrowLeft,
  PackageCheck,
  ChevronRight
} from 'lucide-react';
import { 
  useInventoryStore, 
  StockRequestUrgency, 
  RawMaterial 
} from '../../stores/useInventoryStore';
import { useAuthStore } from '../../stores/useAuthStore';

export type StockModalTab = 'request' | 'stock-in' | 'stock-take';

interface StaffStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: StockModalTab;
}

export default function StaffStockModal({ isOpen, onClose, initialTab = 'request' }: StaffStockModalProps) {
  const { user } = useAuthStore();
  const { 
    materials, 
    stockRequests, 
    stockInLogs,
    stockTakeLogs,
    createStockRequest, 
    addStaffStockIn, 
    fulfillStockRequest,
    submitDailyStockTake
  } = useInventoryStore();

  const [activeTab, setActiveTab] = useState<StockModalTab>(initialTab);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Sync activeTab when initialTab or isOpen changes
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab || 'request');
      setSelectedDOId(null);
      setShowDirectStockIn(false);
    }
  }, [isOpen, initialTab]);

  // ==========================================
  // 1. STATE FORM MENU 1: REQUEST STOK KE OWNER
  // ==========================================
  const [reqUrgency, setReqUrgency] = useState<StockRequestUrgency>('NORMAL');
  const [reqNotes, setReqNotes] = useState('');
  const [reqItems, setReqItems] = useState<{ materialId: string; qtyRequested: number }[]>([
    { materialId: materials[0]?.id || 'mat_1', qtyRequested: 5 }
  ]);

  // ==========================================
  // 2. STATE FORM MENU 2: STOK MASUK (BERBASIS DO & INPUT BEBAS)
  // ==========================================
  const [selectedDOId, setSelectedDOId] = useState<string | null>(null);
  const [doReceivedCounts, setDoReceivedCounts] = useState<{ [materialId: string]: string }>({});
  const [doSearch, setDoSearch] = useState('');
  const [stockInSearch, setStockInSearch] = useState('');
  const [showDirectStockIn, setShowDirectStockIn] = useState(false);
  const [inInvoice, setInInvoice] = useState('');
  const [inItems, setInItems] = useState<{ materialId: string; qty: number }[]>([
    { materialId: materials[0]?.id || 'mat_1', qty: 5 }
  ]);

  // ==========================================
  // 3. STATE FORM MENU 3: STOCK OPNAME HARIAN (STOCK TAKING)
  // ==========================================
  const [opnameShift, setOpnameShift] = useState<'Shift 1 (Pagi)' | 'Shift 2 (Malam)' | 'Closing Harian'>('Closing Harian');
  const [opnameCounts, setOpnameCounts] = useState<{ [materialId: string]: string }>({});

  // Initialize opname counts (Blind Stock Count: default to '0', no auto-fill)
  useEffect(() => {
    const initial: { [materialId: string]: string } = {};
    materials.forEach(m => {
      initial[m.id] = '0';
    });
    setOpnameCounts(initial);
  }, [materials, isOpen]);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // ------------------------------------------
  // HANDLERS: MENU 1 (REQUEST STOK)
  // ------------------------------------------
  const handleAddReqItem = () => {
    setReqItems(prev => [...prev, { materialId: materials[0]?.id || 'mat_1', qtyRequested: 5 }]);
  };

  const handleRemoveReqItem = (idx: number) => {
    setReqItems(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmitRequest = (e: React.FormEvent) => {
    e.preventDefault();
    const hasInvalid = reqItems.some(i => i.qtyRequested <= 0);
    if (hasInvalid) {
      showToast('⚠️ Jumlah pesanan bahan harus lebih dari 0.');
      return;
    }

    createStockRequest({
      requestedBy: user?.name || 'Staff Kasir/Barista',
      urgency: reqUrgency,
      notes: reqNotes,
      items: reqItems,
    });

    setReqNotes('');
    setReqItems([{ materialId: materials[0]?.id || 'mat_1', qtyRequested: 5 }]);
    showToast('🚀 Permintaan stok berhasil dikirim ke Owner!');
  };

  // ------------------------------------------
  // HANDLERS: MENU 2 (STOK MASUK: DO & DIRECT)
  // ------------------------------------------
  const handleSelectDO = (requestId: string) => {
    const req = stockRequests.find(r => r.id === requestId);
    if (!req) return;
    setSelectedDOId(requestId);
    setShowDirectStockIn(false);
    const initialCounts: { [materialId: string]: string } = {};
    req.items.forEach(item => {
      initialCounts[item.materialId] = String(item.qtyRequested);
    });
    setDoReceivedCounts(initialCounts);
  };

  const handleDOItemCountChange = (materialId: string, val: string) => {
    setDoReceivedCounts(prev => ({ ...prev, [materialId]: val }));
  };

  const handleConfirmReceiveDO = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDOId) return;
    const currentRequest = stockRequests.find(r => r.id === selectedDOId);
    if (!currentRequest) return;

    const verifiedItems = currentRequest.items.map(item => {
      const rawVal = parseFloat(doReceivedCounts[item.materialId] || '0');
      const qty = isNaN(rawVal) ? 0 : Math.max(0, rawVal);
      return {
        materialId: item.materialId,
        qty,
      };
    });

    const hasInvalid = verifiedItems.some(i => i.qty <= 0);
    if (hasInvalid) {
      showToast('⚠️ Jumlah fisik barang yang diterima harus lebih dari 0.');
      return;
    }

    const doNo = currentRequest.doNumber || `DO-${currentRequest.id.slice(-4)}`;
    fulfillStockRequest(selectedDOId, user?.name || 'Staff Toko', verifiedItems, doNo);
    setSelectedDOId(null);
    showToast(`🎉 Surat Jalan ${doNo} berhasil diterima & stok toko langsung bertambah!`);
  };

  const handleAddInItem = () => {
    setInItems(prev => [...prev, { materialId: materials[0]?.id || 'mat_1', qty: 5 }]);
  };

  const handleRemoveInItem = (idx: number) => {
    setInItems(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmitStockIn = (e: React.FormEvent) => {
    e.preventDefault();
    const hasInvalid = inItems.some(i => i.qty <= 0);
    if (hasInvalid) {
      showToast('⚠️ Jumlah barang masuk harus lebih dari 0.');
      return;
    }

    addStaffStockIn({
      supplierName: 'Penerimaan Toko',
      invoiceNo: inInvoice.trim() || `SJ-${Date.now().toString().slice(-4)}`,
      receivedBy: user?.name || 'Staff Toko',
      notes: '',
      items: inItems,
    });

    setInInvoice('');
    setInItems([{ materialId: materials[0]?.id || 'mat_1', qty: 5 }]);
    setShowDirectStockIn(false);
    showToast('✅ Stok masuk berhasil disimpan & stok aktif langsung bertambah!');
  };

  // ------------------------------------------
  // HANDLERS: MENU 3 (STOCK OPNAME HARIAN)
  // ------------------------------------------
  const handleOpnameCountChange = (materialId: string, value: string) => {
    setOpnameCounts(prev => ({ ...prev, [materialId]: value }));
  };

  const handleSubmitStockOpname = (e: React.FormEvent) => {
    e.preventDefault();
    const numericCounts: { [materialId: string]: number } = {};
    materials.forEach(m => {
      const val = parseFloat(opnameCounts[m.id] || '0');
      numericCounts[m.id] = isNaN(val) ? 0 : Math.max(0, val);
    });

    submitDailyStockTake({
      shiftName: opnameShift,
      conductedBy: user?.name || 'Staff Toko',
      notes: '',
      countedStocks: numericCounts,
    });

    showToast('📋 Hasil Stock Opname Harian berhasil dikirim ke Owner!');
  };

  const pendingRequests = stockRequests.filter(r => r.status === 'PENDING').length;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fade-in select-none">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 animate-scale-up overflow-hidden">
        
        {/* ======================================================== */}
        {/* MODAL HEADER                                             */}
        {/* ======================================================== */}
        <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-400/30 font-bold text-lg">
              📦
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight flex items-center gap-2">
                Manajemen Stok Bahan Baku
              </h2>
              <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                <span>Outlet: <strong className="text-slate-200">Kopi Nusa Senopati</strong></span>
                <span>•</span>
                <span>Petugas: <strong className="text-slate-200">{user?.name || 'Staff Toko'}</strong></span>
              </div>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl transition-colors"
            title="Tutup Modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* ======================================================== */}
        {/* 3 MENU UTAMA TABS HEADER                                 */}
        {/* ======================================================== */}
        <div className="flex items-center gap-2 p-3 bg-slate-100 border-b border-slate-200 shrink-0 text-xs font-bold">
          
          {/* Menu 1: Request Stok */}
          <button
            type="button"
            onClick={() => setActiveTab('request')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl transition-all ${
              activeTab === 'request'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-black scale-[1.02]'
                : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200/80 hover:text-slate-900'
            }`}
          >
            <Send size={15} />
            <span>1. 📝 Request Stok</span>
            {pendingRequests > 0 && (
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                activeTab === 'request' ? 'bg-amber-400 text-slate-950' : 'bg-amber-100 text-amber-900'
              }`}>
                {pendingRequests}
              </span>
            )}
          </button>

          {/* Menu 2: Stok Masuk */}
          <button
            type="button"
            onClick={() => setActiveTab('stock-in')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl transition-all ${
              activeTab === 'stock-in'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 font-black scale-[1.02]'
                : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200/80 hover:text-slate-900'
            }`}
          >
            <Truck size={15} />
            <span>2. 📥 Stok Masuk</span>
          </button>

          {/* Menu 3: Stock Opname Harian */}
          <button
            type="button"
            onClick={() => setActiveTab('stock-take')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl transition-all ${
              activeTab === 'stock-take'
                ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30 font-black scale-[1.02]'
                : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200/80 hover:text-slate-900'
            }`}
          >
            <Scale size={15} />
            <span>3. 📋 Stock Opname</span>
          </button>

        </div>

        {/* ======================================================== */}
        {/* MODAL CONTENT BODY                                       */}
        {/* ======================================================== */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          
          {/* ====================================================== */}
          {/* MENU 1: REQUEST STOK (STAFF ➔ OWNER)                  */}
          {/* ====================================================== */}
          {activeTab === 'request' && (
            <div className="space-y-6">
              
              {/* Form Request Baru */}
              <form onSubmit={handleSubmitRequest} className="space-y-4 text-xs bg-indigo-50/40 p-4 sm:p-5 rounded-3xl border border-indigo-100">
                <div className="flex items-start justify-between gap-2 border-b border-indigo-100 pb-3">
                  <div>
                    <h3 className="font-black text-sm text-indigo-950 flex items-center gap-1.5">
                      <Send size={16} className="text-indigo-600" />
                      <span>Form Pengajuan Restock Bahan ke Owner</span>
                    </h3>
                    <p className="text-[11px] text-indigo-700/80 mt-0.5">
                      Pilih bahan baku yang menipis di bar. Owner akan langsung melihat dan memesankannya ke supplier.
                    </p>
                  </div>
                  <span className="text-[10px] bg-indigo-100 text-indigo-800 font-bold px-2 py-0.5 rounded-lg border border-indigo-200 shrink-0">
                    Real-Time POS
                  </span>
                </div>

                {/* Tingkat Urgensi */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">Tingkat Kebutuhan / Urgensi:</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setReqUrgency('NORMAL')}
                      className={`p-3 rounded-2xl border text-left font-bold transition-all ${
                        reqUrgency === 'NORMAL'
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-900 ring-2 ring-emerald-500/20 shadow-xs'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span className="block text-xs">🟢 Normal (Restock Rutin)</span>
                      <span className="text-[10px] text-slate-500 font-normal">Untuk persediaan 2-3 hari ke depan</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setReqUrgency('URGENT')}
                      className={`p-3 rounded-2xl border text-left font-bold transition-all ${
                        reqUrgency === 'URGENT'
                          ? 'bg-rose-50 border-rose-500 text-rose-900 ring-2 ring-rose-500/20 shadow-xs'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span className="block text-xs">🔴 Mendesak (Habis Hari Ini)</span>
                      <span className="text-[10px] text-slate-500 font-normal">Sisa stok kritis di bar, butuh cepat</span>
                    </button>
                  </div>
                </div>

                {/* Item Bahan */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="font-bold text-slate-700">Daftar Bahan Baku yang Dipesan:</label>
                    <button
                      type="button"
                      onClick={handleAddReqItem}
                      className="flex items-center gap-1 text-[11px] font-bold text-indigo-700 hover:text-indigo-900 bg-indigo-100/80 hover:bg-indigo-100 px-2.5 py-1 rounded-xl border border-indigo-200 transition-colors"
                    >
                      <Plus size={13} /> Tambah Bahan
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    {reqItems.map((item, idx) => {
                      const selectedMat = materials.find(m => m.id === item.materialId) || materials[0];
                      const estStock = Number((selectedMat?.startStock + selectedMat?.stockIn - selectedMat?.usedSystem).toFixed(2));

                      return (
                        <div key={idx} className="flex items-center gap-2 p-2.5 bg-white border border-slate-200 rounded-2xl shadow-xs">
                          <div className="flex-1">
                            <select
                              value={item.materialId}
                              onChange={(e) => {
                                const newId = e.target.value;
                                setReqItems(prev => prev.map((it, i) => i === idx ? { ...it, materialId: newId } : it));
                              }}
                              className="w-full text-xs font-bold p-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white outline-none"
                            >
                              {materials.map((m) => {
                                const sisa = Number((m.startStock + m.stockIn - m.usedSystem).toFixed(2));
                                return (
                                  <option key={m.id} value={m.id}>
                                    {m.name} (Sisa di bar: ~{sisa} {m.unit})
                                  </option>
                                );
                              })}
                            </select>
                          </div>

                          <div className="w-32 flex items-center gap-1.5">
                            <input
                              type="number"
                              min="0.1"
                              step="0.1"
                              value={item.qtyRequested}
                              onChange={(e) => {
                                const val = parseFloat(e.target.value) || 0;
                                setReqItems(prev => prev.map((it, i) => i === idx ? { ...it, qtyRequested: val } : it));
                              }}
                              className="w-full text-xs font-mono font-black p-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-center focus:bg-white outline-none"
                              placeholder="Qty"
                            />
                            <span className="text-[10px] font-bold text-slate-500 w-10 shrink-0">{selectedMat?.unit}</span>
                          </div>

                          {reqItems.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveReqItem(idx)}
                              className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                            >
                              <Trash2 size={15} />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Catatan Staff */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Catatan Kebutuhan Staff:</label>
                  <textarea
                    rows={2}
                    value={reqNotes}
                    onChange={(e) => setReqNotes(e.target.value)}
                    placeholder="Contoh: Fresh milk sisa 3 liter, weekend estimasi ramai pelanggan..."
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-2xl text-xs focus:ring-2 focus:ring-indigo-500/20 outline-none"
                  />
                </div>

                <div className="pt-1">
                  <button
                    type="submit"
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-2xl shadow-lg shadow-indigo-600/20 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Send size={16} />
                    <span>Kirim Permintaan Stok ke Owner</span>
                  </button>
                </div>
              </form>

              {/* Riwayat Status Permintaan Staff */}
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <span className="font-black text-xs text-slate-800 flex items-center gap-1.5">
                    <ClipboardList size={15} className="text-slate-500" />
                    <span>Riwayat Pengajuan Stok & Status dari Owner</span>
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium">Total: {stockRequests.length} Pengajuan</span>
                </div>

                {stockRequests.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 bg-slate-50 rounded-2xl border border-slate-200">
                    <ClipboardList size={32} className="mx-auto mb-2 opacity-40" />
                    <p className="text-xs">Belum ada riwayat pengajuan stok.</p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {stockRequests.map((req) => (
                      <div key={req.id} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-slate-900">Request #{req.id.slice(-4)}</span>
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                              req.urgency === 'URGENT' ? 'bg-rose-100 text-rose-800' : 'bg-slate-200 text-slate-700'
                            }`}>
                              {req.urgency === 'URGENT' ? '🔴 Mendesak' : '🟢 Normal'}
                            </span>
                          </div>

                          <span className={`text-[11px] font-black px-2.5 py-1 rounded-xl ${
                            req.status === 'PENDING' ? 'bg-amber-100 text-amber-900 animate-pulse' :
                            req.status === 'ORDERED' ? 'bg-blue-100 text-blue-900 font-bold' :
                            req.status === 'RECEIVED' ? 'bg-emerald-100 text-emerald-900' :
                            'bg-rose-100 text-rose-900'
                          }`}>
                            {req.status === 'PENDING' ? '⏳ Menunggu Persetujuan Owner' :
                             req.status === 'ORDERED' ? '🚚 Sudah Dipesankan Owner' :
                             req.status === 'RECEIVED' ? '✅ Barang Sudah Diterima' :
                             '❌ Ditolak'}
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-1.5">
                          {req.items.map((item, idx) => (
                            <span key={idx} className="bg-white border border-slate-200 px-2.5 py-1 rounded-xl text-[11px] font-bold text-slate-800">
                              {item.materialName}: <strong className="text-indigo-600">{item.qtyRequested} {item.unit}</strong>
                            </span>
                          ))}
                        </div>

                        {req.notes && (
                          <p className="text-[11px] text-slate-600 italic bg-white p-2 rounded-xl border border-slate-200/70">
                            "{req.notes}"
                          </p>
                        )}

                        <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-[10px] text-slate-400">
                          <span>Diajukan oleh: <strong>{req.requestedBy}</strong> ({new Date(req.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })})</span>
                          
                          {req.status === 'ORDERED' && (
                            <button
                              type="button"
                              onClick={() => {
                                fulfillStockRequest(req.id, user?.name || 'Staff');
                                showToast('🎉 Barang berhasil diterima & stok langsung bertambah!');
                              }}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-xl font-bold transition-all shadow-xs active:scale-95 flex items-center gap-1 cursor-pointer"
                            >
                              <Check size={14} />
                              <span>Konfirmasi Barang Sampai</span>
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* ====================================================== */}
          {/* MENU 2: STOK MASUK (BERBASIS DO & INPUT BEBAS)        */}
          {/* ====================================================== */}
          {activeTab === 'stock-in' && (
            <div className="space-y-6">
              
              {/* SUB-VIEW A: FORM VERIFIKASI & PENERIMAAN DO TERPILIH */}
              {selectedDOId ? (() => {
                const currentRequest = stockRequests.find(r => r.id === selectedDOId);
                if (!currentRequest) return null;
                const doNo = currentRequest.doNumber || `DO-${currentRequest.id.slice(-4)}`;

                return (
                  <div className="space-y-5 animate-fade-in">
                    {/* Header Navigasi Kembali */}
                    <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                      <button
                        type="button"
                        onClick={() => setSelectedDOId(null)}
                        className="flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-xl transition-all cursor-pointer shadow-xs active:scale-95"
                      >
                        <ArrowLeft size={15} />
                        <span>Kembali ke Daftar Surat Jalan</span>
                      </button>

                      <span className="text-xs bg-emerald-100 text-emerald-950 font-mono font-black px-3 py-1.5 rounded-xl border border-emerald-300">
                        📄 Surat Jalan: {doNo}
                      </span>
                    </div>

                    {/* Form Input Qty Fisik DO */}
                    <form onSubmit={handleConfirmReceiveDO} className="space-y-4 bg-emerald-50/50 p-4 sm:p-5 rounded-3xl border border-emerald-200 shadow-xs">
                      <div className="flex items-start justify-between gap-2 border-b border-emerald-100 pb-3">
                        <div>
                          <h3 className="font-black text-sm text-emerald-950 flex items-center gap-1.5">
                            <PackageCheck size={18} className="text-emerald-600" />
                            <span>Pemeriksaan & Verifikasi Fisik Barang Datang</span>
                          </h3>
                          <p className="text-[11px] text-emerald-800/80 mt-0.5">
                            Periksa fisik barang dari Surat Jalan <strong>{doNo}</strong>. Masukkan jumlah riil yang diterima di bar.
                          </p>
                        </div>
                        <span className="text-[10px] bg-emerald-200/80 text-emerald-900 font-bold px-2.5 py-0.5 rounded-lg shrink-0">
                          🚚 In-Transit DO
                        </span>
                      </div>

                      {/* Info DO Metadata */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs bg-white p-3.5 rounded-2xl border border-slate-200">
                        <div>
                          <span className="text-[10px] text-slate-400 font-medium block">Nomor DO / SJ:</span>
                          <strong className="font-mono text-slate-900">{doNo}</strong>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 font-medium block">Diajukan oleh:</span>
                          <strong className="text-slate-800">{currentRequest.requestedBy}</strong>
                        </div>
                        <div className="col-span-2 sm:col-span-1">
                          <span className="text-[10px] text-slate-400 font-medium block">Petugas Penerima:</span>
                          <strong className="text-emerald-700">{user?.name || 'Staff Toko'}</strong>
                        </div>
                      </div>

                      {/* Daftar Barang Dalam DO & Input Qty Fisik */}
                      <div className="space-y-2">
                        <label className="block font-bold text-slate-700 text-xs">
                          Daftar Barang & Input Hitungan Fisik Aktual:
                        </label>

                        <div className="space-y-2.5">
                          {currentRequest.items.map((item) => {
                            const currentVal = doReceivedCounts[item.materialId] !== undefined
                              ? doReceivedCounts[item.materialId]
                              : String(item.qtyRequested);

                            return (
                              <div
                                key={item.materialId}
                                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-white border border-slate-200 rounded-2xl shadow-xs hover:border-emerald-300 transition-colors"
                              >
                                <div className="flex-1">
                                  <div className="font-bold text-xs sm:text-sm text-slate-900 flex items-center gap-1.5">
                                    <Package size={16} className="text-emerald-600" />
                                    <span>{item.materialName}</span>
                                  </div>
                                  <span className="text-[11px] text-slate-400 font-medium">
                                    Pesanan Sistem: <strong className="text-slate-700 font-mono">{item.qtyRequested} {item.unit}</strong>
                                  </span>
                                </div>

                                <div className="flex items-center gap-2">
                                  <span className="text-[11px] font-bold text-slate-600">Qty Fisik Datang:</span>
                                  <div className="w-36 flex items-center gap-1.5">
                                    <input
                                      type="number"
                                      min="0.1"
                                      step="0.1"
                                      value={currentVal}
                                      onChange={(e) => handleDOItemCountChange(item.materialId, e.target.value)}
                                      className="w-full text-xs font-mono font-black p-2 bg-slate-50 border-2 border-emerald-400 focus:border-emerald-600 rounded-xl text-slate-900 text-center focus:bg-white outline-none"
                                      placeholder="Qty"
                                    />
                                    <span className="text-[10px] font-bold text-slate-500 w-10 shrink-0">{item.unit}</span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setSelectedDOId(null)}
                          className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-2xl transition-all cursor-pointer text-center"
                        >
                          Batal
                        </button>

                        <button
                          type="submit"
                          className="flex-2 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-2xl shadow-lg shadow-emerald-600/20 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <Check size={16} />
                          <span>Konfirmasi Penerimaan DO ({doNo})</span>
                        </button>
                      </div>
                    </form>
                  </div>
                );
              })() : (() => {
                const activeDOs = stockRequests.filter(r => r.status === 'ORDERED');
                const filteredDOs = activeDOs.filter(r => {
                  const query = doSearch.trim().toLowerCase();
                  if (!query) return true;
                  const doNo = (r.doNumber || `DO-${r.id.slice(-4)}`).toLowerCase();
                  const itemsMatch = r.items.some(i => i.materialName.toLowerCase().includes(query));
                  return doNo.includes(query) || itemsMatch;
                });

                return (
                  <div className="space-y-6">
                    
                    {/* Top Action Bar & Toggle Direct Inbound */}
                    <div className="bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-slate-100 p-4 sm:p-5 rounded-3xl border border-emerald-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h3 className="font-black text-sm text-slate-900 flex items-center gap-2">
                          <Truck size={18} className="text-emerald-600" />
                          <span>Penerimaan Barang Masuk (Stok Masuk)</span>
                        </h3>
                        <p className="text-[11px] text-slate-600 mt-0.5">
                          Klik nomor Surat Jalan (DO) yang datang untuk verifikasi fisik, atau gunakan input bebas jika tanpa DO.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => setShowDirectStockIn(!showDirectStockIn)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs shrink-0 cursor-pointer ${
                          showDirectStockIn
                            ? 'bg-slate-800 text-white hover:bg-slate-900'
                            : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-600/20'
                        }`}
                      >
                        {showDirectStockIn ? (
                          <>
                            <Package size={14} />
                            <span>Tutup Form Input Bebas</span>
                          </>
                        ) : (
                          <>
                            <Plus size={14} />
                            <span>Input Non-DO / Belanja Bebas</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Form Input Non-DO Bebas (Jika di-toggle) */}
                    {showDirectStockIn && (
                      <form onSubmit={handleSubmitStockIn} className="space-y-4 text-xs bg-emerald-50/40 p-4 sm:p-5 rounded-3xl border border-emerald-200 animate-fade-in">
                        <div className="flex items-start justify-between gap-2 border-b border-emerald-100 pb-3">
                          <div>
                            <h3 className="font-black text-sm text-emerald-950 flex items-center gap-1.5">
                              <Plus size={16} className="text-emerald-600" />
                              <span>Formulir Penerimaan Non-DO / Belanja Dadakan</span>
                            </h3>
                            <p className="text-[11px] text-emerald-800/80 mt-0.5">
                              Untuk kiriman langsung tanpa pesanan sistem DO (misal: belanja di warung/pasar terdekat).
                            </p>
                          </div>
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-lg border border-emerald-200 shrink-0">
                            Direct Inbound
                          </span>
                        </div>

                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Nomor Surat Jalan / Nota Toko:</label>
                          <input
                            type="text"
                            value={inInvoice}
                            onChange={(e) => setInInvoice(e.target.value)}
                            placeholder="Contoh: NOTA-PASAR-01 (Opsional, otomatis dibuat jika kosong)"
                            className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold focus:ring-2 focus:ring-emerald-500/20 outline-none text-slate-900"
                          />
                        </div>

                        {/* Item Bahan Masuk */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <label className="font-bold text-slate-700">Jumlah Bahan Fisik yang Diterima:</label>
                            <button
                              type="button"
                              onClick={handleAddInItem}
                              className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-900 bg-emerald-100/80 hover:bg-emerald-100 px-2.5 py-1 rounded-xl border border-emerald-200 transition-colors cursor-pointer"
                            >
                              <Plus size={13} /> Tambah Bahan
                            </button>
                          </div>

                          <div className="space-y-2.5">
                            {inItems.map((item, idx) => {
                              const selectedMat = materials.find(m => m.id === item.materialId) || materials[0];

                              return (
                                <div key={idx} className="flex items-center gap-2 p-2.5 bg-white border border-slate-200 rounded-2xl shadow-xs">
                                  <div className="flex-1">
                                    <select
                                      value={item.materialId}
                                      onChange={(e) => {
                                        const newId = e.target.value;
                                        setInItems(prev => prev.map((it, i) => i === idx ? { ...it, materialId: newId } : it));
                                      }}
                                      className="w-full text-xs font-bold p-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white outline-none"
                                    >
                                      {materials.map((m) => (
                                        <option key={m.id} value={m.id}>
                                          {m.name} ({m.unit})
                                        </option>
                                      ))}
                                    </select>
                                  </div>

                                  <div className="w-36 flex items-center gap-1.5">
                                    <input
                                      type="number"
                                      min="0.1"
                                      step="0.1"
                                      value={item.qty}
                                      onChange={(e) => {
                                        const val = parseFloat(e.target.value) || 0;
                                        setInItems(prev => prev.map((it, i) => i === idx ? { ...it, qty: val } : it));
                                      }}
                                      className="w-full text-xs font-mono font-black p-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-center focus:bg-white outline-none"
                                      placeholder="Qty Masuk"
                                    />
                                    <span className="text-[10px] font-bold text-slate-500 w-10 shrink-0">{selectedMat?.unit}</span>
                                  </div>

                                  {inItems.length > 1 && (
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveInItem(idx)}
                                      className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                    >
                                      <Trash2 size={15} />
                                    </button>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        <div className="pt-1">
                          <button
                            type="submit"
                            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-2xl shadow-lg shadow-emerald-600/20 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                          >
                            <Check size={16} />
                            <span>Simpan & Tambah ke Stok Aktif Toko</span>
                          </button>
                        </div>
                      </form>
                    )}

                    {/* Section 1: Daftar Surat Jalan / DO Aktif (Sedang Dikirim) */}
                    <div className="space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-slate-200 gap-2">
                        <div>
                          <span className="font-black text-xs text-slate-800 flex items-center gap-1.5">
                            <PackageCheck size={16} className="text-emerald-600" />
                            <span>Surat Jalan / Delivery Order (DO) Siap Diterima</span>
                          </span>
                          <span className="text-[11px] text-slate-500 font-medium">
                            {activeDOs.length} Surat Jalan aktif sedang dikirim
                          </span>
                        </div>

                        {/* Search bar DO */}
                        <div className="relative w-full sm:w-60">
                          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            type="text"
                            value={doSearch}
                            onChange={(e) => setDoSearch(e.target.value)}
                            placeholder="Cari No DO / Nama Bahan..."
                            className="w-full pl-8 pr-7 py-1.5 bg-slate-50 focus:bg-white border border-slate-200 focus:border-emerald-500 rounded-xl text-xs font-mono outline-none transition-all placeholder:font-sans"
                          />
                          {doSearch && (
                            <button
                              type="button"
                              onClick={() => setDoSearch('')}
                              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full"
                            >
                              <X size={12} />
                            </button>
                          )}
                        </div>
                      </div>

                      {filteredDOs.length === 0 ? (
                        <div className="text-center py-7 text-slate-400 bg-slate-50 rounded-2xl border border-slate-200">
                          <Truck size={30} className="mx-auto mb-1.5 opacity-40" />
                          <p className="text-xs font-bold text-slate-600">
                            {doSearch.trim() ? `Tidak ditemukan DO dengan nomor "${doSearch}".` : 'Tidak ada Surat Jalan (DO) yang sedang dalam perjalanan.'}
                          </p>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            Semua DO telah diterima. Gunakan tombol "Input Non-DO" jika ada kiriman belanja dadakan.
                          </p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 gap-3">
                          {filteredDOs.map((req) => {
                            const doNo = req.doNumber || `DO-${req.id.slice(-4)}`;
                            return (
                              <div
                                key={req.id}
                                onClick={() => handleSelectDO(req.id)}
                                className="p-4 bg-emerald-50/50 hover:bg-emerald-50 rounded-2xl border-2 border-emerald-200 hover:border-emerald-500 transition-all cursor-pointer shadow-xs hover:shadow-md group space-y-3"
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs bg-emerald-600 text-white font-mono font-black px-2.5 py-1 rounded-xl shadow-xs flex items-center gap-1.5">
                                      <Truck size={13} />
                                      <span>{doNo}</span>
                                    </span>
                                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                                      req.urgency === 'URGENT' ? 'bg-rose-100 text-rose-800' : 'bg-slate-200 text-slate-700'
                                    }`}>
                                      {req.urgency === 'URGENT' ? '🔴 Mendesak' : '🟢 Normal'}
                                    </span>
                                  </div>

                                  <span className="text-xs font-bold text-emerald-700 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                                    <span>Klik Untuk Periksa & Terima</span>
                                    <ChevronRight size={15} />
                                  </span>
                                </div>

                                <div className="flex flex-wrap gap-1.5">
                                  {req.items.map((item, idx) => (
                                    <span key={idx} className="bg-white border border-emerald-200 px-2.5 py-1 rounded-xl text-[11px] font-bold text-slate-800">
                                      {item.materialName}: <strong className="text-emerald-700 font-mono">+{item.qtyRequested} {item.unit}</strong>
                                    </span>
                                  ))}
                                </div>

                                <div className="flex items-center justify-between pt-2 border-t border-emerald-200/60 text-[10px] text-slate-500">
                                  <span>Pengaju: <strong>{req.requestedBy}</strong> ({new Date(req.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })})</span>
                                  <span className="text-emerald-800 font-bold bg-emerald-100 px-2 py-0.5 rounded-md">
                                    🚚 Dipesankan Owner
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Section 2: Riwayat Penerimaan Selesai (Inbound Logs) */}
                    <div className="space-y-3 pt-2">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-slate-200 gap-2">
                        <div>
                          <span className="font-black text-xs text-slate-800 flex items-center gap-1.5">
                            <ClipboardList size={15} className="text-slate-500" />
                            <span>Riwayat Penerimaan Barang Selesai (Inbound Logs)</span>
                          </span>
                          <span className="text-[11px] text-slate-500 font-medium">Total: {stockInLogs.length} Surat Jalan Selesai</span>
                        </div>

                        {/* Search bar Inbound Logs */}
                        <div className="relative w-full sm:w-60">
                          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            type="text"
                            value={stockInSearch}
                            onChange={(e) => setStockInSearch(e.target.value)}
                            placeholder="Cari No Surat Jalan..."
                            className="w-full pl-8 pr-7 py-1.5 bg-slate-50 focus:bg-white border border-slate-200 focus:border-emerald-500 rounded-xl text-xs font-mono outline-none transition-all placeholder:font-sans"
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

                      {(() => {
                        const filteredLogs = stockInLogs
                          .slice()
                          .reverse()
                          .filter((log) => 
                            log.invoiceNo.toLowerCase().includes(stockInSearch.trim().toLowerCase())
                          );

                        if (filteredLogs.length === 0) {
                          return (
                            <div className="text-center py-7 text-slate-400 bg-slate-50 rounded-2xl border border-slate-200">
                              <Truck size={30} className="mx-auto mb-1.5 opacity-40" />
                              <p className="text-xs">
                                {stockInSearch.trim() 
                                  ? `Tidak ada surat jalan selesai dengan nomor "${stockInSearch}".`
                                  : 'Belum ada riwayat penerimaan barang masuk.'}
                              </p>
                            </div>
                          );
                        }

                        return (
                          <div className="space-y-2.5">
                            {filteredLogs.map((log) => (
                              <div key={log.id} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <span className="text-[11px] bg-emerald-100 text-emerald-950 font-mono font-bold px-2.5 py-0.5 rounded-lg border border-emerald-200">
                                      📄 No Surat Jalan: {log.invoiceNo}
                                    </span>
                                  </div>
                                  <span className="text-[10px] text-slate-500 font-medium">
                                    {new Date(log.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </div>

                                <div className="flex flex-wrap gap-1.5">
                                  {log.items.map((item, idx) => (
                                    <span key={idx} className="bg-white border border-slate-200 px-2.5 py-1 rounded-xl text-[11px] font-bold text-slate-800">
                                      {item.materialName}: <strong className="text-emerald-600 font-mono">+{item.qty} {item.unit}</strong>
                                    </span>
                                  ))}
                                </div>

                                <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-200/60">
                                  Diterima oleh: <strong>{log.receivedBy}</strong>
                                </div>
                              </div>
                            ))}
                          </div>
                        );
                      })()}
                    </div>

                  </div>
                );
              })()}

            </div>
          )}

          {/* ====================================================== */}
          {/* MENU 3: STOCK OPNAME HARIAN (STOCK TAKING KASIR)      */}
          {/* ====================================================== */}
          {activeTab === 'stock-take' && (
            <div className="space-y-6">
              
              {/* Form Input Stock Opname Harian (Blind Count) */}
              <form onSubmit={handleSubmitStockOpname} className="space-y-4 text-xs bg-sky-50/40 p-4 sm:p-5 rounded-3xl border border-sky-100">
                <div className="flex items-start justify-between gap-2 border-b border-sky-100 pb-3">
                  <div>
                    <h3 className="font-black text-sm text-sky-950 flex items-center gap-1.5">
                      <Scale size={16} className="text-sky-600" />
                      <span>Formulir Hitung Fisik (Stock Opname Harian - Blind Count)</span>
                    </h3>
                    <p className="text-[11px] text-sky-800/80 mt-0.5">
                      Hitung dan masukkan sisa fisik riil bahan baku di bar. Sistem POS akan menghitung rekonsiliasi & selisih di sisi Owner.
                    </p>
                  </div>
                  <span className="text-[10px] bg-sky-100 text-sky-800 font-bold px-2 py-0.5 rounded-lg border border-sky-200 shrink-0">
                    Blind Count
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Sesi Shift Opname:</label>
                    <select
                      value={opnameShift}
                      onChange={(e) => setOpnameShift(e.target.value as any)}
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-sky-500/20 outline-none"
                    >
                      <option value="Shift 1 (Pagi)">Shift 1 (Pagi) - Handover Siang</option>
                      <option value="Shift 2 (Malam)">Shift 2 (Malam) - Handover Malam</option>
                      <option value="Closing Harian">Closing Harian - Tutup Toko</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Petugas Pemeriksa:</label>
                    <input
                      type="text"
                      disabled
                      value={`${user?.name || 'Staff'} (${user?.role || 'KASIR'})`}
                      className="w-full p-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Tabel Input Hitungan Fisik (Blind Count: Tanpa Sisa Sistem & Selisih, Default 0) */}
                <div>
                  <label className="block font-bold text-slate-700 mb-2">
                    Input Hasil Hitungan Fisik Riil di Bar:
                  </label>

                  <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100/90 text-slate-600 font-black border-b border-slate-200 text-[11px]">
                        <tr>
                          <th className="p-3">Bahan Baku & Kategori</th>
                          <th className="p-3 text-center w-48 sm:w-56">Input Hitungan Fisik Riil</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {materials.map((mat) => {
                          return (
                            <tr key={mat.id} className="hover:bg-slate-50/80 transition-colors">
                              <td className="p-3">
                                <div className="font-bold text-slate-900 text-xs sm:text-sm">{mat.name}</div>
                                <span className="text-[10px] text-slate-400 font-medium">{mat.category} • Satuan: {mat.unit}</span>
                              </td>

                              <td className="p-3 text-center">
                                <div className="inline-flex items-center justify-center gap-2">
                                  <input
                                    type="number"
                                    min="0"
                                    step="0.05"
                                    value={opnameCounts[mat.id] !== undefined ? opnameCounts[mat.id] : '0'}
                                    onChange={(e) => handleOpnameCountChange(mat.id, e.target.value)}
                                    onFocus={(e) => {
                                      if (e.target.value === '0') {
                                        handleOpnameCountChange(mat.id, '');
                                      }
                                    }}
                                    className="w-28 sm:w-32 text-center p-2 bg-slate-50 border-2 border-slate-200 focus:border-sky-500 rounded-xl font-mono font-black text-slate-900 focus:bg-white outline-none text-xs sm:text-sm"
                                    placeholder="0"
                                  />
                                  <span className="text-xs font-bold text-slate-600 w-8 text-left">{mat.unit}</span>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-3 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-2xl shadow-lg shadow-sky-600/20 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Check size={16} />
                    <span>Kirim & Simpan Hasil Stock Opname</span>
                  </button>
                </div>
              </form>

            </div>
          )}

        </div>

        {/* ======================================================== */}
        {/* TOAST FEEDBACK NOTIFICATION                              */}
        {/* ======================================================== */}
        {toastMsg && (
          <div className="p-3 bg-slate-900 text-white text-xs font-bold text-center animate-fade-in border-t border-slate-800">
            {toastMsg}
          </div>
        )}

      </div>
    </div>
  );
}
