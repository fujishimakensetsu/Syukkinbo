import React, { useState, useEffect } from 'react';
import { getCurrentFiscalYear } from '../../utils/paidLeaveCalc';
import { getFiscalYearRange, formatFullDate } from '../../utils/dateUtils';

export default function PaidLeaveSettings({
  currentSettings,
  onSave,
  saving
}) {
  const currentFiscalYear = getCurrentFiscalYear();
  const [selectedYear, setSelectedYear] = useState(currentFiscalYear);
  const [granted, setGranted] = useState(0);

  // 年度選択時に付与日数を読み込む
  useEffect(() => {
    const yearSettings = currentSettings?.paidLeave?.years?.[selectedYear];
    if (yearSettings?.granted !== undefined) {
      setGranted(yearSettings.granted);
    } else {
      // デフォルト値（設定がない場合）
      setGranted(currentSettings?.paidLeave?.granted || 0);
    }
  }, [selectedYear, currentSettings]);

  const handleSave = () => {
    onSave({
      paidLeave: {
        ...currentSettings?.paidLeave,
        years: {
          ...currentSettings?.paidLeave?.years,
          [selectedYear]: {
            granted
          }
        }
      }
    });
  };

  // 年度期間を取得
  const { start, end } = getFiscalYearRange(selectedYear);
  const periodText = `${formatFullDate(start)} 〜 ${formatFullDate(end)}`;

  // 年度の選択肢（現在年度の前後2年）
  const yearOptions = [];
  for (let y = currentFiscalYear - 2; y <= currentFiscalYear + 1; y++) {
    yearOptions.push(y);
  }

  return (
    <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700">
      <h3 className="text-lg font-bold text-white mb-4">有給休暇設定</h3>

      <div className="space-y-4">
        {/* 年度選択 */}
        <div>
          <label className="block text-slate-400 text-sm mb-2">年度</label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-cyan-500"
          >
            {yearOptions.map(y => (
              <option key={y} value={y}>{y}年度</option>
            ))}
          </select>
          <p className="text-slate-500 text-xs mt-1">{periodText}</p>
        </div>

        {/* 付与日数 */}
        <div>
          <label className="block text-slate-400 text-sm mb-2">付与日数</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={granted}
              onChange={(e) => setGranted(Math.max(0, parseInt(e.target.value) || 0))}
              min="0"
              max="40"
              step="0.5"
              className="w-24 px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-cyan-500"
            />
            <span className="text-slate-300">日</span>
          </div>
        </div>

        {/* プリセットボタン */}
        <div>
          <label className="block text-slate-400 text-sm mb-2">よく使う日数</label>
          <div className="flex flex-wrap gap-2">
            {[10, 11, 12, 14, 16, 18, 20].map(days => (
              <button
                key={days}
                onClick={() => setGranted(days)}
                className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                  granted === days
                    ? 'bg-cyan-500 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                {days}日
              </button>
            ))}
          </div>
        </div>

        {/* 保存ボタン */}
        <div className="flex justify-end pt-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-white rounded-xl transition-all disabled:opacity-50"
          >
            {saving ? '保存中...' : '保存'}
          </button>
        </div>
      </div>
    </div>
  );
}
