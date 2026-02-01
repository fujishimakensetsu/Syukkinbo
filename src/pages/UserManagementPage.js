import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/layout';
import { Loading, Button, Modal } from '../components/common';
import { UserRegistration } from '../components/admin';
import { useAuth } from '../contexts/AuthContext';
import { getAllUsers, deleteUserProfile } from '../services/userService';
import { ROLE_OPTIONS } from '../utils/constants';

export default function UserManagementPage() {
  const navigate = useNavigate();
  const { userProfile, logOut } = useAuth();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRegistration, setShowRegistration] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await getAllUsers();
      setUsers(data);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logOut();
    navigate('/login');
  };

  const handleDelete = async (userId) => {
    try {
      await deleteUserProfile(userId);
      setUsers(prev => prev.filter(u => u.uid !== userId));
      setDeleteConfirm(null);
    } catch (err) {
      console.error('Failed to delete user:', err);
    }
  };

  const getRoleName = (role) => {
    return ROLE_OPTIONS[role]?.label || '社員';
  };

  const getRoleStyle = (role) => {
    switch (role) {
      case 'admin': return 'bg-purple-500/20 text-purple-400';
      case 'keiri': return 'bg-blue-500/20 text-blue-400';
      default: return 'bg-slate-500/20 text-slate-400';
    }
  };

  return (
    <Layout currentUser={userProfile} onLogout={handleLogout}>
      <div className="space-y-6">
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">ユーザー管理</h2>
            <Button onClick={() => setShowRegistration(true)}>
              + 新規ユーザー
            </Button>
          </div>

          {loading ? (
            <Loading message="ユーザーデータを読み込み中..." />
          ) : users.length === 0 ? (
            <p className="text-slate-400 text-center py-8">
              登録されているユーザーがいません
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-700/50">
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">メール</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">氏名</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">権限</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">所属</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">メール確認</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {users.map(user => (
                    <tr key={user.uid} className="hover:bg-slate-700/50 transition-colors">
                      <td className="px-4 py-3 text-sm text-white">{user.email}</td>
                      <td className="px-4 py-3 text-sm text-white font-medium">{user.name}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs ${getRoleStyle(user.role)}`}>
                          {getRoleName(user.role)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-300">{user.department || '-'}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          user.emailVerified
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {user.emailVerified ? '確認済み' : '未確認'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {user.uid !== userProfile?.uid && user.role !== 'admin' && (
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => setDeleteConfirm(user)}
                          >
                            削除
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ユーザー登録モーダル */}
      <UserRegistration
        isOpen={showRegistration}
        onClose={() => setShowRegistration(false)}
        onSuccess={loadUsers}
      />

      {/* 削除確認モーダル */}
      <Modal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="ユーザー削除の確認"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-slate-300">
            以下のユーザーを削除しますか？
          </p>
          <div className="bg-slate-700/50 rounded-xl p-4">
            <p className="text-white font-medium">{deleteConfirm?.name}</p>
            <p className="text-slate-400 text-sm">{deleteConfirm?.email}</p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={() => setDeleteConfirm(null)}
              className="flex-1"
            >
              キャンセル
            </Button>
            <Button
              variant="danger"
              onClick={() => handleDelete(deleteConfirm?.uid)}
              className="flex-1"
            >
              削除する
            </Button>
          </div>
        </div>
      </Modal>
    </Layout>
  );
}
