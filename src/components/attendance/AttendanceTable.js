import React, { useState } from 'react';
import { generateAttendanceDates } from '../../utils/dateUtils';
import { HALF_DAY_TIMES } from '../../utils/constants';
import AttendanceRow from './AttendanceRow';
import TransferDayPicker from './TransferDayPicker';

export default function AttendanceTable({
  userId,
  year,
  month,
  attendanceData,
  onUpdate,
  onSetTransferLink,
  onClearTransferLink,
  userSettings,
  disabled = false
}) {
  const dates = generateAttendanceDates(year, month);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [selectedDateKey, setSelectedDateKey] = useState(null);

  const handleOpenCalendar = (dateKey) => {
    setSelectedDateKey(dateKey);
    setCalendarOpen(true);
  };

  const handleSelectTransferDate = async (targetDateKey) => {
    if (selectedDateKey && targetDateKey) {
      const dayData = attendanceData[selectedDateKey];

      if (dayData?.kubun === '休日出勤') {
        // 休日出勤 → 振休を設定
        await onSetTransferLink(userId, selectedDateKey, targetDateKey);
      } else if (dayData?.kubun === '振休') {
        // 振休 → 休日出勤を設定
        await onSetTransferLink(userId, targetDateKey, selectedDateKey);
      }
    }
    setCalendarOpen(false);
    setSelectedDateKey(null);
  };

  // 振替連動を解除
  const handleClearTransfer = async (dateKey) => {
    if (onClearTransferLink) {
      await onClearTransferLink(userId, dateKey);
    }
  };

  // 区分変更時の処理（自動入力を含む）
  const handleKubunChange = async (dateKey, newKubun, currentDayData) => {
    const updates = { kubun: newKubun };

    // 「出勤」または「休日出勤」に変更した場合、デフォルト時間を自動入力
    if ((newKubun === '出勤' || newKubun === '休日出勤') &&
        !currentDayData.startTime && !currentDayData.endTime) {
      if (userSettings?.defaultStartTime) {
        updates.startTime = userSettings.defaultStartTime;
      }
      if (userSettings?.defaultEndTime) {
        updates.endTime = userSettings.defaultEndTime;
      }
    }

    // 「午前休」「午後休」に変更した場合、固定の時間を設定
    if (newKubun === '午前休') {
      updates.startTime = HALF_DAY_TIMES.午前休.startTime;  // 13:00
      updates.endTime = HALF_DAY_TIMES.午前休.endTime;      // 18:00
    } else if (newKubun === '午後休') {
      updates.startTime = HALF_DAY_TIMES.午後休.startTime;  // 08:45
      updates.endTime = HALF_DAY_TIMES.午後休.endTime;      // 13:00
    }

    // 「定休日」「有給」「振休」「忌引」に変更した場合、時間をクリア
    if (['定休日', '有給', '振休', '忌引'].includes(newKubun)) {
      updates.startTime = '';
      updates.endTime = '';
    }

    // 振替連動がある場合で、休日出勤/振休以外に変更した場合は連動を解除
    if (currentDayData.furikaeDate && !['休日出勤', '振休'].includes(newKubun)) {
      if (onClearTransferLink) {
        await onClearTransferLink(userId, dateKey);
      }
    }

    // 複数フィールドを一度に更新
    Object.entries(updates).forEach(([field, value]) => {
      onUpdate(dateKey, field, value);
    });
  };

  return (
    <>
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
              {dates.map((dateInfo) => (
                <AttendanceRow
                  key={dateInfo.dateKey}
                  dateInfo={dateInfo}
                  dayData={attendanceData[dateInfo.dateKey] || {}}
                  onUpdate={onUpdate}
                  onKubunChange={handleKubunChange}
                  onOpenCalendar={handleOpenCalendar}
                  onClearTransfer={handleClearTransfer}
                  disabled={disabled}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 振替日選択カレンダー */}
      <TransferDayPicker
        isOpen={calendarOpen}
        onClose={() => {
          setCalendarOpen(false);
          setSelectedDateKey(null);
        }}
        onSelect={handleSelectTransferDate}
        selectedDate={selectedDateKey ? new Date(selectedDateKey) : null}
        attendanceData={attendanceData}
        sourceDateKey={selectedDateKey}
      />
    </>
  );
}
