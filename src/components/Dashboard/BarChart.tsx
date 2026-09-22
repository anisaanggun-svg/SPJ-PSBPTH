interface BarChartData {
  month: string;
  value: number;
}

interface BarChartProps {
  data: BarChartData[];
  title?: string;
}

export function BarChart({ data, title = 'Tren Perjalanan Dinas per Bulan' }: BarChartProps) {
  const maxValue = Math.max(...data.map((d) => d.value), 1);
  const chartHeight = 180;
  const barWidth = 24;
  const gap = 12;
  const chartWidth = data.length * (barWidth + gap);

  return (
    <div className="rounded-xl border border-white/20 dark:border-white/10 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm p-5">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">{title}</h3>
      <div className="w-full overflow-x-auto">
        <svg
          width={chartWidth}
          height={chartHeight + 32}
          viewBox={`0 0 ${chartWidth} ${chartHeight + 32}`}
          className="mx-auto"
        >
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
            const y = chartHeight - chartHeight * ratio;
            return (
              <line
                key={i}
                x1={0}
                y1={y}
                x2={chartWidth}
                y2={y}
                stroke="currentColor"
                strokeWidth={1}
                className="text-gray-200 dark:text-gray-700"
                strokeDasharray="4 4"
              />
            );
          })}
          {data.map((item, index) => {
            const barHeight = (item.value / maxValue) * chartHeight;
            const x = index * (barWidth + gap);
            const y = chartHeight - barHeight;
            return (
              <g key={item.month}>
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  rx={4}
                  className="fill-emerald-500 dark:fill-emerald-400"
                  opacity={0.85}
                />
                <text
                  x={x + barWidth / 2}
                  y={y - 6}
                  textAnchor="middle"
                  className="fill-gray-600 dark:fill-gray-400"
                  fontSize={10}
                  fontWeight={600}
                >
                  {item.value}
                </text>
                <text
                  x={x + barWidth / 2}
                  y={chartHeight + 18}
                  textAnchor="middle"
                  className="fill-gray-500 dark:fill-gray-500"
                  fontSize={10}
                >
                  {item.month}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
