import React, { useState, useEffect } from 'react';
import { getCurrentFiscalYear, getPaidLeaveSummary, getMonthlyPaidLeaveUsage } from '../../utils/paidLeaveCalc';
import { getFiscalYearRange, formatFullDate } from '../../utils/dateUtils';

export default function YearlySummary({
  attendanceData,
  paidLeaveSettings,
  onYearChange
}) {
  const currentFiscalYear = getCurrentFiscalYear();
  const [selectedYear, setSelectedYear] = useState(currentFiscalYear);
  const [summary, setSummary] = useState(null);
  const [monthlyUsage, setMonthlyUsage] = useState([]);

  // サマリー計算
  useEffect(() => {
    if (attendanceData) {
      const granted = paidLeaveSettings?.years?.[selectedYear]?.granted
                   || paidLeaveSettings?.granted
                   || 0;
      const summaryData = getPaidLeaveSummary(attendanceData, granted, selectedYear);
      setSummary(summaryData);

      const monthly = getMonthlyPaidLeaveUsage(attendanceData, selectedYear);
      setMonthlyUsage(monthly);
    }
  }, [attendanceData, paidLeaveSettings, selectedYear]);

  // 年度変更時
  const handleYearChange = (year) => {
    setSelectedYear(year);
    if (onYearChange) {
      onYearChange(year);
    }
  };

  // 年度期間
  const { start, end } = getFiscalYearRange(selectedYear);
  const periodText = `${formatFullDate(start)} 〜 ${formatFullDate(end)}`;

  // 年度の選択肢
  const yearOptions = [];
  for (let y = currentFiscalYear - 2; y <= currentFiscalYear + 1; y++) {
    yearOptions.push(y);
  }

  // 月名フォーマット
  const formatMonth = (monthKey) => {
    const [year, month] = monthKey.split('-');
    return `${parseInt(month)}月`;
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700">
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-white">有給休暇 年間サマリー</h3>
        <select
          value={selectedYear}
          onChange={(e) => handleYearChange(Number(e.target.value))}
          className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-xl text-white text-sm focus:outline-none focus:border-cyan-500"
        >
          {yearOptions.map(y => (
            <option key={y} value={y}>{y}年度</option>
          ))}
        </select>
      </div>

      {/* 期間表示 */}
      <p className="text-slate-400 text-sm mb-6">{periodText}</p>

      {/* サマリーカード */}
      {summary && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          {/* 付与日数 */}
          <div className="bg-slate-700/50 rounded-xl p-4 text-center">
            <p className="text-slate-400 text-xs mb-1">付与日数</p>
            <p className="text-3xl font-bold text-white">{summary.granted}</p>
            <p className="text-slate-500 text-xs">日</p>
          </div>

          {/* 取得日数 */}
          <div className="bg-slate-700/50 rounded-xl p-4 text-center relative">
            <p className="text-slate-400 text-xs mb-1">取得日数</p>
            <p className="text-3xl font-bold text-cyan-400">{summary.used}</p>
            <p className="text-slate-500 text-xs">日</p>
            {/* マイナス記号 */}
            <div className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 text-slate-500 text-2xl">−</div>
          </div>

          {/* 残日数 */}
          <div className="bg-slate-700/50 rounded-xl p-4 text-center relative">
            <p className="text-slate-400 text-xs mb-1">残日数</p>
            <p className={`text-3xl font-bold ${summary.remaining <= 3 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {summary.remaining}
            </p>
            <p className="text-slate-500 text-xs">日</p>
            {/* イコール記号 */}
            <div className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 text-slate-500 text-2xl">=</div>
          </div>
        </div>
      )}

      {/* 取得内訳 */}
      {summary && summary.used > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-slate-400 mb-3">取得内訳</h4>
          <div className="flex flex-wrap gap-4">
            {summary.breakdown.yukyu > 0 && (
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-cyan-500"></span>
                <span className="text-slate-300 text-sm">有給: {summary.breakdown.yukyu}日</span>
              </div>
            )}
            {summary.breakdown.amRest > 0 && (
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                <span className="text-slate-300 text-sm">午前休: {summary.breakdown.amRest}回（{summary.breakdown.amRest * 0.5}日）</span>
              </div>
            )}
            {summary.breakdown.pmRest > 0 && (
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-purple-500"></span>
                <span className="text-slate-300 text-sm">午後休: {summary.breakdown.pmRest}回（{summary.breakdown.pmRest * 0.5}日）</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 月別履歴 */}
      {monthlyUsage.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-slate-400 mb-3">月別取得履歴</h4>
          <div className="space-y-2">
            {monthlyUsage.map(item => (
              <div key={item.month} className="flex items-center justify-between bg-slate-700/30 rounded-lg px-4 py-2">
                <span className="text-white text-sm">{formatMonth(item.month)}</span>
                <div className="flex items-center gap-4">
                  {item.yukyu > 0 && (
                    <span className="text-slate-400 text-sm">有給 {item.yukyu}日</span>
                  )}
                  {item.amRest > 0 && (
                    <span className="text-slate-400 text-sm">午前休 {item.amRest}回</span>
                  )}
                  {item.pmRest > 0 && (
                    <span className="text-slate-400 text-sm">午後休 {item.pmRest}回</span>
                  )}
                  <span className="text-cyan-400 font-medium">{item.total}日</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* データなしの場合 */}
      {summary && summary.used === 0 && (
        <div className="text-center py-8">
          <p className="text-slate-500">この年度の有給取得履歴はありません</p>
        </div>
      )}
    </div>
  );
}
