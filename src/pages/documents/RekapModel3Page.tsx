import { useState, useEffect } from 'react';
import { FileDown, BarChart3, Search } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Card } from '../../components/ui/Card';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { Table } from '../../components/ui/Table';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { toast } from '../../components/ui/Toast';
import { getRekapModel3 } from '../../services/adminService';
import { getActivePejabat } from '../../services/masterPejabatService';
import { generateRekapModel3 } from '../../services/documentService';
import { formatRupiah } from '../../utils/formatCurrency';
import { BULAN_ROMAWI } from '../../constants/masterData';
import type { RekapModel3Item, MasterPejabat } from '../../types';

export function RekapModel3Page() {
  const { userProfile } = useAuth();
  const currentYear = new Date().getFullYear();
  const [tahun, setTahun] = useState(currentYear.toString());
  const [bulan, setBulan] = useState('');
  const [data, setData] = useState<RekapModel3Item[]>([]);
  const [pejabatList, setPejabatList] = useState<MasterPejabat[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [fetched, setFetched] = useState(false);

  const yearOptions = Array.from({ length: 5 }, (_, i) => {
    const y = currentYear - i;
    return { value: y.toString(), label: y.toString() };
  });

  // Auto-fetch on mount and when userProfile/tahun changes
  useEffect(() => {
    if (userProfile) {
      handleFetch();
    }
  }, [userProfile, tahun]);

  const handleFetch = async () => {
    setLoading(true);
    if (!userProfile) {
      setLoading(false);
      return;
    }
    // Validate wilayah_kerja before making request
    if (!userProfile.wilayah_kerja || userProfile.wilayah_kerja <= 0) {
      console.error('Invalid wilayah_kerja:', userProfile.wilayah_kerja);
      toast('error', 'Wilayah kerja tidak valid. Silakan hubungi admin.');
      setLoading(false);
      return;
    }
    try {
      const [rekapData, pejabat] = await Promise.all([
        getRekapModel3(userProfile.wilayah_kerja, parseInt(tahun)),
        getActivePejabat(userProfile.wilayah_kerja),
      ]);
      setData(rekapData);
      setPejabatList(pejabat);
      setFetched(true);
      if (rekapData.length === 0) {
        toast('info', 'Tidak ada data rekap untuk filter yang dipilih');
      }
    } catch (error: any) {
      console.error('Error fetching rekap:', error);
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        toast('error', 'Permintaan timeout. Periksa koneksi ke backend.');
      } else if (error.response?.status === 400) {
        toast('error', error.response.data?.error || 'Parameter tidak valid');
      } else if (error.response?.status === 401) {
        toast('error', 'Sesi berakhir. Silakan login ulang.');
      } else if (error.response?.status === 403) {
        toast('error', 'Akses ditolak. Akun belum di-approve.');
      } else {
        toast('error', 'Gagal memuat data rekap: ' + (error.message || 'Unknown error'));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (data.length === 0) {
      toast('warning', 'Tidak ada data untuk di-generate');
      return;
    }
    setGenerating(true);
    try {
      const bulanLabel = bulan || 'Semua';
      const tahunLabel = `Perj./${tahun}`;
      await generateRekapModel3(data, pejabatList, bulanLabel, tahunLabel);
      toast('success', 'Rekap Model 3 berhasil di-generate');
    } catch (error) {
      console.error('Error generating rekap:', error);
      toast('error', 'Gagal generate rekap. Pastikan template tersedia.');
    } finally {
      setGenerating(false);
    }
  };

  const grandTotal = data.reduce((sum, item) => sum + item.total, 0);

  const columns = [
    {
      key: 'no',
      header: 'No',
      render: (_: RekapModel3Item, index: number) => index + 1,
    },
    { key: 'Berangkat_dari', header: 'Dari' },
    { key: 'Tujuan', header: 'Tujuan' },
    { key: 'Pada_tanggal', header: 'Tanggal' },
    { key: 'Kode_Kegiatan', header: 'Kode Kegiatan' },
    {
      key: 'entries',
      header: 'Pegawai',
      render: (item: RekapModel3Item) => (
        <div className="space-y-1">
          {item.entries.map((e, i) => (
            <div key={i} className="text-xs">
              {e.Nama_Pegawai}
            </div>
          ))}
        </div>
      ),
    },
    {
      key: 'total',
      header: 'Total',
      render: (item: RekapModel3Item) => formatRupiah(item.total),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Rekap Model 3</h1>
        <p className="mt-1 text-gray-600 dark:text-gray-400">
          Rekap agregat data perjalanan dinas
        </p>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col sm:flex-row gap-4 items-end">
          <Select
            label="Tahun"
            value={tahun}
            onChange={(e) => setTahun(e.target.value)}
            options={yearOptions}
          />
          <Select
            label="Bulan (Opsional)"
            placeholder="-- Semua Bulan --"
            value={bulan}
            onChange={(e) => setBulan(e.target.value)}
            options={Object.entries(BULAN_ROMAWI).map(([num, romawi]) => ({
              value: romawi,
              label: `${romawi} (Bulan ${num})`,
            }))}
          />
          <Button
            icon={<Search className="h-4 w-4" />}
            onClick={handleFetch}
            loading={loading}
          >
            Cari Data
          </Button>
        </div>
      </Card>

      {/* Results */}
      {loading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : fetched ? (
        <>
          <Card padding="sm">
            <Table
              columns={columns}
              data={data}
              keyExtractor={(item) => `${item.Berangkat_dari}-${item.Tujuan}-${item.Pada_tanggal}`}
              emptyMessage="Tidak ada data rekap"
            />
            {data.length > 0 && (
              <div className="flex justify-between items-center px-4 py-3 border-t border-gray-200 dark:border-white/10">
                <span className="font-semibold text-gray-900 dark:text-white">
                  Grand Total
                </span>
                <span className="font-bold text-lg text-emerald-600 dark:text-emerald-400">
                  {formatRupiah(grandTotal)}
                </span>
              </div>
            )}
          </Card>

          {data.length > 0 && (
            <div className="flex justify-end">
              <Button
                icon={<FileDown className="h-4 w-4" />}
                onClick={handleGenerate}
                loading={generating}
                size="lg"
              >
                Download Rekap Model 3 (.docx)
              </Button>
            </div>
          )}

          {fetched && data.length === 0 && (
            <Card className="border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20">
              <div className="p-4 text-center">
                <p className="text-yellow-800 dark:text-yellow-300 mb-2">
                  Tidak ada data rekap untuk filter yang dipilih.
                </p>
                <p className="text-sm text-yellow-700 dark:text-yellow-400 mb-3">
                  Pastikan sudah ada Data Primer untuk wilayah kerja Anda (wilayah {userProfile?.wilayah_kerja}) dan tahun {tahun}.
                </p>
                <Button
                  variant="secondary"
                  icon={<FileDown className="h-4 w-4" />}
                  onClick={() => window.location.href = '/data-primer'}
                >
                  Kelola Data Primer
                </Button>
              </div>
            </Card>
          )}
        </>
      ) : (
        <Card className="text-center py-12">
          <BarChart3 className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">
            Data akan dimuat otomatis. Pilih tahun dan klik "Cari Data" untuk refresh.
          </p>
        </Card>
      )}
    </div>
  );
}
