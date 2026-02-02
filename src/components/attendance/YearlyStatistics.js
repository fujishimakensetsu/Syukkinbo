import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getYearlyStatistics, getMonthlyBreakdown } from '../../services/statisticsService';
import { getFiscalYear } from '../../utils/attendanceCalc';
import { Loading } from '../common';

export default function YearlyStatistics({ userId = null }) {
  const { userProfile } = useAuth();
  const [fiscalYear, setFiscalYear] = useState(() => getFiscalYear(new Date()));
  const [statistics, setStatistics] = useState(null);
  const [monthlyBreakdown, setMonthlyBreakdown] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showMonthly, setShowMonthly] = useState(false);

  const targetUserId = userId || userProfile?.uid;

  // 年度選択肢を生成（過去3年 + 現在 + 来年度）
  const currentFiscalYear = getFiscalYear(new Date());
  const yearOptions = [];
  for (let y = currentFiscalYear - 3; y <= currentFiscalYear + 1; y++) {
    yearOptions.push(y);
  }

  useEffect(() => {
    if (targetUserId) {
      loadStatistics();
    }
  }, [targetUserId, fiscalYear]);

  const loadStatistics = async () => {
    setLoading(true);
    setError(null);
    try {
      const [stats, breakdown] = await Promise.all([
        getYearlyStatistics(targetUserId, fiscalYear),
        getMonthlyBreakdown(targetUserId, fiscalYear)
      ]);
      setStatistics(stats);
      setMonthlyBreakdown(breakdown);
    } catch (err) {
      console.error('Failed to load statistics:', err);
      setError('統計の読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading message="統計を計算中..." />;
  }

  if (error) {
    return (
      <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 text-red-300">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 年度選択 */}
      <div className="flex items-center gap-4">
        <label className="text-sm text-gray-400">年度:</label>
        <select
          value={fiscalYear}
          onChange={(e) => setFiscalYear(parseInt(e.target.value))}
          className="px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
        >
          {yearOptions.map(year => (
            <option key={year} value={year}>
              {year}年度（{year}/4/16〜{year + 1}/4/15）
            </option>
          ))}
        </select>
      </div>

      {statistics && (
        <>
          {/* 期間表示 */}
          <div className="text-sm text-gray-400">
            対象期間: {statistics.periodStart} 〜 {statistics.periodEnd}
          </div>

          {/* 主要統計 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              title="出勤日数"
              value={`${statistics.workDays}日`}
              color="cyan"
            />
            <StatCard
              title="休日出勤日数"
              value={`${statistics.holidayWorkDays}日`}
              color="orange"
            />
            <StatCard
              title="振休取得日数"
              value={`${statistics.transferDays}日`}
              color="purple"
            />
            <StatCard
              title="有給取得日数"
              value={`${statistics.paidLeaveDays}日`}
              color="green"
            />
          </div>

          {/* 半休統計 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              title="午前休取得日数"
              value={`${statistics.amRestDays}日`}
              color="blue"
            />
            <StatCard
              title="午後休取得日数"
              value={`${statistics.pmRestDays}日`}
              color="blue"
            />
          </div>

          {/* 就業時間・残業時間 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
              <p className="text-sm text-gray-400 mb-2">総就業時間</p>
              <p className="text-3xl font-bold text-white">{statistics.totalTime}</p>
              <p className="text-xs text-gray-500 mt-1">
                ({statistics.totalMinutes}分)
              </p>
            </div>
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
              <p className="text-sm text-gray-400 mb-2">年間残業時間</p>
              <p className="text-3xl font-bold text-amber-400">{statistics.overtimeTime}</p>
              <p className="text-xs text-gray-500 mt-1">
                ({statistics.overtimeMinutes}分)
              </p>
            </div>
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
              <p className="text-sm text-gray-400 mb-2">月あたり平均残業時間</p>
              <p className="text-3xl font-bold text-amber-400">{statistics.avgMonthlyOvertimeTime}</p>
              <p className="text-xs text-gray-500 mt-1">
                ({statistics.monthCount}ヶ月の平均)
              </p>
            </div>
          </div>

          {/* 残業計算基準の説明 */}
          <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700/50">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-sm text-gray-400">
                <p className="font-medium text-gray-300 mb-1">残業時間の計算基準</p>
                <p>標準勤務時間: 8:45〜18:00（休憩1時間）= 8時間15分（495分）</p>
                <p>残業時間 = 実働時間 - 495分</p>
              </div>
            </div>
          </div>

          {/* 月別内訳 */}
          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-white">月別内訳</h3>
              <button
                onClick={() => setShowMonthly(!showMonthly)}
                className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                {showMonthly ? '閉じる' : '詳細を表示'}
              </button>
            </div>

            {showMonthly && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-gray-400 border-b border-gray-700">
                      <th className="text-left py-2 px-3">年月</th>
                      <th className="text-right py-2 px-3">出勤</th>
                      <th className="text-right py-2 px-3">有給</th>
                      <th className="text-right py-2 px-3">振休</th>
                      <th className="text-right py-2 px-3">就業時間</th>
                      <th className="text-right py-2 px-3">残業</th>
                    </tr>
                  </thead>
                  <tbody>
                    {monthlyBreakdown.map(month => (
                      <tr key={month.yearMonth} className="border-b border-gray-700/50">
                        <td className="py-2 px-3 text-white">{month.yearMonth}</td>
                        <td className="py-2 px-3 text-right text-gray-300">{month.workDays}日</td>
                        <td className="py-2 px-3 text-right text-green-400">{month.paidLeaveDays}日</td>
                        <td className="py-2 px-3 text-right text-purple-400">{month.transferDays}日</td>
                        <td className="py-2 px-3 text-right text-gray-300">{month.totalTime}</td>
                        <td className="py-2 px-3 text-right text-amber-400">{month.overtimeTime}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {monthlyBreakdown.length === 0 && (
                  <div className="text-center text-gray-500 py-4">
                    データがありません
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}

      {!statistics && (
        <div className="text-center text-gray-500 py-8">
          データがありません
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value, color }) {
  const colorClasses = {
    cyan: 'text-cyan-400',
    orange: 'text-orange-400',
    purple: 'text-purple-400',
    green: 'text-green-400',
    blue: 'text-blue-400',
    amber: 'text-amber-400'
  };

  return (
    <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
      <p className="text-sm text-gray-400 mb-1">{title}</p>
      <p className={`text-2xl font-bold ${colorClasses[color] || 'text-white'}`}>
        {value}
      </p>
    </div>
  );
}
