import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, RefreshCw, Save } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Card } from '../../components/ui/Card';
import { Table } from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Modal } from '../../components/ui/Modal';
import { Badge } from '../../components/ui/Badge';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { toast } from '../../components/ui/Toast';
import { getActivePejabat } from '../../services/masterPejabatService';
import { createPejabat, updatePejabat, deletePejabat } from '../../services/adminService';
import type { MasterPejabat } from '../../types';

export function MasterPejabatPage() {
  const { userProfile } = useAuth();
  const [pejabatList, setPejabatList] = useState<MasterPejabat[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; item: MasterPejabat | null }>({
    open: false,
    item: null,
  });

  const [form, setForm] = useState({
    role: '' as string,
    nama: '',
    nip: '',
    jabatan_lengkap: '',
    aktif: true,
  });

  useEffect(() => {
    fetchPejabat();
  }, [userProfile]);

  const fetchPejabat = async () => {
    if (!userProfile) return;
    setLoading(true);
    try {
      const result = await getActivePejabat(userProfile.wilayah_kerja);
      setPejabatList(result);
    } catch (error) {
      console.error('Error fetching pejabat:', error);
      toast('error', 'Gagal memuat data pejabat. Pastikan backend API aktif.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({ role: '', nama: '', nip: '', jabatan_lengkap: '', aktif: true });
    setEditingId(null);
  };

  const openAddModal = () => {
    resetForm();
    setModalOpen(true);
  };

  const openEditModal = (item: MasterPejabat) => {
    setForm({
      role: item.role,
      nama: item.nama,
      nip: item.nip || '',
      jabatan_lengkap: item.jabatan_lengkap,
      aktif: item.aktif,
    });
    setEditingId(item.id || null);
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!userProfile) return;
    if (!form.role || !form.nama || !form.jabatan_lengkap) {
      toast('warning', 'Lengkapi semua field yang wajib diisi');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        role: form.role as 'ppk' | 'admin' | 'operator' | 'kpa' | 'bendahara' | 'pengkompulir',
        nama: form.nama,
        nip: form.nip || null,
        jabatan_lengkap: form.jabatan_lengkap,
        wilayah_kerja: userProfile.wilayah_kerja,
        aktif: form.aktif,
      };

      if (editingId) {
        await updatePejabat(editingId, payload);
        toast('success', 'Pejabat berhasil diperbarui');
      } else {
        await createPejabat(payload);
        toast('success', 'Pejabat berhasil ditambahkan');
      }
      setModalOpen(false);
      resetForm();
      fetchPejabat();
    } catch (error) {
      console.error('Error saving pejabat:', error);
      toast('error', 'Gagal menyimpan data pejabat');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.item?.id) return;
    try {
      await deletePejabat(deleteModal.item.id);
      toast('success', 'Pejabat berhasil dihapus');
      setDeleteModal({ open: false, item: null });
      fetchPejabat();
    } catch (error) {
      console.error('Error deleting pejabat:', error);
      toast('error', 'Gagal menghapus pejabat');
    }
  };

  const columns = [
    {
      key: 'role',
      header: 'Role',
      render: (item: MasterPejabat) => (
        <Badge variant="info">{item.role.toUpperCase()}</Badge>
      ),
    },
    { key: 'nama', header: 'Nama', render: (item: MasterPejabat) => item.nama },
    { key: 'nip', header: 'NIP', render: (item: MasterPejabat) => item.nip || '-' },
    { key: 'jabatan_lengkap', header: 'Jabatan', render: (item: MasterPejabat) => item.jabatan_lengkap },
    {
      key: 'aktif',
      header: 'Status',
      render: (item: MasterPejabat) => (
        <Badge variant={item.aktif ? 'success' : 'neutral'}>
          {item.aktif ? 'Aktif' : 'Nonaktif'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Aksi',
      render: (item: MasterPejabat) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => openEditModal(item)}
            className="rounded-lg p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
            title="Edit"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            onClick={() => setDeleteModal({ open: true, item })}
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Master Pejabat</h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">Kelola data pejabat penandatangan</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" icon={<RefreshCw className="h-4 w-4" />} onClick={fetchPejabat}>
            Refresh
          </Button>
          <Button icon={<Plus className="h-4 w-4" />} onClick={openAddModal}>
            Tambah Pejabat
          </Button>
        </div>
      </div>

      <Card padding="sm">
        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <Table
            columns={columns}
            data={pejabatList}
            keyExtractor={(item) => item.id || item.nama}
            emptyMessage="Belum ada data pejabat"
          />
        )}
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); resetForm(); }}
        title={editingId ? 'Edit Pejabat' : 'Tambah Pejabat'}
        size="lg"
      >
        <div className="space-y-4">
          <Select
            label="Role"
            placeholder="-- Pilih Role --"
            value={form.role}
            onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}
            options={[
              { value: 'kpa', label: 'KPA (Kuasa Pengguna Anggaran)' },
              { value: 'ppk', label: 'PPK (Pejabat Pembuat Komitmen)' },
              { value: 'bendahara', label: 'Bendahara Pengeluaran' },
              { value: 'pengkompulir', label: 'Yang Mengkompulir' },
              { value: 'admin', label: 'Admin (Master Pejabat)' },
              { value: 'operator', label: 'Operator (Master Pejabat)' },
            ]}
            required
          />
          <Input
            label="Nama"
            type="text"
            placeholder="Nama pejabat"
            value={form.nama}
            onChange={(e) => setForm((p) => ({ ...p, nama: e.target.value }))}
            required
          />
          <Input
            label="NIP"
            type="text"
            placeholder="NIP pejabat (opsional)"
            value={form.nip}
            onChange={(e) => setForm((p) => ({ ...p, nip: e.target.value }))}
          />
          <Input
            label="Jabatan Lengkap"
            type="text"
            placeholder="Nama jabatan lengkap"
            value={form.jabatan_lengkap}
            onChange={(e) => setForm((p) => ({ ...p, jabatan_lengkap: e.target.value }))}
            required
          />
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="aktif"
              checked={form.aktif}
              onChange={(e) => setForm((p) => ({ ...p, aktif: e.target.checked }))}
              className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
            />
            <label htmlFor="aktif" className="text-sm text-gray-700 dark:text-gray-300">
              Aktif
            </label>
          </div>
          <div className="flex gap-3 justify-end pt-4">
            <Button variant="secondary" onClick={() => { setModalOpen(false); resetForm(); }}>
              Batal
            </Button>
            <Button icon={<Save className="h-4 w-4" />} loading={saving} onClick={handleSave}>
              {editingId ? 'Perbarui' : 'Simpan'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <Modal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, item: null })}
        title="Konfirmasi Hapus"
        size="sm"
      >
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Apakah Anda yakin ingin menghapus pejabat{' '}
          <span className="font-semibold">{deleteModal.item?.nama}</span>?
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
    </div>
  );
}
