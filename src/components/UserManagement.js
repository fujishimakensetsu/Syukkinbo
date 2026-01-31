import React from 'react';

export default function UserManagement({ users, onEdit, onDelete, onAdd }) {
  const getRoleName = (role) => {
    switch (role) {
      case 'admin': return '管理者';
      case 'keiri': return '経理';
      default: return '社員';
    }
  };
  
  const getRoleStyle = (role) => {
    switch (role) {
      case 'admin': return 'bg-purple-500/20 text-purple-400';
      case 'keiri': return 'bg-blue-500/20 text-blue-400';
      default: return 'bg-slate-500/20 text-slate-400';
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">ユーザー管理</h2>
          <button
            onClick={onAdd}
            className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl hover:from-cyan-400 hover:to-blue-500 transition-all shadow-lg shadow-cyan-500/30"
          >
            + 新規ユーザー
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-700/50">
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">氏名</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">権限</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">所属</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {users.map(user => (
                <tr key={user.id} className="hover:bg-slate-700/50 transition-colors">
                  <td className="px-4 py-3 text-sm text-white">{user.id}</td>
                  <td className="px-4 py-3 text-sm text-white font-medium">{user.name}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${getRoleStyle(user.role)}`}>
                      {getRoleName(user.role)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-300">{user.department || '-'}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => onEdit(user)}
                      className="px-3 py-1 bg-cyan-500/20 text-cyan-400 rounded-lg text-sm hover:bg-cyan-500/30 transition-all"
                    >
                      編集
                    </button>
                    {user.id !== 'admin' && (
                      <button
                        onClick={() => onDelete(user.id)}
                        className="ml-2 px-3 py-1 bg-red-500/20 text-red-400 rounded-lg text-sm hover:bg-red-500/30 transition-all"
                      >
                        削除
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
