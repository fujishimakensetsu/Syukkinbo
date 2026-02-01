import React from 'react';
import { Link } from 'react-router-dom';
import { calculateSummary } from '../../utils/attendanceCalc';
import { getCurrentFiscalYear, calculateUsedDays, calculateRemainingDays } from '../../utils/paidLeaveCalc';

export default function AttendanceSummary({ userId, attendanceData, paidLeaveSettings, allAttendanceData }) {
  const summary = calculateSummary(userId, attendanceData);

  // 年間有給の残日数計算
  const fiscalYear = getCurrentFiscalYear();
  const granted = paidLeaveSettings?.years?.[fiscalYear]?.granted
               || paidLeaveSettings?.granted
               || 0;

  let remaining = granted;
  if (allAttendanceData && granted > 0) {
    const used = calculateUsedDays(allAttendanceData, fiscalYear);
    remaining = calculateRemainingDays(granted, used.total);
  }

  const items = [
    { label: '出勤日数', value: summary.workDays, unit: '日', color: 'text-white' },
    { label: '有給取得（当月）', value: summary.paidLeaveDays, unit: '日', color: 'text-white' },
    { label: '定休日', value: summary.holidayDays, unit: '日', color: 'text-white' },
    { label: '総就業時間', value: summary.totalTime, unit: '', color: 'text-cyan-400' }
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {items.map((item, idx) => (
          <div
            key={idx}
            className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-4 border border-slate-700"
          >
            <p className="text-slate-400 text-xs mb-1">{item.label}</p>
            <p className={`text-2xl font-bold ${item.color}`}>
              {item.value}
              {item.unit && <span className="text-sm text-slate-400 ml-1">{item.unit}</span>}
            </p>
          </div>
        ))}
      </div>

      {/* 有給残日数 */}
      {granted > 0 && (
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-4 border border-slate-700 flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-xs mb-1">有給残日数（{fiscalYear}年度）</p>
            <p className={`text-2xl font-bold ${remaining <= 3 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {remaining}
              <span className="text-sm text-slate-400 ml-1">日</span>
              <span className="text-sm text-slate-500 ml-2">/ {granted}日</span>
            </p>
          </div>
          <Link
            to="/paid-leave"
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-xl text-sm transition-all"
          >
            詳細を見る
          </Link>
        </div>
      )}
    </div>
  );
}
