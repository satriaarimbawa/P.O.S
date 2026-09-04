import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChefHat, BarChart3, Clock, Settings, LogOut, Wifi, CheckCircle2 } from 'lucide-react';
import MenuGrid from '../components/pos/MenuGrid';
import OrderPanel from '../components/pos/OrderPanel';
import ModifierModal, { ProductItem } from '../components/pos/ModifierModal';
import PaymentDialog from '../components/pos/PaymentDialog';
import { useAuthStore } from '../stores/useAuthStore';

export default function CashierPage() {
  const [selectedProductForMod, setSelectedProductForMod] = useState<ProductItem | null>(null);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [successToast, setSuccessToast] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handlePaymentSuccess = () => {
    setIsPaymentOpen(false);
    setSuccessToast(true);
    setTimeout(() => {
      setSuccessToast(false);
    }, 2500);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-100 font-sans">
      
      {/* MASTER TOP BAR */}
      <header className="h-14 bg-[#1a1a2e] text-white px-4 flex items-center justify-between shrink-0 shadow-md z-30">
        
        {/* Brand & Terminal Info */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#e94560] flex items-center justify-center font-black text-sm">
            ☕
          </div>
          <div>
            <h1 className="font-bold text-sm tracking-tight leading-tight">Kopi Nusa Senopati</h1>
            <span className="text-[10px] text-slate-400 font-medium">Kasir 1 • Shift #001</span>
          </div>
        </div>

        {/* Navigation & Status Center/Right */}
        <div className="flex items-center gap-2">
          
          {/* LAN & Cloud Sync Status */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-slate-800/80 rounded-lg text-[11px] font-medium text-emerald-400 border border-slate-700">
            <Wifi className="w-3.5 h-3.5" />
            <span>Online</span>
          </div>

          {/* Quick Action Navigation Links */}
          <button
            type="button"
            onClick={() => navigate('/kitchen')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <ChefHat className="w-4 h-4 text-amber-400" />
            <span className="hidden md:inline">KDS Barista</span>
          </button>

          <button
            type="button"
            onClick={() => navigate('/reports')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <BarChart3 className="w-4 h-4 text-sky-400" />
            <span className="hidden md:inline">Laporan Owner</span>
          </button>

          <button
            type="button"
            onClick={() => navigate('/shift')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <Clock className="w-4 h-4 text-emerald-400" />
            <span className="hidden md:inline">Shift Kasir</span>
          </button>

          <button
            type="button"
            onClick={() => navigate('/settings')}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            title="Pengaturan"
          >
            <Settings className="w-4 h-4" />
          </button>

          <div className="h-5 w-[1px] bg-slate-700 mx-1" />

          {/* User Profile & Logout */}
          <div className="flex items-center gap-2 pl-1">
            <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-200">
              {user?.name ? user.name[0] : 'R'}
            </div>
            <span className="text-xs font-semibold text-slate-300 hidden lg:inline">
              {user?.name || 'Rian (Kasir)'}
            </span>
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
              title="Keluar / Ganti Staff"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

        </div>

      </header>

      {/* MAIN TWO-COLUMN BODY */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left: Product Menu Grid */}
        <MenuGrid onSelectProduct={(prod) => setSelectedProductForMod(prod)} />

        {/* Right: Active Order Cart Panel */}
        <OrderPanel onOpenPayment={() => setIsPaymentOpen(true)} />
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

      {/* SUCCESS TOAST NOTIFICATION */}
      {successToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-3 animate-bounce">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <div>
            <p className="text-xs font-bold uppercase tracking-wider">Transaksi Berhasil!</p>
            <p className="text-[11px] text-emerald-100">Struk dicetak dan laci kas telah dibuka.</p>
          </div>
        </div>
      )}

    </div>
  );
}
