'use client';

import { Users, Store, TrendingUp, AlertCircle, Plus, Key } from 'lucide-react';

const stats = [
  { name: 'Total Tenants', value: '47', change: '+5 bulan ini', icon: Users, color: 'text-blue-600' },
  { name: 'Active Today', value: '38', change: 'Kafe yang sedang buka shift kasir', icon: Store, color: 'text-green-600' },
  { name: 'MRR (Monthly Recurring Revenue)', value: 'Rp 23.450.000', change: '▲ +12% MoM', icon: TrendingUp, color: 'text-coral' },
  { name: 'Expiring Soon', value: '3', change: 'Lisensi habis < 7 hari', icon: AlertCircle, color: 'text-yellow-600' },
];

const recentTenants = [
  { id: 1, name: 'Kopi Kenangan', city: 'Jakarta', status: 'Aktif', plan: 'Pro', todayTx: '124', lastSync: '10 menit lalu' },
  { id: 2, name: 'Janji Jiwa', city: 'Bandung', status: 'Trial', plan: 'Basic', todayTx: '45', lastSync: '1 jam lalu' },
  { id: 3, name: 'Kopi Tuku', city: 'Surabaya', status: 'Expired', plan: 'Basic', todayTx: '0', lastSync: '2 hari lalu' },
];

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
          Executive Dashboard
        </h2>
        <div className="flex space-x-3">
          <button className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
            <Plus className="-ml-0.5 mr-1.5 h-5 w-5 text-gray-400" aria-hidden="true" />
            Daftarkan Kafe Baru
          </button>
          <button className="inline-flex items-center rounded-md bg-coral px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-coral">
            <Key className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
            Terbitkan Lisensi
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((item) => (
          <div key={item.name} className="relative overflow-hidden rounded-lg bg-white px-4 pb-12 pt-5 shadow sm:px-6 sm:pt-6">
            <dt>
              <div className="absolute rounded-md bg-gray-50 p-3">
                <item.icon className={`h-6 w-6 ${item.color}`} aria-hidden="true" />
              </div>
              <p className="ml-16 truncate text-sm font-medium text-gray-500">{item.name}</p>
            </dt>
            <dd className="ml-16 flex items-baseline pb-6 sm:pb-7">
              <p className="text-2xl font-semibold text-gray-900">{item.value}</p>
              <div className="absolute inset-x-0 bottom-0 bg-gray-50 px-4 py-4 sm:px-6">
                <div className="text-sm">
                  <span className="font-medium text-gray-500">{item.change}</span>
                </div>
              </div>
            </dd>
          </div>
        ))}
      </div>

      <div className="rounded-lg bg-white p-6 shadow">
        <h3 className="text-base font-semibold leading-6 text-gray-900 mb-4">Real-time Transaction Volume</h3>
        <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg bg-gray-50 text-gray-400">
          [Chart Placeholder: Transaksi hari ini per jam]
        </div>
      </div>

      <div className="rounded-lg bg-white shadow">
        <div className="border-b border-gray-200 px-4 py-5 sm:px-6">
          <h3 className="text-base font-semibold leading-6 text-gray-900">Daftar Kafe Klien Terbaru</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Kafe</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kota</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transaksi Hari Ini</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Sync</th>
                <th scope="col" className="relative px-6 py-3"><span className="sr-only">Aksi</span></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentTenants.map((tenant) => (
                <tr key={tenant.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{tenant.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{tenant.city}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      tenant.status === 'Aktif' ? 'bg-green-100 text-green-800' :
                      tenant.status === 'Trial' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {tenant.status === 'Aktif' && '🟢 '}
                      {tenant.status === 'Trial' && '🟡 '}
                      {tenant.status === 'Expired' && '🔴 '}
                      {tenant.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{tenant.plan}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{tenant.todayTx}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{tenant.lastSync}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <a href="#" className="text-coral hover:text-red-900">Lihat Detail</a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
