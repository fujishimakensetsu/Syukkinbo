import React from 'react';
import { generateDates } from '../data/constants';

export default function AttendanceDetail({
  users,
  selectedEmployee,
  selectedYear,
  selectedMonth,
  attendanceData,
  onBack
}) {
  const dates = generateDates(selectedYear, selectedMonth);
  const employee = users.find(u => u.id === selectedEmployee);
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl transition-all"
        >
          ← 戻る
        </button>
        <h2 className="text-xl font-bold text-white">
          {employee?.name} の勤怠詳細
        </h2>
      </div>
      
      <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-700/50">
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">日付</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">曜日</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">区分</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">出社</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">退社</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">振替日</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {dates.map((d, idx) => {
                const dateKey = d.date.toISOString().split('T')[0];
                const dayData = attendanceData[selectedEmployee]?.[dateKey] || {};
                return (
                  <tr key={idx} className={`${d.isWeekend ? 'bg-slate-700/30' : ''}`}>
                    <td className="px-4 py-3 text-sm text-white">
                      {d.date.getMonth() + 1}/{d.date.getDate()}
                    </td>
                    <td className={`px-4 py-3 text-sm ${
                      d.dayOfWeek === '日' ? 'text-red-400' : 
                      d.dayOfWeek === '土' ? 'text-cyan-400' : 'text-slate-300'
                    }`}>
                      {d.dayOfWeek}
                    </td>
                    <td className="px-4 py-3 text-sm text-white">{dayData.kubun || '-'}</td>
                    <td className="px-4 py-3 text-sm text-slate-300">{dayData.startTime || '-'}</td>
                    <td className="px-4 py-3 text-sm text-slate-300">{dayData.endTime || '-'}</td>
                    <td className="px-4 py-3 text-sm text-slate-300">{dayData.furikae || '-'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
