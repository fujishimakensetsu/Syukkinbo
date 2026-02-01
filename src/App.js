import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AttendanceProvider } from './contexts/AttendanceContext';
import { Loading } from './components/common';
import {
  LoginPage,
  RegisterPage,
  EmailVerificationPage,
  ForgotPasswordPage,
  AttendancePage,
  AdminPage,
  UserManagementPage,
  SettingsPage,
  PaidLeavePage
} from './pages';

// 認証が必要なルートのラッパー
function PrivateRoute({ children, allowedRoles, requireEmailVerification = true }) {
  const { isAuthenticated, isEmailVerified, userProfile, loading } = useAuth();

  if (loading) {
    return <Loading fullScreen message="認証情報を確認中..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // メール確認が必要な場合
  if (requireEmailVerification && !isEmailVerified) {
    return <Navigate to="/verify-email" replace />;
  }

  // 権限チェック
  if (allowedRoles && !allowedRoles.includes(userProfile?.role)) {
    // 権限がない場合は勤怠入力ページにリダイレクト
    return <Navigate to="/attendance" replace />;
  }

  return children;
}

// 未認証ユーザー専用ルート
function PublicRoute({ children }) {
  const { isAuthenticated, isEmailVerified, loading } = useAuth();

  if (loading) {
    return <Loading fullScreen message="読み込み中..." />;
  }

  if (isAuthenticated) {
    if (!isEmailVerified) {
      return <Navigate to="/verify-email" replace />;
    }
    return <Navigate to="/attendance" replace />;
  }

  return children;
}

// メール確認ページ用ルート
function EmailVerificationRoute({ children }) {
  const { isAuthenticated, isEmailVerified, loading } = useAuth();

  if (loading) {
    return <Loading fullScreen message="読み込み中..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (isEmailVerified) {
    return <Navigate to="/attendance" replace />;
  }

  return children;
}

// メインルーティング
function AppRoutes() {
  return (
    <Routes>
      {/* 公開ルート */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <RegisterPage />
          </PublicRoute>
        }
      />
      <Route
        path="/forgot-password"
        element={
          <PublicRoute>
            <ForgotPasswordPage />
          </PublicRoute>
        }
      />

      {/* メール確認ページ */}
      <Route
        path="/verify-email"
        element={
          <EmailVerificationRoute>
            <EmailVerificationPage />
          </EmailVerificationRoute>
        }
      />

      {/* 全ロール共通ルート（自分の勤怠管理） */}
      <Route
        path="/attendance"
        element={
          <PrivateRoute allowedRoles={['employee', 'keiri', 'admin']}>
            <AttendancePage />
          </PrivateRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <PrivateRoute allowedRoles={['employee', 'keiri', 'admin']}>
            <SettingsPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/paid-leave"
        element={
          <PrivateRoute allowedRoles={['employee', 'keiri', 'admin']}>
            <PaidLeavePage />
          </PrivateRoute>
        }
      />

      {/* 管理者・経理用ルート */}
      <Route
        path="/admin"
        element={
          <PrivateRoute allowedRoles={['admin', 'keiri']}>
            <AdminPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/users"
        element={
          <PrivateRoute allowedRoles={['admin']}>
            <UserManagementPage />
          </PrivateRoute>
        }
      />

      {/* デフォルトリダイレクト */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AttendanceProvider>
          <AppRoutes />
        </AttendanceProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
