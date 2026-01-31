import React from 'react';

export default function Header({ currentUser, activeTab, setActiveTab, onLogout }) {
  const getRoleName = (role) => {
    switch (role) {
      case 'admin': return '管理者';
      case 'keiri': return '経理';
      default: return '社員';
    }
  };
  
  return (
    <header className="bg-slate-800/50 backdrop-blur-xl border-b border-slate-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
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
        
        {/* タブナビゲーション */}
        <nav className="flex gap-1 bg-slate-700/50 rounded-xl p-1">
          {currentUser?.role === 'employee' && (
            <button
              onClick={() => setActiveTab('input')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'input' 
                  ? 'bg-cyan-500 text-white shadow-lg' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              勤怠入力
            </button>
          )}
          {(currentUser?.role === 'admin' || currentUser?.role === 'keiri') && (
            <button
              onClick={() => setActiveTab('admin')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'admin' 
                  ? 'bg-cyan-500 text-white shadow-lg' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {currentUser?.role === 'keiri' ? '勤怠確認' : '全社員一覧'}
            </button>
          )}
          {currentUser?.role === 'admin' && (
            <button
              onClick={() => setActiveTab('users')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'users' 
                  ? 'bg-cyan-500 text-white shadow-lg' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              ユーザー管理
            </button>
          )}
        </nav>
        
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
