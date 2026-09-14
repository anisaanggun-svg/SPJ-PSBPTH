import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, FileDown, FileText } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { toast } from '../../components/ui/Toast';
import { getDataPrimer } from '../../services/dataPrimerService';
import { getActivePejabat } from '../../services/masterPejabatService';
import {
  generateKwitansi,
  generateRincianBiaya,
  generateDaftarPengeluaranRiil,
  generateSPPD,
} from '../../services/documentService';
import { formatTanggalIndonesia } from '../../utils/dateHelpers';
import { formatRupiah } from '../../utils/formatCurrency';
import type { DataPrimer, MasterPejabat } from '../../types';

export function DocumentGeneratePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const [data, setData] = useState<DataPrimer | null>(null);
  const [pejabatList, setPejabatList] = useState<MasterPejabat[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [id, userProfile]);

  const fetchData = async () => {
    if (!userProfile || !id) return;
    try {
      const [allData, pejabat] = await Promise.all([
        getDataPrimer(userProfile.wilayah_kerja),
        getActivePejabat(userProfile.wilayah_kerja),
      ]);
      const found = allData.find((d) => d.id === id);
      setData(found || null);
      setPejabatList(pejabat);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast('error', 'Gagal memuat data');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async (type: string) => {
    if (!data) return;
    setGenerating(type);
    try {
      switch (type) {
        case 'sppd':
          await generateSPPD(data, pejabatList);
          break;
        case 'kwitansi':
          await generateKwitansi(data, pejabatList);
          break;
        case 'rincian':
          await generateRincianBiaya(data, pejabatList);
          break;
        case 'pengeluaran':
          await generateDaftarPengeluaranRiil(data, pejabatList);
          break;
      }
      toast('success', 'Dokumen berhasil di-generate dan diunduh');
    } catch (error) {
      console.error('Error generating document:', error);
      toast('error', 'Gagal generate dokumen. Pastikan template tersedia di folder public/templates/');
    } finally {
      setGenerating(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">Data tidak ditemukan</p>
        <Button variant="secondary" className="mt-4" onClick={() => navigate('/data-primer')}>
          Kembali ke Data Primer
        </Button>
      </div>
    );
  }

  const documents = [
    {
      key: 'sppd',
      title: 'SPPD',
      description: 'Surat Perintah Perjalanan Dinas (Halaman Depan & Belakang)',
    },
    {
      key: 'kwitansi',
      title: 'Kwitansi',
      description: 'Kwitansi perjalanan dinas',
    },
    {
      key: 'rincian',
      title: 'Rincian Biaya',
      description: 'Rincian Biaya Perjalanan Dinas',
    },
    {
      key: 'pengeluaran',
      title: 'Daftar Pengeluaran Riil',
      description: 'Daftar Pengeluaran Riil perjalanan dinas',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate('/data-primer')} icon={<ArrowLeft className="h-4 w-4" />}>
          Kembali
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Generate Dokumen</h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">Pilih dokumen yang ingin di-generate</p>
        </div>
      </div>

      {/* Data Summary */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Ringkasan Data</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-gray-500 dark:text-gray-400">Nama Pegawai: </span>
            <span className="font-medium text-gray-900 dark:text-white">{data.Nama_Pegawai}</span>
          </div>
          <div>
            <span className="text-gray-500 dark:text-gray-400">NIP: </span>
            <span className="font-medium text-gray-900 dark:text-white">{data.NIP_Pegawai}</span>
          </div>
          <div>
            <span className="text-gray-500 dark:text-gray-400">Tujuan: </span>
            <span className="font-medium text-gray-900 dark:text-white">{data.Tujuan}</span>
          </div>
          <div>
            <span className="text-gray-500 dark:text-gray-400">Tanggal: </span>
            <span className="font-medium text-gray-900 dark:text-white">
              {(() => { try { return formatTanggalIndonesia(data.Pada_tanggal); } catch { return '-'; } })()}
            </span>
          </div>
          <div>
            <span className="text-gray-500 dark:text-gray-400">Jumlah: </span>
            <span className="font-medium text-gray-900 dark:text-white">{formatRupiah(data.Jumlah_Uang)}</span>
          </div>
          <div>
            <span className="text-gray-500 dark:text-gray-400">No SPPD: </span>
            <span className="font-medium text-gray-900 dark:text-white">{data.No_Urut_SPPD}/{data.Bulan_Kegiatan}/{data.Tahun_Kegiatan}</span>
          </div>
        </div>
      </Card>

      {/* Document Generation */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {documents.map((doc) => (
          <Card key={doc.key} className="flex flex-col justify-between">
            <div className="flex items-start gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex-shrink-0">
                <FileText className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">{doc.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{doc.description}</p>
              </div>
            </div>
            <Button
              icon={<FileDown className="h-4 w-4" />}
              loading={generating === doc.key}
              onClick={() => handleGenerate(doc.key)}
              className="w-full"
            >
              Download .docx
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
