import React, { useState } from 'react';
import { TIME_PRESETS } from '../../utils/constants';

export default function QuickTimeSettings({
  defaultStartTime,
  defaultEndTime,
  onSaveDefaults
}) {
  const [startTime, setStartTime] = useState(defaultStartTime);
  const [endTime, setEndTime] = useState(defaultEndTime);
  const [saveAsDefault, setSaveAsDefault] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleApply = () => {
    if (saveAsDefault) {
      onSaveDefaults({
        defaultStartTime: startTime,
        defaultEndTime: endTime
      });
    }
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-slate-700/50 hover:bg-slate-700 rounded-xl text-sm text-slate-300 transition-all"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        デフォルト: {defaultStartTime} 〜 {defaultEndTime}
        <svg className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 p-4 bg-slate-800 rounded-xl border border-slate-700 shadow-xl z-10 min-w-[320px]">
          <div className="space-y-4">
            {/* 出社時間 */}
            <div>
              <label className="block text-slate-400 text-xs mb-2">出社時間</label>
              <div className="flex flex-wrap gap-2">
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="px-3 py-1.5 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500"
                />
                {TIME_PRESETS.start.slice(0, 4).map(time => (
                  <button
                    key={time}
                    onClick={() => setStartTime(time)}
                    className={`px-2 py-1 rounded text-xs ${
                      startTime === time
                        ? 'bg-cyan-500 text-white'
                        : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>

            {/* 退社時間 */}
            <div>
              <label className="block text-slate-400 text-xs mb-2">退社時間</label>
              <div className="flex flex-wrap gap-2">
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="px-3 py-1.5 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500"
                />
                {TIME_PRESETS.end.slice(0, 4).map(time => (
                  <button
                    key={time}
                    onClick={() => setEndTime(time)}
                    className={`px-2 py-1 rounded text-xs ${
                      endTime === time
                        ? 'bg-cyan-500 text-white'
                        : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>

            {/* 保存オプション */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={saveAsDefault}
                onChange={(e) => setSaveAsDefault(e.target.checked)}
                className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-cyan-500 focus:ring-cyan-500"
              />
              <span className="text-slate-300 text-sm">この時間をデフォルトに保存</span>
            </label>

            {/* ボタン */}
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsOpen(false)}
                className="px-3 py-1.5 text-slate-400 hover:text-white text-sm transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={handleApply}
                className="px-4 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-white rounded-lg text-sm transition-colors"
              >
                適用
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
