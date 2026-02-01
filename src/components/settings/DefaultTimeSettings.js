import React, { useState, useEffect } from 'react';
import { Button } from '../common';
import { TIME_PRESETS, DEFAULT_SETTINGS } from '../../utils/constants';

export default function DefaultTimeSettings({ currentSettings, onSave, saving }) {
  const [startTime, setStartTime] = useState(
    currentSettings?.defaultStartTime || DEFAULT_SETTINGS.defaultStartTime
  );
  const [endTime, setEndTime] = useState(
    currentSettings?.defaultEndTime || DEFAULT_SETTINGS.defaultEndTime
  );
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setStartTime(currentSettings?.defaultStartTime || DEFAULT_SETTINGS.defaultStartTime);
    setEndTime(currentSettings?.defaultEndTime || DEFAULT_SETTINGS.defaultEndTime);
    setHasChanges(false);
  }, [currentSettings]);

  const handleStartTimeChange = (time) => {
    setStartTime(time);
    setHasChanges(true);
  };

  const handleEndTimeChange = (time) => {
    setEndTime(time);
    setHasChanges(true);
  };

  const handleSave = () => {
    onSave({
      defaultStartTime: startTime,
      defaultEndTime: endTime
    });
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700">
      <h3 className="text-lg font-bold text-white mb-4">デフォルト出退勤時間</h3>
      <p className="text-slate-400 text-sm mb-6">
        区分を「出勤」に設定した際に自動入力される時間です。個別に変更することも可能です。
      </p>

      <div className="space-y-6">
        {/* 出社時間 */}
        <div>
          <label className="block text-slate-300 text-sm font-medium mb-3">出社時間</label>
          <div className="flex flex-wrap items-center gap-3">
            <input
              type="time"
              value={startTime}
              onChange={(e) => handleStartTimeChange(e.target.value)}
              className="px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-cyan-500"
            />
            <div className="flex flex-wrap gap-2">
              {TIME_PRESETS.start.map(time => (
                <button
                  key={time}
                  onClick={() => handleStartTimeChange(time)}
                  className={`
                    px-3 py-1.5 rounded-lg text-sm transition-all
                    ${startTime === time
                      ? 'bg-cyan-500 text-white'
                      : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                    }
                  `}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 退社時間 */}
        <div>
          <label className="block text-slate-300 text-sm font-medium mb-3">退社時間</label>
          <div className="flex flex-wrap items-center gap-3">
            <input
              type="time"
              value={endTime}
              onChange={(e) => handleEndTimeChange(e.target.value)}
              className="px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-cyan-500"
            />
            <div className="flex flex-wrap gap-2">
              {TIME_PRESETS.end.map(time => (
                <button
                  key={time}
                  onClick={() => handleEndTimeChange(time)}
                  className={`
                    px-3 py-1.5 rounded-lg text-sm transition-all
                    ${endTime === time
                      ? 'bg-cyan-500 text-white'
                      : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                    }
                  `}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end mt-6">
        <Button
          onClick={handleSave}
          disabled={!hasChanges}
          loading={saving}
        >
          保存
        </Button>
      </div>
    </div>
  );
}
