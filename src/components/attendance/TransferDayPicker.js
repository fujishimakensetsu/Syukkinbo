import React, { useState, useEffect, useRef } from 'react';
import { Calendar } from '../common';
import { formatDateKey } from '../../utils/dateUtils';

export default function TransferDayPicker({
  isOpen,
  onClose,
  onSelect,
  selectedDate,
  attendanceData,
  sourceDateKey
}) {
  const [pickedDate, setPickedDate] = useState(selectedDate);
  const [showConfirm, setShowConfirm] = useState(false);
  const [targetDateKey, setTargetDateKey] = useState(null);
  const lastPickedRef = useRef(null);

  // リセット
  useEffect(() => {
    if (isOpen) {
      setPickedDate(selectedDate);
      setShowConfirm(false);
      setTargetDateKey(null);
      lastPickedRef.current = null;
    }
  }, [isOpen, selectedDate]);

  const handleSelect = (date) => {
    const dateKey = formatDateKey(date);

    // 同じ日を2回クリック（または確定ボタン）= 確定操作
    if (lastPickedRef.current && formatDateKey(lastPickedRef.current) === dateKey) {
      // 同じ日（振替元）は選択不可
      if (dateKey === sourceDateKey) {
        return;
      }

      // 選択先に既にデータがあるかチェック
      const existingData = attendanceData?.[dateKey];
      if (existingData?.kubun && existingData.kubun !== '' && existingData.kubun !== '振休') {
        setTargetDateKey(dateKey);
        setShowConfirm(true);
        return;
      }

      onSelect(dateKey);
      return;
    }

    // 新しい日付を選択
    setPickedDate(date);
    lastPickedRef.current = date;
  };

  const handleConfirmOverwrite = () => {
    if (targetDateKey) {
      onSelect(targetDateKey);
    }
    setShowConfirm(false);
    setTargetDateKey(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative">
        {!showConfirm ? (
          <div>
            <div className="bg-slate-800 rounded-t-2xl border-x border-t border-slate-700 px-4 pt-4 pb-2">
              <h3 className="text-white font-medium">振替日を選択</h3>
              <p className="text-slate-400 text-sm mt-1">
                振替休日として設定する日付を選んでください
              </p>
            </div>
            <Calendar
              selectedDate={pickedDate}
              onSelect={handleSelect}
              onClose={onClose}
            />
          </div>
        ) : (
          <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 shadow-xl max-w-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-amber-500/20 rounded-xl">
                <svg className="w-6 h-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-white font-medium">確認</h3>
            </div>
            <p className="text-slate-300 text-sm mb-4">
              選択した日付には既に「{attendanceData?.[targetDateKey]?.kubun}」が設定されています。
              「振休」に変更してもよろしいですか？
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowConfirm(false);
                  setTargetDateKey(null);
                }}
                className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl transition-all text-sm"
              >
                キャンセル
              </button>
              <button
                onClick={handleConfirmOverwrite}
                className="flex-1 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-white rounded-xl transition-all text-sm"
              >
                変更する
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
