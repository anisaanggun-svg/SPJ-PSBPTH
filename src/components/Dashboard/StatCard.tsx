import type { ReactNode } from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: ReactNode;
  badge?: {
    text: string;
    variant: 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  };
  color: 'emerald' | 'blue' | 'amber' | 'purple' | 'cyan' | 'rose';
  isLoading?: boolean;
}

const colorMap = {
  emerald: {
    bg: 'bg-emerald-50 dark:bg-emerald-900/20',
    icon: 'text-emerald-600 dark:text-emerald-400',
    bar: 'bg-emerald-500',
  },
  blue: {
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    icon: 'text-blue-600 dark:text-blue-400',
    bar: 'bg-blue-500',
  },
  amber: {
    bg: 'bg-amber-50 dark:bg-amber-900/20',
    icon: 'text-amber-600 dark:text-amber-400',
    bar: 'bg-amber-500',
  },
  purple: {
    bg: 'bg-purple-50 dark:bg-purple-900/20',
    icon: 'text-purple-600 dark:text-purple-400',
    bar: 'bg-purple-500',
  },
  cyan: {
    bg: 'bg-cyan-50 dark:bg-cyan-900/20',
    icon: 'text-cyan-600 dark:text-cyan-400',
    bar: 'bg-cyan-500',
  },
  rose: {
    bg: 'bg-rose-50 dark:bg-rose-900/20',
    icon: 'text-rose-600 dark:text-rose-400',
    bar: 'bg-rose-500',
  },
};

export function StatCard({ label, value, icon, badge, color, isLoading }: StatCardProps) {
  const colors = colorMap[color];

  return (
    <div className="relative overflow-hidden rounded-xl border border-white/20 dark:border-white/10 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${colors.bg}`}>
            <span className={colors.icon}>{icon}</span>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</p>
            {isLoading ? (
              <div className="h-7 w-16 rounded bg-gray-200 dark:bg-gray-700" />
            ) : (
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
            )}
          </div>
        </div>
        {badge && (
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
              badge.variant === 'success'
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
                : badge.variant === 'warning'
                  ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                  : badge.variant === 'danger'
                    ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                    : badge.variant === 'info'
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700/30 dark:text-gray-400'
            }`}
          >
            {badge.text}
          </span>
        )}
      </div>
      <div className={`absolute bottom-0 left-0 right-0 h-1 ${colors.bar} opacity-60`} />
    </div>
  );
}
