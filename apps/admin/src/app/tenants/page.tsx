'use client';

import { useState } from 'react';
import { Search, Filter, Plus, MoreVertical } from 'lucide-react';

const tenantsData = [
  { id: 1, name: 'Kopi Kenangan', owner: 'Edward Tirtanata', phone: '081234567890', email: 'edward@kenangan.com', plan: 'Pro', status: 'Aktif', outlets: 10 },
  { id: 2, name: 'Janji Jiwa', owner: 'Billy Kurniawan', phone: '081298765432', email: 'billy@janjijiwa.com', plan: 'Basic', status: 'Trial', outlets: 2 },
  { id: 3, name: 'Kopi Tuku', owner: 'Andanu Prasetyo', phone: '081345678901', email: 'andanu@tuku.com', plan: 'Enterprise', status: 'Aktif', outlets: 5 },
];

export default function TenantsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Manajemen Kafe Klien
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            Daftar seluruh tenant kafe yang menggunakan KopiPOS.
          </p>
        </div>
        <div className="mt-4 sm:ml-4 sm:mt-0">
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center rounded-md bg-coral px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-coral"
          >
            <Plus className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
            Daftarkan Kafe Baru
          </button>
        </div>
      </div>

      <div className="flex space-x-4">
        <div className="flex-1 relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full rounded-md border-0 py-2 pl-10 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-coral sm:text-sm sm:leading-6"
            placeholder="Cari nama kafe, pemilik, email..."
          />
        </div>
        <div className="relative">
          <button className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
            <Filter className="-ml-0.5 mr-1.5 h-5 w-5 text-gray-400" aria-hidden="true" />
            Filter
          </button>
        </div>
      </div>

      <div className="rounded-lg bg-white shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kafe Info</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kontak</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan & Outlets</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th scope="col" className="relative px-6 py-3"><span className="sr-only">Aksi</span></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {tenantsData.map((tenant) => (
              <tr key={tenant.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-10 w-10 flex-shrink-0 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-500">
                      {tenant.name.charAt(0)}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{tenant.name}</div>
                      <div className="text-sm text-gray-500">{tenant.owner}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{tenant.email}</div>
                  <div className="text-sm text-gray-500">{tenant.phone}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{tenant.plan}</div>
                  <div className="text-sm text-gray-500">{tenant.outlets} Outlets</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                    tenant.status === 'Aktif' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {tenant.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button className="text-gray-400 hover:text-gray-500">
                    <MoreVertical className="h-5 w-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal - Daftarkan Kafe Baru */}
      {isModalOpen && (
        <div className="relative z-10" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
          <div className="fixed inset-0 z-10 overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                  <div>
                    <h3 className="text-lg font-semibold leading-6 text-gray-900" id="modal-title">Daftarkan Kafe Baru</h3>
                    <div className="mt-4 space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Nama Kafe</label>
                        <input type="text" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-coral focus:ring-coral sm:text-sm border p-2" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Nama Pemilik</label>
                        <input type="text" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-coral focus:ring-coral sm:text-sm border p-2" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">No. WhatsApp</label>
                          <input type="text" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-coral focus:ring-coral sm:text-sm border p-2" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Email</label>
                          <input type="email" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-coral focus:ring-coral sm:text-sm border p-2" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Paket Langganan</label>
                        <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-coral focus:ring-coral sm:text-sm border p-2">
                          <option>Trial (14 Hari)</option>
                          <option>Basic (Bulanan)</option>
                          <option>Pro (Tahunan)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                  <button type="button" className="inline-flex w-full justify-center rounded-md bg-coral px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto" onClick={() => setIsModalOpen(false)}>
                    Simpan
                  </button>
                  <button type="button" className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto" onClick={() => setIsModalOpen(false)}>
                    Batal
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
