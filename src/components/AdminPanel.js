import React from 'react';
import { calculateSummary } from '../data/constants';
import { exportToExcel } from '../utils/excelExport';

export default function AdminPanel({
  currentUser,
  users,
  attendanceData,
  setActiveTab,
  setSelectedEmployee
}) {
  const employees = users.filter(u => u.role === 'employee');
  
  return (
    <div className="space-y-6">
      <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700">
        <h2 className="text-xl font-bold text-white mb-4">
          {currentUser?.role === 'keiri' ? '社員勤怠確認' : '全社員勤怠一覧'}
        </h2>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-700/50">
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">社員ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">氏名</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">所属</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">出勤日数</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">ステータス</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {employees.map(user => {
                const summary = calculateSummary(user.id, attendanceData);
                const hasData = Object.keys(attendanceData[user.id] || {}).length > 0;
                return (
                  <tr key={user.id} className="hover:bg-slate-700/50 transition-colors">
                    <td className="px-4 py-3 text-sm text-white">{user.id}</td>
                    <td className="px-4 py-3 text-sm text-white font-medium">{user.name}</td>
                    <td className="px-4 py-3 text-sm text-slate-300">{user.department}</td>
                    <td className="px-4 py-3 text-sm text-cyan-400">{summary.workDays}日</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        hasData 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {hasData ? '提出済み' : '未提出'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => {
                          setSelectedEmployee(user.id);
                          setActiveTab('detail');
                        }}
                        className="px-3 py-1 bg-cyan-500/20 text-cyan-400 rounded-lg text-sm hover:bg-cyan-500/30 transition-all"
                      >
                        詳細
                      </button>
                      <button 
                        onClick={() => {
                          // Excel出力機能（将来実装）
                          alert('Excel出力機能は開発中です');
                        }}
                        className="ml-2 px-3 py-1 bg-slate-600 text-white rounded-lg text-sm hover:bg-slate-500 transition-all"
                      >
                        Excel
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
