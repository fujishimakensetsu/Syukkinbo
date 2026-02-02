import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/layout';
import { Loading } from '../components/common';
import { PeriodSelector, AttendanceTable } from '../components/attendance';
import MonthlySnapshot from '../components/attendance/MonthlySnapshot';
import { useAuth } from '../contexts/AuthContext';
import { useAttendance } from '../contexts/AttendanceContext';
import { getMonthlySnapshot, getSnapshotsByUser } from '../services/snapshotService';
import { getAllUsers } from '../services/userService';

export default function MonthlySnapshotPage() {
  const navigate = useNavigate();
  const { userProfile, logOut } = useAuth();
  const {
    selectedYear,
    setSelectedYear,
    selectedMonth,
    setSelectedMonth,
    attendanceData,
    loadUserAttendance
  } = useAttendance();

  const [selectedUserId, setSelectedUserId] = useState(null);
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [snapshots, setSnapshots] = useState([]);
  const [currentSnapshot, setCurrentSnapshot] = useState(null);
  const [loadingSnapshot, setLoadingSnapshot] = useState(false);

  const isAdmin = userProfile?.role === 'admin' || userProfile?.role === 'keiri';

  useEffect(() => {
    if (isAdmin) {
      loadUsers();
    }
  }, [isAdmin]);

  useEffect(() => {
    const targetUserId = selectedUserId || userProfile?.uid;
    if (targetUserId) {
      loadSnapshotData(targetUserId);
    }
  }, [selectedUserId, userProfile?.uid, selectedYear, selectedMonth]);

  const loadUsers = async () => {
    setLoadingUsers(true);
    try {
      const userList = await getAllUsers();
      setUsers(userList);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoadingUsers(false);
    }
  };

  const loadSnapshotData = async (userId) => {
    setLoadingSnapshot(true);
    try {
      const [snapshot, userSnapshots] = await Promise.all([
        getMonthlySnapshot(userId, selectedYear, selectedMonth),
        getSnapshotsByUser(userId)
      ]);
      setCurrentSnapshot(snapshot);
      setSnapshots(userSnapshots);

      // 管理者が他ユーザーを見る場合、出勤データもロード
      if (isAdmin && selectedUserId) {
        await loadUserAttendance(selectedUserId, selectedYear, selectedMonth);
      }
    } catch (err) {
      console.error('Failed to load snapshot:', err);
    } finally {
      setLoadingSnapshot(false);
    }
  };

  const handleLogout = async () => {
    await logOut();
    navigate('/login');
  };

  const targetUserId = selectedUserId || userProfile?.uid;
  const selectedUser = users.find(u => u.uid === selectedUserId);

  // 確定済みの場合はスナップショットのデータを、未確定の場合は現在のデータを表示
  const displayData = currentSnapshot?.status === 'confirmed'
    ? currentSnapshot.attendanceData
    : attendanceData[targetUserId] || {};

  return (
    <Layout currentUser={userProfile} onLogout={handleLogout}>
      <div className="space-y-6">
        {/* ヘッダー */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-white">月次出勤簿</h1>

          {/* 管理者用: ユーザー選択 */}
          {isAdmin && (
            <div className="flex items-center gap-4">
              <label className="text-sm text-gray-400">対象ユーザー:</label>
              <select
                value={selectedUserId || ''}
                onChange={(e) => setSelectedUserId(e.target.value || null)}
                className="px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                disabled={loadingUsers}
              >
                <option value="">自分</option>
                {users.map(user => (
                  <option key={user.uid} value={user.uid}>
                    {user.name} ({user.department})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* 期間選択 */}
        <PeriodSelector
          selectedYear={selectedYear}
          setSelectedYear={setSelectedYear}
          selectedMonth={selectedMonth}
          setSelectedMonth={setSelectedMonth}
        />

        {/* 選択中のユーザー表示 */}
        {isAdmin && selectedUserId && selectedUser && (
          <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-3">
            <span className="text-cyan-400">
              {selectedUser.name} さんの出勤簿を表示中
            </span>
          </div>
        )}

        {/* 確定済み月一覧 */}
        {snapshots.length > 0 && (
          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
            <h3 className="text-sm font-medium text-gray-400 mb-3">確定済みの月</h3>
            <div className="flex flex-wrap gap-2">
              {snapshots.map(snap => (
                <button
                  key={snap.id}
                  onClick={() => {
                    setSelectedYear(snap.year);
                    setSelectedMonth(snap.month);
                  }}
                  className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                    snap.year === selectedYear && snap.month === selectedMonth
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {snap.year}年{snap.month}月
                </button>
              ))}
            </div>
          </div>
        )}

        {loadingSnapshot ? (
          <Loading message="読み込み中..." />
        ) : (
          <>
            {/* スナップショットステータス */}
            <MonthlySnapshot
              userId={targetUserId}
              year={selectedYear}
              month={selectedMonth}
            />

            {/* 出勤データ表示（読み取り専用） */}
            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
              <h3 className="text-lg font-medium text-white mb-4">
                {currentSnapshot?.status === 'confirmed' ? '確定時のデータ' : '現在のデータ'}
              </h3>
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
                    {Object.entries(displayData)
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
                {Object.keys(displayData).length === 0 && (
                  <div className="text-center text-gray-500 py-8">
                    データがありません
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
