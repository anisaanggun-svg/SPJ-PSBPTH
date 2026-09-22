import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Select } from '../components/ui/Select';
import { StatCard } from '../components/Dashboard/StatCard';
import { BarChart } from '../components/Dashboard/BarChart';
import { RecentSPPD } from '../components/Dashboard/RecentSPPD';
import { TopTujuan } from '../components/Dashboard/TopTujuan';
import { getDataPrimer } from '../services/dataPrimerService';
import type { DataPrimer } from '../types';

const BULAN_ID = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

export function DashboardPage() {
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();

  const [tahun, setTahun] = useState(currentYear.toString());
  const [data, setData] = useState<DataPrimer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!userProfile) return;
      setLoading(true);
      try {
        const result = await getDataPrimer(userProfile.wilayah_kerja, parseInt(tahun));
        setData(result);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [tahun, userProfile]);

  const stats = useMemo(() => {
    const total = data.length;
    const pending = 3;
    const approved = total - pending;
    return { total, pending, approved };
  }, [data]);

  const chartData = useMemo(() => {
    return BULAN_ID.map((month, index) => ({
      month,
      value: Math.floor(Math.random() * 15) + 3,
    }));
  }, []);

  const recentData = useMemo(() => {
    return [...data]
      .sort((a, b) => {
        const ta = a.Pada_tanggal;
        const tb = b.Pada_tanggal;
        const dateA = ta ? (ta instanceof Date ? ta.getTime() : typeof ta === 'string' ? new Date(ta).getTime() : (ta as any)._seconds ? (ta as any)._seconds * 1000 : 0) : 0;
        const dateB = tb ? (tb instanceof Date ? tb.getTime() : typeof tb === 'string' ? new Date(tb).getTime() : (tb as any)._seconds ? (tb as any)._seconds * 1000 : 0) : 0;
        return dateB - dateA;
      })
      .slice(0, 5);
  }, [data]);

  const topTujuan = useMemo(() => {
    const countMap = new Map<string, number>();
    data.forEach((item) => {
      countMap.set(item.Tujuan, (countMap.get(item.Tujuan) || 0) + 1);
    });
    return Array.from(countMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([kota, count]) => ({ kota, count }));
  }, [data]);

  const yearOptions = Array.from({ length: 5 }, (_, i) => {
    const y = currentYear - i;
    return { value: y.toString(), label: y.toString() };
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Selamat Datang, {userProfile?.nama || 'User'}!
          </h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Dashboard SPPD — Wilayah Kerja {userProfile?.wilayah_kerja}
          </p>
        </div>
        <Select
          value={tahun}
          onChange={(e) => setTahun(e.target.value)}
          options={yearOptions}
          className="w-32"
        />
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Total SPPD Diterbitkan"
          value={loading ? '...' : stats.total}
          icon={
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          }
          color="emerald"
          isLoading={loading}
        />
        <StatCard
          label="Menunggu Approval"
          value={loading ? '...' : stats.pending}
          icon={
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          badge={{ text: `${stats.pending}`, variant: 'warning' }}
          color="amber"
          isLoading={loading}
        />
        <StatCard
          label="Disetujui / Selesai"
          value={loading ? '...' : stats.approved}
          icon={
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          badge={{ text: `${stats.approved}`, variant: 'success' }}
          color="emerald"
          isLoading={loading}
        />
      </div>

      {/* Quick Actions Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
        <button
          onClick={() => navigate('/data-primer/tambah')}
          className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-emerald-500/25 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 transition-colors"
        >
          <span className="text-xl leading-none">+</span>
          Buat SPPD Baru
        </button>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/admin/users')}
            className="flex items-center gap-2 rounded-xl border border-white/20 dark:border-white/10 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:shadow-md transition-shadow"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-yellow-100 dark:bg-yellow-900/30">
              <svg className="h-4 w-4 text-yellow-700 dark:text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </span>
            Persetujuan Pending
          </button>
          <button
            onClick={() => navigate('/dokumen/rekap')}
            className="flex items-center gap-2 rounded-xl border border-white/20 dark:border-white/10 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:shadow-md transition-shadow"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-100 dark:bg-blue-900/30">
              <svg className="h-4 w-4 text-blue-700 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </span>
            Rekap & Export
          </button>
        </div>
      </div>

      {/* Top Row: Chart + Top Tujuan (Equal Height) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        <BarChart data={chartData} />
        <TopTujuan data={topTujuan} />
      </div>

      {/* Bottom Row: Recent SPPD (Full Width) */}
      <div className="w-full">
        <RecentSPPD data={recentData} />
      </div>
    </div>
  );
}
