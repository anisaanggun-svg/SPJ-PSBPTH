import { MapPin, ArrowUpRight } from 'lucide-react';

interface TopTujuanItem {
  kota: string;
  count: number;
}

interface TopTujuanProps {
  data?: TopTujuanItem[];
}

export function TopTujuan({ data }: TopTujuanProps) {
  const items: TopTujuanItem[] = data || [
    { kota: 'Surabaya', count: 24 },
    { kota: 'Malang', count: 18 },
    { kota: 'Kediri', count: 12 },
    { kota: 'Blitar', count: 9 },
    { kota: 'Tulungagung', count: 6 },
  ];
  const maxCount = Math.max(...items.map((d) => d.count));

  return (
    <div className="rounded-xl border border-white/20 dark:border-white/10 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm p-5">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Top Tujuan Perjalanan</h3>
      <div className="space-y-3">
        {items.map((item, index) => (
          <div key={item.kota}>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-xs font-bold text-emerald-700 dark:text-emerald-400">{index + 1}</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{item.kota}</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                <MapPin className="h-3 w-3" />
                <span className="font-semibold">{item.count}x</span>
              </div>
            </div>
            <div className="h-2 w-full rounded-full bg-gray-100 dark:bg-gray-700/50">
              <div className="h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 transition-all duration-500" style={{ width: `${(item.count / maxCount) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>
      <button className="mt-4 flex w-full items-center justify-center gap-1 rounded-lg py-2 text-xs font-medium text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors">
        Lihat Semua <ArrowUpRight className="h-3 w-3" />
      </button>
    </div>
  );
}
