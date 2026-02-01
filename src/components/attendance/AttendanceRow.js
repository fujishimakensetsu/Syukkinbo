import React from 'react';
import { KUBUN_OPTIONS } from '../../utils/constants';

export default function AttendanceRow({
  dateInfo,
  dayData,
  onUpdate,
  onOpenCalendar,
  onKubunChange,
  onClearTransfer,
  disabled = false
}) {
  const { date, dateKey, dayOfWeek, isWeekend } = dateInfo;

  const handleChange = (field) => (e) => {
    onUpdate(dateKey, field, e.target.value);
  };

  const handleKubunChange = (e) => {
    const newKubun = e.target.value;
    // 区分変更時は親コンポーネントに通知（自動入力処理のため）
    if (onKubunChange) {
      onKubunChange(dateKey, newKubun, dayData);
    } else {
      onUpdate(dateKey, 'kubun', newKubun);
    }
  };

  // 区分によって入力可否を制御
  const isTimeDisabled = !dayData.kubun || ['定休日', '有給', '振休'].includes(dayData.kubun);
  const isFurikaeEnabled = ['休日出勤', '振休'].includes(dayData.kubun);

  return (
    <tr className={`${isWeekend ? 'bg-slate-700/30' : ''} hover:bg-slate-700/50 transition-colors`}>
      {/* 日付 */}
      <td className="px-4 py-3 text-sm text-white">
        {date.getMonth() + 1}/{date.getDate()}
      </td>

      {/* 曜日 */}
      <td className={`px-4 py-3 text-sm ${
        dayOfWeek === '日' ? 'text-red-400' :
        dayOfWeek === '土' ? 'text-cyan-400' : 'text-slate-300'
      }`}>
        {dayOfWeek}
      </td>

      {/* 区分 */}
      <td className="px-4 py-3">
        <select
          value={dayData.kubun || ''}
          onChange={handleKubunChange}
          disabled={disabled}
          className="w-full px-3 py-1.5 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500 disabled:opacity-50"
        >
          {KUBUN_OPTIONS.map(k => (
            <option key={k} value={k}>{k || '---'}</option>
          ))}
        </select>
      </td>

      {/* 出社時刻 */}
      <td className="px-4 py-3">
        <input
          type="time"
          value={dayData.startTime || ''}
          onChange={handleChange('startTime')}
          disabled={disabled || isTimeDisabled}
          className="px-3 py-1.5 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500 disabled:opacity-50"
        />
      </td>

      {/* 退社時刻 */}
      <td className="px-4 py-3">
        <input
          type="time"
          value={dayData.endTime || ''}
          onChange={handleChange('endTime')}
          disabled={disabled || isTimeDisabled}
          className="px-3 py-1.5 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500 disabled:opacity-50"
        />
      </td>

      {/* 振替日 */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={dayData.furikaeDate ? formatFurikaeDate(dayData.furikaeDate) : ''}
            readOnly
            placeholder={isFurikaeEnabled ? '選択' : ''}
            disabled={disabled || !isFurikaeEnabled}
            onClick={() => isFurikaeEnabled && !disabled && !dayData.furikaeDate && onOpenCalendar?.(dateKey)}
            className="w-24 px-3 py-1.5 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500 disabled:opacity-50 cursor-pointer"
          />
          {isFurikaeEnabled && !disabled && !dayData.furikaeDate && (
            <button
              onClick={() => onOpenCalendar?.(dateKey)}
              className="p-1.5 bg-slate-600 hover:bg-slate-500 rounded-lg transition-colors"
              title="振替日を選択"
            >
              <svg className="w-4 h-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </button>
          )}
          {/* 連動解除ボタン */}
          {dayData.furikaeDate && !disabled && (
            <button
              onClick={() => onClearTransfer?.(dateKey)}
              className="p-1.5 bg-red-600/50 hover:bg-red-500 rounded-lg transition-colors"
              title="振替連動を解除"
            >
              <svg className="w-4 h-4 text-red-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        {/* 連動先表示 */}
        {dayData.furikaeDate && (
          <p className="text-xs text-slate-400 mt-1">
            {dayData.furikaeType === 'source' ? '→ 振休' : '← 休日出勤'}
          </p>
        )}
      </td>
    </tr>
  );
}

// 振替日をM/D形式でフォーマット
function formatFurikaeDate(dateKey) {
  if (!dateKey) return '';
  const [year, month, day] = dateKey.split('-').map(Number);
  return `${month}/${day}`;
}
