import { FileText, BarChart3, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function QuickActions() {
  const navigate = useNavigate();

  return (
    <div className="space-y-4">
      <button
        onClick={() => navigate('/data-primer/tambah')}
        className="w-full h-12 text-base font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition-colors"
      >
        <Plus className="h-5 w-5" />
        Buat SPPD Baru
      </button>
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => navigate('/admin/users')}
          className="flex flex-col items-center gap-2 rounded-xl border border-white/20 dark:border-white/10 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-100 dark:bg-yellow-900/30">
            <FileText className="h-5 w-5 text-yellow-700 dark:text-yellow-400" />
          </div>
          <span className="text-xs font-medium text-gray-700 dark:text-gray-300 text-center leading-tight">
            Persetujuan<br />Pending
          </span>
        </button>
        <button
          onClick={() => navigate('/dokumen/rekap')}
          className="flex flex-col items-center gap-2 rounded-xl border border-white/20 dark:border-white/10 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
            <BarChart3 className="h-5 w-5 text-blue-700 dark:text-blue-400" />
          </div>
          <span className="text-xs font-medium text-gray-700 dark:text-gray-300 text-center leading-tight">
            Rekap &<br />Export
          </span>
        </button>
      </div>
    </div>
  );
}
