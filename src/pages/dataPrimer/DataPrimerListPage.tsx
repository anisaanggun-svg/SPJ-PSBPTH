import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Pencil, Trash2, FileDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { Table } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { toast } from '../../components/ui/Toast';
import { RincianBiayaGenerationModal } from '../../components/RincianBiayaGenerationModal';
import { SPPDGenerationModal } from '../../components/SPPDGenerationModal';
import { getDataPrimer, deleteDataPrimer, downloadKwitansi } from '../../services/dataPrimerService';
import { getActivePejabat } from '../../services/masterPejabatService';
import {
  generateRincianBiaya,
  generateDaftarPengeluaranRiil,
  generateSPPD,
  type RincianBiayaGenerationOptions,
} from '../../services/documentService';
import { formatTanggalIndonesia } from '../../utils/dateHelpers';
import { formatRupiah } from '../../utils/formatCurrency';
import type { DataPrimer, MasterPejabat } from '../../types';

const PAGE_LIMIT = 10;

export function DataPrimerListPage() {
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();
  const [tahun, setTahun] = useState(currentYear.toString());
  const [data, setData] = useState<DataPrimer[]>([]);
  const [pejabatList, setPejabatList] = useState<MasterPejabat[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; item: DataPrimer | null }>({
    open: false,
    item: null,
  });
  const [docModal, setDocModal] = useState<{ open: boolean; item: DataPrimer | null }>({
    open: false,
    item: null,
  });
  const [rincianModalOpen, setRincianModalOpen] = useState(false);
  const [sppdModalOpen, setSppdModalOpen] = useState(false);
  const [generatingDoc, setGeneratingDoc] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);

  const yearOptions = Array.from({ length: 5 }, (_, i) => {
    const y = currentYear - i;
    return { value: y.toString(), label: y.toString() };
  });

  useEffect(() => {
    fetchData(1);
  }, [tahun, userProfile]);

  useEffect(() => {
    fetchPejabat();
  }, [userProfile]);

  const fetchData = async (page?: number) => {
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
      const result = await getDataPrimer(
        userProfile.wilayah_kerja,
        parseInt(tahun),
        page ?? currentPage,
        PAGE_LIMIT,
      );
      setData(result.data);
      setTotal(result.total);
      setTotalPages(result.totalPages);
    } catch (error: any) {
      console.error('Error fetching data:', error);
      // Provide more specific error message
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        toast('error', 'Permintaan timeout. Periksa koneksi ke backend.');
      } else if (error.response?.status === 400) {
        toast('error', error.response.data?.error || 'Parameter tidak valid');
      } else if (error.response?.status === 401) {
        toast('error', 'Sesi berakhir. Silakan login ulang.');
      } else if (error.response?.status === 403) {
        toast('error', 'Akses ditolak. Akun belum di-approve.');
      } else {
        toast('error', 'Gagal memuat data: ' + (error.message || 'Unknown error'));
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchPejabat = async () => {
    if (!userProfile) return;
    if (!userProfile.wilayah_kerja || userProfile.wilayah_kerja <= 0) {
      console.error('Invalid wilayah_kerja for pejabat:', userProfile.wilayah_kerja);
      return;
    }
    try {
      const result = await getActivePejabat(userProfile.wilayah_kerja);
      setPejabatList(result);
    } catch (error: any) {
      console.error('Error fetching pejabat:', error);
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        console.warn('Pejabat fetch timeout');
      }
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.item?.id) return;
    try {
      await deleteDataPrimer(deleteModal.item.id);
      toast('success', 'Data berhasil dihapus');
      setDeleteModal({ open: false, item: null });
      fetchData();
    } catch (error) {
      console.error('Error deleting:', error);
      toast('error', 'Gagal menghapus data');
    }
  };

  const handleGenerateDoc = async (type: string) => {
    if (!docModal.item) return;

    if (type === 'rincian') {
      setRincianModalOpen(true);
      return;
    }

    if (type === 'sppd') {
      setSppdModalOpen(true);
      return;
    }

    setGeneratingDoc(true);
    try {
      switch (type) {
        case 'kwitansi':
          await downloadKwitansi(
            docModal.item.id!,
            docModal.item.Nama_Pegawai,
            docModal.item.No_Urut_SPPD,
          );
          break;
        case 'pengeluaran':
          await generateDaftarPengeluaranRiil(docModal.item, pejabatList);
          break;
      }
      setDocModal({ open: false, item: null });
      toast('success', 'Dokumen berhasil di-generate');
    } catch (error) {
      console.error('Error generating document:', error);
      toast('error', 'Gagal generate dokumen. Pastikan template sudah tersedia.');
    } finally {
      setGeneratingDoc(false);
    }
  };

  const handleGenerateSPPD = async (options: any) => {
    if (!docModal.item) return;
    setGeneratingDoc(true);
    try {
      await generateSPPD(docModal.item, pejabatList, options);
      setDocModal({ open: false, item: null });
      setSppdModalOpen(false);
      toast('success', 'Dokumen berhasil di-generate');
    } catch (error) {
      console.error('Error generating document:', error);
      toast('error', 'Gagal generate dokumen. Pastikan template sudah tersedia.');
    } finally {
      setGeneratingDoc(false);
    }
  };
  const handleGenerateRincian = async (options: RincianBiayaGenerationOptions) => {
    if (!docModal.item) return;

    setGeneratingDoc(true);
    try {
      await generateRincianBiaya(docModal.item, pejabatList, options);
      setDocModal({ open: false, item: null });
      setRincianModalOpen(false);
      toast('success', 'Dokumen berhasil di-generate');
    } catch (error) {
      console.error('Error generating document:', error);
      toast('error', 'Gagal generate dokumen. Pastikan template sudah tersedia.');
    } finally {
      setGeneratingDoc(false);
    }
  };

  const columns = [
    { key: 'No', header: 'No', render: (_item: DataPrimer, index: number) => (currentPage - 1) * PAGE_LIMIT + index + 1 },
    { key: 'Nama_Pegawai', header: 'Nama Pegawai', render: (item: DataPrimer) => item.Nama_Pegawai },
    {
      key: 'Pada_tanggal',
      header: 'Tanggal Kegiatan',
      render: (item: DataPrimer) => {
        if (!item.Pada_tanggal) return '-';
        try {
          return formatTanggalIndonesia(item.Pada_tanggal);
        } catch {
          return '-';
        }
      },
    },
    { key: 'Tujuan', header: 'Tujuan', render: (item: DataPrimer) => item.Tujuan },
    {
      key: 'Kegiatan',
      header: 'Kegiatan',
      render: (item: DataPrimer) => (
        <Badge variant={item.Kegiatan === 'Sertifikasi' ? 'success' : 'info'}>
          {item.Kegiatan}
        </Badge>
      ),
    },
    {
      key: 'Kategori_DL',
      header: 'Kategori',
      render: (item: DataPrimer) => (
        <Badge variant={item.Kategori_DL === 'Pendek' ? 'neutral' : 'warning'}>
          {item.Kategori_DL}
        </Badge>
      ),
    },
    {
      key: 'Jumlah_Uang',
      header: 'Jumlah',
      render: (item: DataPrimer) => formatRupiah(item.Jumlah_Uang),
    },
    {
      key: 'actions',
      header: 'Aksi',
      render: (item: DataPrimer) => (
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); navigate(`/data-primer/edit/${item.id}`); }}
            className="rounded-lg p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
            title="Edit"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setDocModal({ open: true, item }); }}
            className="rounded-lg p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
            title="Generate Dokumen"
          >
            <FileDown className="h-4 w-4" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setDeleteModal({ open: true, item }); }}
            className="rounded-lg p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            title="Hapus"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Data Primer</h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">Kelola data perjalanan dinas</p>
        </div>
        <div className="flex items-center gap-3">
          <Select
            value={tahun}
            onChange={(e) => {
              setTahun(e.target.value);
              setCurrentPage(1);
            }}
            options={yearOptions}
            className="w-32"
          />
          <Button
            icon={<Plus className="h-4 w-4" />}
            onClick={() => navigate('/data-primer/tambah')}
          >
            Tambah Data
          </Button>
        </div>
      </div>

      <Card padding="sm">
        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <>
            <Table
              columns={columns}
              data={data}
              keyExtractor={(item) => item.id || String(item.No)}
              emptyMessage="Belum ada data perjalanan dinas untuk tahun ini"
            />
            {total > 0 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Menampilkan <span className="font-medium">{(currentPage - 1) * PAGE_LIMIT + 1}</span>–
                  <span className="font-medium">{Math.min(currentPage * PAGE_LIMIT, total)}</span> dari{' '}
                  <span className="font-medium">{total}</span> data
                </p>
                <div className="flex items-center gap-1">
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={<ChevronLeft className="h-4 w-4" />}
                    disabled={currentPage <= 1}
                    onClick={() => {
                      const newPage = Math.max(1, currentPage - 1);
                      setCurrentPage(newPage);
                      fetchData(newPage);
                    }}
                  >
                    Prev
                  </Button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={page === currentPage ? 'primary' : 'secondary'}
                      size="sm"
                      onClick={() => {
                        setCurrentPage(page);
                        fetchData(page);
                      }}
                      className="min-w-[36px]"
                    >
                      {page}
                    </Button>
                  ))}
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={<ChevronRight className="h-4 w-4" />}
                    disabled={currentPage >= totalPages}
                    onClick={() => {
                      const newPage = Math.min(totalPages, currentPage + 1);
                      setCurrentPage(newPage);
                      fetchData(newPage);
                    }}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, item: null })}
        title="Konfirmasi Hapus"
        size="sm"
      >
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Apakah Anda yakin ingin menghapus data perjalanan dinas{' '}
          <span className="font-semibold">{deleteModal.item?.Nama_Pegawai}</span>?
        </p>
        <div className="flex gap-3 justify-end">
          <Button variant="secondary" onClick={() => setDeleteModal({ open: false, item: null })}>
            Batal
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Hapus
          </Button>
        </div>
      </Modal>

      {/* Generate Document Modal */}
      <Modal
        isOpen={docModal.open}
        onClose={() => setDocModal({ open: false, item: null })}
        title="Generate Dokumen"
        size="sm"
      >
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Pilih jenis dokumen untuk{' '}
          <span className="font-semibold">{docModal.item?.Nama_Pegawai}</span>:
        </p>
        <div className="space-y-2">
          {[
            { key: 'sppd', label: 'SPPD (Surat Perintah Perjalanan Dinas)' },
            { key: 'kwitansi', label: 'Kwitansi' },
            { key: 'rincian', label: 'Rincian Biaya Perjalanan Dinas' },
            { key: 'pengeluaran', label: 'Daftar Pengeluaran Riil' },
          ].map((doc) => (
            <Button
              key={doc.key}
              variant="secondary"
              className="w-full justify-start"
              icon={<FileDown className="h-4 w-4" />}
              loading={generatingDoc}
              onClick={() => handleGenerateDoc(doc.key)}
            >
              {doc.label}
            </Button>
          ))}
        </div>
      </Modal>

      <SPPDGenerationModal
        isOpen={sppdModalOpen}
        data={docModal.item}
        onClose={() => setSppdModalOpen(false)}
        onGenerate={handleGenerateSPPD}
        loading={generatingDoc}
      />
      <RincianBiayaGenerationModal
        isOpen={rincianModalOpen}
        data={docModal.item}
        onClose={() => setRincianModalOpen(false)}
        onGenerate={handleGenerateRincian}
        loading={generatingDoc}
      />
    </div>
  );
}
