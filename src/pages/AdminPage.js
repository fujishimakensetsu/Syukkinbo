import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/layout';
import { Loading, Button } from '../components/common';
import { useAuth } from '../contexts/AuthContext';
import { useAttendance } from '../contexts/AttendanceContext';
import { getEmployees } from '../services/userService';
import { calculateSummary } from '../utils/attendanceCalc';

export default function AdminPage() {
  const navigate = useNavigate();
  const { userProfile, logOut } = useAuth();
  const { attendanceData, loadUserAttendance, selectedYear, selectedMonth } = useAttendance();

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    setLoading(true);
    try {
      const data = await getEmployees();
      setEmployees(data);

      // 各社員の勤怠データを読み込む
      for (const emp of data) {
        await loadUserAttendance(emp.uid, selectedYear, selectedMonth);
      }
    } catch (err) {
      console.error('Failed to load employees:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logOut();
    navigate('/login');
  };

  const handleViewDetail = (employeeId) => {
    setSelectedEmployee(employeeId);
    // 詳細ページへの遷移はPhase 4以降で実装
  };

  return (
    <Layout currentUser={userProfile} onLogout={handleLogout}>
      <div className="space-y-6">
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700">
          <h2 className="text-xl font-bold text-white mb-4">
            {userProfile?.role === 'keiri' ? '社員勤怠確認' : '全社員勤怠一覧'}
          </h2>

          {loading ? (
            <Loading message="社員データを読み込み中..." />
          ) : employees.length === 0 ? (
            <p className="text-slate-400 text-center py-8">
              登録されている社員がいません
            </p>
          ) : (
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
                  {employees.map(employee => {
                    const empAttendance = attendanceData[employee.uid] || {};
                    const summary = calculateSummary(employee.uid, attendanceData);
                    const hasData = Object.keys(empAttendance).length > 0;

                    return (
                      <tr key={employee.uid} className="hover:bg-slate-700/50 transition-colors">
                        <td className="px-4 py-3 text-sm text-white">{employee.email?.split('@')[0]}</td>
                        <td className="px-4 py-3 text-sm text-white font-medium">{employee.name}</td>
                        <td className="px-4 py-3 text-sm text-slate-300">{employee.department}</td>
                        <td className="px-4 py-3 text-sm text-cyan-400">{summary.workDays}日</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            hasData
                              ? 'bg-green-500/20 text-green-400'
                              : 'bg-yellow-500/20 text-yellow-400'
                          }`}>
                            {hasData ? '入力あり' : '未入力'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleViewDetail(employee.uid)}
                          >
                            詳細
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
