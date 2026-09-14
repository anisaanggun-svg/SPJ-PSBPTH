import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  BarChart3,
  Users,
  UserCog,
  X,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
    isActive
      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/25'
      : 'text-gray-600 dark:text-gray-400 hover:bg-emerald-50 dark:hover:bg-white/5 hover:text-emerald-700 dark:hover:text-emerald-400'
  }`;

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { userProfile } = useAuth();
  const isAdmin = userProfile?.role === 'admin';

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 transform border-r border-white/20 dark:border-white/10 bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl transition-transform duration-300 lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Mobile close button */}
          <div className="flex items-center justify-between p-4 lg:hidden">
            <span className="text-lg font-bold text-emerald-700 dark:text-emerald-400">
              Menu
            </span>
            <button
              onClick={onClose}
              className="rounded-lg p-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-white/10"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Logo area for desktop */}
          <div className="hidden lg:flex items-center gap-3 px-6 py-5 border-b border-white/20 dark:border-white/10">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 shadow-lg shadow-emerald-500/25">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-gray-900 dark:text-white">SPPD</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">UPT PSBTPH</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-3 py-4">
            <p className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
              Menu Utama
            </p>
            <NavLink to="/" end className={navLinkClass} onClick={onClose}>
              <LayoutDashboard className="h-5 w-5" />
              Dashboard
            </NavLink>
            <NavLink to="/data-primer" className={navLinkClass} onClick={onClose}>
              <FileText className="h-5 w-5" />
              Data Primer
            </NavLink>
            <NavLink to="/dokumen/rekap" className={navLinkClass} onClick={onClose}>
              <BarChart3 className="h-5 w-5" />
              Rekap Model 3
            </NavLink>

            {isAdmin && (
              <>
                <p className="px-4 pt-6 pb-2 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                  Administrasi
                </p>
                <NavLink to="/admin/users" className={navLinkClass} onClick={onClose}>
                  <Users className="h-5 w-5" />
                  Daftar User & Approval
                </NavLink>
                <NavLink to="/admin/pejabat" className={navLinkClass} onClick={onClose}>
                  <UserCog className="h-5 w-5" />
                  Master Pejabat
                </NavLink>
              </>
            )}
          </nav>

          {/* Footer */}
          <div className="border-t border-white/20 dark:border-white/10 p-4">
            <p className="text-xs text-center text-gray-400 dark:text-gray-500">
              &copy; 2026 UPT PSBTPH
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
