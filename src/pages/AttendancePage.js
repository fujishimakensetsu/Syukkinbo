import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/layout';
import { Loading, Button } from '../components/common';
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
    setTransferLink,
    removeTransferLink,
    loading,
    saving
  } = useAttendance();

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
              <Button onClick={handleExport} variant="secondary">
                Excelダウンロード
              </Button>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
