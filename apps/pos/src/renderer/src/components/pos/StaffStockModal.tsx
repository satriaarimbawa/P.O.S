import React, { useState } from 'react';
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
  Info
} from 'lucide-react';
import { 
  useInventoryStore, 
  StockRequestUrgency, 
  RawMaterial 
} from '../../stores/useInventoryStore';
import { useAuthStore } from '../../stores/useAuthStore';

interface StaffStockModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function StaffStockModal({ isOpen, onClose }: StaffStockModalProps) {
  const { user } = useAuthStore();
  const { 
    materials, 
    stockRequests, 
    createStockRequest, 
    addStaffStockIn, 
    fulfillStockRequest 
  } = useInventoryStore();

  const [activeTab, setActiveTab] = useState<'request' | 'stock-in' | 'history'>('request');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // ==========================================
  // 1. STATE FORM REQUEST STOK KE OWNER
  // ==========================================
  const [reqUrgency, setReqUrgency] = useState<StockRequestUrgency>('NORMAL');
  const [reqNotes, setReqNotes] = useState('');
  const [reqItems, setReqItems] = useState<{ materialId: string; qtyRequested: number }[]>([
    { materialId: materials[0]?.id || 'mat_1', qtyRequested: 5 }
  ]);

  // ==========================================
  // 2. STATE FORM INPUT STOK MASUK SEDERHANA (STAFF)
  // ==========================================
  const [inSupplier, setInSupplier] = useState('');
  const [inInvoice, setInInvoice] = useState('');
  const [inNotes, setInNotes] = useState('');
  const [inItems, setInItems] = useState<{ materialId: string; qty: number }[]>([
    { materialId: materials[0]?.id || 'mat_1', qty: 5 }
  ]);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // ------------------------------------------
  // HANDLERS REQUEST STOK
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
    setActiveTab('history');
  };

  // ------------------------------------------
  // HANDLERS STOCK IN SEDERHANA
  // ------------------------------------------
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
      supplierName: inSupplier,
      invoiceNo: inInvoice,
      receivedBy: user?.name || 'Staff Toko',
      notes: inNotes,
      items: inItems,
    });

    setInSupplier('');
    setInInvoice('');
    setInNotes('');
    setInItems([{ materialId: materials[0]?.id || 'mat_1', qty: 5 }]);
    showToast('✅ Stok masuk berhasil disimpan & stok langsung bertambah!');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fade-in select-none">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 animate-scale-up overflow-hidden">
        
        {/* MODAL HEADER */}
        <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-400/30">
              <Package size={20} />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight flex items-center gap-2">
                Manajemen Stok & Permintaan Bahan
              </h2>
              <p className="text-xs text-slate-400">
                Petugas: <strong>{user?.name || 'Staff Toko'}</strong>
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* TABS HEADER */}
        <div className="flex items-center gap-1.5 p-2.5 bg-slate-100 border-b border-slate-200 text-xs font-bold">
          <button
            onClick={() => setActiveTab('request')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl transition-all ${
              activeTab === 'request'
                ? 'bg-white text-indigo-700 shadow-xs font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Send size={15} />
            <span>📝 Request Stok ke Owner</span>
          </button>

          <button
            onClick={() => setActiveTab('stock-in')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl transition-all ${
              activeTab === 'stock-in'
                ? 'bg-white text-emerald-700 shadow-xs font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Truck size={15} />
            <span>📥 Catat Barang Masuk</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl transition-all ${
              activeTab === 'history'
                ? 'bg-white text-slate-900 shadow-xs font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ClipboardList size={15} />
            <span>📋 Status Permintaan</span>
            {stockRequests.filter(r => r.status === 'PENDING').length > 0 && (
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
            )}
          </button>
        </div>

        {/* MODAL BODY */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          
          {/* ==================================================== */}
          {/* TAB 1: FORM REQUEST STOK DARI STAFF KE OWNER         */}
          {/* ==================================================== */}
          {activeTab === 'request' && (
            <form onSubmit={handleSubmitRequest} className="space-y-4 text-xs">
              
              <div className="bg-indigo-50 border border-indigo-200 p-3.5 rounded-2xl flex items-start gap-2.5 text-indigo-900 font-medium">
                <Info size={18} className="text-indigo-600 shrink-0 mt-0.5" />
                <p>
                  Ajukan bahan baku yang hampir habis di bar. Owner akan melihat daftar permintaan ini secara real-time dan langsung memesankannya ke supplier.
                </p>
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
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-900 ring-2 ring-emerald-500/20'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
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
                        ? 'bg-rose-50 border-rose-500 text-rose-900 ring-2 ring-rose-500/20'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <span className="block text-xs">🔴 Mendesak (Habis Hari Ini)</span>
                    <span className="text-[10px] text-slate-500 font-normal">Sisa stok kritis, butuh segera</span>
                  </button>
                </div>
              </div>

              {/* Daftar Bahan yang Diminta */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="font-bold text-slate-700">Daftar Bahan yang Ingin Dipesan:</label>
                  <button
                    type="button"
                    onClick={handleAddReqItem}
                    className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-2.5 py-1 rounded-xl border border-indigo-200"
                  >
                    <Plus size={13} /> Tambah Bahan
                  </button>
                </div>

                <div className="space-y-2.5">
                  {reqItems.map((item, idx) => {
                    const selectedMat = materials.find(m => m.id === item.materialId) || materials[0];
                    const estStock = Number((selectedMat?.startStock + selectedMat?.stockIn - selectedMat?.usedSystem).toFixed(2));

                    return (
                      <div key={idx} className="flex items-center gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-2xl">
                        <div className="flex-1">
                          <select
                            value={item.materialId}
                            onChange={(e) => {
                              const newId = e.target.value;
                              setReqItems(prev => prev.map((it, i) => i === idx ? { ...it, materialId: newId } : it));
                            }}
                            className="w-full text-xs font-bold p-2 bg-white border border-slate-300 rounded-xl text-slate-900"
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

                        <div className="w-28 flex items-center gap-1">
                          <input
                            type="number"
                            min="0.1"
                            step="0.1"
                            value={item.qtyRequested}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value) || 0;
                              setReqItems(prev => prev.map((it, i) => i === idx ? { ...it, qtyRequested: val } : it));
                            }}
                            className="w-full text-xs font-mono font-black p-2 bg-white border border-slate-300 rounded-xl text-slate-900 text-center"
                            placeholder="Qty"
                          />
                          <span className="text-[10px] font-bold text-slate-500">{selectedMat?.unit}</span>
                        </div>

                        {reqItems.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveReqItem(idx)}
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

              {/* Catatan Kebutuhan Staff */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Catatan Kebutuhan Staff (Opsional):</label>
                <textarea
                  rows={2}
                  value={reqNotes}
                  onChange={(e) => setReqNotes(e.target.value)}
                  placeholder="Contoh: Biji kopi sisa sedikit, malam minggu perkiraan ramai pelanggan..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:bg-white focus:outline-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-2xl shadow-lg shadow-indigo-600/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <Send size={16} />
                  <span>Kirim Permintaan Stok ke Owner</span>
                </button>
              </div>

            </form>
          )}

          {/* ==================================================== */}
          {/* TAB 2: FORM STOK MASUK SEDERHANA (STAFF INPUT)       */}
          {/* ==================================================== */}
          {activeTab === 'stock-in' && (
            <form onSubmit={handleSubmitStockIn} className="space-y-4 text-xs">
              
              <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-2xl flex items-start gap-2.5 text-emerald-900 font-medium">
                <CheckCircle2 size={18} className="text-emerald-600 shrink-0 mt-0.5" />
                <p>
                  Form pencatatan barang datang dari supplier. <strong>Staff cukup mengisi jumlah barang fisik yang diterima</strong> tanpa perlu memikirkan perhitungan harga atau pembukuan.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nama Supplier / Pengirim:</label>
                  <input
                    type="text"
                    value={inSupplier}
                    onChange={(e) => setInSupplier(e.target.value)}
                    placeholder="Contoh: Cimory / PT Nusa"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">No Surat Jalan (Opsional):</label>
                  <input
                    type="text"
                    value={inInvoice}
                    onChange={(e) => setInInvoice(e.target.value)}
                    placeholder="Contoh: SJ-9912"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                  />
                </div>
              </div>

              {/* Daftar Bahan Masuk */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="font-bold text-slate-700">Jumlah Bahan Fisik yang Diterima:</label>
                  <button
                    type="button"
                    onClick={handleAddInItem}
                    className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200"
                  >
                    <Plus size={13} /> Tambah Bahan
                  </button>
                </div>

                <div className="space-y-2.5">
                  {inItems.map((item, idx) => {
                    const selectedMat = materials.find(m => m.id === item.materialId) || materials[0];

                    return (
                      <div key={idx} className="flex items-center gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-2xl">
                        <div className="flex-1">
                          <select
                            value={item.materialId}
                            onChange={(e) => {
                              const newId = e.target.value;
                              setInItems(prev => prev.map((it, i) => i === idx ? { ...it, materialId: newId } : it));
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

                        <div className="w-32 flex items-center gap-1">
                          <input
                            type="number"
                            min="0.1"
                            step="0.1"
                            value={item.qty}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value) || 0;
                              setInItems(prev => prev.map((it, i) => i === idx ? { ...it, qty: val } : it));
                            }}
                            className="w-full text-xs font-mono font-black p-2 bg-white border border-slate-300 rounded-xl text-slate-900 text-center"
                            placeholder="Qty Masuk"
                          />
                          <span className="text-[10px] font-bold text-slate-500">{selectedMat?.unit}</span>
                        </div>

                        {inItems.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveInItem(idx)}
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

              <div>
                <label className="block font-bold text-slate-700 mb-1">Catatan Kondisi Barang (Opsional):</label>
                <input
                  type="text"
                  value={inNotes}
                  onChange={(e) => setInNotes(e.target.value)}
                  placeholder="Contoh: Kemasan tersegel rapi, suhu dingin terjaga"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-2xl shadow-lg shadow-emerald-600/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <Check size={16} />
                  <span>Simpan Barang Masuk ke Stok</span>
                </button>
              </div>

            </form>
          )}

          {/* ==================================================== */}
          {/* TAB 3: RIWAYAT STATUS PERMINTAAN STOK STAFF          */}
          {/* ==================================================== */}
          {activeTab === 'history' && (
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="font-bold text-slate-600">Daftar Pengajuan Stok ke Owner:</span>
                <span className="text-[11px] text-slate-400">Total: {stockRequests.length} Permintaan</span>
              </div>

              {stockRequests.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <ClipboardList size={32} className="mx-auto mb-2 opacity-50" />
                  <p>Belum ada pengajuan permintaan stok.</p>
                </div>
              ) : (
                stockRequests.map((req) => (
                  <div key={req.id} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">Request #{req.id.slice(-4)}</span>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                          req.urgency === 'URGENT' ? 'bg-rose-100 text-rose-800' : 'bg-slate-200 text-slate-700'
                        }`}>
                          {req.urgency === 'URGENT' ? '🔴 Mendesak' : '🟢 Normal'}
                        </span>
                      </div>

                      {/* Status Badge */}
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
                        <span key={idx} className="bg-white border border-slate-200 px-2 py-1 rounded-lg text-[11px] font-bold text-slate-800">
                          {item.materialName}: <strong>{item.qtyRequested} {item.unit}</strong>
                        </span>
                      ))}
                    </div>

                    {req.notes && (
                      <p className="text-[11px] text-slate-500 italic bg-white/60 p-2 rounded-lg border border-slate-100">
                        "{req.notes}"
                      </p>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-[10px] text-slate-400">
                      <span>Diajukan oleh: <strong>{req.requestedBy}</strong> ({new Date(req.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })})</span>
                      
                      {/* Tombol Terima Barang jika status ORDERED */}
                      {req.status === 'ORDERED' && (
                        <button
                          onClick={() => {
                            fulfillStockRequest(req.id, user?.name || 'Staff');
                            showToast('🎉 Barang berhasil diterima & stok langsung bertambah!');
                          }}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1 rounded-lg font-bold transition-all shadow-xs active:scale-95"
                        >
                          📦 Konfirmasi Barang Sudah Sampai
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}

            </div>
          )}

        </div>

        {/* TOAST FEEDBACK */}
        {toastMsg && (
          <div className="p-3 bg-slate-900 text-white text-xs font-bold text-center animate-fade-in">
            {toastMsg}
          </div>
        )}

      </div>
    </div>
  );
}
