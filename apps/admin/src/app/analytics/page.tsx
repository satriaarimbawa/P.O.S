'use client';

import { useState } from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  Store, 
  Users, 
  ArrowUpRight, 
  ArrowDownRight,
  Download
} from 'lucide-react';

const analyticsSummary = {
  mrr: 'Rp 48.500.000',
  mrrGrowth: '+14.2%',
  activeTenants: 42,
  tenantGrowth: '+8.5%',
  totalTransactionsVolume: 'Rp 1.420.000.000',
  volumeGrowth: '+22.4%',
  churnRate: '1.8%',
  churnChange: '-0.4%',
};

const topPerformingTenants = [
  { rank: 1, name: 'Kopi Kenangan - Senopati', outlets: 12, monthlyVolume: 'Rp 340.000.000', growth: '+18%' },
  { rank: 2, name: 'Janji Jiwa - Gading Serpong', outlets: 5, monthlyVolume: 'Rp 185.000.000', growth: '+12%' },
  { rank: 3, name: 'Kopi Tuku - Cipete', outlets: 6, monthlyVolume: 'Rp 160.000.000', growth: '+9%' },
  { rank: 4, name: 'Anomali Coffee - Ubud', outlets: 3, monthlyVolume: 'Rp 98.000.000', growth: '+15%' },
  { rank: 5, name: 'Fore Coffee - Grand Indonesia', outlets: 4, monthlyVolume: 'Rp 88.000.000', growth: '+6%' },
];

const subscriptionBreakdown = [
  { tier: 'Enterprise Plan', count: 8, percentage: 19, revenue: 'Rp 20.000.000' },
  { tier: 'Pro Plan', count: 24, percentage: 57, revenue: 'Rp 24.000.000' },
  { tier: 'Basic Plan', count: 10, percentage: 24, revenue: 'Rp 4.500.000' },
];

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('30days');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Analitik Global Platform SaaS
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            Performa agregat seluruh tenant kafe, pertumbuhan MRR, dan tren transaksi nasional.
          </p>
        </div>
        <div className="mt-4 flex items-center space-x-3 sm:ml-4 sm:mt-0">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="rounded-md border-0 py-1.5 pl-3 pr-8 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-coral text-sm"
          >
            <option value="7days">7 Hari Terakhir</option>
            <option value="30days">30 Hari Terakhir</option>
            <option value="90days">Kuartal Ini (Q3)</option>
            <option value="year">Tahun Ini (2026)</option>
          </select>

          <button
            onClick={() => alert('Laporan Analitik Global berhasil diunduh (PDF / Excel).')}
            className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
          >
            <Download className="-ml-0.5 mr-1.5 h-4 w-4 text-gray-500" />
            Ekspor Laporan
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6 border border-gray-100">
          <div className="flex items-center">
            <div className="rounded-md bg-coral/10 p-3">
              <DollarSign className="h-6 w-6 text-coral" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="truncate text-xs font-medium uppercase tracking-wider text-gray-500">Monthly Recurring Revenue (MRR)</dt>
                <dd className="mt-1 flex items-baseline">
                  <div className="text-xl font-bold text-gray-900">{analyticsSummary.mrr}</div>
                  <div className="ml-2 flex items-baseline text-xs font-semibold text-green-600">
                    <ArrowUpRight className="h-3 w-3 self-center" />
                    {analyticsSummary.mrrGrowth}
                  </div>
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6 border border-gray-100">
          <div className="flex items-center">
            <div className="rounded-md bg-blue-50 p-3">
              <Store className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="truncate text-xs font-medium uppercase tracking-wider text-gray-500">Total Kafe / Tenant Aktif</dt>
                <dd className="mt-1 flex items-baseline">
                  <div className="text-xl font-bold text-gray-900">{analyticsSummary.activeTenants} Kafe</div>
                  <div className="ml-2 flex items-baseline text-xs font-semibold text-green-600">
                    <ArrowUpRight className="h-3 w-3 self-center" />
                    {analyticsSummary.tenantGrowth}
                  </div>
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6 border border-gray-100">
          <div className="flex items-center">
            <div className="rounded-md bg-purple-50 p-3">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="truncate text-xs font-medium uppercase tracking-wider text-gray-500">Gross Merchandise Value (GMV)</dt>
                <dd className="mt-1 flex items-baseline">
                  <div className="text-xl font-bold text-gray-900">{analyticsSummary.totalTransactionsVolume}</div>
                  <div className="ml-2 flex items-baseline text-xs font-semibold text-green-600">
                    <ArrowUpRight className="h-3 w-3 self-center" />
                    {analyticsSummary.volumeGrowth}
                  </div>
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6 border border-gray-100">
          <div className="flex items-center">
            <div className="rounded-md bg-emerald-50 p-3">
              <Users className="h-6 w-6 text-emerald-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="truncate text-xs font-medium uppercase tracking-wider text-gray-500">Tenant Churn Rate</dt>
                <dd className="mt-1 flex items-baseline">
                  <div className="text-xl font-bold text-gray-900">{analyticsSummary.churnRate}</div>
                  <div className="ml-2 flex items-baseline text-xs font-semibold text-green-600">
                    <ArrowDownRight className="h-3 w-3 self-center" />
                    {analyticsSummary.churnChange}
                  </div>
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Plan Distribution & Top Tenants */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Tier Distribution */}
        <div className="rounded-lg bg-white p-6 shadow border border-gray-100">
          <h3 className="text-base font-semibold leading-6 text-gray-900 mb-4">
            Distribusi Paket Berlangganan
          </h3>
          <div className="space-y-4">
            {subscriptionBreakdown.map((item) => (
              <div key={item.tier} className="space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-gray-800">{item.tier} ({item.count} Kafe)</span>
                  <span className="text-gray-500 font-semibold">{item.revenue} / bln</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                  <div 
                    className="bg-coral h-3 rounded-full transition-all duration-500" 
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
                <div className="text-right text-xs text-gray-400">{item.percentage}% dari total tenant</div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Tenants by Volume */}
        <div className="rounded-lg bg-white p-6 shadow border border-gray-100">
          <h3 className="text-base font-semibold leading-6 text-gray-900 mb-4">
            Top Tenant Berdasarkan Volume Transaksi (GMV)
          </h3>
          <div className="flow-root">
            <ul role="list" className="-my-3 divide-y divide-gray-200">
              {topPerformingTenants.map((t) => (
                <li key={t.rank} className="py-3 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-600">
                      #{t.rank}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{t.name}</p>
                      <p className="text-xs text-gray-500">{t.outlets} Cabang Aktif</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">{t.monthlyVolume}</p>
                    <span className="inline-flex items-center text-xs font-medium text-green-600">
                      <ArrowUpRight className="h-3 w-3 mr-0.5" />
                      {t.growth}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
