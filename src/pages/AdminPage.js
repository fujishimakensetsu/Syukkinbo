import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/layout';
import { Loading, Button, Modal } from '../components/common';
import { useAuth } from '../contexts/AuthContext';
import { useAttendance } from '../contexts/AttendanceContext';
import { getAllUsers } from '../services/userService';
import { calculateSummary } from '../utils/attendanceCalc';
import { generateAttendanceDates, formatShortDate, getDayOfWeek } from '../utils/dateUtils';
import { KUBUN_OPTIONS } from '../utils/constants';

export default function AdminPage() {
  const navigate = useNavigate();
  const { userProfile, logOut } = useAuth();
  const { attendanceData, loadUserAttendance, selectedYear, selectedMonth } = useAttendance();

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    loadEmployees();
  }, [selectedYear, selectedMonth]);

  const loadEmployees = async () => {
    setLoading(true);
    try {
      const data = await getAllUsers();
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

  const handleViewDetail = async (employee) => {
    setSelectedEmployee(employee);
    await loadUserAttendance(employee.uid, selectedYear, selectedMonth);
    setShowDetailModal(true);
  };

  const closeDetailModal = () => {
    setShowDetailModal(false);
    setSelectedEmployee(null);
  };

  // 勤怠期間の日付を生成
  const dates = generateAttendanceDates(selectedYear, selectedMonth);

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
                            onClick={() => handleViewDetail(employee)}
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

      {/* 詳細モーダル */}
      <Modal
        isOpen={showDetailModal}
        onClose={closeDetailModal}
        title={selectedEmployee ? `${selectedEmployee.name}さんの勤怠詳細` : '勤怠詳細'}
        size="full"
      >
        {selectedEmployee && (
          <div className="space-y-4">
            {/* 社員情報 */}
            <div className="bg-slate-700/50 rounded-xl p-4">
              <div className="flex gap-8 text-sm">
                <div>
                  <span className="text-slate-400">氏名：</span>
                  <span className="text-white font-medium">{selectedEmployee.name}</span>
                </div>
                <div>
                  <span className="text-slate-400">所属：</span>
                  <span className="text-white">{selectedEmployee.department || '-'}</span>
                </div>
                <div>
                  <span className="text-slate-400">期間：</span>
                  <span className="text-white">{selectedYear}年{selectedMonth}月16日〜{selectedMonth === 12 ? selectedYear + 1 : selectedYear}年{selectedMonth === 12 ? 1 : selectedMonth + 1}月15日</span>
                </div>
              </div>
            </div>

            {/* 集計情報 */}
            {(() => {
              const summary = calculateSummary(selectedEmployee.uid, attendanceData);
              return (
                <div className="grid grid-cols-6 gap-4">
                  <div className="bg-slate-700/50 rounded-xl p-3 text-center">
                    <p className="text-slate-400 text-xs">出勤日数</p>
                    <p className="text-cyan-400 text-xl font-bold">{summary.workDays}日</p>
                  </div>
                  <div className="bg-slate-700/50 rounded-xl p-3 text-center">
                    <p className="text-slate-400 text-xs">定休日</p>
                    <p className="text-white text-xl font-bold">{summary.holidayDays}日</p>
                  </div>
                  <div className="bg-slate-700/50 rounded-xl p-3 text-center">
                    <p className="text-slate-400 text-xs">有給取得</p>
                    <p className="text-green-400 text-xl font-bold">{summary.paidLeaveDays}日</p>
                  </div>
                  <div className="bg-slate-700/50 rounded-xl p-3 text-center">
                    <p className="text-slate-400 text-xs">振休</p>
                    <p className="text-purple-400 text-xl font-bold">{summary.transferDays}日</p>
                  </div>
                  <div className="bg-slate-700/50 rounded-xl p-3 text-center">
                    <p className="text-slate-400 text-xs">忌引</p>
                    <p className="text-slate-300 text-xl font-bold">{summary.bereavementDays}日</p>
                  </div>
                  <div className="bg-slate-700/50 rounded-xl p-3 text-center">
                    <p className="text-slate-400 text-xs">総就業時間</p>
                    <p className="text-yellow-400 text-xl font-bold">{summary.totalTime}</p>
                  </div>
                </div>
              );
            })()}

            {/* 勤怠テーブル */}
            <div className="overflow-x-auto max-h-96">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-slate-800">
                  <tr className="bg-slate-700/50">
                    <th className="px-3 py-2 text-left text-xs font-medium text-slate-400">日付</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-slate-400">曜日</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-slate-400">区分</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-slate-400">出勤</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-slate-400">退勤</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {dates.map(({ date, dateKey, dayOfWeek, isWeekend }) => {
                    const dayData = attendanceData[selectedEmployee.uid]?.[dateKey] || {};
                    return (
                      <tr key={dateKey} className={`${isWeekend ? 'bg-slate-700/30' : ''}`}>
                        <td className="px-3 py-2 text-white">{formatShortDate(date)}</td>
                        <td className={`px-3 py-2 ${isWeekend ? 'text-red-400' : 'text-slate-300'}`}>{dayOfWeek}</td>
                        <td className="px-3 py-2">
                          <span className={`px-2 py-1 rounded text-xs ${
                            dayData.kubun === '出勤' ? 'bg-cyan-500/20 text-cyan-400' :
                            dayData.kubun === '定休日' ? 'bg-slate-500/20 text-slate-400' :
                            dayData.kubun === '有給' ? 'bg-green-500/20 text-green-400' :
                            dayData.kubun === '午前休' || dayData.kubun === '午後休' ? 'bg-emerald-500/20 text-emerald-400' :
                            dayData.kubun === '振休' ? 'bg-purple-500/20 text-purple-400' :
                            dayData.kubun === '休日出勤' ? 'bg-orange-500/20 text-orange-400' :
                            dayData.kubun === '忌引' ? 'bg-slate-500/20 text-slate-300' :
                            'bg-slate-600/20 text-slate-500'
                          }`}>
                            {dayData.kubun || '-'}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-slate-300">{dayData.startTime || '-'}</td>
                        <td className="px-3 py-2 text-slate-300">{dayData.endTime || '-'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end">
              <Button variant="secondary" onClick={closeDetailModal}>
                閉じる
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </Layout>
  );
}
