import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Coffee, Delete, Check, Lock, AlertCircle, ShieldCheck } from 'lucide-react';
import { useAuthStore } from '../stores/useAuthStore';

const STAFF_LIST = [
  { id: 'usr-1', name: 'Rian H.', role: 'CASHIER', avatar: '☕', pin: '1234' },
  { id: 'usr-2', name: 'Sari N.', role: 'CASHIER', avatar: '🧋', pin: '0000' },
  { id: 'usr-3', name: 'Budi S.', role: 'MANAGER', avatar: '👨‍💼', pin: '8888' },
  { id: 'usr-4', name: 'Dimas A.', role: 'BARISTA', avatar: '🧑‍🍳', pin: '1111' },
];

export default function LoginPage() {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<typeof STAFF_LIST[0] | null>(STAFF_LIST[0]);
  const navigate = useNavigate();
  const { login } = useAuthStore();

  useEffect(() => {
    if (pin.length === 4) {
      verifyPin(pin);
    }
  }, [pin]);

  const verifyPin = async (enteredPin: string) => {
    setError('');
    try {
      if ((window as any).posAPI?.login) {
        const res = await (window as any).posAPI.login(enteredPin);
        if (res?.success) {
          login(res.user);
          navigate('/');
        } else {
          triggerErrorShake('PIN salah. Silakan coba lagi.');
        }
      } else {
        // Fallback demo matching staff pin
        const matched = selectedStaff?.pin === enteredPin || enteredPin === '1234' || enteredPin === '0000';
        if (matched) {
          login({
            id: selectedStaff?.id || 'usr-1',
            name: selectedStaff?.name || 'Rian H.',
            role: selectedStaff?.role || 'CASHIER'
          });
          navigate('/');
        } else {
          triggerErrorShake('PIN tidak cocok. (Gunakan: 1234 atau 0000)');
        }
      }
    } catch (e) {
      triggerErrorShake('Gagal memproses autentikasi PIN.');
    }
  };

  const triggerErrorShake = (msg: string) => {
    setError(msg);
    setShake(true);
    setTimeout(() => {
      setShake(false);
      setPin('');
    }, 500);
  };

  const handleKeyPress = (digit: string) => {
    if (pin.length < 4) {
      setPin((prev) => prev + digit);
    }
  };

  const handleBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
    setError('');
  };

  const handleClear = () => {
    setPin('');
    setError('');
  };

  return (
    <div className="min-h-screen bg-[#1a1a2e] flex flex-col justify-center items-center p-6 select-none">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl p-7 border border-slate-100 flex flex-col items-center">
        
        {/* Dynamic Cafe Brand */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-[#78350F]/10 rounded-2xl mx-auto mb-2 flex items-center justify-center text-2xl text-[#78350F] shadow-sm">
            ☕
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Kopi Nusa Senopati</h1>
          <p className="text-xs text-slate-400 font-medium">Terminal Kasir REG-01</p>
        </div>

        {/* PIN Prompt */}
        <div className="text-center mb-5">
          <h2 className="text-sm font-semibold text-slate-700 flex items-center justify-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-[#e94560]" /> Masukkan PIN Staff
          </h2>
          {selectedStaff && (
            <span className="inline-block mt-1 text-[11px] font-semibold text-[#e94560] bg-[#e94560]/10 px-2.5 py-0.5 rounded-full">
              Staff: {selectedStaff.name} ({selectedStaff.role})
            </span>
          )}
        </div>

        {/* 4-Digit PIN Indicators */}
        <div className={`flex gap-4 mb-6 ${shake ? 'animate-bounce text-red-500' : ''}`}>
          {[0, 1, 2, 3].map((idx) => {
            const isFilled = pin.length > idx;
            return (
              <div
                key={idx}
                className={`w-4 h-4 rounded-full border-2 transition-all duration-200 ${
                  isFilled
                    ? 'bg-[#e94560] border-[#e94560] scale-110 shadow-md shadow-[#e94560]/30'
                    : 'bg-slate-100 border-slate-300'
                }`}
              />
            );
          })}
        </div>

        {error && (
          <p className="text-xs font-semibold text-red-500 mb-4 text-center animate-fade-in">
            {error}
          </p>
        )}

        {/* Numeric Keypad Grid (3x4) */}
        <div className="grid grid-cols-3 gap-3 w-full max-w-[280px] mb-6">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              type="button"
              onClick={() => handleKeyPress(digit)}
              className="h-14 bg-slate-50 hover:bg-slate-100 active:bg-slate-200 text-slate-800 text-xl font-bold rounded-2xl border border-slate-200/80 transition-all flex items-center justify-center active:scale-95 shadow-sm"
            >
              {digit}
            </button>
          ))}
          <button
            type="button"
            onClick={handleClear}
            className="h-14 bg-slate-50 hover:bg-red-50 active:bg-red-100 text-slate-500 hover:text-red-500 text-xs font-bold rounded-2xl border border-slate-200/80 transition-all flex items-center justify-center active:scale-95"
          >
            CLEAR
          </button>
          <button
            type="button"
            onClick={() => handleKeyPress('0')}
            className="h-14 bg-slate-50 hover:bg-slate-100 active:bg-slate-200 text-slate-800 text-xl font-bold rounded-2xl border border-slate-200/80 transition-all flex items-center justify-center active:scale-95 shadow-sm"
          >
            0
          </button>
          <button
            type="button"
            onClick={handleBackspace}
            className="h-14 bg-slate-50 hover:bg-slate-100 active:bg-slate-200 text-slate-600 text-sm font-bold rounded-2xl border border-slate-200/80 transition-all flex items-center justify-center active:scale-95"
          >
            <Delete className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Staff Selector */}
        <div className="w-full pt-4 border-t border-slate-100">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider text-center mb-2.5">
            Pilih Profil Staff:
          </p>
          <div className="flex justify-center gap-2">
            {STAFF_LIST.map((staff) => (
              <button
                key={staff.id}
                type="button"
                onClick={() => {
                  setSelectedStaff(staff);
                  setPin('');
                  setError('');
                }}
                className={`flex flex-col items-center p-2 rounded-xl border transition-all ${
                  selectedStaff?.id === staff.id
                    ? 'border-[#e94560] bg-[#e94560]/5 text-slate-900 shadow-sm'
                    : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                }`}
              >
                <span className="text-lg mb-0.5">{staff.avatar}</span>
                <span className="text-[11px] font-semibold truncate max-w-[50px]">{staff.name}</span>
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
