import React, { useState } from 'react';
import LoginScreen from './components/LoginScreen';
import Header from './components/Header';
import AttendanceInput from './components/AttendanceInput';
import AdminPanel from './components/AdminPanel';
import UserManagement from './components/UserManagement';
import AttendanceDetail from './components/AttendanceDetail';
import UserModal from './components/UserModal';
import { SAMPLE_USERS, DEPARTMENT_OPTIONS } from './data/constants';

export default function App() {
  // 認証状態
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  
  // ユーザー管理
  const [users, setUsers] = useState(SAMPLE_USERS);
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  
  // 勤怠データ
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [attendanceData, setAttendanceData] = useState({});
  
  // 経理画面用
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  
  // 画面切り替え
  const [activeTab, setActiveTab] = useState('input');
  
  // ログイン処理
  const handleLogin = (userId, password) => {
    const user = users.find(u => u.id === userId && u.password === password);
    if (user) {
      setCurrentUser(user);
      setIsLoggedIn(true);
      if (user.role === 'keiri') {
        setActiveTab('admin');
      }
      return true;
    }
    return false;
  };
  
  // ログアウト処理
  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    setActiveTab('input');
  };
  
  // 勤怠データ更新
  const updateAttendance = (dateKey, field, value) => {
    const userKey = currentUser?.id || selectedEmployee;
    setAttendanceData(prev => ({
      ...prev,
      [userKey]: {
        ...prev[userKey],
        [dateKey]: {
          ...prev[userKey]?.[dateKey],
          [field]: value
        }
      }
    }));
  };
  
  // ユーザー追加/編集
  const handleSaveUser = (userData) => {
    if (editingUser) {
      setUsers(prev => prev.map(u => u.id === editingUser.id ? userData : u));
    } else {
      setUsers(prev => [...prev, userData]);
    }
    setShowUserModal(false);
    setEditingUser(null);
  };
  
  // ユーザー削除
  const handleDeleteUser = (userId) => {
    if (window.confirm('このユーザーを削除しますか？')) {
      setUsers(prev => prev.filter(u => u.id !== userId));
    }
  };
  
  // ログイン画面表示
  if (!isLoggedIn) {
    return <LoginScreen onLogin={handleLogin} />;
  }
  
  // メイン画面
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Header
        currentUser={currentUser}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
      />
      
      <main className="max-w-7xl mx-auto p-4">
        {/* 勤怠入力画面（社員用） */}
        {activeTab === 'input' && currentUser?.role === 'employee' && (
          <AttendanceInput
            currentUser={currentUser}
            selectedYear={selectedYear}
            setSelectedYear={setSelectedYear}
            selectedMonth={selectedMonth}
            setSelectedMonth={setSelectedMonth}
            attendanceData={attendanceData}
            updateAttendance={updateAttendance}
          />
        )}
        
        {/* 経理/管理者用一覧画面 */}
        {activeTab === 'admin' && (
          <AdminPanel
            currentUser={currentUser}
            users={users}
            attendanceData={attendanceData}
            setActiveTab={setActiveTab}
            setSelectedEmployee={setSelectedEmployee}
          />
        )}
        
        {/* ユーザー管理画面（管理者用） */}
        {activeTab === 'users' && currentUser?.role === 'admin' && (
          <UserManagement
            users={users}
            onEdit={(user) => {
              setEditingUser(user);
              setShowUserModal(true);
            }}
            onDelete={handleDeleteUser}
            onAdd={() => {
              setEditingUser(null);
              setShowUserModal(true);
            }}
          />
        )}
        
        {/* 詳細画面 */}
        {activeTab === 'detail' && selectedEmployee && (
          <AttendanceDetail
            users={users}
            selectedEmployee={selectedEmployee}
            selectedYear={selectedYear}
            selectedMonth={selectedMonth}
            attendanceData={attendanceData}
            onBack={() => {
              setActiveTab('admin');
              setSelectedEmployee(null);
            }}
          />
        )}
      </main>
      
      {/* ユーザー編集モーダル */}
      {showUserModal && (
        <UserModal
          user={editingUser}
          onSave={handleSaveUser}
          onCancel={() => {
            setShowUserModal(false);
            setEditingUser(null);
          }}
        />
      )}
    </div>
  );
}
