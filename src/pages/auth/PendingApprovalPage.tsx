import { useNavigate } from 'react-router-dom';
import { Clock, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';

export function PendingApprovalPage() {
  const { logout, userProfile } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-teal-50 dark:from-gray-950 dark:via-gray-900 dark:to-emerald-950 p-4">
      <Card className="w-full max-w-md text-center" padding="lg">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/30 mb-6">
          <Clock className="h-10 w-10 text-yellow-600 dark:text-yellow-400" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Menunggu Persetujuan
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-2">
          Akun Anda (<span className="font-medium">{userProfile?.email}</span>) telah berhasil didaftarkan.
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-500 mb-8">
          Silakan tunggu hingga administrator menyetujui akun Anda. Anda akan mendapatkan akses setelah di-approve.
        </p>
        <Button
          variant="secondary"
          icon={<LogOut className="h-4 w-4" />}
          onClick={handleLogout}
          className="w-full"
        >
          Logout
        </Button>
      </Card>
    </div>
  );
}
