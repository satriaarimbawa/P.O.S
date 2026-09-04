'use client';

import { Key, Copy, RefreshCw, Ban } from 'lucide-react';

const licenses = [
  { id: 1, key: 'KPOS-A1B2-C3D4-E5F6', tenant: 'Kopi Kenangan - Sudirman', hwId: 'HW-987654321', activeDate: '2023-10-01', expireDate: '2024-10-01', status: 'Active' },
  { id: 2, key: 'KPOS-Z9Y8-X7W6-V5U4', tenant: 'Janji Jiwa - Kemang', hwId: 'HW-123456789', activeDate: '2023-11-15', expireDate: '2024-11-15', status: 'Active' },
  { id: 3, key: 'KPOS-M1N2-O3P4-Q5R6', tenant: 'Kopi Tuku - Cipete', hwId: 'HW-555555555', activeDate: '2023-01-10', expireDate: '2024-01-10', status: 'Expired' },
];

export default function LicensesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
          Pusat Pengelolaan Lisensi
        </h2>
        <p className="mt-2 text-sm text-gray-500">
          Kelola lisensi untuk aplikasi kasir desktop KopiPOS di berbagai outlet kafe klien.
        </p>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <Key className="mr-2 h-5 w-5 text-coral" />
          Generator Lisensi 1-Klik
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700">Pilih Kafe</label>
            <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-coral focus:ring-coral sm:text-sm border p-2">
              <option>Kopi Kenangan</option>
              <option>Janji Jiwa</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Cabang / Outlet</label>
            <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-coral focus:ring-coral sm:text-sm border p-2">
              <option>Sudirman (Pusat)</option>
              <option>Senopati</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Durasi</label>
            <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-coral focus:ring-coral sm:text-sm border p-2">
              <option>1 Bulan</option>
              <option>1 Tahun</option>
              <option>Lifetime (Special)</option>
            </select>
          </div>
          <div>
            <button className="w-full inline-flex justify-center items-center rounded-md bg-navy px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-800">
              GENERATE LICENSE KEY
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-lg bg-white shadow overflow-hidden">
        <div className="border-b border-gray-200 px-4 py-5 sm:px-6">
          <h3 className="text-base font-semibold leading-6 text-gray-900">Daftar Lisensi Terbit</h3>
        </div>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">License Key & Info</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Masa Aktif</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {licenses.map((lic) => (
              <tr key={lic.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-mono font-bold text-navy">{lic.key}</div>
                  <div className="text-sm text-gray-900">{lic.tenant}</div>
                  <div className="text-xs text-gray-500">HW ID: {lic.hwId}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">Mulai: {lic.activeDate}</div>
                  <div className="text-sm text-gray-500">Berakhir: {lic.expireDate}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                    lic.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {lic.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                  <button className="text-gray-400 hover:text-gray-900" title="Copy Key">
                    <Copy className="h-5 w-5 inline" />
                  </button>
                  <button className="text-blue-400 hover:text-blue-900" title="Perpanjang">
                    <RefreshCw className="h-5 w-5 inline" />
                  </button>
                  <button className="text-red-400 hover:text-red-900" title="Revoke">
                    <Ban className="h-5 w-5 inline" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
