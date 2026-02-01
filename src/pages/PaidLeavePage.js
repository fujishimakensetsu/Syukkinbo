import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/layout';
import { Loading } from '../components/common';
import { YearlySummary } from '../components/attendance';
import { PaidLeaveSettings } from '../components/settings';
import { useAuth } from '../contexts/AuthContext';
import { getAttendanceByDateRange } from '../services/attendanceService';
import { updateUserSettings } from '../services/userService';
import { getFiscalYearRange, formatDateKey } from '../utils/dateUtils';
import { getCurrentFiscalYear } from '../utils/paidLeaveCalc';

export default function PaidLeavePage() {
  const navigate = useNavigate();
  const { userProfile, logOut, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [attendanceData, setAttendanceData] = useState({});
  const [selectedYear, setSelectedYear] = useState(getCurrentFiscalYear());
  const [message, setMessage] = useState('');

  const handleLogout = async () => {
    await logOut();
    navigate('/login');
  };

  // 年度の勤怠データを取得
  const loadAttendanceData = useCallback(async (fiscalYear) => {
    if (!userProfile?.uid) return;

    setLoading(true);
    try {
      const { start, end } = getFiscalYearRange(fiscalYear);
      const startKey = formatDateKey(start);
      const endKey = formatDateKey(end);

      const list = await getAttendanceByDateRange(userProfile.uid, startKey, endKey);

      // 配列からオブジェクトに変換
      const data = {};
      list.forEach(item => {
        data[item.date] = item;
      });

      setAttendanceData(data);
    } catch (err) {
      console.error('Failed to load attendance data:', err);
    } finally {
      setLoading(false);
    }
  }, [userProfile?.uid]);

  // 初回読み込み
  useEffect(() => {
    loadAttendanceData(selectedYear);
  }, [loadAttendanceData, selectedYear]);

  // 年度変更時
  const handleYearChange = (year) => {
    setSelectedYear(year);
  };

  // 設定保存
  const handleSaveSettings = async (updates) => {
    if (!userProfile?.uid) return;

    setSaving(true);
    setMessage('');

    try {
      const newSettings = {
        ...userProfile.settings,
        ...updates
      };
      await updateUserSettings(userProfile.uid, newSettings);
      await refreshProfile();
      setMessage('設定を保存しました');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error('Failed to save settings:', err);
      setMessage('保存に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout currentUser={userProfile} onLogout={handleLogout}>
      <div className="space-y-6">
        {/* ヘッダー */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">有給休暇管理</h2>
          {message && (
            <span className={`text-sm ${message.includes('失敗') ? 'text-red-400' : 'text-green-400'}`}>
              {message}
            </span>
          )}
        </div>

        {loading ? (
          <Loading message="データを読み込み中..." />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 年間サマリー（2カラム分） */}
            <div className="lg:col-span-2">
              <YearlySummary
                attendanceData={attendanceData}
                paidLeaveSettings={userProfile?.settings?.paidLeave}
                onYearChange={handleYearChange}
              />
            </div>

            {/* 設定（1カラム分） */}
            <div>
              <PaidLeaveSettings
                currentSettings={userProfile?.settings}
                onSave={handleSaveSettings}
                saving={saving}
              />

              {/* ヒント */}
              <div className="mt-4 bg-slate-800/30 rounded-xl p-4 border border-slate-700/50">
                <h4 className="text-sm font-medium text-slate-400 mb-2">有給のカウント方法</h4>
                <ul className="text-slate-500 text-sm space-y-1">
                  <li>・有給：1日</li>
                  <li>・午前休：0.5日</li>
                  <li>・午後休：0.5日</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
