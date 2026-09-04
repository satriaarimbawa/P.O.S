import React, { useState } from 'react';
import { Clock, Calculator, CreditCard, Wallet, Printer, CheckCircle, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type ShiftStatus = 'closed' | 'active';

export default function ShiftPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<ShiftStatus>('closed');
  
  // Open Shift Form State
  const [cashierName, setCashierName] = useState('');
  const [openingCash, setOpeningCash] = useState<number>(0);

  // Close Shift Form State
  const [actualCash, setActualCash] = useState<number>(0);
  const [notes, setNotes] = useState('');

  // Dummy stats
  const expectedCash = openingCash + 1250000; // Opening + Cash Sales
  const difference = actualCash - expectedCash;

  const handleOpenShift = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('active');
    setActualCash(expectedCash); // reset actual cash for closing
  };

  const handleCloseShift = () => {
    alert('Shift ditutup. Mencetak Z-Report...');
    setStatus('closed');
    setOpeningCash(0);
    setCashierName('');
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 flex flex-col items-center justify-center">
      <div className="w-full max-w-2xl">
        <button onClick={() => navigate('/')} className="mb-6 flex items-center text-slate-500 hover:text-slate-800 transition-colors">
          <ArrowLeft size={20} className="mr-2" /> Kembali ke POS
        </button>

        {status === 'closed' ? (
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
            <div className="bg-indigo-600 p-6 text-white text-center">
              <h2 className="text-2xl font-bold mb-1">Buka Shift Baru</h2>
              <p className="text-indigo-100 text-sm">Mulai sesi kasir dan catat kas awal laci</p>
            </div>
            
            <form onSubmit={handleOpenShift} className="p-8 space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Nama Kasir</label>
                <input 
                  type="text" 
                  required
                  value={cashierName}
                  onChange={(e) => setCashierName(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  placeholder="Masukkan nama..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Kas Awal (Modal Kembalian)</label>
                <div className="relative">
                  <span className="absolute left-4 top-3 text-slate-500">Rp</span>
                  <input 
                    type="number" 
                    required
                    value={openingCash || ''}
                    onChange={(e) => setOpeningCash(Number(e.target.value))}
                    className="w-full border border-slate-300 rounded-lg pl-12 pr-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none text-lg font-semibold"
                    placeholder="0"
                  />
                </div>
                <div className="flex gap-2 mt-3">
                  {[100000, 200000, 300000, 500000].map(amount => (
                    <button
                      key={amount}
                      type="button"
                      onClick={() => setOpeningCash(amount)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-sm font-medium transition-colors"
                    >
                      {amount.toLocaleString('id-ID')}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl text-lg transition-colors shadow-md">
                  Buka Shift
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
            <div className="bg-slate-900 p-6 text-white flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold mb-1">Tutup Shift & Rekonsiliasi</h2>
                <p className="text-slate-400 text-sm">Kasir: {cashierName || 'Siti'} • Register #1</p>
              </div>
              <div className="text-right">
                <div className="text-slate-400 text-sm flex items-center justify-end gap-1 mb-1">
                  <Clock size={14} /> Durasi Shift
                </div>
                <div className="font-mono font-bold text-lg">08:15:32</div>
              </div>
            </div>

            <div className="p-8">
              <h3 className="font-bold text-slate-800 mb-4 border-b pb-2">Ringkasan Penjualan</h3>
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-slate-50 p-4 rounded-lg">
                  <div className="text-slate-500 text-sm mb-1 flex items-center gap-2"><Wallet size={16}/> Tunai (Cash)</div>
                  <div className="font-bold text-lg text-slate-900">Rp 1.250.000</div>
                </div>
                <div className="bg-slate-50 p-4 rounded-lg">
                  <div className="text-slate-500 text-sm mb-1 flex items-center gap-2"><CreditCard size={16}/> QRIS & E-Wallet</div>
                  <div className="font-bold text-lg text-slate-900">Rp 2.100.000</div>
                </div>
                <div className="col-span-2 bg-indigo-50 p-4 rounded-lg border border-indigo-100 flex justify-between items-center">
                  <div className="font-medium text-indigo-900">Total Transaksi ({85} pesanan)</div>
                  <div className="font-bold text-xl text-indigo-700">Rp 3.350.000</div>
                </div>
              </div>

              <h3 className="font-bold text-slate-800 mb-4 border-b pb-2">Penghitungan Kas Laci (Drawer)</h3>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center text-slate-600">
                  <span>Kas Awal (Modal)</span>
                  <span>Rp {openingCash.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span>Penerimaan Tunai</span>
                  <span>+ Rp 1.250.000</span>
                </div>
                <div className="flex justify-between items-center font-bold text-slate-900 border-t pt-2">
                  <span>Kas Seharusnya (Expected)</span>
                  <span>Rp {expectedCash.toLocaleString('id-ID')}</span>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-bold text-slate-700 mb-2">Kas Aktual Dihitung (Actual)</label>
                <div className="relative">
                  <span className="absolute left-4 top-4 text-slate-500 font-bold">Rp</span>
                  <input 
                    type="number" 
                    value={actualCash || ''}
                    onChange={(e) => setActualCash(Number(e.target.value))}
                    className="w-full border-2 border-slate-300 rounded-xl pl-12 pr-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none text-xl font-bold"
                  />
                </div>
                
                {actualCash > 0 && (
                  <div className={`mt-3 p-3 rounded-lg flex items-center justify-between font-bold ${
                    difference === 0 ? 'bg-green-100 text-green-800' : 
                    difference > 0 ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'
                  }`}>
                    <div className="flex items-center gap-2">
                      <Calculator size={18} />
                      {difference === 0 ? 'Akurat' : difference > 0 ? 'Surplus (Kelebihan)' : 'Defisit (Kekurangan)'}
                    </div>
                    <span>
                      {difference === 0 ? 'Rp 0' : `${difference > 0 ? '+' : '-'} Rp ${Math.abs(difference).toLocaleString('id-ID')}`}
                    </span>
                  </div>
                )}
              </div>

              <div className="mb-8">
                <label className="block text-sm font-medium text-slate-700 mb-2">Catatan (Wajib jika ada selisih)</label>
                <textarea 
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 min-h-[80px]"
                  placeholder="Penjelasan jika ada uang lebih/kurang..."
                ></textarea>
              </div>

              <div className="flex gap-4">
                <button className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-colors">
                  <Printer size={20} /> Cetak Z-Report
                </button>
                <button 
                  onClick={handleCloseShift}
                  className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-md"
                >
                  <CheckCircle size={20} /> Tutup Shift Resmi
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
