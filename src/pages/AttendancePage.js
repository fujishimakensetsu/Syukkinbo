import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/layout';
import { Loading, Button, Modal } from '../components/common';
import {
  PeriodSelector,
  AttendanceSummary,
  AttendanceTable
} from '../components/attendance';
import { QuickTimeSettings } from '../components/settings';
import { useAuth } from '../contexts/AuthContext';
import { useAttendance } from '../contexts/AttendanceContext';
import { updateUserSettings } from '../services/userService';
import { exportToExcel } from '../utils/excelExport';
import { generateAttendanceDates } from '../utils/dateUtils';
import { DEFAULT_SETTINGS } from '../utils/constants';

export default function AttendancePage() {
  const navigate = useNavigate();
  const { userProfile, logOut, refreshProfile } = useAuth();
  const {
    selectedYear,
    setSelectedYear,
    selectedMonth,
    setSelectedMonth,
    attendanceData,
    updateAttendance,
    saveBatchAttendance,
    setTransferLink,
    removeTransferLink,
    loading,
    saving
  } = useAttendance();

  const [showAutoFillConfirm, setShowAutoFillConfirm] = useState(false);

  const handleLogout = async () => {
    await logOut();
    navigate('/login');
  };

  const handleUpdate = async (dateKey, field, value) => {
    if (userProfile?.uid) {
      await updateAttendance(userProfile.uid, dateKey, field, value);
    }
  };

  const handleSetTransferLink = async (userId, sourceDateKey, targetDateKey) => {
    await setTransferLink(userId, sourceDateKey, targetDateKey);
  };

  const handleClearTransferLink = async (userId, dateKey) => {
    await removeTransferLink(userId, dateKey);
  };

  const handleSaveDefaults = async (settings) => {
    if (!userProfile?.uid) return;
    try {
      const newSettings = {
        ...userProfile.settings,
        ...settings
      };
      await updateUserSettings(userProfile.uid, newSettings);
      await refreshProfile();
    } catch (err) {
      console.error('Failed to save defaults:', err);
    }
  };

  const handleExport = () => {
    if (!userProfile) return;
    const dates = generateAttendanceDates(selectedYear, selectedMonth);
    exportToExcel(
      userProfile,
      selectedYear,
      selectedMonth,
      { [userProfile.uid]: attendanceData[userProfile.uid] || {} },
      dates
    );
  };

  // 自動入力処理
  const handleAutoFill = async () => {
    if (!userProfile?.uid) return;

    const dates = generateAttendanceDates(selectedYear, selectedMonth);
    const fixedHolidays = userSettings.fixedHolidays || DEFAULT_SETTINGS.fixedHolidays;
    const defaultStartTime = userSettings.defaultStartTime || DEFAULT_SETTINGS.defaultStartTime;
    const defaultEndTime = userSettings.defaultEndTime || DEFAULT_SETTINGS.defaultEndTime;

    const dataMap = {};

    dates.forEach(({ date, dateKey }) => {
      const dayOfWeek = date.getDay(); // 0=日曜, 6=土曜
      const existingData = userAttendance[dateKey] || {};

      // 既に振替連動がある場合はスキップ
      if (existingData.furikaeDate) {
        return;
      }

      if (fixedHolidays.includes(dayOfWeek)) {
        // 定休日
        dataMap[dateKey] = {
          ...existingData,
          kubun: '定休日',
          startTime: '',
          endTime: ''
        };
      } else {
        // 出勤
        dataMap[dateKey] = {
          ...existingData,
          kubun: '出勤',
          startTime: defaultStartTime,
          endTime: defaultEndTime
        };
      }
    });

    try {
      await saveBatchAttendance(userProfile.uid, dataMap);
    } catch (err) {
      console.error('Auto-fill failed:', err);
    }

    setShowAutoFillConfirm(false);
  };

  const userAttendance = userProfile?.uid ? (attendanceData[userProfile.uid] || {}) : {};
  const userSettings = userProfile?.settings || DEFAULT_SETTINGS;

  return (
    <Layout currentUser={userProfile} onLogout={handleLogout}>
      <div className="space-y-6">
        {/* 期間選択とクイック設定 */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <PeriodSelector
            selectedYear={selectedYear}
            setSelectedYear={setSelectedYear}
            selectedMonth={selectedMonth}
            setSelectedMonth={setSelectedMonth}
          />
          <div className="flex flex-wrap items-center gap-4">
            <QuickTimeSettings
              defaultStartTime={userSettings.defaultStartTime || DEFAULT_SETTINGS.defaultStartTime}
              defaultEndTime={userSettings.defaultEndTime || DEFAULT_SETTINGS.defaultEndTime}
              onSaveDefaults={handleSaveDefaults}
            />
            <div className="text-slate-300 text-sm">
              所属: <span className="text-cyan-400 font-medium">{userProfile?.department}</span>
            </div>
          </div>
        </div>

        {/* ローディング */}
        {loading ? (
          <Loading message="勤怠データを読み込み中..." />
        ) : (
          <>
            {/* 集計 */}
            <AttendanceSummary
              userId={userProfile?.uid}
              attendanceData={attendanceData}
              paidLeaveSettings={userProfile?.settings?.paidLeave}
              allAttendanceData={userAttendance}
            />

            {/* 勤怠テーブル */}
            <AttendanceTable
              userId={userProfile?.uid}
              year={selectedYear}
              month={selectedMonth}
              attendanceData={userAttendance}
              onUpdate={handleUpdate}
              onSetTransferLink={handleSetTransferLink}
              onClearTransferLink={handleClearTransferLink}
              userSettings={userSettings}
            />

            {/* ボタン */}
            <div className="flex justify-end gap-4">
              {saving && (
                <span className="text-slate-400 text-sm flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  保存中...
                </span>
              )}
              <Button onClick={() => setShowAutoFillConfirm(true)} variant="primary">
                自動入力
              </Button>
              <Button onClick={handleExport} variant="secondary">
                Excelダウンロード
              </Button>
            </div>

            {/* 自動入力確認モーダル */}
            <Modal
              isOpen={showAutoFillConfirm}
              onClose={() => setShowAutoFillConfirm(false)}
              title="自動入力の確認"
            >
              <div className="space-y-4">
                <p className="text-slate-300">
                  設定に基づいて勤怠を自動入力します。
                </p>
                <div className="bg-slate-700/50 rounded-xl p-4 space-y-2">
                  <p className="text-slate-400 text-sm">
                    <span className="text-white font-medium">定休日</span>（{(userSettings.fixedHolidays || DEFAULT_SETTINGS.fixedHolidays).map(d => ['日', '月', '火', '水', '木', '金', '土'][d]).join('・')}）
                    → 「定休日」
                  </p>
                  <p className="text-slate-400 text-sm">
                    <span className="text-white font-medium">その他の日</span>
                    → 「出勤」（{userSettings.defaultStartTime || DEFAULT_SETTINGS.defaultStartTime}〜{userSettings.defaultEndTime || DEFAULT_SETTINGS.defaultEndTime}）
                  </p>
                </div>
                <p className="text-amber-400 text-sm">
                  ※ 振替連動がある日はスキップされます
                </p>
                <div className="flex gap-3 pt-2">
                  <Button
                    onClick={() => setShowAutoFillConfirm(false)}
                    variant="secondary"
                    className="flex-1"
                  >
                    キャンセル
                  </Button>
                  <Button
                    onClick={handleAutoFill}
                    variant="primary"
                    className="flex-1"
                  >
                    実行
                  </Button>
                </div>
              </div>
            </Modal>
          </>
        )}
      </div>
    </Layout>
  );
}
