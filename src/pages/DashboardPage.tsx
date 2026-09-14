import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Plus, BarChart3, Users, UserCog } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Card } from '../components/ui/Card';
import { getDataPrimer } from '../services/dataPrimerService';

export function DashboardPage() {
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  const [totalData, setTotalData] = useState(0);
  const [loading, setLoading] = useState(true);
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    async function fetchStats() {
      if (!userProfile) return;
      try {
        const data = await getDataPrimer(userProfile.wilayah_kerja, currentYear);
        setTotalData(data.length);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, [userProfile, currentYear]);

  const isAdmin = userProfile?.role === 'admin';

  const quickLinks = [
    {
      title: 'Data Primer',
      description: 'Kelola data perjalanan dinas',
      icon: FileText,
      path: '/data-primer',
      color: 'bg-emerald-500',
    },
    {
      title: 'Tambah Data',
      description: 'Input data perjalanan baru',
      icon: Plus,
      path: '/data-primer/tambah',
      color: 'bg-blue-500',
    },
    {
      title: 'Rekap Model 3',
      description: 'Lihat rekap agregat data',
      icon: BarChart3,
      path: '/dokumen/rekap',
      color: 'bg-purple-500',
    },
    ...(isAdmin
      ? [
          {
            title: 'Daftar User & Approval',
            description: 'Kelola persetujuan akun user',
            icon: Users,
            path: '/admin/users',
            color: 'bg-amber-500',
          },
          {
            title: 'Master Pejabat',
            description: 'Kelola pejabat penandatangan',
            icon: UserCog,
            path: '/admin/pejabat',
            color: 'bg-cyan-500',
          },
        ]
      : []),
  ];

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Selamat Datang, {userProfile?.nama}!
        </h1>
        <p className="mt-1 text-gray-600 dark:text-gray-400">
          Dashboard SPPD — Wilayah Kerja {userProfile?.wilayah_kerja}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/30">
              <FileText className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Data {currentYear}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {loading ? '...' : totalData}
              </p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/30">
              <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Role</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white capitalize">
                {userProfile?.role || '-'}
              </p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-900/30">
              <BarChart3 className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Tahun Aktif</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {currentYear}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Links */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Akses Cepat
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickLinks.map((link) => (
            <Card
              key={link.path}
              className="cursor-pointer hover:shadow-xl transition-shadow duration-200"
            >
              <button
                onClick={() => navigate(link.path)}
                className="flex items-center gap-4 w-full text-left"
              >
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl ${link.color} shadow-lg`}
                >
                  <link.icon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {link.title}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {link.description}
                  </p>
                </div>
              </button>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
