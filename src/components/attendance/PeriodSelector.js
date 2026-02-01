import React from 'react';
import { Select } from '../common';

export default function PeriodSelector({
  selectedYear,
  setSelectedYear,
  selectedMonth,
  setSelectedMonth
}) {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  const nextMonth = selectedMonth === 12 ? 1 : selectedMonth + 1;

  return (
    <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-cyan-500"
          >
            {years.map(y => (
              <option key={y} value={y}>{y}年</option>
            ))}
          </select>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-cyan-500"
          >
            {months.map(m => (
              <option key={m} value={m}>{m}月</option>
            ))}
          </select>
          <span className="text-slate-400">
            （{selectedMonth}月16日〜{nextMonth}月15日）
          </span>
        </div>
      </div>
    </div>
  );
}
