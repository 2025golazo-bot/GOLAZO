'use client';

import { useState } from 'react';

type Measurement = {
  date: string;
  weight: number;
  fat: number;
  muscle: number;
};

type Metric = 'weight' | 'fat' | 'muscle';

const METRICS = [
  { key: 'weight', label: '体重', unit: 'kg' },
  { key: 'fat', label: '体脂肪率', unit: '%' },
  { key: 'muscle', label: '筋肉量', unit: 'kg' },
] as const;

export default function MeasurementTrendChart({
  measurements,
}: {
  measurements: Measurement[];
}) {
  const [metric, setMetric] = useState<Metric>('weight');

  const selected = METRICS.find(item => item.key === metric)!;

  const points = measurements
    .filter(item =>
      /^\d{4}-\d{2}-\d{2}$/.test(item.date) &&
      Number.isFinite(item[metric]) &&
      item[metric] > 0
    )
    .sort((a, b) => a.date.localeCompare(b.date));

  const values = points.map(item => item[metric]);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const padding = Math.max((max - min) * 0.15, 0.5);
  const low = min - padding;
  const high = max + padding;

  const coordinates = points.map((item, index) => {
    const x = points.length === 1
      ? 160
      : 30 + (index / (points.length - 1)) * 260;
    const y = 125 - ((item[metric] - low) / (high - low)) * 100;

    return { x, y, item };
  });

  return (
    <div className="w-full max-w-[350px] rounded-xl border border-slate-200 bg-white p-3">
      <h4 className="mb-3 text-xs font-bold text-slate-700">
        📈 測定結果の推移
      </h4>

      <div className="mb-2 flex gap-1">
        {METRICS.map(item => (
          <button
            key={item.key}
            type="button"
            onClick={() => setMetric(item.key)}
            className={`flex-1 rounded-md px-2 py-1.5 text-[11px] font-bold ${
              metric === item.key
                ? 'bg-[#5e9bc4] text-white'
                : 'bg-slate-100 text-slate-600'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {points.length === 0 ? (
        <div className="flex h-[170px] items-center justify-center text-xs text-slate-400">
          測定データがありません
        </div>
      ) : (
        <svg
          viewBox="0 0 320 170"
          className="h-[170px] w-full"
          role="img"
          aria-label={`${selected.label}の測定推移`}
        >
          {[25, 75, 125].map(y => (
            <line
              key={y}
              x1="30"
              y1={y}
              x2="290"
              y2={y}
              stroke="#e2e8f0"
              strokeDasharray="3 3"
            />
          ))}

          {coordinates.length > 1 && (
            <polyline
              points={coordinates.map(p => `${p.x},${p.y}`).join(' ')}
              fill="none"
              stroke="#5e9bc4"
              strokeWidth="2.5"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          )}

          {coordinates.map(({ x, y, item }) => (
            <g key={item.date}>
              <circle cx={x} cy={y} r="4" fill="#5e9bc4" />
              <text
                x={x}
                y={Math.max(12, y - 10)}
                textAnchor="middle"
                fontSize="10"
                fill="#334155"
              >
                {item[metric]}{selected.unit}
              </text>
              <text
                x={x}
                y="155"
                textAnchor="middle"
                fontSize="9"
                fill="#64748b"
              >
                {item.date.slice(5).replace('-', '/')}
              </text>
            </g>
          ))}
        </svg>
      )}
    </div>
  );
}
