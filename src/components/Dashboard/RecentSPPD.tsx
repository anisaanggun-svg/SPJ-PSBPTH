import { Badge } from '../ui/Badge';
import type { DataPrimer } from '../../types';
import { formatTanggalIndonesia } from '../../utils/dateHelpers';
import { formatRupiah } from '../../utils/formatCurrency';

interface RecentSPPDProps {
  data: DataPrimer[];
}

export function RecentSPPD({ data }: RecentSPPDProps) {
  return (
    <div className="rounded-xl border border-white/20 dark:border-white/10 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm p-5">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Recent SPPD</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-white/10">
              {['Nama Pegawai', 'Tanggal Kegiatan', 'Tujuan', 'Kegiatan', 'Kategori', 'Jumlah'].map((h) => (
                <th key={h} className="pb-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-white/5">
            {data.map((item) => (
              <tr key={item.id || String(item.No)} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                <td className="py-3 text-gray-700 dark:text-gray-300">{item.Nama_Pegawai}</td>
                <td className="py-3 text-gray-700 dark:text-gray-300">
                  {item.Pada_tanggal ? formatTanggalIndonesia(item.Pada_tanggal) : '-'}
                </td>
                <td className="py-3 text-gray-700 dark:text-gray-300">{item.Tujuan}</td>
                <td className="py-3">
                  <Badge variant={item.Kegiatan === 'Sertifikasi' ? 'success' : 'info'}>
                    {item.Kegiatan}
                  </Badge>
                </td>
                <td className="py-3">
                  <Badge variant={item.Kategori_DL === 'Pendek' ? 'neutral' : 'warning'}>
                    {item.Kategori_DL}
                  </Badge>
                </td>
                <td className="py-3 text-right text-gray-700 dark:text-gray-300">
                  {formatRupiah(item.Jumlah_Uang || 0)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
