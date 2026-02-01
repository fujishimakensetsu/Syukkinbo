import React, { useState, useEffect } from 'react';
import { Button } from '../common';
import { DAY_OF_WEEK } from '../../utils/constants';

export default function FixedHolidaySettings({ currentSettings, onSave, saving }) {
  const [selectedDays, setSelectedDays] = useState(currentSettings?.fixedHolidays || []);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setSelectedDays(currentSettings?.fixedHolidays || []);
    setHasChanges(false);
  }, [currentSettings]);

  const handleToggle = (dayIndex) => {
    setSelectedDays(prev => {
      if (prev.includes(dayIndex)) {
        return prev.filter(d => d !== dayIndex);
      } else {
        return [...prev, dayIndex].sort();
      }
    });
    setHasChanges(true);
  };

  const handleSave = () => {
    onSave({ fixedHolidays: selectedDays });
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700">
      <h3 className="text-lg font-bold text-white mb-4">固定休日の設定</h3>
      <p className="text-slate-400 text-sm mb-6">
        毎週の固定休日を選択してください。選択した曜日は勤怠入力時に自動で「定休日」が設定されます。
      </p>

      <div className="grid grid-cols-7 gap-2 mb-6">
        {DAY_OF_WEEK.map((day, idx) => (
          <button
            key={idx}
            onClick={() => handleToggle(idx)}
            className={`
              py-3 rounded-xl text-sm font-medium transition-all
              ${selectedDays.includes(idx)
                ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/30'
                : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
              }
              ${idx === 0 ? 'text-red-400' : ''}
              ${idx === 6 ? 'text-cyan-400' : ''}
            `}
          >
            {day}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <p className="text-slate-400 text-sm">
          選択中: {selectedDays.length > 0
            ? selectedDays.map(d => DAY_OF_WEEK[d]).join('、')
            : 'なし'
          }
        </p>
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
