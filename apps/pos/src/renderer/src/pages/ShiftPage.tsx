import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  Calculator, 
  CreditCard, 
  Wallet, 
  Printer, 
  CheckCircle2, 
  ArrowLeft, 
  X, 
  AlertTriangle, 
  Sparkles, 
  TrendingUp,
  Delete,
  RotateCcw,
  Coins,
  FileText
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/useAuthStore';

type ShiftStatus = 'closed' | 'active';
type InputMode = 'direct' | 'denominations';

interface Denomination {
  value: number;
  label: string;
  count: number;
}

export default function ShiftPage() {
  const navigate = useNavigate();
  const { user, activeShift, setActiveShift } = useAuthStore();
  
  const [status, setStatus] = useState<ShiftStatus>(activeShift ? 'active' : 'closed');
  const [cashierName, setCashierName] = useState(user?.name || 'Sari N.');
  const [openingCash, setOpeningCash] = useState<number>(activeShift?.openingCash || 500000);

  // Close Shift Calculations
  const cashSales = 1250000;
  const nonCashSales = 2100000;
  const totalSales = cashSales + nonCashSales;
  const expectedCash = openingCash + cashSales;

  // Actual Cash in Drawer Input State
  const [actualCash, setActualCash] = useState<number>(expectedCash);
  const [inputMode, setInputMode] = useState<InputMode>('direct');
  const [notes, setNotes] = useState('');
  const [showZReportModal, setShowZReportModal] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Denominations breakdown counter
  const [denominations, setDenominations] = useState<Denomination[]>([
    { value: 100000, label: 'Rp 100.000', count: 0 },
    { value: 50000, label: 'Rp 50.000', count: 0 },
    { value: 20000, label: 'Rp 20.000', count: 0 },
    { value: 10000, label: 'Rp 10.000', count: 0 },
    { value: 5000, label: 'Rp 5.000', count: 0 },
    { value: 2000, label: 'Rp 2.000', count: 0 },
    { value: 1000, label: 'Rp 1.000', count: 0 },
    { value: 500, label: 'Rp 500 (Koin)', count: 0 },
  ]);

  useEffect(() => {
    if (activeShift) {
      setStatus('active');
      setOpeningCash(activeShift.openingCash);
    } else {
      setStatus('closed');
    }
  }, [activeShift]);

  // Update actual cash when denominations change in denomination mode
  const updateDenominationCount = (index: number, count: number) => {
    const updated = [...denominations];
    updated[index].count = Math.max(0, count);
    setDenominations(updated);
    
    const sum = updated.reduce((acc, curr) => acc + (curr.value * curr.count), 0);
    setActualCash(sum);
  };

  // Difference Calculation
  const difference = actualCash - expectedCash;

  // Itemized product sales record
  const itemSales = [
    { name: 'Kopi Susu Gula Aren', qty: 26, total: 728000, category: 'Kopi' },
    { name: 'Iced Latte', qty: 18, total: 576000, category: 'Kopi' },
    { name: 'Croissant Butter', qty: 14, total: 350000, category: 'Pastry' },
    { name: 'Americano', qty: 12, total: 264000, category: 'Kopi' },
    { name: 'Cappuccino', qty: 9, total: 288000, category: 'Kopi' },
    { name: 'Nasi Goreng Spesial', qty: 6, total: 210000, category: 'Makanan' },
    { name: 'Kentang Goreng', qty: 5, total: 125000, category: 'Snack' },
    { name: 'Matcha Latte', qty: 4, total: 152000, category: 'Non-Kopi' },
  ];
  const totalItemsSold = itemSales.reduce((acc, it) => acc + it.qty, 0);

  // Numpad key handlers
  const handleNumpadPress = (val: string) => {
    let currentStr = actualCash ? actualCash.toString() : '';
    if (val === 'CLEAR') {
      setActualCash(0);
    } else if (val === 'BACKSPACE') {
      currentStr = currentStr.slice(0, -1);
      setActualCash(currentStr ? parseInt(currentStr, 10) : 0);
    } else if (val === '000') {
      if (currentStr && currentStr !== '0') {
        setActualCash(parseInt(currentStr + '000', 10));
      }
    } else {
      if (currentStr === '0') currentStr = '';
      setActualCash(parseInt(currentStr + val, 10));
    }
  };

  const addCashAmount = (amount: number) => {
    setActualCash((prev) => prev + amount);
  };

  // Open Shift Action
  const handleOpenShift = (e: React.FormEvent) => {
    e.preventDefault();
    const newShift = {
      id: 'shift_' + Date.now(),
      openedAt: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      openingCash,
    };
    setActiveShift(newShift);
    setStatus('active');
    navigate('/');
  };

  // End Shift & Auto Print Action
  const handleExecuteEndShift = async () => {
    setIsClosing(true);
    const nowTime = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    
    const shiftPayload = {
      shiftNumber: '001',
      cashierName,
      registerId: 'REG-01',
      openedAt: activeShift?.openedAt || '08:00',
      closedAt: nowTime,
      totalTx: 68,
      netSales: 3200000,
      tax: 352000,
      totalOmset: 3552000,
      cashSales,
      nonCashSales,
      openingCash,
      expectedCash,
      actualCash,
      difference,
      itemSales,
      totalItemsSold,
      notes: notes.trim() || undefined,
    };

    try {
      if ((window as any).posAPI?.openCashDrawer) {
        await (window as any).posAPI.openCashDrawer();
      }
      if ((window as any).posAPI?.printReceipt) {
        await (window as any).posAPI.printReceipt('z-report', shiftPayload);
      }
      if ((window as any).posAPI?.closeShift) {
        await (window as any).posAPI.closeShift({
          shiftId: activeShift?.id || 'shift_active',
          actualCash,
          notes: notes.trim() || undefined
        });
      }
    } catch (e) {
      console.error('Error closing shift & printing Z-Report:', e);
    }

    // Immediately clear shift and cart state
    setActiveShift(null);
    setStatus('closed');
    useCartStore.getState().clearCart();

    setToastMsg('🖨️ Struk End Shift (Z-Report) otomatis dicetak & shift resmi ditutup.');
    setTimeout(() => {
      setShowZReportModal(false);
      setIsClosing(false);
      navigate('/login');
    }, 1800);
  };

  return (
    <div className="h-screen w-full overflow-y-auto bg-slate-100 p-4 sm:p-6 flex flex-col items-center select-none pb-24">
      <div className="w-full max-w-4xl">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigate('/')}
            className="flex items-center text-slate-600 hover:text-slate-900 transition-colors font-bold text-sm bg-white px-4 py-2.5 rounded-xl shadow-xs border border-slate-200"
          >
            <ArrowLeft size={18} className="mr-2 text-slate-500" /> Kembali ke Kasir
          </button>
          {status === 'active' && (
            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full text-emerald-700 font-bold text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Shift Aktif #{activeShift?.id?.slice(-3) || '001'} ({cashierName})
            </div>
          )}
        </div>

        {status === 'closed' ? (
          <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden max-w-xl mx-auto">
            <div className="bg-[#1a1a2e] p-6 text-white text-center">
              <div className="w-14 h-14 bg-[#e94560]/20 text-[#e94560] rounded-2xl mx-auto mb-3 flex items-center justify-center font-black text-2xl shadow-inner">
                ☕
              </div>
              <h2 className="text-xl font-black mb-1">Buka Shift Kasir Baru</h2>
              <p className="text-slate-400 text-xs">Mulai sesi transaksi penjualan dan masukkan kas modal kembalian di laci</p>
            </div>
            
            <form onSubmit={handleOpenShift} className="p-6 sm:p-8 space-y-6">
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">Nama Kasir Bertugas</label>
                <input 
                  type="text" 
                  required
                  value={cashierName}
                  onChange={(e) => setCashierName(e.target.value)}
                  className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 focus:border-[#e94560] outline-none text-sm font-bold text-slate-800"
                  placeholder="Masukkan nama kasir..."
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">Kas Awal Modal Kembalian Laci</label>
                <div className="relative">
                  <span className="absolute left-4 top-3.5 text-slate-400 font-bold text-sm">Rp</span>
                  <input 
                    type="number" 
                    required
                    value={openingCash || ''}
                    onChange={(e) => setOpeningCash(Number(e.target.value))}
                    className="w-full border-2 border-slate-200 rounded-xl pl-12 pr-4 py-3 focus:border-[#e94560] outline-none text-xl font-mono font-black text-slate-900"
                    placeholder="0"
                  />
                </div>
                <div className="grid grid-cols-4 gap-2 mt-3">
                  {[200000, 300000, 500000, 1000000].map(amount => (
                    <button
                      key={amount}
                      type="button"
                      onClick={() => setOpeningCash(amount)}
                      className="py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors border border-slate-200"
                    >
                      {amount >= 1000000 ? `${amount/1000000} Juta` : `${amount/1000}k`}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full bg-[#e94560] hover:bg-[#d03b53] text-white font-bold py-4 rounded-xl text-base transition-all shadow-lg shadow-[#e94560]/25 active:scale-[0.99] flex items-center justify-center gap-2"
                >
                  <CheckCircle2 size={18} />
                  <span>Buka Shift & Mulai Transaksi</span>
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200">
                <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Wallet size={15} className="text-emerald-600"/> Kas Awal Modal
                </div>
                <div className="font-mono font-black text-xl text-slate-800">
                  Rp {openingCash.toLocaleString('id-ID')}
                </div>
                <div className="text-[11px] text-slate-400 mt-1">Mulai: {activeShift?.openedAt || '08:00'} WIB</div>
              </div>

              <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200">
                <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <CreditCard size={15} className="text-indigo-600"/> Penjualan Shift
                </div>
                <div className="font-mono font-black text-xl text-[#e94560]">
                  Rp {totalSales.toLocaleString('id-ID')}
                </div>
                <div className="text-[11px] text-slate-500 mt-1 flex justify-between font-mono">
                  <span>Tunai: Rp {cashSales.toLocaleString('id-ID')}</span>
                  <span>Non-Tunai: Rp {nonCashSales.toLocaleString('id-ID')}</span>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200">
                <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Calculator size={15} className="text-blue-600"/> Kas Seharusnya (Expected)
                </div>
                <div className="font-mono font-black text-xl text-indigo-900">
                  Rp {expectedCash.toLocaleString('id-ID')}
                </div>
                <div className="text-[11px] text-slate-400 mt-1">Modal Rp {openingCash.toLocaleString('id-ID')} + Tunai Rp {cashSales.toLocaleString('id-ID')}</div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              <div className="lg:col-span-7 bg-white rounded-3xl p-6 shadow-sm border border-slate-200 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                    <div>
                      <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                        <Calculator className="text-[#e94560]" size={20} />
                        Input Kas Aktual di Laci (Actual)
                      </h2>
                      <p className="text-xs text-slate-500 mt-0.5">Hitung seluruh uang fisik di laci kasir saat tutup shift</p>
                    </div>

                    <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
                      <button
                        type="button"
                        onClick={() => setInputMode('direct')}
                        className={`px-3 py-1.5 rounded-lg transition-all ${
                          inputMode === 'direct' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Numpad Langsung
                      </button>
                      <button
                        type="button"
                        onClick={() => setInputMode('denominations')}
                        className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ${
                          inputMode === 'denominations' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <Coins size={14} /> Hitung Lembaran
                      </button>
                    </div>
                  </div>

                  <div className="bg-slate-900 text-white p-4 rounded-2xl mb-4 relative overflow-hidden shadow-inner">
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex justify-between">
                      <span>Total Fisik Uang di Laci:</span>
                      <button 
                        type="button"
                        onClick={() => setActualCash(expectedCash)}
                        className="text-xs text-amber-400 hover:underline font-bold flex items-center gap-1"
                      >
                        ⚡ Samakan Sesuai Kas Harapan
                      </button>
                    </div>
                    <div className="text-3xl sm:text-4xl font-mono font-black text-white tracking-tight flex items-baseline gap-2">
                      <span className="text-emerald-400 text-xl font-bold">Rp</span>
                      <span>{actualCash.toLocaleString('id-ID')}</span>
                    </div>
                  </div>

                  <div className={`p-4 rounded-2xl mb-4 border transition-all ${
                    difference === 0 
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
                      : difference > 0 
                        ? 'bg-blue-50 border-blue-200 text-blue-900' 
                        : 'bg-rose-50 border-rose-200 text-rose-900'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {difference === 0 ? (
                          <CheckCircle2 size={20} className="text-emerald-600 shrink-0" />
                        ) : difference > 0 ? (
                          <TrendingUp size={20} className="text-blue-600 shrink-0" />
                        ) : (
                          <AlertTriangle size={20} className="text-rose-600 shrink-0" />
                        )}
                        <div>
                          <div className="text-xs font-black uppercase tracking-wider">
                            {difference === 0 ? 'Status Kas: Sesuai (Akurat)' : difference > 0 ? 'Status Kas: Surplus (Uang Lebih)' : 'Status Kas: Defisit (Uang Kurang)'}
                          </div>
                          <div className="text-[11px] opacity-80 mt-0.5">
                            {difference === 0 
                              ? 'Jumlah uang di laci tepat sama dengan catatan sistem.' 
                              : difference > 0 
                                ? 'Uang fisik di laci lebih banyak dari pencatatan sistem.' 
                                : 'Uang fisik di laci lebih sedikit dari pencatatan sistem.'}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-[10px] uppercase tracking-wider font-bold opacity-75">Selisih Kas</div>
                        <div className="font-mono font-black text-base sm:text-lg">
                          {difference === 0 ? 'Rp 0' : `${difference > 0 ? '+' : '-'} Rp ${Math.abs(difference).toLocaleString('id-ID')}`}
                        </div>
                      </div>
                    </div>
                  </div>

                  {inputMode === 'direct' ? (
                    <div>
                      <div className="grid grid-cols-4 gap-2 mb-3">
                        {[100000, 50000, 20000, 10000, 5000, 2000, 1000].map((amt) => (
                          <button
                            key={amt}
                            type="button"
                            onClick={() => addCashAmount(amt)}
                            className="py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-all border border-slate-200 active:scale-95"
                          >
                            +{amt >= 1000 ? `${amt / 1000}k` : amt}
                          </button>
                        ))}
                        <button
                          type="button"
                          onClick={() => setActualCash(0)}
                          className="py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold transition-all border border-rose-200 active:scale-95 flex items-center justify-center gap-1"
                        >
                          <RotateCcw size={13} /> Reset
                        </button>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        {['1', '2', '3', '4', '5', '6', '7', '8', '9', '000', '0'].map((digit) => (
                          <button
                            key={digit}
                            type="button"
                            onClick={() => handleNumpadPress(digit)}
                            className="h-12 bg-slate-50 hover:bg-slate-200 text-slate-900 rounded-xl font-bold font-mono text-base border border-slate-200 shadow-xs active:bg-slate-300 transition-colors flex items-center justify-center"
                          >
                            {digit}
                          </button>
                        ))}
                        <button
                          type="button"
                          onClick={() => handleNumpadPress('BACKSPACE')}
                          className="h-12 bg-amber-50 hover:bg-amber-100 text-amber-900 rounded-xl font-bold text-xs border border-amber-200 shadow-xs active:scale-95 transition-all flex items-center justify-center gap-1"
                        >
                          <Delete size={18} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                      {denominations.map((denom, idx) => (
                        <div key={denom.value} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                          <div>
                            <div className="text-xs font-bold text-slate-800">{denom.label}</div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              Total: Rp {(denom.value * denom.count).toLocaleString('id-ID')}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => updateDenominationCount(idx, denom.count - 1)}
                              className="w-8 h-8 rounded-lg bg-white border border-slate-300 text-slate-700 font-bold text-sm flex items-center justify-center hover:bg-slate-100"
                            >
                              -
                            </button>
                            <input 
                              type="number"
                              min="0"
                              value={denom.count || ''}
                              placeholder="0"
                              onChange={(e) => updateDenominationCount(idx, Number(e.target.value))}
                              className="w-14 text-center font-mono font-bold text-xs bg-white border border-slate-300 py-1.5 rounded-lg outline-none focus:border-[#e94560]"
                            />
                            <button
                              type="button"
                              onClick={() => updateDenominationCount(idx, denom.count + 1)}
                              className="w-8 h-8 rounded-lg bg-slate-900 text-white font-bold text-sm flex items-center justify-center hover:bg-slate-800"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="mt-4">
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Catatan Kasir / Keterangan Selisih {difference !== 0 && <span className="text-rose-500">*</span>}
                    </label>
                    <textarea 
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-[#e94560] text-xs text-slate-800 min-h-[60px]"
                      placeholder="Masukkan keterangan jika terdapat uang lebih/kurang di laci kasir..."
                    />
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={() => setShowZReportModal(true)}
                    className="sm:w-1/3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3.5 rounded-2xl text-xs flex items-center justify-center gap-1.5 border border-slate-200 transition-colors"
                  >
                    <FileText size={16} /> Preview Struk
                  </button>

                  <button 
                    type="button"
                    onClick={handleExecuteEndShift}
                    disabled={isClosing}
                    className="flex-1 bg-[#e94560] hover:bg-[#d03b53] disabled:opacity-50 text-white font-black py-3.5 rounded-2xl text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#e94560]/25 active:scale-[0.99]"
                  >
                    <Printer size={18} />
                    <span>{isClosing ? 'Mencetak Struk & Menutup Shift...' : 'Tutup Shift & Otomatis Cetak Struk'}</span>
                  </button>
                </div>
              </div>

              <div className="lg:col-span-5 space-y-4">
                <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200">
                  <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2.5">
                    <div className="flex items-center gap-1.5">
                      <Sparkles size={16} className="text-amber-500" />
                      <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                        Rekap Produk Terjual ({totalItemsSold} Item)
                      </h3>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      Best Seller
                    </span>
                  </div>

                  <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                    {itemSales.map((item, idx) => (
                      <div key={item.name} className="flex items-center justify-between text-xs py-2 px-2.5 rounded-xl hover:bg-slate-50 border border-slate-100/80 transition-colors">
                        <div className="flex items-center gap-2.5">
                          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${
                            idx === 0 ? 'bg-amber-400 text-slate-900 shadow-xs' :
                            idx === 1 ? 'bg-slate-300 text-slate-800' :
                            idx === 2 ? 'bg-amber-700/30 text-amber-900' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {idx + 1}
                          </span>
                          <div>
                            <div className="font-bold text-slate-800 truncate max-w-[140px]">{item.name}</div>
                            <div className="text-[10px] text-slate-400 font-medium">{item.category}</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2.5 font-mono">
                          <span className="font-extrabold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md text-[11px]">
                            {item.qty}x
                          </span>
                          <span className="font-semibold text-slate-700 text-right w-20 text-[11px]">
                            Rp {item.total.toLocaleString('id-ID')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-100 flex justify-between items-center text-xs font-bold text-slate-700">
                    <span>Total Kuantitas Terjual:</span>
                    <span className="font-mono text-slate-900 font-black">{totalItemsSold} Cup/Porsi</span>
                  </div>
                </div>

                <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200 text-xs space-y-2.5">
                  <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] pb-2 border-b border-slate-100">
                    Rincian Metode Pembayaran
                  </h4>
                  <div className="flex justify-between items-center text-slate-600">
                    <span>Tunai / Cash (32 Trx):</span>
                    <span className="font-mono font-bold text-slate-900">Rp {cashSales.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-600">
                    <span>QRIS Dinamis (24 Trx):</span>
                    <span className="font-mono font-bold text-slate-900">Rp 1.500.000</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-600">
                    <span>EDC & E-Wallet (12 Trx):</span>
                    <span className="font-mono font-bold text-slate-900">Rp 600.000</span>
                  </div>
                  <div className="pt-2 border-t border-slate-100 flex justify-between items-center font-bold text-slate-900">
                    <span>Total Penjualan (68 Trx):</span>
                    <span className="font-mono text-[#e94560] font-black text-sm">Rp {totalSales.toLocaleString('id-ID')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {showZReportModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 select-none animate-fade-in">
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl p-6 border border-slate-200 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-[#e94560]" />
                <h3 className="font-black text-slate-900 text-sm">Preview Struk Z-Report</h3>
              </div>
              <button
                onClick={() => setShowZReportModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto my-3 p-4 bg-slate-50 border border-slate-200 rounded-2xl font-mono text-[11px] leading-relaxed text-slate-800 whitespace-pre">
{`================================================
            ☕ KOPI NUSA SENOPATI
          Jl. Senopati No. 42, Jakarta
================================================
              Z-REPORT / TUTUP SHIFT
================================================
Shift       : #001
Kasir       : ${cashierName}
Register    : REG-01
Dibuka      : ${activeShift?.openedAt || '08:00'}
Ditutup     : ${new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
================================================
--- RINGKASAN PENJUALAN ------------------
Total Transaksi         :            68 Trx
Penjualan Bersih (DPP)  :   Rp 3.200.000
PPN 11% Terkumpul       :   Rp   352.000
================================================
TOTAL OMSET             :   Rp 3.552.000
================================================
--- REKAP PRODUK TERJUAL (ITEM SALES) ----
${itemSales.map((it, idx) => `#${idx + 1} ${it.name.padEnd(21, ' ')} ${it.qty.toString().padStart(3, ' ')}x  Rp ${it.total.toLocaleString('id-ID').padStart(9, ' ')}`).join('\n')}
------------------------------------------------
TOTAL ITEM TERJUAL      :   ${totalItemsSold} Cup/Porsi
================================================
--- PEMBAYARAN PER METODE ----------------
CASH                    :   Rp ${cashSales.toLocaleString('id-ID')} (32 Trx)
QRIS DINAMIS            :   Rp 1.500.000 (24 Trx)
E-WALLET                :   Rp   600.000 (12 Trx)
------------------------------------------------
--- REKONSILIASI KAS REGISTER ------------
Kas Awal (Modal)        :   Rp ${openingCash.toLocaleString('id-ID')}
+ Penjualan Cash        :   Rp ${cashSales.toLocaleString('id-ID')}
------------------------------------------------
Kas Seharusnya di Laci  :   Rp ${expectedCash.toLocaleString('id-ID')}
Kas Aktual Fisik        :   Rp ${actualCash.toLocaleString('id-ID')}
================================================
SELISIH KAS             :   ${difference === 0 ? 'Rp 0 (AKURAT)' : (difference > 0 ? '+' : '-') + 'Rp ' + Math.abs(difference).toLocaleString('id-ID')}
================================================
${notes ? `Catatan Kasir: ${notes}\n================================================\n` : ''}Struk dicetak otomatis saat Tutup Shift
================================================`}
            </div>

            <div className="pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={handleExecuteEndShift}
                disabled={isClosing}
                className="w-full py-3.5 bg-[#e94560] hover:bg-[#d03b53] disabled:opacity-50 text-white font-black text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
              >
                <Printer className="w-4 h-4" />
                <span>{isClosing ? 'Mencetak Struk & Menutup Shift...' : 'Cetak Struk Z-Report Sekarang'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-3 border border-emerald-500/40 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <p className="text-xs font-bold">{toastMsg}</p>
        </div>
      )}
    </div>
  );
}

