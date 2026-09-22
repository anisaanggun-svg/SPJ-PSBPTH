import { FileText, Printer } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '../ui/Badge';
import type { DataPrimer } from '../../types';
import { formatTanggalIndonesia } from '../../utils/dateHelpers';

interface RecentSPPDProps {
  data: DataPrimer[];
}

export function RecentSPPD({ data }: RecentSPPDProps) {
  const navigate = useNavigate();

  const getStatus = (i: number) => {
    if (i < 2) return <Badge variant="success">Disetujui</Badge>;
    if (i < 4) return <Badge variant="warning">Menunggu</Badge>;
    return <Badge variant="info">Proses</Badge>;
  };

  return (
    <div className="rounded-xl border border-white/20 dark:border-white/10 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm p-5">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Recent SPPD</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-white/10">
              {['No. SPPD', 'Nama Pegawai', 'Tujuan', 'Tanggal', 'Status', 'Aksi'].map((h) => (
                <th key={h} className="pb-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-white/5">
            {data.map((item, index) => (
              <tr key={item.id || String(item.No)} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                <td className="py-3 font-medium text-gray-900 dark:text-white">
                  {item.No_Urut_SPPD}/{item.Bulan_Kegiatan}/{item.Tahun_Kegiatan.replace('Perj./', '')}
                </td>
                <td className="py-3 text-gray-700 dark:text-gray-300">{item.Nama_Pegawai}</td>
                <td className="py-3 text-gray-700 dark:text-gray-300">{item.Tujuan}</td>
                <td className="py-3 text-gray-700 dark:text-gray-300">
                  {item.Pada_tanggal ? formatTanggalIndonesia(item.Pada_tanggal) : '-'}
                </td>
                <td className="py-3">{getStatus(index)}</td>
                <td className="py-3 text-right">
                  <button onClick={() => navigate(`/data-primer/edit/${item.id}`)} className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors" title="Detail">
                    <FileText className="h-3.5 w-3.5" /> Detail
                  </button>
                  <button className="ml-1 inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors" title="Cetak">
                    <Printer className="h-3.5 w-3.5" /> Cetak
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
