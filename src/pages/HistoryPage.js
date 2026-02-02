import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/layout';
import { AttendanceHistory } from '../components/history';
import { useAuth } from '../contexts/AuthContext';
import { getAllUsers } from '../services/userService';

export default function HistoryPage() {
  const navigate = useNavigate();
  const { userProfile, logOut } = useAuth();
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const isAdmin = userProfile?.role === 'admin' || userProfile?.role === 'keiri';

  useEffect(() => {
    if (isAdmin) {
      loadUsers();
    }
  }, [isAdmin]);

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

  const handleLogout = async () => {
    await logOut();
    navigate('/login');
  };

  const selectedUser = users.find(u => u.uid === selectedUserId);

  return (
    <Layout currentUser={userProfile} onLogout={handleLogout}>
      <div className="space-y-6">
        {/* ヘッダー */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-white">変更履歴</h1>

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
                <option value="">全ユーザー</option>
                {users.map(user => (
                  <option key={user.uid} value={user.uid}>
                    {user.name} ({user.department})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* 説明 */}
        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-sm text-gray-300">
              <p className="mb-1">
                勤怠データの変更履歴を確認できます。履歴は自動的に記録され、改ざんできません。
              </p>
              {isAdmin && (
                <p className="text-gray-400">
                  管理者・経理は全スタッフの履歴を閲覧できます。
                </p>
              )}
            </div>
          </div>
        </div>

        {/* 選択中のユーザー表示 */}
        {isAdmin && selectedUserId && selectedUser && (
          <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-3">
            <span className="text-cyan-400">
              {selectedUser.name} さんの履歴を表示中
            </span>
          </div>
        )}

        {/* 履歴一覧 */}
        <AttendanceHistory
          targetUserId={selectedUserId}
          userName={selectedUser?.name}
        />
      </div>
    </Layout>
  );
}
