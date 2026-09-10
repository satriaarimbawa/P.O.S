import React, { useState, useEffect } from 'react';
import { X, Check, Banknote, QrCode, Wallet, CreditCard, Printer, CheckCircle2, ArrowRight, AlertTriangle, WifiOff } from 'lucide-react';
import { useCartStore } from '../../stores/useCartStore';
import { useHardwareStore } from '../../stores/useHardwareStore';

export interface PaymentSuccessResult {
  receiptPrinted: boolean;
  drawerOpened: boolean;
  printerOffline: boolean;
  method: PaymentMethod;
  total: number;
}

interface PaymentDialogProps {
  onClose: () => void;
  onSuccess: (result: PaymentSuccessResult) => void;
}

type PaymentMethod = 'CASH' | 'QRIS' | 'EWALLET' | 'DEBIT';

export default function PaymentDialog({ onClose, onSuccess }: PaymentDialogProps) {
  const { 
    total, 
    subtotal, 
    taxAmount, 
    discountAmount, 
    clearCart, 
    items, 
    orderType, 
    tableNo,
    customerName,
    deliveryPlatform,
    driverRefNo,
    isPackagingFeeApplied,
    packagingFee
  } = useCartStore();
  const { printerStatus, isVirtualSimulator } = useHardwareStore();
  const [method, setMethod] = useState<PaymentMethod>('CASH');
  const [cashGiven, setCashGiven] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [qrisState, setQrisState] = useState<'generating' | 'waiting' | 'paid'>('generating');
  const [receiptPrinted, setReceiptPrinted] = useState(printerStatus.connected || isVirtualSimulator);

  const isHardwareConnected = printerStatus.connected || isVirtualSimulator;
  const cashAmountNum = parseInt(cashGiven.replace(/\D/g, '') || '0', 10);
  const changeAmount = Math.max(0, cashAmountNum - total);
  const isCashSufficient = method !== 'CASH' || cashAmountNum >= total;

  // Update receipt check state if printer status changes
  useEffect(() => {
    setReceiptPrinted(printerStatus.connected || isVirtualSimulator);
  }, [printerStatus.connected, isVirtualSimulator]);

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
    let printSuccess = false;
    let drawerSuccess = false;

    try {
      if ((window as any).posAPI) {
        // Create order via IPC
        await (window as any).posAPI.createOrder({
          orderType,
          tableNo: orderType === 'DINE_IN' ? tableNo : null,
          customerName: customerName || null,
          deliveryPlatform: orderType === 'DELIVERY' ? deliveryPlatform : null,
          driverRefNo: orderType === 'DELIVERY' ? driverRefNo : null,
          packagingFee: isPackagingFeeApplied ? packagingFee : 0,
          subtotal,
          taxAmount,
          discountAmount,
          total,
          paymentMethod: method,
          items,
        });

        // Print receipt only if printer is connected/virtual and checked
        if (receiptPrinted && isHardwareConnected) {
          try {
            printSuccess = await (window as any).posAPI.printReceipt('latest', {
              orderType,
              tableNo,
              customerName,
              deliveryPlatform,
              driverRefNo,
              packagingFee: isPackagingFeeApplied ? packagingFee : 0,
              subtotal,
              taxAmount,
              discountAmount,
              total,
              paymentMethod: method,
              items,
            });
          } catch (e) {
            printSuccess = false;
          }
        }

        // Auto kick cash drawer only if cash AND hardware is connected
        if (method === 'CASH' && isHardwareConnected) {
          try {
            drawerSuccess = await (window as any).posAPI.openCashDrawer();
          } catch (e) {
            drawerSuccess = false;
          }
        }
      } else {
        // Browser mode
        await new Promise((r) => setTimeout(r, 600));
        printSuccess = receiptPrinted && isHardwareConnected;
        drawerSuccess = method === 'CASH' && isHardwareConnected;
      }

      clearCart();
      onSuccess({
        receiptPrinted: printSuccess,
        drawerOpened: drawerSuccess,
        printerOffline: !isHardwareConnected,
        method,
        total,
      });
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
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                orderType === 'DINE_IN'
                  ? 'bg-indigo-100 text-indigo-800'
                  : orderType === 'TAKE_AWAY'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-800'
              }`}>
                {orderType === 'DINE_IN'
                  ? `🍽️ DINE IN • Meja ${tableNo || '01'}`
                  : orderType === 'TAKE_AWAY'
                  ? `🛍️ TAKE AWAY • ${customerName || 'Bawa Pulang'}`
                  : `🛵 DELIVERY (${deliveryPlatform || 'GoFood'}) • #${driverRefNo || '-'}`}
              </span>
            </div>
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

          {/* CASH SECTION WITH TABLET TOUCH NUMPAD */}
          {method === 'CASH' && (
            <div className="space-y-3.5 animate-fade-in bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
              
              {/* Display & Total Comparison */}
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Uang Diterima dari Pelanggan:
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-base">Rp</span>
                    <input
                      type="text"
                      value={cashGiven ? parseInt(cashGiven, 10).toLocaleString('id-ID') : ''}
                      onChange={(e) => setCashGiven(e.target.value.replace(/\D/g, ''))}
                      placeholder={total.toLocaleString('id-ID')}
                      className="w-full pl-10 pr-3 py-2.5 bg-white border-2 border-slate-200 rounded-xl font-mono text-lg font-black text-slate-900 focus:outline-none focus:border-[#e94560]"
                      readOnly={false}
                    />
                  </div>
                </div>

                {/* Kembalian Box */}
                <div className="w-48 bg-white p-2.5 rounded-xl border border-slate-200 flex flex-col justify-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Uang Kembalian:</span>
                  <span className={`text-lg font-black font-mono truncate ${cashAmountNum >= total ? 'text-emerald-600' : 'text-slate-400'}`}>
                    Rp {changeAmount.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>

              {/* Quick Preset Nominal Chips */}
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => setCashGiven(total.toString())}
                  className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-800 text-xs font-bold rounded-lg transition-all active:scale-95 shadow-sm"
                >
                  💵 Uang Pas
                </button>
                {[50000, 100000, 150000, 200000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setCashGiven(amt.toString())}
                    className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-xs font-bold rounded-lg text-slate-700 transition-all active:scale-95 shadow-sm"
                  >
                    Rp {amt.toLocaleString('id-ID')}
                  </button>
                ))}
              </div>

              {/* Tablet On-Screen Touch Numpad */}
              <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
                <div className="grid grid-cols-4 gap-2">
                  {/* Row 1 */}
                  {['1', '2', '3'].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setCashGiven((prev) => (prev === '0' ? d : prev + d))}
                      className="h-12 bg-slate-50 hover:bg-slate-100 active:bg-slate-200 text-slate-800 text-lg font-bold rounded-xl border border-slate-200 transition-all flex items-center justify-center active:scale-95 shadow-xs"
                    >
                      {d}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setCashGiven((prev) => {
                      const cur = parseInt(prev || '0', 10);
                      return (cur + 10000).toString();
                    })}
                    className="h-12 bg-emerald-50 hover:bg-emerald-100 active:bg-emerald-200 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-200 transition-all flex items-center justify-center active:scale-95"
                  >
                    +10.000
                  </button>

                  {/* Row 2 */}
                  {['4', '5', '6'].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setCashGiven((prev) => (prev === '0' ? d : prev + d))}
                      className="h-12 bg-slate-50 hover:bg-slate-100 active:bg-slate-200 text-slate-800 text-lg font-bold rounded-xl border border-slate-200 transition-all flex items-center justify-center active:scale-95 shadow-xs"
                    >
                      {d}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setCashGiven((prev) => {
                      const cur = parseInt(prev || '0', 10);
                      return (cur + 20000).toString();
                    })}
                    className="h-12 bg-emerald-50 hover:bg-emerald-100 active:bg-emerald-200 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-200 transition-all flex items-center justify-center active:scale-95"
                  >
                    +20.000
                  </button>

                  {/* Row 3 */}
                  {['7', '8', '9'].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setCashGiven((prev) => (prev === '0' ? d : prev + d))}
                      className="h-12 bg-slate-50 hover:bg-slate-100 active:bg-slate-200 text-slate-800 text-lg font-bold rounded-xl border border-slate-200 transition-all flex items-center justify-center active:scale-95 shadow-xs"
                    >
                      {d}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setCashGiven((prev) => {
                      const cur = parseInt(prev || '0', 10);
                      return (cur + 50000).toString();
                    })}
                    className="h-12 bg-emerald-50 hover:bg-emerald-100 active:bg-emerald-200 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-200 transition-all flex items-center justify-center active:scale-95"
                  >
                    +50.000
                  </button>

                  {/* Row 4 */}
                  <button
                    type="button"
                    onClick={() => setCashGiven((prev) => (prev && prev !== '0' ? prev + '000' : ''))}
                    className="h-12 bg-slate-50 hover:bg-slate-100 active:bg-slate-200 text-slate-700 text-sm font-bold rounded-xl border border-slate-200 transition-all flex items-center justify-center active:scale-95 font-mono"
                  >
                    000
                  </button>
                  <button
                    type="button"
                    onClick={() => setCashGiven((prev) => (prev === '0' ? '0' : prev + '0'))}
                    className="h-12 bg-slate-50 hover:bg-slate-100 active:bg-slate-200 text-slate-800 text-lg font-bold rounded-xl border border-slate-200 transition-all flex items-center justify-center active:scale-95 shadow-xs"
                  >
                    0
                  </button>
                  <button
                    type="button"
                    onClick={() => setCashGiven((prev) => prev.slice(0, -1))}
                    className="h-12 bg-slate-50 hover:bg-slate-100 active:bg-slate-200 text-slate-600 text-base font-bold rounded-xl border border-slate-200 transition-all flex items-center justify-center active:scale-95"
                    title="Hapus Satu Angka"
                  >
                    ⌫
                  </button>
                  <button
                    type="button"
                    onClick={() => setCashGiven('')}
                    className="h-12 bg-red-50 hover:bg-red-100 active:bg-red-200 text-red-600 text-xs font-bold rounded-xl border border-red-200 transition-all flex items-center justify-center active:scale-95"
                  >
                    RESET
                  </button>
                </div>
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

          {/* PRINTER STATUS & RECEIPT TOGGLE */}
          {!printerStatus.connected ? (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs flex items-start gap-2.5 animate-pulse">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-bold text-red-800 block">Printer Thermal Sedang Offline</span>
                <span className="text-red-700 text-[11px]">
                  Koneksi ke printer di <code className="font-mono bg-red-100 px-1 rounded">{printerStatus.host}</code> terputus. Struk tidak akan tercetak fisik. Transaksi tetap dapat disimpan ke sistem.
                </span>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between text-xs text-slate-600 bg-slate-50 px-4 py-3 rounded-xl border border-slate-200">
              <span className="flex items-center gap-2 font-medium">
                <Printer className="w-4 h-4 text-emerald-600" /> Cetak Struk Otomatis (80mm)
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">Ready</span>
              </span>
              <input
                type="checkbox"
                checked={receiptPrinted}
                onChange={(e) => setReceiptPrinted(e.target.checked)}
                className="w-4 h-4 accent-[#e94560] cursor-pointer"
              />
            </div>
          )}

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
