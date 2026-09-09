import React, { useState } from 'react';
import { 
  Printer, 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  X, 
  FileText, 
  Sparkles,
  Layers
} from 'lucide-react';
import { useHardwareStore } from '../../stores/useHardwareStore';

interface PrinterStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PrinterStatusModal({ isOpen, onClose }: PrinterStatusModalProps) {
  const { 
    printerStatus, 
    checkPrinterStatus, 
    isVirtualSimulator, 
    toggleVirtualSimulator 
  } = useHardwareStore();
  
  const [testResult, setTestResult] = useState<string | null>(null);
  const [testingPrint, setTestingPrint] = useState(false);

  if (!isOpen) return null;

  const handleTestPrint = async () => {
    setTestingPrint(true);
    setTestResult(null);
    try {
      if ((window as any).posAPI?.testPrinter && printerStatus.connected) {
        await (window as any).posAPI.testPrinter();
        setTestResult('Struk lembar uji berhasil dikirim ke printer fisik!');
      } else if (!printerStatus.connected) {
        setTestResult('Gagal: Printer thermal fisik tidak terhubung. Aktifkan mode virtual simulator jika ingin demo.');
      } else {
        await new Promise((r) => setTimeout(r, 600));
        setTestResult('Preview struk uji coba berhasil disimulasikan (Mode Virtual)!');
      }
    } catch (e: any) {
      setTestResult('Error cetak: ' + e.message);
    } finally {
      setTestingPrint(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 select-none animate-fade-in">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl p-6 border border-slate-100 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
              printerStatus.connected 
                ? 'bg-emerald-50 text-emerald-600' 
                : 'bg-red-50 text-red-600 animate-pulse'
            }`}>
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Status & Diagnostik Printer</h2>
              <p className="text-xs text-slate-500">Thermal Receipt Printer Kasir (ESC/POS)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Live Status Card */}
        <div className="my-5">
          <div className={`p-5 rounded-2xl border transition-all ${
            printerStatus.connected
              ? 'bg-emerald-50/70 border-emerald-200'
              : 'bg-red-50/80 border-red-200'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${
                  printerStatus.connected ? 'bg-emerald-500' : 'bg-red-500 animate-ping'
                }`} />
                <span className={`text-sm font-extrabold uppercase tracking-wide ${
                  printerStatus.connected ? 'text-emerald-800' : 'text-red-700'
                }`}>
                  {printerStatus.connected ? 'TERHUBUNG (ONLINE)' : 'TERPUTUS (OFFLINE)'}
                </span>
              </div>
              
              {isVirtualSimulator ? (
                <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full border border-amber-300 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Simulator Virtual
                </span>
              ) : printerStatus.latency && printerStatus.connected ? (
                <span className="text-[11px] font-mono font-bold bg-white px-2 py-0.5 rounded-full text-emerald-700 border border-emerald-200 shadow-sm">
                  Ping: {printerStatus.latency} ms
                </span>
              ) : (
                <span className="text-[10px] font-bold bg-red-100 text-red-800 px-2 py-0.5 rounded-full border border-red-200">
                  Tidak Terdeteksi
                </span>
              )}
            </div>

            <p className="text-xs text-slate-700 mb-3 font-medium">
              {printerStatus.message}
            </p>

            {/* Detailed Parameters Grid */}
            <div className="grid grid-cols-2 gap-2 text-xs pt-3 border-t border-slate-200/60 font-mono">
              <div className="bg-white/70 p-2 rounded-xl border border-slate-200/50">
                <span className="text-slate-400 block text-[10px] font-sans">Target IP / Port:</span>
                <span className="font-bold text-slate-800">{printerStatus.host}:{printerStatus.port}</span>
              </div>
              <div className="bg-white/70 p-2 rounded-xl border border-slate-200/50">
                <span className="text-slate-400 block text-[10px] font-sans">Lebar Kertas:</span>
                <span className="font-bold text-slate-800">{printerStatus.paperWidth}mm (Standar)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Troubleshooting Checklist (Shown when disconnected) */}
        {!printerStatus.connected && (
          <div className="mb-5 p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs space-y-2.5">
            <h4 className="font-bold text-amber-900 flex items-center gap-1.5 text-xs uppercase tracking-wider">
              <AlertTriangle className="w-4 h-4 text-amber-600" /> Mengapa Printer Berstatus Terputus?
            </h4>
            <p className="text-amber-950 text-[11px] leading-relaxed">
              Komputer Anda saat ini tidak mendeteksi printer thermal fisik pada port jaringan <strong>{printerStatus.host}:{printerStatus.port}</strong>.
            </p>
            <ul className="space-y-1.5 text-amber-950 ml-1 text-[11px]">
              <li className="flex items-start gap-2">
                <span className="font-bold text-amber-600">1.</span>
                <span><strong>Jika Belum Memasang Printer Fisik:</strong> Aktifkan <em>Mode Virtual Simulator</em> di bawah untuk mendemokan alur cetak struk virtual.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-amber-600">2.</span>
                <span><strong>Jika Menggunakan Printer Fisik:</strong> Pastikan kabel daya printer menyala dan kabel LAN/USB terhubung ke komputer/router kasir.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-amber-600">3.</span>
                <span><strong>Sesuaikan IP Printer:</strong> Jika IP printer Anda berbeda (misal <code>192.168.1.200</code>), atur pada menu <em>Pengaturan ➔ Hardware</em>.</span>
              </li>
            </ul>
          </div>
        )}

        {/* Test Result Toast/Message */}
        {testResult && (
          <div className={`mb-4 p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
            testResult.includes('berhasil')
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {testResult.includes('berhasil') ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span>{testResult}</span>
          </div>
        )}

        {/* Actions Grid */}
        <div className="space-y-3 pt-1">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={checkPrinterStatus}
              disabled={printerStatus.checking}
              className="flex-1 py-3 bg-[#1a1a2e] hover:bg-slate-800 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-sm active:scale-98 transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${printerStatus.checking ? 'animate-spin' : ''}`} />
              <span>{printerStatus.checking ? 'Memeriksa...' : 'Cek Ulang Koneksi (Ping)'}</span>
            </button>

            <button
              type="button"
              onClick={handleTestPrint}
              disabled={testingPrint}
              className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl flex items-center justify-center gap-2 border border-slate-200 active:scale-98 transition-all"
            >
              <FileText className="w-3.5 h-3.5 text-indigo-600" />
              <span>{testingPrint ? 'Mencetak...' : 'Cetak Uji Struk'}</span>
            </button>
          </div>

          {/* Virtual Simulator Switch */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <div>
              <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Mode Virtual Printer (Simulator Demo)
              </span>
              <span className="text-[11px] text-slate-400">Aktifkan untuk simulasi cetak struk tanpa printer fisik</span>
            </div>
            <button
              type="button"
              onClick={toggleVirtualSimulator}
              className={`px-3.5 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm ${
                isVirtualSimulator
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {isVirtualSimulator ? <CheckCircle2 className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
              <span>{isVirtualSimulator ? 'Virtual: Aktif (Hijau)' : 'Deteksi Fisik (Merah)'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
