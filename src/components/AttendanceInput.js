import React from 'react';
import { KUBUN_OPTIONS, generateDates, calculateSummary } from '../data/constants';
import { exportToExcel } from '../utils/excelExport';

export default function AttendanceInput({
  currentUser,
  selectedYear,
  setSelectedYear,
  selectedMonth,
  setSelectedMonth,
  attendanceData,
  updateAttendance
}) {
  const dates = generateDates(selectedYear, selectedMonth);
  const summary = calculateSummary(currentUser?.id, attendanceData);
  
  const handleExport = () => {
    exportToExcel(currentUser, selectedYear, selectedMonth, attendanceData, dates);
  };
  
  return (
    <div className="space-y-6">
      {/* 期間選択 */}
      <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-cyan-500"
            >
              {[2024, 2025, 2026].map(y => (
                <option key={y} value={y}>{y}年</option>
              ))}
            </select>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-cyan-500"
            >
              {[...Array(12)].map((_, i) => (
                <option key={i + 1} value={i + 1}>{i + 1}月</option>
              ))}
            </select>
            <span className="text-slate-400">
              （{selectedMonth}月16日〜{selectedMonth === 12 ? 1 : selectedMonth + 1}月15日）
            </span>
          </div>
          
          <div className="ml-auto flex items-center gap-4">
            <div className="text-slate-300 text-sm">
              所属: <span className="text-cyan-400 font-medium">{currentUser?.department}</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* 集計 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-4 border border-slate-700">
          <p className="text-slate-400 text-xs mb-1">出勤日数</p>
          <p className="text-2xl font-bold text-white">
            {summary.workDays}<span className="text-sm text-slate-400 ml-1">日</span>
          </p>
        </div>
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-4 border border-slate-700">
          <p className="text-slate-400 text-xs mb-1">有給取得</p>
          <p className="text-2xl font-bold text-white">
            {summary.paidLeaveDays}<span className="text-sm text-slate-400 ml-1">日</span>
          </p>
        </div>
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-4 border border-slate-700">
          <p className="text-slate-400 text-xs mb-1">定休日</p>
          <p className="text-2xl font-bold text-white">
            {summary.holidayDays}<span className="text-sm text-slate-400 ml-1">日</span>
          </p>
        </div>
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-4 border border-slate-700">
          <p className="text-slate-400 text-xs mb-1">総就業時間</p>
          <p className="text-2xl font-bold text-cyan-400">{summary.totalTime}</p>
        </div>
      </div>
      
      {/* 勤怠テーブル */}
      <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-700/50">
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">日付</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">曜日</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">区分</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">出社時刻</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">退社時刻</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">振替日</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {dates.map((d, idx) => {
                const dateKey = d.date.toISOString().split('T')[0];
                const dayData = attendanceData[currentUser?.id]?.[dateKey] || {};
                return (
                  <tr 
                    key={idx} 
                    className={`${d.isWeekend ? 'bg-slate-700/30' : ''} hover:bg-slate-700/50 transition-colors`}
                  >
                    <td className="px-4 py-3 text-sm text-white">
                      {d.date.getMonth() + 1}/{d.date.getDate()}
                    </td>
                    <td className={`px-4 py-3 text-sm ${
                      d.dayOfWeek === '日' ? 'text-red-400' : 
                      d.dayOfWeek === '土' ? 'text-cyan-400' : 'text-slate-300'
                    }`}>
                      {d.dayOfWeek}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={dayData.kubun || ''}
                        onChange={(e) => updateAttendance(dateKey, 'kubun', e.target.value)}
                        className="w-full px-3 py-1.5 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500"
                      >
                        {KUBUN_OPTIONS.map(k => (
                          <option key={k} value={k}>{k || '---'}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="time"
                        value={dayData.startTime || ''}
                        onChange={(e) => updateAttendance(dateKey, 'startTime', e.target.value)}
                        className="px-3 py-1.5 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500"
                        disabled={!dayData.kubun || ['定休日', '有給', '振休'].includes(dayData.kubun)}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="time"
                        value={dayData.endTime || ''}
                        onChange={(e) => updateAttendance(dateKey, 'endTime', e.target.value)}
                        className="px-3 py-1.5 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500"
                        disabled={!dayData.kubun || ['定休日', '有給', '振休'].includes(dayData.kubun)}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        value={dayData.furikae || ''}
                        onChange={(e) => updateAttendance(dateKey, 'furikae', e.target.value)}
                        placeholder="例: 10/20"
                        className="w-24 px-3 py-1.5 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500 placeholder-slate-500"
                        disabled={!['休日出勤', '振休'].includes(dayData.kubun)}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* 保存ボタン */}
      <div className="flex justify-end gap-4">
        <button className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl transition-all">
          一時保存（クラウド）
        </button>
        <button 
          onClick={handleExport}
          className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-xl hover:from-cyan-400 hover:to-blue-500 transition-all shadow-lg shadow-cyan-500/30"
        >
          提出（Excelダウンロード）
        </button>
      </div>
    </div>
  );
}
