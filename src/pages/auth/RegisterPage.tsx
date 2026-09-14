import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, FileText } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Card } from '../../components/ui/Card';

export function RegisterPage() {
  const [nama, setNama] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [wilayahKerja, setWilayahKerja] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Password dan konfirmasi password tidak cocok');
      return;
    }
    if (!wilayahKerja) {
      setError('Pilih wilayah kerja');
      return;
    }

    setLoading(true);
    try {
      await register(email, password, nama, parseInt(wilayahKerja));
      navigate('/pending');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Registrasi gagal';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-teal-50 dark:from-gray-950 dark:via-gray-900 dark:to-emerald-950 p-4">
      <Card className="w-full max-w-md" padding="lg">
        <div className="text-center mb-8">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-600 shadow-lg shadow-emerald-500/25 mb-4">
            <FileText className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Daftar Akun Baru
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Buat akun untuk mengakses SPPD App
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 text-sm text-red-700 dark:text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nama Lengkap"
            type="text"
            placeholder="Masukkan nama lengkap"
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            required
          />
          <Input
            label="Email"
            type="email"
            placeholder="nama@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Select
            label="Wilayah Kerja"
            placeholder="-- Pilih Wilayah Kerja --"
            value={wilayahKerja}
            onChange={(e) => setWilayahKerja(e.target.value)}
            options={[
              { value: '1', label: 'Wilayah Kerja I' },
              { value: '2', label: 'Wilayah Kerja II' },
              { value: '3', label: 'Wilayah Kerja III' },
              { value: '4', label: 'Wilayah Kerja IV - Malang' },
            ]}
            required
          />
          <Input
            label="Password"
            type="password"
            placeholder="Minimal 6 karakter"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Input
            label="Konfirmasi Password"
            type="password"
            placeholder="Ulangi password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <Button
            type="submit"
            loading={loading}
            icon={<UserPlus className="h-4 w-4" />}
            className="w-full"
            size="lg"
          >
            Daftar
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
          Sudah punya akun?{' '}
          <Link
            to="/login"
            className="font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300"
          >
            Masuk di sini
          </Link>
        </p>
      </Card>
    </div>
  );
}
