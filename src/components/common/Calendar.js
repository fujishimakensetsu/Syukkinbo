import React, { useState } from 'react';
import { getDaysInMonth, getFirstDayOfMonth, formatDateKey, DAY_OF_WEEK } from '../../utils/dateUtils';
import { DAY_OF_WEEK as DAYS } from '../../utils/constants';

export default function Calendar({
  selectedDate,
  onSelect,
  onClose,
  minDate,
  maxDate
}) {
  const today = new Date();
  const initialDate = selectedDate || today;

  const [viewYear, setViewYear] = useState(initialDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(initialDate.getMonth() + 1);

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDayOfMonth = getFirstDayOfMonth(viewYear, viewMonth);

  // 前月へ
  const prevMonth = () => {
    if (viewMonth === 1) {
      setViewYear(viewYear - 1);
      setViewMonth(12);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  // 翌月へ
  const nextMonth = () => {
    if (viewMonth === 12) {
      setViewYear(viewYear + 1);
      setViewMonth(1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  // 年変更
  const handleYearChange = (e) => {
    setViewYear(Number(e.target.value));
  };

  // 日付が選択可能かチェック
  const isDateSelectable = (year, month, day) => {
    const date = new Date(year, month - 1, day);
    if (minDate && date < minDate) return false;
    if (maxDate && date > maxDate) return false;
    return true;
  };

  // 日付が選択中かチェック
  const isSelected = (year, month, day) => {
    if (!selectedDate) return false;
    return selectedDate.getFullYear() === year &&
           selectedDate.getMonth() === month - 1 &&
           selectedDate.getDate() === day;
  };

  // 今日かチェック
  const isToday = (year, month, day) => {
    return today.getFullYear() === year &&
           today.getMonth() === month - 1 &&
           today.getDate() === day;
  };

  // 日付クリック
  const handleDateClick = (day) => {
    if (!isDateSelectable(viewYear, viewMonth, day)) return;
    const date = new Date(viewYear, viewMonth - 1, day);
    onSelect(date);
  };

  // カレンダーグリッドを生成
  const renderDays = () => {
    const days = [];

    // 空白セル（月の最初の曜日まで）
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="h-10" />);
    }

    // 日付セル
    for (let day = 1; day <= daysInMonth; day++) {
      const selectable = isDateSelectable(viewYear, viewMonth, day);
      const selected = isSelected(viewYear, viewMonth, day);
      const todayDate = isToday(viewYear, viewMonth, day);
      const dayOfWeek = (firstDayOfMonth + day - 1) % 7;
      const isSunday = dayOfWeek === 0;
      const isSaturday = dayOfWeek === 6;

      days.push(
        <button
          key={day}
          onClick={() => handleDateClick(day)}
          disabled={!selectable}
          className={`
            h-10 w-10 rounded-lg text-sm font-medium transition-all
            ${selected
              ? 'bg-cyan-500 text-white'
              : todayDate
                ? 'bg-slate-600 text-white'
                : selectable
                  ? 'hover:bg-slate-700 text-slate-300'
                  : 'text-slate-600 cursor-not-allowed'
            }
            ${isSunday && !selected ? 'text-red-400' : ''}
            ${isSaturday && !selected ? 'text-cyan-400' : ''}
          `}
        >
          {day}
        </button>
      );
    }

    return days;
  };

  // 年の選択肢（現在の年の前後5年）
  const yearOptions = [];
  for (let y = today.getFullYear() - 5; y <= today.getFullYear() + 5; y++) {
    yearOptions.push(y);
  }

  return (
    <div className="bg-slate-800 rounded-2xl border border-slate-700 p-4 shadow-xl w-80">
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={prevMonth}
          className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-slate-400 hover:text-white"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div className="flex items-center gap-2">
          <select
            value={viewYear}
            onChange={handleYearChange}
            className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-cyan-500"
          >
            {yearOptions.map(y => (
              <option key={y} value={y}>{y}年</option>
            ))}
          </select>
          <span className="text-white font-medium">{viewMonth}月</span>
        </div>

        <button
          onClick={nextMonth}
          className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-slate-400 hover:text-white"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* 曜日ヘッダー */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {DAYS.map((day, idx) => (
          <div
            key={day}
            className={`
              h-8 flex items-center justify-center text-xs font-medium
              ${idx === 0 ? 'text-red-400' : idx === 6 ? 'text-cyan-400' : 'text-slate-400'}
            `}
          >
            {day}
          </div>
        ))}
      </div>

      {/* 日付グリッド */}
      <div className="grid grid-cols-7 gap-1">
        {renderDays()}
      </div>

      {/* 選択中の日付表示 */}
      {selectedDate && (
        <div className="mt-4 pt-4 border-t border-slate-700">
          <p className="text-center text-slate-300 text-sm">
            選択: {selectedDate.getFullYear()}年{selectedDate.getMonth() + 1}月{selectedDate.getDate()}日
          </p>
        </div>
      )}

      {/* ボタン */}
      <div className="mt-4 flex gap-2">
        <button
          onClick={onClose}
          className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl transition-all text-sm"
        >
          キャンセル
        </button>
        <button
          onClick={() => onSelect(selectedDate)}
          disabled={!selectedDate}
          className="flex-1 px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-white rounded-xl transition-all text-sm disabled:opacity-50"
        >
          確定
        </button>
      </div>
    </div>
  );
}
