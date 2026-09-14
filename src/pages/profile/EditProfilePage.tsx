import { useState } from 'react';
import { Save, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { toast } from '../../components/ui/Toast';

export function EditProfilePage() {
  const { userProfile, updateUserEmail, updateUserPassword } = useAuth();
  const [email, setEmail] = useState(userProfile?.email || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateUserEmail(email);
      toast('success', 'Email berhasil diperbarui');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Gagal memperbarui email';
      toast('error', message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast('error', 'Password dan konfirmasi tidak cocok');
      return;
    }
    if (newPassword.length < 6) {
      toast('error', 'Password minimal 6 karakter');
      return;
    }
    setLoading(true);
    try {
      await updateUserPassword(newPassword);
      setNewPassword('');
      setConfirmPassword('');
      toast('success', 'Password berhasil diperbarui');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Gagal memperbarui password';
      toast('error', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Profil</h1>
        <p className="mt-1 text-gray-600 dark:text-gray-400">
          Kelola informasi akun Anda
        </p>
      </div>

      {/* Profile Info */}
      <Card>
        <div className="flex items-center gap-4 mb-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
            <User className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {userProfile?.nama}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {userProfile?.role === 'admin' ? 'Administrator' : 'Staf'} — Wilayah Kerja {userProfile?.wilayah_kerja}
            </p>
          </div>
        </div>
      </Card>

      {/* Update Email */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Ubah Email</h2>
        <form onSubmit={handleUpdateEmail} className="space-y-4">
          <Input
            label="Email Baru"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Button type="submit" loading={loading} icon={<Save className="h-4 w-4" />}>
            Simpan Email
          </Button>
        </form>
      </Card>

      {/* Update Password */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Ubah Password</h2>
        <form onSubmit={handleUpdatePassword} className="space-y-4">
          <Input
            label="Password Baru"
            type="password"
            placeholder="Minimal 6 karakter"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          <Input
            label="Konfirmasi Password"
            type="password"
            placeholder="Ulangi password baru"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <Button type="submit" loading={loading} icon={<Save className="h-4 w-4" />}>
            Simpan Password
          </Button>
        </form>
      </Card>
    </div>
  );
}
