import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Layout } from '../components/layout';
import { Loading, Button } from '../components/common';
import { AttendanceHistory } from '../components/history';
import YearlyStatistics from '../components/attendance/YearlyStatistics';
import MonthlySnapshot from '../components/attendance/MonthlySnapshot';
import { PeriodSelector } from '../components/attendance';
import { useAuth } from '../contexts/AuthContext';
import { useAttendance } from '../contexts/AttendanceContext';
import { getUserProfile } from '../services/userService';
import { getSnapshotsByUser } from '../services/snapshotService';

export default function StaffDetailPage() {
  const navigate = useNavigate();
  const { userId } = useParams();
  const { userProfile, logOut } = useAuth();
  const {
    selectedYear,
    setSelectedYear,
    selectedMonth,
    setSelectedMonth,
    loadUserAttendance,
    attendanceData
  } = useAttendance();

  const [staffProfile, setStaffProfile] = useState(null);
  const [snapshots, setSnapshots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('attendance');

  useEffect(() => {
    if (userId) {
      loadStaffData();
    }
  }, [userId]);

  useEffect(() => {
    if (userId && staffProfile) {
      loadUserAttendance(userId, selectedYear, selectedMonth);
    }
  }, [userId, selectedYear, selectedMonth, staffProfile]);

  const loadStaffData = async () => {
    setLoading(true);
    try {
      const [profile, userSnapshots] = await Promise.all([
        getUserProfile(userId),
        getSnapshotsByUser(userId)
      ]);
      setStaffProfile(profile);
      setSnapshots(userSnapshots);
    } catch (err) {
      console.error('Failed to load staff data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logOut();
    navigate('/login');
  };

  const tabs = [
    { id: 'attendance', label: '月次出勤簿' },
    { id: 'statistics', label: '年間統計' },
    { id: 'history', label: '変更履歴' }
  ];

  if (loading) {
    return (
      <Layout currentUser={userProfile} onLogout={handleLogout}>
        <Loading message="スタッフ情報を読み込み中..." />
      </Layout>
    );
  }

  if (!staffProfile) {
    return (
      <Layout currentUser={userProfile} onLogout={handleLogout}>
        <div className="text-center py-12">
          <p className="text-gray-400">スタッフが見つかりませんでした</p>
          <Button onClick={() => navigate('/admin')} variant="secondary" className="mt-4">
            一覧に戻る
          </Button>
        </div>
      </Layout>
    );
  }

  const userAttendance = attendanceData[userId] || {};

  return (
    <Layout currentUser={userProfile} onLogout={handleLogout}>
      <div className="space-y-6">
        {/* ヘッダー */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/admin')}
              className="p-2 text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white">{staffProfile.name}</h1>
              <p className="text-gray-400 text-sm">{staffProfile.department}</p>
            </div>
          </div>

          {/* 提出ステータス */}
          <div className="flex items-center gap-2">
            {snapshots.length > 0 ? (
              <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm">
                最終提出: {snapshots[0].year}年{snapshots[0].month}月
              </span>
            ) : (
              <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-sm">
                未提出
              </span>
            )}
          </div>
        </div>

        {/* スタッフ情報カード */}
        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-400">氏名</p>
              <p className="text-white font-medium">{staffProfile.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">部署</p>
              <p className="text-white font-medium">{staffProfile.department}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">権限</p>
              <p className="text-white font-medium">
                {staffProfile.role === 'admin' ? '管理者' : staffProfile.role === 'keiri' ? '経理' : '社員'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-400">メールアドレス</p>
              <p className="text-white font-medium text-sm">{staffProfile.email}</p>
            </div>
          </div>
        </div>

        {/* タブナビゲーション */}
        <div className="flex gap-1 bg-gray-800/50 rounded-xl p-1 w-fit">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-cyan-500 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* タブコンテンツ */}
        {activeTab === 'attendance' && (
          <div className="space-y-4">
            {/* 期間選択 */}
            <PeriodSelector
              selectedYear={selectedYear}
              setSelectedYear={setSelectedYear}
              selectedMonth={selectedMonth}
              setSelectedMonth={setSelectedMonth}
            />

            {/* 月次スナップショット */}
            <MonthlySnapshot
              userId={userId}
              year={selectedYear}
              month={selectedMonth}
            />

            {/* 出勤データ表示 */}
            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
              <h3 className="text-lg font-medium text-white mb-4">勤怠データ</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-gray-400 border-b border-gray-700">
                      <th className="text-left py-2 px-3">日付</th>
                      <th className="text-left py-2 px-3">区分</th>
                      <th className="text-left py-2 px-3">出勤</th>
                      <th className="text-left py-2 px-3">退勤</th>
                      <th className="text-left py-2 px-3">メモ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(userAttendance)
                      .sort(([a], [b]) => a.localeCompare(b))
                      .map(([dateKey, day]) => (
                        <tr key={dateKey} className="border-b border-gray-700/50">
                          <td className="py-2 px-3 text-white">{dateKey}</td>
                          <td className="py-2 px-3">
                            <span className={`px-2 py-0.5 rounded text-xs ${
                              day.kubun === '出勤' ? 'bg-cyan-500/20 text-cyan-300' :
                              day.kubun === '定休日' ? 'bg-gray-500/20 text-gray-300' :
                              day.kubun === '有給' ? 'bg-green-500/20 text-green-300' :
                              day.kubun === '振休' ? 'bg-purple-500/20 text-purple-300' :
                              day.kubun === '休日出勤' ? 'bg-orange-500/20 text-orange-300' :
                              'bg-gray-500/20 text-gray-300'
                            }`}>
                              {day.kubun || '-'}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-gray-300">{day.startTime || '-'}</td>
                          <td className="py-2 px-3 text-gray-300">{day.endTime || '-'}</td>
                          <td className="py-2 px-3 text-gray-400 text-xs">{day.memo || '-'}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
                {Object.keys(userAttendance).length === 0 && (
                  <div className="text-center text-gray-500 py-8">
                    この期間のデータがありません
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'statistics' && (
          <YearlyStatistics userId={userId} />
        )}

        {activeTab === 'history' && (
          <AttendanceHistory targetUserId={userId} userName={staffProfile.name} />
        )}
      </div>
    </Layout>
  );
}
