import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Menu,
  Sun,
  Moon,
  User,
  LogOut,
  Settings,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Badge } from '../ui/Badge';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';

interface NavbarProps {
  onToggleSidebar: () => void;
  sidebarCollapsed: boolean;
}

export function Navbar({ onToggleSidebar, sidebarCollapsed }: NavbarProps) {
  const { userProfile, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleLogoutConfirm = () => {
    setLogoutModalOpen(false);
    handleLogout();
  };

  return (
    <header className="sticky top-0 z-30 border-b border-emerald-500/20 dark:border-white/10 bg-emerald-600/90 dark:bg-gray-900/70 backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Left: Menu button + Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="rounded-lg p-2 text-white hover:bg-white/20 transition-colors"
            title={sidebarCollapsed ? 'Buka Sidebar' : 'Tutup Sidebar'}
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="hidden sm:block">
            <h1 className="text-sm font-bold text-white">SPPD App</h1>
          </div>
        </div>

        {/* Right: Theme toggle + User dropdown */}
        <div className="flex items-center gap-2">
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="rounded-lg p-2 text-white hover:bg-white/20 transition-colors"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>

          {/* User dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-white hover:bg-white/20 transition-colors"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/30">
                  <User className="h-4 w-4 text-white" />
                </div>
                <span className="hidden sm:block font-medium text-white">
                  {userProfile?.nama || userProfile?.email?.split('@')[0] || 'User'}
                </span>
                <ChevronDown className="h-4 w-4 text-white" />
              </button>
   
               {dropdownOpen && (
                 <div className="absolute right-0 mt-2 w-56 rounded-xl border border-white/20 dark:border-white/10 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl shadow-xl">
                   <div className="border-b border-gray-100 dark:border-white/10 px-4 py-3">
                     <div className="flex items-center gap-2">
                       <p className="text-sm font-medium text-gray-900 dark:text-white">
                         {userProfile?.nama || userProfile?.email?.split('@')[0] || 'User'}
                       </p>
                      <Badge
                        variant={userProfile?.role === 'admin' ? 'info' : 'neutral'}
                        className="text-[10px] px-1.5 py-0"
                      >
                        {userProfile?.role === 'admin' ? 'Admin' : 'Staf'}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {userProfile?.email}
                    </p>
                  </div>
                <div className="p-1">
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      navigate('/profil');
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                  >
                    <Settings className="h-4 w-4" />
                    Edit Profil
                  </button>
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      setLogoutModalOpen(true);
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      <Modal
        isOpen={logoutModalOpen}
        onClose={() => setLogoutModalOpen(false)}
        title="Konfirmasi Logout"
        size="sm"
      >
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Apakah Anda yakin ingin keluar dari aplikasi?
        </p>
        <div className="flex justify-end gap-3">
          <Button
            variant="secondary"
            onClick={() => setLogoutModalOpen(false)}
          >
            Batal
          </Button>
          <Button
            variant="danger"
            onClick={handleLogoutConfirm}
          >
            Ya, Logout
          </Button>
        </div>
      </Modal>
    </header>
  );
}
