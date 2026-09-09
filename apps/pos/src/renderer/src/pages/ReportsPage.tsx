import React, { useState, useEffect } from 'react';
import { Calendar, Download, Printer, TrendingUp, BarChart3, Coffee, Users, AlertCircle, ArrowLeft, X, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/useAuthStore';

export default function ReportsPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isManager = user?.role === 'MANAGER' || user?.role === 'ADMIN';

  useEffect(() => {
    if (!isManager) {
      navigate('/');
    }
  }, [isManager, navigate]);

  const [period, setPeriod] = useState('Harian');
  const [showThermalModal, setShowThermalModal] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  if (!isManager) {
    return null;
  }

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const printThermalReceipt = () => {
    if (window && 'posAPI' in window) {
      try {
        // @ts-ignore
        window.posAPI.printReceipt('daily-eod');
      } catch (e) {
        console.error(e);
      }
    }
    setShowThermalModal(true);
  };


  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 p-6">
      {/* Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/')} className="p-2 hover:bg-gray-200 rounded-lg">
            <ArrowLeft size={24} className="text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Laporan Penjualan (Owner)</h1>
            <p className="text-gray-500 text-sm">Outlet: Pusat (Jakarta Selatan)</p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-white p-1 rounded-lg border border-gray-200 shadow-sm">
          {['📅 Harian', '📆 Mingguan', '🗓️ Bulanan'].map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p.split(' ')[1])}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                period === p.split(' ')[1] ? 'bg-indigo-50 text-indigo-700 shadow-sm' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={printThermalReceipt}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
          >
            <Printer size={18} /> Cetak Struk Harian (80mm)
          </button>
          <button className="flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm">
            <Download size={18} /> PDF
          </button>
          <button className="flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm">
            <BarChart3 size={18} /> Excel
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <p className="text-gray-500 text-sm font-medium">Total Pendapatan</p>
            <span className="flex items-center text-green-600 text-xs font-bold bg-green-50 px-2 py-1 rounded">
              <TrendingUp size={12} className="mr-1" /> +12.5%
            </span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">Rp 4.520.000</h3>
          <p className="text-xs text-gray-400 mt-2">vs periode sebelumnya</p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <p className="text-gray-500 text-sm font-medium">Total Pesanan</p>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">142</h3>
          <p className="text-xs text-gray-400 mt-2">62 Dine-in, 80 Takeaway</p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <p className="text-gray-500 text-sm font-medium">Rata-rata Transaksi (AOV)</p>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">Rp 31.830</h3>
          <p className="text-xs text-gray-400 mt-2">Stabil</p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <p className="text-gray-500 text-sm font-medium">Kas di Laci (Cash)</p>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">Rp 1.250.000</h3>
          <p className="text-xs text-gray-400 mt-2">28% dari total pendapatan</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart Area */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm h-80 flex flex-col justify-center items-center">
            <BarChart3 size={48} className="text-gray-300 mb-4" />
            <p className="text-gray-500">Grafik Penjualan Per Jam (Placeholder)</p>
          </div>

          {/* Roster / Tim Bertugas */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
              <Users size={20} className="text-indigo-600" />
              <h3 className="font-bold text-gray-900">Tim Bertugas Hari Ini</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="px-6 py-3 font-medium">Shift</th>
                    <th className="px-6 py-3 font-medium">Kasir</th>
                    <th className="px-6 py-3 font-medium">Barista</th>
                    <th className="px-6 py-3 font-medium">Pesanan</th>
                    <th className="px-6 py-3 font-medium">Pendapatan</th>
                    <th className="px-6 py-3 font-medium">Status Rekonsiliasi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr>
                    <td className="px-6 py-4">Shift 1 (07-15)</td>
                    <td className="px-6 py-4 font-medium">Siti</td>
                    <td className="px-6 py-4">Budi</td>
                    <td className="px-6 py-4">85</td>
                    <td className="px-6 py-4">Rp 2.800.000</td>
                    <td className="px-6 py-4"><span className="text-green-600 bg-green-50 px-2 py-1 rounded text-xs font-bold">🟢 Akurat</span></td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4">Shift 2 (15-23)</td>
                    <td className="px-6 py-4 font-medium">Andi</td>
                    <td className="px-6 py-4">Doni</td>
                    <td className="px-6 py-4">57</td>
                    <td className="px-6 py-4">Rp 1.720.000</td>
                    <td className="px-6 py-4"><span className="text-amber-600 bg-amber-50 px-2 py-1 rounded text-xs font-bold">⚠️ Selisih -Rp10k</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Sidebar Data */}
        <div className="space-y-8">
          {/* AI Insights */}
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-100 p-6 shadow-sm">
            <h3 className="font-bold text-indigo-900 mb-4 flex items-center gap-2">
              <span>✨</span> Auto-Insights
            </h3>
            <div className="space-y-4">
              <div className="bg-white/80 p-3 rounded-lg text-sm border border-indigo-100">
                <strong>📈 Happy Hour:</strong> Penjualan sepi di jam 14:00 - 16:00. Pertimbangkan promo bundling kopi & pastry.
              </div>
              <div className="bg-white/80 p-3 rounded-lg text-sm border border-indigo-100">
                <strong>⚠️ Restock Alert:</strong> Stok Oat Milk menipis. Cukup untuk sisa hari ini, namun perlu dipesan besok.
              </div>
            </div>
          </div>

          {/* Ingredient Tracker */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-6">
              <Coffee size={20} className="text-amber-700" />
              <h3 className="font-bold text-gray-900">Penggunaan Bahan Baku</h3>
            </div>
            
            <div className="space-y-5">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Biji Kopi (Espresso Blend)</span>
                  <span className="font-bold text-gray-900">1.8 kg</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className="bg-amber-800 h-2 rounded-full" style={{ width: '45%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Fresh Milk</span>
                  <span className="font-bold text-gray-900">12 Liter</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className="bg-blue-400 h-2 rounded-full" style={{ width: '60%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Oat Milk</span>
                  <span className="font-bold text-gray-900">5 Liter</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className="bg-yellow-600 h-2 rounded-full" style={{ width: '85%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Cup Dingin (Regular)</span>
                  <span className="font-bold text-gray-900">85 Pcs</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '30%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* THERMAL RECEIPT 80MM PREVIEW MODAL */}
      {showThermalModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 select-none animate-fade-in">
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl p-6 border border-slate-200 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-sm">Preview Struk Thermal (80mm)</h3>
              </div>
              <button
                onClick={() => setShowThermalModal(false)}
                className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Receipt Content */}
            <div className="flex-1 overflow-y-auto my-4 p-4 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[11px] leading-relaxed text-slate-800 whitespace-pre">
{`================================================
            ☕ KOPI NUSA SENOPATI
          Jl. Senopati No. 42, Jakarta
================================================
         LAPORAN HARIAN TOKO (END OF DAY)
================================================
Tanggal Toko : 09 September 2026
Waktu Tutup  : 09/09/2026  23:15:08
Status Toko  : CLOSED / TUTUP BUKU
Outlet Code  : JKT01 (Senopati Flagship)
================================================
--- DAFTAR STAF & SHIFT BERTUGAS ---------------
[SHIFT 1: PAGI (07:00 - 15:00)]
  • Kasir Bertugas   : Sari Novita (REG-01)
  • Barista Utama    : Budi Santoso (Barista-1)
  • Transaksi Kasir  : 78 Order (Rp 2.450.000)

[SHIFT 2: SORE (15:00 - 23:00)]
  • Kasir Bertugas   : Rian Hidayat (REG-01)
  • Barista Utama    : Dimas Anggara (Barista-1)
  • Transaksi Kasir  : 64 Order (Rp 2.070.000)

>> Total Personil Bertugas: 4 Orang
------------------------------------------------
--- REKAP PRODUKSI STASIUN BARISTA -------------
Total Minuman Terjual   :           142 Cup
Estimasi Bahan Kritis:
  • Biji Kopi Terpakai  :        ~2.840 Gram
  • Susu Fresh Milk (L) :          ~14.2 Liter
  • Susu Oat Milk (L)   :           ~3.5 Liter
------------------------------------------------
--- IKHTISAR PENJUALAN HARIAN ------------------
Total Transaksi Bersih  :           142 Trx
Penjualan Kotor         :   Rp 4.520.000
Diskon Promo/Voucher    :  (Rp   250.000)
Penjualan Bersih (DPP)  :   Rp 4.270.000
PPN 11% Terkumpul       :   Rp   469.700
================================================
TOTAL OMSET HARI INI    :   Rp 4.739.700
================================================
--- REKONSILIASI KAS REGISTER TOKO -------------
Total Kas Masuk Fisik   :   Rp 1.250.000
Sisa Modal Kembalian    :   Rp   500.000 (Besok)
Selisih Kas Harian      :   Rp         0 (Akurat)
================================================
PERTANGGUNGJAWABAN PENUTUPAN TOKO:

   Lead Barista       Head Cashier      Supervisor
                                        
  ( Dimas A. )       ( Rian H. )       ( Budi S. )
================================================
   Dicetak otomatis saat End-of-Day Closing
   KopiPOS SaaS v0.1.0 │ Terminal: REG-01
================================================`}
            </div>

            <div className="flex gap-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => {
                  showToast('Perintah cetak 80mm dikirim ke printer thermal!');
                  setShowThermalModal(false);
                }}
                className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2"
              >
                <Printer className="w-4 h-4" /> Cetak ke Printer Fisik
              </button>
            </div>
          </div>
        </div>
      )}

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

