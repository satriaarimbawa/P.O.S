'use client';

import { FileText, Send } from 'lucide-react';

const invoices = [
  { id: 'INV-2023-001', tenant: 'Kopi Kenangan', amount: 'Rp 250.000', dueDate: '2023-11-01', status: 'Lunas' },
  { id: 'INV-2023-002', tenant: 'Janji Jiwa', amount: 'Rp 250.000', dueDate: '2023-11-05', status: 'Jatuh Tempo' },
  { id: 'INV-2023-003', tenant: 'Kopi Tuku', amount: 'Rp 500.000', dueDate: '2023-10-25', status: 'Terlambat' },
];

export default function BillingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
          Billing & Invoice
        </h2>
        <p className="mt-2 text-sm text-gray-500">
          Kelola penagihan dan kirim pengingat WhatsApp ke pemilik kafe.
        </p>
      </div>

      <div className="rounded-lg bg-white shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice ID</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kafe Klien</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Penagihan</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jatuh Tempo</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {invoices.map((inv) => (
              <tr key={inv.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 flex items-center">
                  <FileText className="mr-2 h-4 w-4 text-gray-400" />
                  {inv.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{inv.tenant}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{inv.amount}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{inv.dueDate}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                    inv.status === 'Lunas' ? 'bg-green-100 text-green-800' :
                    inv.status === 'Jatuh Tempo' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {inv.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {inv.status !== 'Lunas' && (
                    <button 
                      className="inline-flex items-center rounded-md bg-green-500 px-2.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-green-600"
                      onClick={() => {
                        const message = encodeURIComponent(`Halo Kak, masa aktif KopiPOS untuk ${inv.tenant} akan berakhir pada ${inv.dueDate}. Silakan lakukan pembayaran perpanjangan...`);
                        window.open(`https://wa.me/?text=${message}`, '_blank');
                      }}
                    >
                      <Send className="mr-1.5 h-3 w-3" />
                      Kirim WA
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
