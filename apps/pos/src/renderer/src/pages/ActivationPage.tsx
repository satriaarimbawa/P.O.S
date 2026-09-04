import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { KeyRound, Monitor, CheckCircle2, AlertTriangle, Coffee, HelpCircle, ArrowRight } from 'lucide-react';

export default function ActivationPage() {
  const [licenseKey, setLicenseKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [machineId, setMachineId] = useState('MEMINDAI MESIN...');
  const navigate = useNavigate();

  useEffect(() => {
    // Auto-detect or mock machine ID
    const timer = setTimeout(() => {
      setMachineId('POS-WIN11-7F89-4A12');
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  // Format license key as KPOS-XXXX-XXXX-XXXX
  const handleKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    if (val.length > 4) val = val.slice(0, 4) + '-' + val.slice(4);
    if (val.length > 9) val = val.slice(0, 9) + '-' + val.slice(9);
    if (val.length > 14) val = val.slice(0, 14) + '-' + val.slice(14);
    if (val.length > 19) val = val.slice(0, 19);
    
    if (val.length >= 4 && !val.startsWith('KPOS')) {
      val = 'KPOS' + val.substring(4);
    }
    setLicenseKey(val);
    setError('');
  };

  const handleActivate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!licenseKey || licenseKey.length < 19) {
      setError('Format lisensi tidak lengkap. Contoh: KPOS-A1B2-C3D4-E5F6');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if ((window as any).posAPI?.activateLicense) {
        const res = await (window as any).posAPI.activateLicense(licenseKey);
        if (res?.success) {
          navigate('/login');
        } else {
          setError(res?.error || 'Kunci lisensi tidak valid atau telah kadaluarsa.');
        }
      } else {
        // Mock fallback demo
        setTimeout(() => {
          if (licenseKey.startsWith('KPOS')) {
            navigate('/login');
          } else {
            setError('Kunci lisensi tidak terdaftar di server.');
          }
          setLoading(false);
        }, 1200);
        return;
      }
    } catch (err) {
      setError('Gagal menghubungi server lisensi cloud. Periksa koneksi internet.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1a1a2e] flex flex-col justify-center items-center p-6 select-none">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 border border-slate-100">
        
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#e94560]/10 rounded-2xl mx-auto mb-3 flex items-center justify-center text-3xl text-[#e94560]">
            ☕
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">KopiPOS</h1>
          <p className="text-slate-500 text-sm mt-1">Platform POS Cerdas Kafe & Restoran</p>
        </div>

        {/* Activation Title */}
        <div className="bg-slate-50 rounded-2xl p-4 mb-6 border border-slate-200/80">
          <h2 className="text-base font-semibold text-slate-800 flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-[#e94560]" /> Aktivasi Lisensi Outlet
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Masukkan kunci lisensi yang diberikan oleh vendor untuk mengaktifkan terminal kasir ini.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs flex items-start gap-2 animate-shake">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleActivate} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Kunci Lisensi (License Key)
            </label>
            <div className="relative">
              <input
                type="text"
                value={licenseKey}
                onChange={handleKeyChange}
                placeholder="KPOS-XXXX-XXXX-XXXX"
                className="w-full px-4 py-3.5 bg-slate-50 border-2 border-slate-200 rounded-xl font-mono text-center text-lg font-bold text-slate-800 tracking-wider focus:outline-none focus:border-[#e94560] focus:bg-white transition-all uppercase"
                disabled={loading}
                autoFocus
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1.5 text-center">
              Format: KPOS-4 digit-4 digit-4 digit
            </p>
          </div>

          {/* Machine ID Info */}
          <div className="flex items-center justify-between text-xs text-slate-500 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200/60">
            <span className="flex items-center gap-1.5">
              <Monitor className="w-3.5 h-3.5 text-slate-400" /> Device Fingerprint:
            </span>
            <span className="font-mono font-medium text-slate-700">{machineId}</span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-[#e94560] hover:bg-[#d03b53] text-white font-bold rounded-xl transition-all shadow-lg shadow-[#e94560]/20 flex items-center justify-center gap-2 text-base active:scale-[0.98] disabled:opacity-60"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Memverifikasi Lisensi...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                AKTIVASI OUTLET <ArrowRight className="w-4 h-4" />
              </span>
            )}
          </button>
        </form>

        {/* Footer Support */}
        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-400 flex items-center justify-center gap-1">
            <HelpCircle className="w-3.5 h-3.5" /> Butuh bantuan lisensi? Hubungi:
          </p>
          <a href="mailto:support@kopipos.id" className="text-xs font-semibold text-[#e94560] hover:underline mt-0.5 block">
            support@kopipos.id
          </a>
        </div>
      </div>
    </div>
  );
}
