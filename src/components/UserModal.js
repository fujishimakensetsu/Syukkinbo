import React, { useState } from 'react';
import { DEPARTMENT_OPTIONS } from '../data/constants';

export default function UserModal({ user, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    id: user?.id || '',
    password: user?.password || '',
    name: user?.name || '',
    role: user?.role || 'employee',
    department: user?.department || DEPARTMENT_OPTIONS[0]
  });
  
  const handleSubmit = () => {
    if (!formData.id || !formData.password || !formData.name) {
      alert('必須項目を入力してください');
      return;
    }
    onSave(formData);
  };
  
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-md border border-slate-700 shadow-2xl">
        <h3 className="text-xl font-bold text-white mb-6">
          {user ? 'ユーザー編集' : '新規ユーザー'}
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-slate-300 text-sm font-medium mb-2">社員ID *</label>
            <input
              type="text"
              value={formData.id}
              onChange={(e) => setFormData({ ...formData, id: e.target.value })}
              disabled={!!user}
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-cyan-500 disabled:opacity-50"
            />
          </div>
          <div>
            <label className="block text-slate-300 text-sm font-medium mb-2">パスワード *</label>
            <input
              type="text"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-cyan-500"
            />
          </div>
          <div>
            <label className="block text-slate-300 text-sm font-medium mb-2">氏名 *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-cyan-500"
            />
          </div>
          <div>
            <label className="block text-slate-300 text-sm font-medium mb-2">権限</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="employee">社員</option>
              <option value="keiri">経理</option>
              <option value="admin">管理者</option>
            </select>
          </div>
          {formData.role === 'employee' && (
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">所属</label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-cyan-500"
              >
                {DEPARTMENT_OPTIONS.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          )}
          
          <div className="flex gap-3 pt-4">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl transition-all"
            >
              キャンセル
            </button>
            <button
              onClick={handleSubmit}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-xl hover:from-cyan-400 hover:to-blue-500 transition-all"
            >
              保存
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
