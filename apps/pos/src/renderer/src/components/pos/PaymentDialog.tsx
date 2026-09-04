import React, { useState, useEffect } from 'react';
import { X, Check, Banknote, QrCode, Wallet, CreditCard, Printer, CheckCircle2, ArrowRight } from 'lucide-react';
import { useCartStore } from '../../stores/useCartStore';

interface PaymentDialogProps {
  onClose: () => void;
  onSuccess: () => void;
}

type PaymentMethod = 'CASH' | 'QRIS' | 'EWALLET' | 'DEBIT';

export default function PaymentDialog({ onClose, onSuccess }: PaymentDialogProps) {
  const { total, subtotal, taxAmount, discountAmount, clearCart, items, orderType, tableNo } = useCartStore();
  const [method, setMethod] = useState<PaymentMethod>('CASH');
  const [cashGiven, setCashGiven] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [qrisState, setQrisState] = useState<'generating' | 'waiting' | 'paid'>('generating');
  const [receiptPrinted, setReceiptPrinted] = useState(true);

  const cashAmountNum = parseInt(cashGiven.replace(/\D/g, '') || '0', 10);
  const changeAmount = Math.max(0, cashAmountNum - total);
  const isCashSufficient = method !== 'CASH' || cashAmountNum >= total;

  // Simulate QRIS dynamic code generation
  useEffect(() => {
    if (method === 'QRIS') {
      setQrisState('generating');
      const genTimer = setTimeout(() => {
        setQrisState('waiting');
      }, 700);

      // Simulate customer scan & pay webhook after 4 seconds
      const payTimer = setTimeout(() => {
        setQrisState('paid');
      }, 4500);

      return () => {
        clearTimeout(genTimer);
        clearTimeout(payTimer);
      };
    }
  }, [method]);

  const handleQuickCash = (amount: number) => {
    setCashGiven(amount.toString());
  };

  const handleProcessPayment = async () => {
    if (!isCashSufficient) return;

    setLoading(true);
    try {
      if ((window as any).posAPI) {
        // Create order via IPC
        await (window as any).posAPI.createOrder({
          orderType,
          tableNo,
          subtotal,
          taxAmount,
          discountAmount,
          total,
          paymentMethod: method,
          items,
        });

        // Print receipt if checked
        if (receiptPrinted) {
          await (window as any).posAPI.printReceipt('latest');
        }

        // Auto kick cash drawer if cash
        if (method === 'CASH') {
          await (window as any).posAPI.openCashDrawer();
        }
      } else {
        // Mock delay
        await new Promise((r) => setTimeout(r, 800));
      }

      clearCart();
      onSuccess();
    } catch (err) {
      console.error('Payment process error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 select-none animate-fade-in">
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh] border border-slate-100">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Tagihan</span>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Rp {total.toLocaleString('id-ID')}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 flex-1 overflow-y-auto space-y-6">
          
          {/* Method Selector Tabs */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
              Metode Pembayaran
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: 'CASH', label: 'CASH', icon: Banknote },
                { id: 'QRIS', label: 'QRIS', icon: QrCode },
                { id: 'EWALLET', label: 'E-WALLET', icon: Wallet },
                { id: 'DEBIT', label: 'DEBIT/EDC', icon: CreditCard },
              ].map((m) => {
                const Icon = m.icon;
                const isSelected = method === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setMethod(m.id as PaymentMethod)}
                    className={`py-3 px-2 rounded-2xl border text-center font-bold text-xs flex flex-col items-center gap-1.5 transition-all ${
                      isSelected
                        ? 'border-[#e94560] bg-[#e94560]/5 text-[#e94560] shadow-sm ring-2 ring-[#e94560]/20'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* CASH SECTION */}
          {method === 'CASH' && (
            <div className="space-y-4 animate-fade-in bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Uang Diterima dari Pelanggan:
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-lg">Rp</span>
                  <input
                    type="text"
                    value={cashGiven ? parseInt(cashGiven, 10).toLocaleString('id-ID') : ''}
                    onChange={(e) => setCashGiven(e.target.value.replace(/\D/g, ''))}
                    placeholder={total.toLocaleString('id-ID')}
                    className="w-full pl-12 pr-4 py-3.5 bg-white border-2 border-slate-200 rounded-xl font-mono text-xl font-black text-slate-900 focus:outline-none focus:border-[#e94560]"
                    autoFocus
                  />
                </div>
              </div>

              {/* Quick Cash Pills */}
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickCash(total)}
                  className="px-3 py-2 bg-white hover:bg-slate-100 border border-slate-200 text-xs font-bold rounded-lg text-slate-700 shadow-sm"
                >
                  Uang Pas (Rp {total.toLocaleString('id-ID')})
                </button>
                {[50000, 100000, 150000, 200000].map((amt) => {
                  if (amt < total && amt !== 50000) return null;
                  return (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => handleQuickCash(amt)}
                      className="px-3 py-2 bg-white hover:bg-slate-100 border border-slate-200 text-xs font-bold rounded-lg text-slate-700 shadow-sm"
                    >
                      Rp {amt.toLocaleString('id-ID')}
                    </button>
                  );
                })}
              </div>

              {/* Change / Kembalian Calculation */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-600">Uang Kembalian:</span>
                <span className={`text-xl font-black font-mono ${cashAmountNum >= total ? 'text-emerald-600' : 'text-slate-400'}`}>
                  Rp {changeAmount.toLocaleString('id-ID')}
                </span>
              </div>
            </div>
          )}

          {/* QRIS SECTION */}
          {method === 'QRIS' && (
            <div className="text-center p-6 bg-slate-50 rounded-2xl border border-slate-200/80 flex flex-col items-center animate-fade-in">
              <div className="w-48 h-48 bg-white p-3 rounded-2xl shadow-md border border-slate-200 flex flex-col items-center justify-center mb-3">
                {qrisState === 'generating' ? (
                  <div className="flex flex-col items-center gap-2">
                    <span className="w-8 h-8 border-3 border-[#e94560] border-t-transparent rounded-full animate-spin"></span>
                    <span className="text-xs text-slate-500 font-medium">Membuat QR Dinamis...</span>
                  </div>
                ) : (
                  <div className="relative flex flex-col items-center">
                    {/* Mock QR SVG Box */}
                    <div className="w-36 h-36 bg-slate-900 rounded-lg p-2 flex items-center justify-center">
                      <QrCode className="w-28 h-28 text-white" />
                    </div>
                    {qrisState === 'paid' && (
                      <div className="absolute inset-0 bg-emerald-500/90 rounded-lg flex flex-col items-center justify-center text-white backdrop-blur-[2px]">
                        <CheckCircle2 className="w-12 h-12 mb-1" />
                        <span className="text-xs font-bold uppercase tracking-wider">PEMBAYARAN BERHASIL</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <span className="text-xs font-bold text-slate-700">QRIS Dinamis (EMVCo)</span>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {qrisState === 'paid'
                  ? 'Dana telah terverifikasi otomatis via Webhook!'
                  : 'Pelanggan memindai via BCA, Livin, GoPay, OVO, ShopeePay, atau DANA'}
              </p>
            </div>
          )}

          {/* EWALLET / DEBIT INFO */}
          {(method === 'EWALLET' || method === 'DEBIT') && (
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 text-center animate-fade-in">
              <span className="text-sm font-bold text-slate-800 block mb-1">
                {method === 'EWALLET' ? 'E-Wallet Scanner' : 'Mesin EDC Bank'}
              </span>
              <p className="text-xs text-slate-500">
                Lakukan transaksi pada terminal EDC kasir senilai <strong className="text-slate-800">Rp {total.toLocaleString('id-ID')}</strong>, lalu tekan tombol Selesaikan Pembayaran di bawah.
              </p>
            </div>
          )}

          {/* Receipt & Drawer toggle */}
          <div className="flex items-center justify-between text-xs text-slate-600 bg-slate-50 px-4 py-3 rounded-xl border border-slate-200">
            <span className="flex items-center gap-2 font-medium">
              <Printer className="w-4 h-4 text-slate-400" /> Cetak Struk Otomatis (80mm)
            </span>
            <input
              type="checkbox"
              checked={receiptPrinted}
              onChange={(e) => setReceiptPrinted(e.target.checked)}
              className="w-4 h-4 accent-[#e94560] cursor-pointer"
            />
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold rounded-xl transition-all"
          >
            Batal
          </button>

          <button
            type="button"
            onClick={handleProcessPayment}
            disabled={!isCashSufficient || loading}
            className="flex-1 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? (
              <span>Memproses Transaksi...</span>
            ) : (
              <>
                <span>SELESAIKAN PEMBAYARAN</span>
                <Check className="w-5 h-5" />
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
