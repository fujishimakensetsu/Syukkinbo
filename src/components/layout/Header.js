import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ROLE_OPTIONS } from '../../utils/constants';

export default function Header({ currentUser, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();

  const getRoleName = (role) => {
    return ROLE_OPTIONS[role]?.label || '社員';
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const navItems = [];

  // 全ロール共通：自分の勤怠管理機能
  navItems.push({ path: '/attendance', label: '勤怠入力' });
  navItems.push({ path: '/monthly-snapshot', label: '月次出勤簿' });
  navItems.push({ path: '/yearly-statistics', label: '年間統計' });
  navItems.push({ path: '/history', label: '履歴' });
  navItems.push({ path: '/paid-leave', label: '有給管理' });
  navItems.push({ path: '/settings', label: '設定' });

  // 経理用ナビゲーション（追加機能）
  if (currentUser?.role === 'keiri' || currentUser?.role === 'admin') {
    navItems.push({ path: '/admin', label: '全社員一覧' });
  }

  // 管理者用ナビゲーション（追加機能）
  if (currentUser?.role === 'admin') {
    navItems.push({ path: '/users', label: 'ユーザー管理' });
  }

  return (
    <header className="bg-slate-800/50 backdrop-blur-xl border-b border-slate-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* ロゴ・ユーザー情報 */}
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h1 className="text-white font-bold">勤怠管理システム</h1>
            <p className="text-slate-400 text-xs">
              {currentUser?.name}（{getRoleName(currentUser?.role)}）
            </p>
          </div>
        </div>

        {/* ナビゲーション */}
        <nav className="flex gap-1 bg-slate-700/50 rounded-xl p-1">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive(item.path)
                  ? 'bg-cyan-500 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* ログアウト */}
        <button
          onClick={onLogout}
          className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-xl text-sm transition-all"
        >
          ログアウト
        </button>
      </div>
    </header>
  );
}
