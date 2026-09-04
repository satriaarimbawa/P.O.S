import React, { useState } from 'react';
import { Settings, Printer, Store, Cloud, Palette, Shield, ArrowLeft, RefreshCw, Key } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function SettingsPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('branding');
  const [primaryColor, setPrimaryColor] = useState('#78350F');
  
  const tabs = [
    { id: 'branding', name: 'Branding & Tema', icon: Palette },
    { id: 'hardware', name: 'Hardware (Printer)', icon: Printer },
    { id: 'receipt', name: 'Format Struk', icon: Store },
    { id: 'license', name: 'Lisensi & Sync', icon: Cloud },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-slate-200 p-4 flex flex-col">
        <button onClick={() => navigate('/')} className="flex items-center text-slate-500 hover:text-slate-800 mb-8 font-medium">
          <ArrowLeft size={18} className="mr-2" /> Kembali ke POS
        </button>
        <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
          <Settings size={24} className="text-indigo-600" /> Pengaturan
        </h2>
        <nav className="flex-1 space-y-2">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.id ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Icon size={18} /> {tab.name}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Content */}
      <div className="flex-1 p-8 max-w-4xl overflow-y-auto">
        
        {activeTab === 'branding' && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Branding & Tema Kafe</h3>
              <p className="text-sm text-slate-500">Sesuaikan tampilan aplikasi dengan identitas kafe Anda.</p>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Nama Kafe</label>
                  <input type="text" className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none" defaultValue="Senja Kopi" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Tagline</label>
                  <input type="text" className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none" defaultValue="Kopi & Cerita" />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Warna Utama (Primary Color)</label>
                <div className="flex items-center gap-4">
                  <input 
                    type="color" 
                    value={primaryColor} 
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="h-10 w-20 rounded cursor-pointer border border-slate-300" 
                  />
                  <div className="flex gap-2">
                    {[
                      { name: 'Earthy Coffee', code: '#78350F' },
                      { name: 'Matcha Green', code: '#059669' },
                      { name: 'Modern Navy', code: '#1E293B' },
                      { name: 'Dark Crimson', code: '#E11D48' },
                    ].map(c => (
                      <button 
                        key={c.code}
                        onClick={() => setPrimaryColor(c.code)}
                        className={`w-8 h-8 rounded-full border-2 ${primaryColor === c.code ? 'border-indigo-500' : 'border-transparent'}`}
                        style={{ backgroundColor: c.code }}
                        title={c.name}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Preferensi Layout Menu</label>
                <div className="flex gap-4">
                  <label className="flex-1 border border-slate-200 rounded-lg p-4 cursor-pointer hover:bg-slate-50 flex items-center gap-3">
                    <input type="radio" name="layout" defaultChecked className="text-indigo-600 focus:ring-indigo-500" />
                    <div>
                      <div className="font-medium text-slate-900">Mode Foto Estetis</div>
                      <div className="text-xs text-slate-500">Tampilkan gambar produk besar</div>
                    </div>
                  </label>
                  <label className="flex-1 border border-slate-200 rounded-lg p-4 cursor-pointer hover:bg-slate-50 flex items-center gap-3">
                    <input type="radio" name="layout" className="text-indigo-600 focus:ring-indigo-500" />
                    <div>
                      <div className="font-medium text-slate-900">Mode Speed Grid / Kotak</div>
                      <div className="text-xs text-slate-500">Tombol padat untuk input cepat</div>
                    </div>
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors">Simpan Perubahan</button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'hardware' && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
             <div className="p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Hardware Printer & Laci Kasir</h3>
              <p className="text-sm text-slate-500">Konfigurasi koneksi thermal printer dan cash drawer.</p>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Interface Printer</label>
                <select className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none">
                  <option>TCP/IP Network (LAN/Wi-Fi)</option>
                  <option>USB</option>
                  <option>Bluetooth</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">IP Address Printer</label>
                  <input type="text" className="w-full border border-slate-300 rounded-lg px-4 py-2 font-mono text-sm" defaultValue="192.168.1.100" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Port</label>
                  <input type="text" className="w-full border border-slate-300 rounded-lg px-4 py-2 font-mono text-sm" defaultValue="9100" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Ukuran Kertas (Paper Width)</label>
                  <select className="w-full border border-slate-300 rounded-lg px-4 py-2">
                    <option>80mm (Standar)</option>
                    <option>58mm (Kecil)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Cash Drawer Kick Pulse</label>
                  <select className="w-full border border-slate-300 rounded-lg px-4 py-2">
                    <option>Pin 2 (Standar Epson/Star)</option>
                    <option>Pin 5</option>
                  </select>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 flex gap-4">
                <button className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2">
                  <Printer size={18} /> Test Print Struk
                </button>
                <button className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2">
                  <Store size={18} /> Test Dorong Laci Kas
                </button>
                <div className="flex-1"></div>
                <button className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors">Simpan Konfigurasi</button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'receipt' && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
             <div className="p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Format Struk Kasir</h3>
              <p className="text-sm text-slate-500">Informasi tambahan yang dicetak pada struk fisik pelanggan.</p>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Wi-Fi SSID (Nama Jaringan)</label>
                  <input type="text" className="w-full border border-slate-300 rounded-lg px-4 py-2" defaultValue="SenjaKopi_Guest" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Password Wi-Fi</label>
                  <input type="text" className="w-full border border-slate-300 rounded-lg px-4 py-2" defaultValue="kopihitam123" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Akun Instagram Kafe</label>
                <div className="relative">
                  <span className="absolute left-4 top-2 text-slate-500">@</span>
                  <input type="text" className="w-full border border-slate-300 rounded-lg pl-10 pr-4 py-2" defaultValue="senjakopi.id" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Pesan Promo Footer</label>
                <textarea 
                  className="w-full border border-slate-300 rounded-lg px-4 py-3 min-h-[100px]"
                  defaultValue="Terima kasih atas kunjungannya! Dapatkan diskon 10% untuk pembelian berikutnya dengan menukarkan struk ini."
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors">Simpan Format</button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'license' && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
             <div className="p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Lisensi & Cloud Sync</h3>
              <p className="text-sm text-slate-500">Status sinkronisasi cloud dan langganan POS Anda.</p>
            </div>
            <div className="p-6 space-y-6">
              <div className="bg-green-50 border border-green-200 p-4 rounded-xl flex items-start gap-4">
                <Shield className="text-green-600 mt-1" size={24} />
                <div className="flex-1">
                  <h4 className="font-bold text-green-900">Lisensi Aktif (Pro Plan)</h4>
                  <p className="text-green-700 text-sm mt-1">Berlaku hingga: <strong>12 Agustus 2027</strong></p>
                </div>
                <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                  Perpanjang
                </button>
              </div>

              <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="font-bold text-slate-900 flex items-center gap-2"><Cloud size={18} /> Cloud Synchronization</h4>
                    <p className="text-slate-500 text-sm mt-1">Data master dan transaksi tersinkronisasi terakhir: 5 menit yang lalu.</p>
                  </div>
                  <button className="bg-indigo-100 hover:bg-indigo-200 text-indigo-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                    <RefreshCw size={16} /> Sync Sekarang
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">API Key (Cloud Access Token)</label>
                <div className="relative">
                  <Key size={18} className="absolute left-4 top-2.5 text-slate-400" />
                  <input type="password" disabled className="w-full bg-slate-100 border border-slate-200 text-slate-500 rounded-lg pl-10 pr-4 py-2 font-mono text-sm" value="KPOS_SECURE_TOKEN_DEMO" />
                </div>
                <p className="text-xs text-slate-400 mt-2">Digunakan untuk komunikasi sinkronisasi dengan Cloud Dashboard.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
