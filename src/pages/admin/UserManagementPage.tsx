import { useEffect, useState } from 'react';
import { UserCheck, UserX, RefreshCw, Edit, Save, X, Trash2 } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Table } from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { Modal } from '../../components/ui/Modal';
import { Select } from '../../components/ui/Select';
import { toast } from '../../components/ui/Toast';
import {
  getPendingUsers,
  getAllUsers,
  approveUser,
  rejectUser,
  updateUser,
  deleteUser,
} from '../../services/adminService';
import { useAuth } from '../../contexts/AuthContext';
import type { UserProfile } from '../../types';
import { getWilayahKerjaSelectOptions, getWilayahKerjaLabel } from '../../config/wilayahKerja';

const ROLE_OPTIONS = [
  { value: 'admin', label: 'Admin' },
  { value: 'staf', label: 'Staf' },
];

const STATUS_FILTER_OPTIONS = [
  { value: 'all', label: 'Semua Status' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
];

// Gunakan konfigurasi terpusat dari src/config/wilayahKerja.ts
// Jika jumlah wilayah kerja bertambah di masa depan, cukup update file config tersebut saja.
const WILAYAH_OPTIONS = getWilayahKerjaSelectOptions();

export function UserManagementPage() {
  const { userProfile: currentUserProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<'pending' | 'all'>('pending');
  const [pendingUsers, setPendingUsers] = useState<UserProfile[]>([]);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingUid, setProcessingUid] = useState<string | null>(null);

  // Approve modal state
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [approveTarget, setApproveTarget] = useState<UserProfile | null>(null);
  const [approveRole, setApproveRole] = useState<'admin' | 'staf'>('staf');
  const [approveWilayah, setApproveWilayah] = useState<string>('1');

  // Edit modal state (Tab 2)
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<UserProfile | null>(null);
  const [editRole, setEditRole] = useState<'admin' | 'staf'>('staf');
  const [editWilayah, setEditWilayah] = useState<string>('1');

  // Delete modal state (Tab 2)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<UserProfile | null>(null);

  // Filter state (Tab 2)
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    fetchPendingUsers();
    fetchAllUsers();
  }, []);

  const fetchPendingUsers = async () => {
    setLoading(true);
    try {
      const result = await getPendingUsers();
      setPendingUsers(result);
    } catch (error) {
      console.error('Error fetching pending users:', error);
      toast('error', 'Gagal memuat daftar user pending. Pastikan backend API aktif.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllUsers = async () => {
    try {
      const result = await getAllUsers();
      setAllUsers(result);
    } catch (error) {
      console.error('Error fetching all users:', error);
      toast('error', 'Gagal memuat daftar semua user. Pastikan backend API aktif.');
    }
  };

  const handleRefresh = () => {
    fetchPendingUsers();
    fetchAllUsers();
  };

  // --- Tab 1: Pending Users ---
  const openApproveModal = (user: UserProfile) => {
    setApproveTarget(user);
    setApproveRole('staf');
    setApproveWilayah(String(user.wilayah_kerja || 1));
    setApproveModalOpen(true);
  };

  const handleApprove = async () => {
    if (!approveTarget) return;
    setProcessingUid(approveTarget.uid);
    try {
      await approveUser(approveTarget.uid, approveRole, Number(approveWilayah));
      toast('success', `User ${approveTarget.nama} berhasil di-approve sebagai ${approveRole}`);
      setApproveModalOpen(false);
      fetchPendingUsers();
      fetchAllUsers();
    } catch (error: any) {
      console.error('Error approving user:', error);
      toast('error', error?.response?.data?.error || 'Gagal approve user');
    } finally {
      setProcessingUid(null);
    }
  };

  const handleReject = async (user: UserProfile) => {
    setProcessingUid(user.uid);
    try {
      await rejectUser(user.uid);
      toast('success', `User ${user.nama} berhasil di-reject`);
      fetchPendingUsers();
      fetchAllUsers();
    } catch (error: any) {
      console.error('Error rejecting user:', error);
      toast('error', error?.response?.data?.error || 'Gagal reject user');
    } finally {
      setProcessingUid(null);
    }
  };

  // --- Tab 2: All Users ---
  const openEditModal = (user: UserProfile) => {
    setEditTarget(user);
    setEditRole(user.role);
    setEditWilayah(String(user.wilayah_kerja || 1));
    setEditModalOpen(true);
  };

  const handleUpdateUser = async () => {
    if (!editTarget) return;

    // Self-protection: admin cannot change their own role to 'staf'
    if (
      editTarget.uid === currentUserProfile?.uid &&
      editRole === 'staf'
    ) {
      toast('error', 'Anda tidak dapat mengubah role Anda sendiri menjadi staf');
      return;
    }

    setProcessingUid(editTarget.uid);
    try {
      await updateUser(editTarget.uid, {
        role: editRole,
        wilayah_kerja: Number(editWilayah),
      });
      toast('success', `User ${editTarget.nama} berhasil diupdate`);
      setEditModalOpen(false);
      fetchAllUsers();
    } catch (error: any) {
      console.error('Error updating user:', error);
      toast('error', error?.response?.data?.error || 'Gagal update user');
    } finally {
      setProcessingUid(null);
    }
  };

  const openDeleteModal = (user: UserProfile) => {
    setDeleteTarget(user);
    setDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    // Self-protection: admin cannot delete themselves
    if (deleteTarget.uid === currentUserProfile?.uid) {
      toast('error', 'Anda tidak dapat menghapus akun Anda sendiri');
      return;
    }

    setProcessingUid(deleteTarget.uid);
    try {
      await deleteUser(deleteTarget.uid);
      toast('success', `User ${deleteTarget.nama} berhasil dihapus`);
      setDeleteModalOpen(false);
      fetchAllUsers();
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast('error', error?.response?.data?.error || 'Gagal hapus user');
    } finally {
      setProcessingUid(null);
    }
  };

  const filteredUsers =
    statusFilter === 'all'
      ? allUsers
      : allUsers.filter((u) => u.status === statusFilter);

  const getRoleBadgeVariant = (role: string) => {
    return role === 'admin' ? 'info' : 'neutral';
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'pending':
        return 'warning';
      case 'rejected':
        return 'danger';
      default:
        return 'neutral';
    }
  };

  // --- Tab 1 Columns ---
  const pendingColumns = [
    { key: 'nama', header: 'Nama', render: (item: UserProfile) => item.nama },
    { key: 'email', header: 'Email', render: (item: UserProfile) => item.email },
    {
      key: 'wilayah_kerja',
      header: 'Wilayah Kerja',
      render: (item: UserProfile) => getWilayahKerjaLabel(item.wilayah_kerja) || `WK ${item.wilayah_kerja}`,
    },
    {
      key: 'status',
      header: 'Status',
      render: (item: UserProfile) => (
        <Badge variant={getStatusBadgeVariant(item.status)}>{item.status}</Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Aksi',
      render: (item: UserProfile) => (
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            icon={<UserCheck className="h-4 w-4" />}
            loading={processingUid === item.uid}
            onClick={() => openApproveModal(item)}
          >
            Approve
          </Button>
          <Button
            size="sm"
            variant="danger"
            icon={<UserX className="h-4 w-4" />}
            loading={processingUid === item.uid}
            onClick={() => handleReject(item)}
          >
            Reject
          </Button>
        </div>
      ),
    },
  ];

  // --- Tab 2 Columns ---
  const allUsersColumns = [
    { key: 'nama', header: 'Nama', render: (item: UserProfile) => item.nama },
    { key: 'email', header: 'Email', render: (item: UserProfile) => item.email },
    {
      key: 'role',
      header: 'Role',
      render: (item: UserProfile) => (
        <Badge variant={getRoleBadgeVariant(item.role)}>{item.role}</Badge>
      ),
    },
    {
      key: 'wilayah_kerja',
      header: 'Wilayah Kerja',
      render: (item: UserProfile) => getWilayahKerjaLabel(item.wilayah_kerja) || `WK ${item.wilayah_kerja}`,
    },
    {
      key: 'status',
      header: 'Status',
      render: (item: UserProfile) => (
        <Badge variant={getStatusBadgeVariant(item.status)}>{item.status}</Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Aksi',
      render: (item: UserProfile) => {
        const isSelf = item.uid === currentUserProfile?.uid;
        const canEdit = item.status === 'approved' && !isSelf;
        return (
          <div className="flex items-center gap-1">
            {canEdit ? (
              <Button
                size="sm"
                icon={<Edit className="h-4 w-4" />}
                onClick={() => openEditModal(item)}
              >
                Edit
              </Button>
            ) : isSelf ? (
              <Badge variant="info">Anda</Badge>
            ) : (
              <span className="text-xs text-gray-400">—</span>
            )}
            {!isSelf && item.status === 'approved' && (
              <Button
                size="sm"
                variant="danger"
                icon={<Trash2 className="h-4 w-4" />}
                loading={processingUid === item.uid}
                onClick={() => openDeleteModal(item)}
              >
                Hapus
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Daftar User & Approval
          </h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Kelola persetujuan dan data user aplikasi SPPD
          </p>
        </div>
        <Button
          variant="secondary"
          icon={<RefreshCw className="h-4 w-4" />}
          onClick={handleRefresh}
        >
          Refresh
        </Button>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-white/10">
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-4 py-2 text-sm font-medium transition-all ${
            activeTab === 'pending'
              ? 'border-b-2 border-emerald-600 text-emerald-700 dark:text-emerald-400'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Menunggu Approval
        </button>
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 text-sm font-medium transition-all ${
            activeTab === 'all'
              ? 'border-b-2 border-emerald-600 text-emerald-700 dark:text-emerald-400'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Semua User
        </button>
      </div>

      {/* Tab 1: Pending Users */}
      {activeTab === 'pending' && (
        <Card padding="sm">
          {loading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <Table
              columns={pendingColumns}
              data={pendingUsers}
              keyExtractor={(item) => item.uid}
              emptyMessage="Tidak ada user yang menunggu approval"
            />
          )}
        </Card>
      )}

      {/* Tab 2: All Users */}
      {activeTab === 'all' && (
        <Card padding="sm">
          <div className="mb-4 flex items-center gap-4">
            <Select
              label="Filter Status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={STATUS_FILTER_OPTIONS}
            />
          </div>
          {loading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <Table
              columns={allUsersColumns}
              data={filteredUsers}
              keyExtractor={(item) => item.uid}
              emptyMessage="Tidak ada user ditemukan"
            />
          )}
        </Card>
      )}

      {/* Approve Modal (Tab 1) */}
      <Modal
        isOpen={approveModalOpen}
        onClose={() => setApproveModalOpen(false)}
        title={`Approve User: ${approveTarget?.nama || ''}`}
        size="sm"
      >
        <div className="space-y-4">
          <Select
            label="Role"
            value={approveRole}
            onChange={(e) => setApproveRole(e.target.value as 'admin' | 'staf')}
            options={ROLE_OPTIONS}
          />
          <Select
            label="Wilayah Kerja"
            value={approveWilayah}
            onChange={(e) => setApproveWilayah(e.target.value)}
            options={WILAYAH_OPTIONS}
          />
          <div className="flex justify-end gap-2 pt-4">
            <Button
              size="sm"
              variant="secondary"
              icon={<X className="h-4 w-4" />}
              onClick={() => setApproveModalOpen(false)}
            >
              Batal
            </Button>
            <Button
              size="sm"
              icon={<Save className="h-4 w-4" />}
              loading={processingUid === approveTarget?.uid}
              onClick={handleApprove}
            >
              Simpan
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Modal (Tab 2) */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title={`Edit User: ${editTarget?.nama || ''}`}
        size="sm"
      >
        <div className="space-y-4">
          <Select
            label="Role"
            value={editRole}
            onChange={(e) => setEditRole(e.target.value as 'admin' | 'staf')}
            options={ROLE_OPTIONS}
          />
          <Select
            label="Wilayah Kerja"
            value={editWilayah}
            onChange={(e) => setEditWilayah(e.target.value)}
            options={WILAYAH_OPTIONS}
          />
          <div className="flex justify-end gap-2 pt-4">
            <Button
              size="sm"
              variant="secondary"
              icon={<X className="h-4 w-4" />}
              onClick={() => setEditModalOpen(false)}
            >
              Batal
            </Button>
            <Button
              size="sm"
              icon={<Save className="h-4 w-4" />}
              loading={processingUid === editTarget?.uid}
              onClick={handleUpdateUser}
            >
              Simpan
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal (Tab 2) */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Konfirmasi Hapus User"
        size="sm"
      >
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Apakah Anda yakin ingin menghapus user{' '}
          <span className="font-semibold">{deleteTarget?.nama}</span> ({deleteTarget?.email})?
          <br />
          <span className="text-sm text-red-600 dark:text-red-400">
            Tindakan ini tidak dapat dibatalkan. Data user akan dihapus permanen dari Firestore dan Firebase Auth.
          </span>
        </p>
        <div className="flex gap-3 justify-end">
          <Button variant="secondary" onClick={() => setDeleteModalOpen(false)}>
            Batal
          </Button>
          <Button variant="danger" loading={processingUid === deleteTarget?.uid} onClick={handleDelete}>
            Hapus
          </Button>
        </div>
      </Modal>
    </div>
  );
}
