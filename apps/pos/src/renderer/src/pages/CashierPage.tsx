import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChefHat, 
  BarChart3, 
  Clock, 
  Settings, 
  LogOut, 
  Wifi, 
  CheckCircle2, 
  ShieldCheck, 
  Lock, 
  X, 
  Info, 
  Printer, 
  AlertTriangle,
  Maximize2,
  Minimize2,
  Store,
  Scan,
  ShoppingBag,
  ArrowRight,
  PlayCircle,
  Package,
  Menu,
  ChevronRight,
  Send,
  Scale
} from 'lucide-react';
import MenuGrid from '../components/pos/MenuGrid';
import OrderPanel from '../components/pos/OrderPanel';
import ModifierModal, { ProductItem } from '../components/pos/ModifierModal';
import PaymentDialog, { PaymentSuccessResult } from '../components/pos/PaymentDialog';
import PrinterStatusModal from '../components/pos/PrinterStatusModal';
import StaffStockModal, { StockModalTab } from '../components/pos/StaffStockModal';
import { useAuthStore } from '../stores/useAuthStore';
import { useHardwareStore } from '../stores/useHardwareStore';
import { useCartStore } from '../stores/useCartStore';

const BARCODE_CATALOG: Record<string, { id: string; name: string; price: number; station: string }> = {
  'p1': { id: 'p1', name: 'Iced Latte', price: 32000, station: 'BARISTA' },
  'p2': { id: 'p2', name: 'Americano', price: 22000, station: 'BARISTA' },
  'p3': { id: 'p3', name: 'Cappuccino', price: 32000, station: 'BARISTA' },
  'p4': { id: 'p4', name: 'Kopi Susu Gula Aren', price: 28000, station: 'BARISTA' },
  'p5': { id: 'p5', name: 'Espresso Single', price: 18000, station: 'BARISTA' },
  'p13': { id: 'p13', name: 'Croissant Butter', price: 25000, station: 'BAKERY' },
  '8999999001': { id: 'p1', name: 'Iced Latte (Barcode 8999999001)', price: 32000, station: 'BARISTA' },
  '8999999004': { id: 'p4', name: 'Kopi Susu Gula Aren (Barcode 8999999004)', price: 28000, station: 'BARISTA' },
};

export default function CashierPage() {
  const [selectedProductForMod, setSelectedProductForMod] = useState<ProductItem | null>(null);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isTabletCartOpen, setIsTabletCartOpen] = useState(false);
  const [isHamburgerOpen, setIsHamburgerOpen] = useState(false);
  const [paymentResultToast, setPaymentResultToast] = useState<PaymentSuccessResult | null>(null);
  const [scannedToast, setScannedToast] = useState<string | null>(null);
  
  // Manager PIN Modal State
  const [isManagerPromptOpen, setIsManagerPromptOpen] = useState(false);
  const [targetDestination, setTargetDestination] = useState<string | null>(null);
  const [managerPin, setManagerPin] = useState('');
  const [managerPinError, setManagerPinError] = useState('');
  
  // Architecture Info, Printer & Staff Stock Modal State
  const [showArchInfo, setShowArchInfo] = useState(false);
  const [showPrinterModal, setShowPrinterModal] = useState(false);
  const [showStaffStockModal, setShowStaffStockModal] = useState(false);
  const [stockModalTab, setStockModalTab] = useState<StockModalTab>('request');

  const openStockModal = (tab: StockModalTab) => {
    setStockModalTab(tab);
    setShowStaffStockModal(true);
  };

  const navigate = useNavigate();
  const { user, activeShift, setActiveShift, logout } = useAuthStore();
  const isManager = user?.role === 'MANAGER' || user?.role === 'ADMIN';
  const { addItem, itemCount, total } = useCartStore();
  const { 
    printerStatus, 
    isBannerDismissed, 
    setBannerDismissed, 
    checkPrinterStatus, 
    fetchSystemPrinters,
    isFullscreen,
    toggleFullscreen,
    openCashDrawer
  } = useHardwareStore();

  // Inline Quick Start Shift State
  const [modalOpeningCash, setModalOpeningCash] = useState<number>(500000);

  const scanBuffer = useRef<{ text: string; lastTime: number }>({ text: '', lastTime: 0 });

  const handleStartShiftDirect = (e: React.FormEvent) => {
    e.preventDefault();
    const newShift = {
      id: 'shift_' + Date.now(),
      openedAt: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      openingCash: modalOpeningCash,
    };
    setActiveShift(newShift);
    setScannedToast('🟢 Shift Kasir Berhasil Dibuka! Transaksi kini dapat dilakukan.');
    setTimeout(() => setScannedToast(null), 3500);
  };

  useEffect(() => {
    // Initial hardware check on mount
    fetchSystemPrinters();
    checkPrinterStatus();
    const interval = setInterval(() => {
      checkPrinterStatus();
    }, 30000);

    // Global Barcode Scanner HID listener
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is currently typing in an input or textarea
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
        return;
      }

      // If shift is not opened, block barcode scanning
      if (!activeShift) {
        if (e.key === 'Enter') {
          setScannedToast('⚠️ Shift Belum Dibuka! Harap lakukan Start Shift sebelum transaksi.');
          setTimeout(() => setScannedToast(null), 3000);
        }
        return;
      }

      const now = Date.now();
      if (now - scanBuffer.current.lastTime > 100) {
        scanBuffer.current.text = '';
      }
      scanBuffer.current.lastTime = now;

      if (e.key === 'Enter') {
        const code = scanBuffer.current.text.trim();
        if (code.length >= 2) {
          const item = BARCODE_CATALOG[code] || BARCODE_CATALOG[code.toLowerCase()];
          if (item) {
            addItem({
              productId: item.id,
              productName: item.name,
              qty: 1,
              unitPrice: item.price,
              modifiers: [],
              station: item.station,
            });
            setScannedToast(`📦 Barcode Terdeteksi: ${item.name}`);
            setTimeout(() => setScannedToast(null), 3000);
          }
        }
        scanBuffer.current.text = '';
      } else if (e.key.length === 1) {
        scanBuffer.current.text += e.key;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      clearInterval(interval);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeShift]);

  const handlePaymentSuccess = (result: PaymentSuccessResult) => {
    setIsPaymentOpen(false);
    setPaymentResultToast(result);
    setTimeout(() => {
      setPaymentResultToast(null);
    }, 3500);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleGuardedNav = (destination: string) => {
    // If user is already ADMIN or MANAGER, allow direct navigation
    if (user?.role === 'ADMIN' || user?.role === 'MANAGER') {
      navigate(destination);
      return;
    }

    // Otherwise, require Manager / Admin PIN
    setTargetDestination(destination);
    setManagerPin('');
    setManagerPinError('');
    setIsManagerPromptOpen(true);
  };

  const handleVerifyManagerPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (managerPin === '1234' || managerPin === '8888') {
      setIsManagerPromptOpen(false);
      if (targetDestination) {
        navigate(targetDestination);
      }
    } else {
      setManagerPinError('PIN Manager salah! (Default PIN Manager: 1234 atau 8888)');
      setManagerPin('');
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-100 font-sans">
      
      {/* MASTER TOP BAR */}
      <header className="h-14 bg-[#1a1a2e] text-white px-4 flex items-center justify-between shrink-0 shadow-md z-30">
        
        {/* Brand & Terminal Info */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#e94560] flex items-center justify-center font-black text-sm shadow-sm">
            ☕
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-sm tracking-tight leading-tight">Kopi Nusa Senopati</h1>
              <span className="text-[10px] bg-slate-800 text-emerald-400 font-mono px-2 py-0.5 rounded border border-slate-700">
                REG-01
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1.5">
              <span>Staff: <strong className="text-slate-200">{user?.name || 'Kasir'}</strong></span>
              <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                isManager 
                  ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40' 
                  : 'bg-slate-800 text-slate-300 border border-slate-700'
              }`}>
                {isManager ? '👑 MANAGER' : 'KASIR'}
              </span>
              <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                activeShift 
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse'
              }`}>
                {activeShift ? `🟢 Shift Aktif (${activeShift.openedAt})` : '🟡 Belum Start Shift'}
              </span>
            </span>
          </div>
        </div>

        {/* Navigation & Status Center/Right */}
        <div className="flex items-center gap-2.5">
          
          {/* LAN & Cloud Sync Status */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 bg-slate-800/80 rounded-lg text-[11px] font-medium text-emerald-400 border border-slate-700">
            <Wifi className="w-3.5 h-3.5" />
            <span>LAN Ready (<span className="text-[10px] font-mono">50ms</span>)</span>
          </div>

          {/* THERMAL PRINTER LIVE STATUS PILL */}
          <button
            type="button"
            onClick={() => setShowPrinterModal(true)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
              printerStatus.connected
                ? 'bg-slate-800/90 text-emerald-400 border-slate-700 hover:border-emerald-500/50 hover:bg-slate-800'
                : 'bg-red-950/80 text-red-300 border-red-500/80 hover:bg-red-900 animate-pulse shadow-md shadow-red-900/30'
            }`}
            title="Klik untuk membuka Diagnostik & Tes Printer"
          >
            <Printer className="w-3.5 h-3.5" />
            {printerStatus.connected ? (
              <span className="hidden sm:inline">Printer: Ready</span>
            ) : (
              <span className="font-black text-red-200 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-red-400" /> Printer: Terputus!
              </span>
            )}
          </button>

          {/* Tablet Cart Quick Button (< lg screens) */}
          <button
            type="button"
            onClick={() => setIsTabletCartOpen(!isTabletCartOpen)}
            className="flex lg:hidden items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black bg-[#e94560] text-white shadow-md active:scale-95 transition-all"
            title="Buka Keranjang Pesanan"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>{itemCount}</span>
          </button>

          <div className="h-5 w-[1px] bg-slate-700 mx-0.5" />

          {/* HAMBURGER MENU BUTTON */}
          <button
            type="button"
            onClick={() => setIsHamburgerOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 hover:border-slate-500 transition-all shadow-sm active:scale-95 cursor-pointer"
            title="Buka Menu & Navigasi Kasir"
          >
            <Menu className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold">Menu</span>
            {(!activeShift || !printerStatus.connected) && (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping ml-0.5" />
            )}
          </button>

        </div>

      </header>

      {/* STICKY OFFLINE PRINTER WARNING BANNER */}
      {!printerStatus.connected && !isBannerDismissed && (
        <div className="bg-gradient-to-r from-red-600 via-red-500 to-amber-600 text-white px-4 py-2.5 flex items-center justify-between text-xs font-bold shadow-md z-20 animate-fade-in shrink-0">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-white shrink-0 animate-bounce" />
            <span>
              <strong>Peringatan Kasir:</strong> Printer Thermal Terputus / Tidak Terdeteksi di <code className="bg-red-800/60 px-1.5 py-0.5 rounded font-mono text-[11px]">{printerStatus.host}</code>. Struk fisik tidak dapat dicetak otomatis.
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setShowPrinterModal(true)}
              className="bg-white text-red-700 hover:bg-red-50 px-3 py-1 rounded-lg text-xs font-black shadow-sm transition-all"
            >
              Diagnostik & Perbaiki
            </button>
            <button
              type="button"
              onClick={() => setBannerDismissed(true)}
              className="p-1 hover:bg-white/20 rounded-md transition-colors"
              title="Sembunyikan peringatan ini"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* MAIN BODY (RESPONSIVE TABLET & DESKTOP) */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left: Product Menu Grid */}
        <MenuGrid 
          onSelectProduct={(prod) => {
            if (!activeShift) {
              setScannedToast('⚠️ Shift Belum Dibuka! Harap lakukan Start Shift terlebih dahulu.');
              setTimeout(() => setScannedToast(null), 3000);
              return;
            }
            setSelectedProductForMod(prod);
          }} 
        />

        {/* Right: Active Order Cart Panel (Desktop & Landscape Tablet) */}
        <div className="hidden lg:flex h-full">
          <OrderPanel onOpenPayment={() => setIsPaymentOpen(true)} />
        </div>

        {/* SHIFT LOCK OVERLAY: MENCEGAH TRANSAKSI SEBELUM START SHIFT */}
        {!activeShift && (
          <div className="absolute inset-0 z-40 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in select-none">
            <div className="bg-white max-w-md w-full rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 text-center relative overflow-hidden">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-3xl mx-auto mb-3 flex items-center justify-center text-3xl shadow-inner border border-emerald-100">
                ☕
              </div>
              
              <div className="inline-flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-black uppercase px-3 py-1 rounded-full tracking-wider mb-2">
                <Lock size={12} className="text-amber-600" /> Transaksi Terkunci
              </div>

              <h2 className="text-xl font-black text-slate-900 mb-1">
                Buka Shift Kasir Baru
              </h2>
              <p className="text-xs text-slate-500 mb-5 leading-relaxed">
                Halo <strong>{user?.name || 'Kasir'}</strong>! Untuk mencegah kesalahan transaksi, kasir tidak dapat melayani pesanan sebelum melakukan <strong>Start Shift</strong> dan memasukkan modal kembalian di laci.
              </p>

              <form onSubmit={handleStartShiftDirect} className="space-y-4 text-left">
                <div>
                  <label className="block text-[11px] font-black text-slate-700 uppercase tracking-wider mb-1.5">
                    Kas Awal / Modal Kembalian di Laci:
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-3 text-slate-400 font-bold text-sm">Rp</span>
                    <input
                      type="number"
                      required
                      value={modalOpeningCash || ''}
                      onChange={(e) => setModalOpeningCash(Number(e.target.value))}
                      className="w-full border-2 border-slate-200 rounded-2xl pl-12 pr-4 py-2.5 focus:border-[#e94560] outline-none text-xl font-mono font-black text-slate-900 bg-slate-50 focus:bg-white transition-all"
                      placeholder="0"
                    />
                  </div>
                  <div className="grid grid-cols-4 gap-1.5 mt-2">
                    {[200000, 300000, 500000, 1000000].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setModalOpeningCash(amt)}
                        className={`py-1.5 rounded-xl text-xs font-bold transition-all border ${
                          modalOpeningCash === amt
                            ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                            : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                        }`}
                      >
                        {amt >= 1000000 ? `${amt / 1000000} Juta` : `${amt / 1000}k`}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full bg-[#e94560] hover:bg-[#d03b53] text-white font-black py-4 rounded-2xl text-sm transition-all shadow-lg shadow-[#e94560]/30 active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                    <PlayCircle size={18} />
                    <span>Buka Shift & Mulai Transaksi (Start Shift)</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Tablet Portrait Sticky Floating Cart Action Bar */}
        {itemCount > 0 && !isTabletCartOpen && (
          <div className="lg:hidden absolute bottom-4 left-4 right-4 z-30 bg-slate-950/95 backdrop-blur-md text-white p-3.5 rounded-2xl shadow-2xl border border-slate-700/80 flex items-center justify-between animate-fade-in select-none">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#e94560] flex items-center justify-center font-bold text-white shadow-md">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-400 block">{itemCount} Menu Dipilih</span>
                <p className="text-base font-black text-white font-mono leading-tight">
                  Rp {total.toLocaleString('id-ID')}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsTabletCartOpen(true)}
              className="px-4 py-2.5 bg-[#e94560] hover:bg-[#d03b53] text-white text-xs font-black rounded-xl shadow-lg flex items-center gap-1.5 active:scale-95 transition-all"
            >
              <span>Lihat Pesanan & Bayar</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Tablet Portrait Slide-over Cart Drawer Modal */}
        {isTabletCartOpen && (
          <div className="lg:hidden fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs flex justify-end animate-fade-in">
            <div className="w-full sm:w-[420px] h-full bg-white shadow-2xl flex flex-col">
              <OrderPanel
                onOpenPayment={() => {
                  setIsTabletCartOpen(false);
                  setIsPaymentOpen(true);
                }}
                onClose={() => setIsTabletCartOpen(false)}
              />
            </div>
          </div>
        )}
      </div>

      {/* MODIFIERS MODAL */}
      {selectedProductForMod && (
        <ModifierModal
          product={selectedProductForMod}
          onClose={() => setSelectedProductForMod(null)}
        />
      )}

      {/* PAYMENT DIALOG */}
      {isPaymentOpen && (
        <PaymentDialog
          onClose={() => setIsPaymentOpen(false)}
          onSuccess={handlePaymentSuccess}
        />
      )}

      {/* PRINTER DIAGNOSTICS & TROUBLESHOOTING MODAL */}
      <PrinterStatusModal
        isOpen={showPrinterModal}
        onClose={() => setShowPrinterModal(false)}
      />

      {/* MANAGER PIN VERIFICATION MODAL */}
      {isManagerPromptOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in select-none">
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl p-6 border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Otorisasi Manager</h3>
                  <p className="text-[11px] text-slate-500">Akses Laporan & Pengaturan</p>
                </div>
              </div>
              <button
                onClick={() => setIsManagerPromptOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 mb-4 bg-slate-50 p-3 rounded-xl border border-slate-200/70">
              Menu ini memuat data keuangan toko. Masukkan <strong>PIN Manager / Owner</strong> untuk melanjutkan:
            </p>

            <form onSubmit={handleVerifyManagerPin} className="space-y-4">
              <div>
                <input
                  type="password"
                  maxLength={4}
                  value={managerPin}
                  onChange={(e) => {
                    setManagerPin(e.target.value.replace(/\D/g, ''));
                    setManagerPinError('');
                  }}
                  placeholder="PIN 4 Digit (cth: 1234)"
                  className="w-full text-center text-2xl font-mono tracking-widest px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-[#e94560] focus:bg-white outline-none"
                  autoFocus
                />
              </div>

              {managerPinError && (
                <p className="text-xs text-red-500 font-semibold text-center">{managerPinError}</p>
              )}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsManagerPromptOpen(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#1a1a2e] hover:bg-slate-800 text-white text-xs font-bold rounded-xl"
                >
                  Buka Menu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ARCHITECTURE & ROLE SEPARATION MODAL */}
      {showArchInfo && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in select-none">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl p-7 border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-lg">
                  ☕
                </div>
                <div>
                  <h2 className="font-bold text-slate-900 text-base">Struktur & Pemisahan Sistem KopiPOS</h2>
                  <p className="text-xs text-slate-500">Pemisahan 3 Lapisan: Vendor SaaS, POS Kasir Toko & Laporan Owner</p>
                </div>
              </div>
              <button
                onClick={() => setShowArchInfo(false)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs text-slate-700">
              
              {/* 1. Admin Vendor SaaS */}
              <div className="p-4 rounded-2xl bg-slate-900 text-white border border-slate-800">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-sm text-[#e94560] flex items-center gap-1.5">
                    🏢 1. Admin Penyedia Layanan (Vendor SaaS Hub)
                  </span>
                  <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                    Web Next.js • Port 3000
                  </span>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed mb-2">
                  <strong>Khusus untuk Anda (Pemilik Software)</strong>: Bukan untuk kasir atau owner kafe. Digunakan untuk mendaftarkan kafe klien baru, menerbitkan kode lisensi <code className="text-[#e94560]">KPOS-XXXX-XXXX</code>, mengelola paket langganan (Basic/Pro), memantau total GMV transaksi seluruh kafe, dan menagih biaya SaaS via WhatsApp.
                </p>
                <div className="text-[10px] text-slate-400 flex items-center gap-1">
                  <span>Jalankan di terminal:</span>
                  <code className="bg-slate-800 px-1.5 py-0.5 rounded text-emerald-400 font-mono">pnpm dev:admin</code>
                </div>
              </div>

              {/* 2. Sistem POS Kasir & KDS */}
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-sm text-emerald-900 flex items-center gap-1.5">
                    💻 2. Sistem POS Kasir Toko & KDS Barista
                  </span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">
                    Aplikasi Aktif Saat Ini
                  </span>
                </div>
                <p className="text-emerald-950 text-[11px] leading-relaxed">
                  <strong>Khusus untuk Kasir & Barista di Toko</strong>: Berjalan langsung di komputer kasir meja toko. 100% Offline-First menggunakan SQLite lokal. Kasir cukup login PIN 4-digit (<code className="font-bold">0000</code>), buka shift kas awal, pilih menu minuman/makanan, proses pembayaran cepat (Cash/QRIS), otomatis cetak struk thermal dan dorong laci kas.
                </p>
              </div>

              {/* 3. Laporan Atasan / Owner */}
              <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-sm text-sky-900 flex items-center gap-1.5">
                    📊 3. Laporan Atasan / Owner Kafe
                  </span>
                  <span className="text-[10px] bg-sky-100 text-sky-800 px-2 py-0.5 rounded font-bold">
                    Proteksi PIN Manager (1234)
                  </span>
                </div>
                <p className="text-sky-950 text-[11px] leading-relaxed">
                  <strong>Khusus untuk Pemilik / Manajer Kafe Klien</strong>: Melihat omset harian/mingguan/bulanan outlet, cetak Struk Harian Toko (EOD) 80mm saat tutup buku, rekap pemakaian bahan baku barista (biji kopi & susu), performa kasir, dan laporan pajak PPN 11%.
                </p>
              </div>

            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setShowArchInfo(false)}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-md"
              >
                Mengerti & Kembali ke Kasir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REAL-TIME TRANSACTION RESULT TOAST */}
      {paymentResultToast && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-3 border animate-bounce ${
            paymentResultToast.printerOffline
              ? 'bg-slate-900 text-white border-amber-500/60 shadow-amber-950/30'
              : 'bg-emerald-600 text-white border-emerald-500 shadow-emerald-950/30'
          }`}
        >
          {paymentResultToast.printerOffline ? (
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-emerald-100 shrink-0" />
          )}
          <div>
            <p className="text-xs font-bold uppercase tracking-wider">
              {paymentResultToast.printerOffline ? 'Transaksi Berhasil Disimpan' : 'Transaksi Selesai!'}
            </p>
            <p className={`text-[11px] ${paymentResultToast.printerOffline ? 'text-amber-200' : 'text-emerald-100'}`}>
              {paymentResultToast.printerOffline
                ? '⚠️ Printer offline: Struk tidak dicetak fisik & laci tidak terbuka otomatis.'
                : paymentResultToast.method === 'CASH'
                ? '🖨️ Struk fisik dicetak & 💵 Laci kas terbuka.'
                : '🖨️ Struk fisik dicetak. Pembayaran non-tunai sukses.'}
            </p>
          </div>
        </div>
      )}

      {/* BARCODE SCANNER TOAST NOTIFICATION */}
      {scannedToast && (
        <div className="fixed bottom-6 left-6 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-3 border border-amber-500/30 animate-fade-in">
          <span className="text-lg">📦</span>
          <div>
            <p className="text-xs font-bold text-amber-400 uppercase tracking-wider">Scanner Aktif</p>
            <p className="text-[11px] text-slate-200">{scannedToast}</p>
          </div>
        </div>
      )}

      {/* STAFF STOCK & REQUEST MODAL */}
      <StaffStockModal
        isOpen={showStaffStockModal}
        onClose={() => setShowStaffStockModal(false)}
        initialTab={stockModalTab}
      />

      {/* SLIDE-OVER HAMBURGER DRAWER */}
      {isHamburgerOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex justify-end animate-fade-in select-none">
          {/* Click outside backdrop to close */}
          <div className="absolute inset-0" onClick={() => setIsHamburgerOpen(false)} />
          
          <div className="relative w-full max-w-sm sm:max-w-md h-full bg-[#161622] text-white border-l border-slate-800 shadow-2xl flex flex-col justify-between overflow-hidden z-10">
            
            {/* Top Header of Drawer */}
            <div className="p-5 border-b border-slate-800/80 bg-[#1a1a2e]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#e94560] to-rose-400 flex items-center justify-center font-black text-white text-lg shadow-md shadow-[#e94560]/30">
                    ☕
                  </div>
                  <div>
                    <h2 className="font-black text-base text-white tracking-tight">Kopi Nusa Senopati</h2>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[10px] bg-slate-800 text-emerald-400 font-mono px-1.5 py-0.5 rounded border border-slate-700">
                        REG-01
                      </span>
                      <span className="text-[11px] text-slate-300 font-semibold">
                        Staff: {user?.name || 'Kasir'}
                      </span>
                      <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                        isManager 
                          ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40' 
                          : 'bg-slate-800 text-slate-300 border border-slate-700'
                      }`}>
                        {isManager ? '👑 MANAGER' : 'KASIR'}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsHamburgerOpen(false)}
                  className="w-8 h-8 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-all border border-slate-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Shift Card inside Drawer */}
              <div className="mt-4 p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">Status Shift Kasir</span>
                  <span className={`text-xs font-bold flex items-center gap-1.5 mt-0.5 ${
                    activeShift ? 'text-emerald-400' : 'text-amber-400 animate-pulse'
                  }`}>
                    {activeShift ? (
                      <>🟢 Shift Aktif ({activeShift.openedAt})</>
                    ) : (
                      <>🟡 Shift Belum Dibuka</>
                    )}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsHamburgerOpen(false);
                    navigate('/shift');
                  }}
                  className={`px-3 py-2 rounded-xl text-xs font-black transition-all shadow-xs active:scale-95 flex items-center gap-1.5 ${
                    activeShift 
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30' 
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-900/40'
                  }`}
                >
                  {activeShift ? (
                    <>🔴 Tutup Shift</>
                  ) : (
                    <>🟢 Buka Shift</>
                  )}
                </button>
              </div>
            </div>

            {/* Menu List Sections (Scrollable) */}
            <div className="flex-1 p-5 space-y-6 overflow-y-auto">
              
              {/* SECTION 1: MANAJEMEN STOK & BAHAN (3 MENU UTAMA) */}
              <div>
                <p className="text-[11px] font-black uppercase tracking-wider text-slate-400 mb-2 px-1">
                  Manajemen Stok & Bahan
                </p>
                <div className="space-y-1.5">
                  {/* 1. Request Stok */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsHamburgerOpen(false);
                      openStockModal('request');
                    }}
                    className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-800/60 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-800/80 hover:border-slate-700 transition-all text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30 group-hover:scale-105 transition-transform">
                        <Send className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-xs">1. 📝 Request Stok Bahan</div>
                        <div className="text-[11px] text-slate-400">Pengajuan restock bahan menipis ke Owner</div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-slate-300 transition-colors" />
                  </button>

                  {/* 2. Stok Masuk */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsHamburgerOpen(false);
                      openStockModal('stock-in');
                    }}
                    className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-800/60 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-800/80 hover:border-slate-700 transition-all text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30 group-hover:scale-105 transition-transform">
                        <Package className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-xs">2. 📥 Stok Masuk (Penerimaan)</div>
                        <div className="text-[11px] text-slate-400">Pencatatan barang datang dari kurir/supplier</div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-slate-300 transition-colors" />
                  </button>

                  {/* 3. Stock Opname Harian */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsHamburgerOpen(false);
                      openStockModal('stock-take');
                    }}
                    className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-800/60 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-800/80 hover:border-slate-700 transition-all text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center border border-sky-500/30 group-hover:scale-105 transition-transform">
                        <Scale className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-xs">3. 📋 Stock Opname Harian</div>
                        <div className="text-[11px] text-slate-400">Hitung stok fisik per shift & audit selisih</div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-slate-300 transition-colors" />
                  </button>
                </div>
              </div>

              {/* SECTION 2: OPERASIONAL KASIR & TOKO */}
              <div>
                <p className="text-[11px] font-black uppercase tracking-wider text-slate-400 mb-2 px-1">
                  Operasional Kasir & Toko
                </p>
                <div className="space-y-1.5">
                  {/* KDS Kitchen Display */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsHamburgerOpen(false);
                      navigate('/kitchen');
                    }}
                    className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-800/60 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-800/80 hover:border-slate-700 transition-all text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30 group-hover:scale-105 transition-transform">
                        <ChefHat className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-bold text-xs">KDS Barista / Dapur</div>
                        <div className="text-[11px] text-slate-400">Antrean pesanan kitchen display bar</div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-slate-300 transition-colors" />
                  </button>

                  {/* Buka Laci Kas */}
                  <button
                    type="button"
                    onClick={async () => {
                      const ok = await openCashDrawer();
                      if (ok) {
                        setScannedToast('💵 Sinyal Terkirim: Laci Kas Terbuka!');
                      } else {
                        setScannedToast('⚠️ Laci Gagal Terbuka: Printer offline atau kabel RJ11 terlepas.');
                      }
                      setTimeout(() => setScannedToast(null), 3500);
                    }}
                    className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-800/60 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-800/80 hover:border-slate-700 transition-all text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30 group-hover:scale-105 transition-transform">
                        <Store className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-bold text-xs">Buka Laci Kas (Cash Drawer)</div>
                        <div className="text-[11px] text-slate-400">Trigger pulsa elektrik RJ11 printer</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20">
                      Kick RJ11
                    </span>
                  </button>
                </div>
              </div>

              {/* Section 2: Manajemen & Owner */}
              <div>
                <div className="flex items-center justify-between mb-2 px-1">
                  <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                    Manajemen & Owner
                  </p>
                  <span className="text-[9px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 px-1.5 py-0.2 rounded flex items-center gap-1">
                    <Lock className="w-2.5 h-2.5" /> PIN Manager
                  </span>
                </div>
                <div className="space-y-1.5">
                  {/* Laporan Owner */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsHamburgerOpen(false);
                      handleGuardedNav('/reports');
                    }}
                    className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-800/60 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-800/80 hover:border-slate-700 transition-all text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center border border-sky-500/30 group-hover:scale-105 transition-transform">
                        <BarChart3 className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-bold text-xs flex items-center gap-1.5">
                          <span>Laporan Penjualan & Owner</span>
                          <span className="text-[9px] bg-sky-500/20 text-sky-300 px-1.5 py-0.2 rounded font-bold">4 Tab</span>
                        </div>
                        <div className="text-[11px] text-slate-400">Grafik omset, stok masuk, stock taking, laba rugi</div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-slate-300 transition-colors" />
                  </button>

                  {/* Pengaturan Toko */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsHamburgerOpen(false);
                      handleGuardedNav('/settings');
                    }}
                    className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-800/60 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-800/80 hover:border-slate-700 transition-all text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center border border-purple-500/30 group-hover:scale-105 transition-transform">
                        <Settings className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-bold text-xs">Pengaturan Toko & Menu</div>
                        <div className="text-[11px] text-slate-400">Konfigurasi outlet, menu, staf & pajak</div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-slate-300 transition-colors" />
                  </button>

                  {/* Struktur Sistem Info */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsHamburgerOpen(false);
                      setShowArchInfo(true);
                    }}
                    className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-800/60 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-800/80 hover:border-slate-700 transition-all text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30 group-hover:scale-105 transition-transform">
                        <Info className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-bold text-xs">Struktur & Pemisahan Sistem</div>
                        <div className="text-[11px] text-slate-400">Arsitektur SaaS Vendor vs POS Toko vs Owner</div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-slate-300 transition-colors" />
                  </button>
                </div>
              </div>

              {/* Section 3: Perangkat & Layar */}
              <div>
                <p className="text-[11px] font-black uppercase tracking-wider text-slate-400 mb-2 px-1">
                  Perangkat & Layar
                </p>
                <div className="space-y-1.5">
                  {/* Diagnostik Printer */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsHamburgerOpen(false);
                      setShowPrinterModal(true);
                    }}
                    className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-800/60 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-800/80 hover:border-slate-700 transition-all text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-all ${
                        printerStatus.connected 
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
                          : 'bg-red-500/20 text-red-400 border-red-500/30'
                      }`}>
                        <Printer className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-bold text-xs flex items-center gap-2">
                          <span>Diagnostik Printer Thermal</span>
                          <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                            printerStatus.connected 
                              ? 'bg-emerald-500/20 text-emerald-300' 
                              : 'bg-red-500/20 text-red-300'
                          }`}>
                            {printerStatus.connected ? 'Online' : 'Offline'}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400">Tes potong kertas & IP printer thermal</div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-slate-300 transition-colors" />
                  </button>

                  {/* Kiosk Mode Toggle */}
                  <button
                    type="button"
                    onClick={() => {
                      toggleFullscreen();
                    }}
                    className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-800/60 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-800/80 hover:border-slate-700 transition-all text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-700/50 text-cyan-400 flex items-center justify-center border border-slate-600/50 group-hover:scale-105 transition-transform">
                        {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                      </div>
                      <div>
                        <div className="font-bold text-xs">
                          {isFullscreen ? 'Keluar Mode Layar Penuh Kiosk' : 'Mode Layar Penuh Kiosk'}
                        </div>
                        <div className="text-[11px] text-slate-400">Maksimalkan layar terminal POS tanpa gangguan OS</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">F11</span>
                  </button>
                </div>
              </div>

            </div>

            {/* Drawer Footer */}
            <div className="p-5 border-t border-slate-800 bg-[#14141f] space-y-3">
              <button
                type="button"
                onClick={() => {
                  setIsHamburgerOpen(false);
                  handleLogout();
                }}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-500/40 font-bold text-xs transition-all active:scale-98 shadow-sm cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Kunci Layar Kasir / Ganti Staff</span>
              </button>

              <div className="flex items-center justify-between text-[10px] text-slate-400 px-1">
                <span>KopiPOS Terminal v1.2.0</span>
                <span className="flex items-center gap-1 text-emerald-400 font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Offline-First Engine
                </span>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}


