import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { auth } from '../config/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import {
  signUp as authSignUp,
  signIn as authSignIn,
  logOut as authLogOut,
  resendVerificationEmail,
  resetPassword as authResetPassword,
  getAuthErrorMessage
} from '../services/authService';
import {
  getUserProfile,
  createUserProfile,
  updateEmailVerified
} from '../services/userService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 認証状態の監視
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);

      if (user) {
        try {
          // Firestoreからユーザープロフィールを取得
          let profile = await getUserProfile(user.uid);

          // プロフィールがなければ作成（初回ログイン時）
          if (!profile) {
            profile = await createUserProfile(user.uid, {
              email: user.email,
              name: user.displayName || 'ユーザー',
              role: 'employee',
              emailVerified: user.emailVerified
            });
          }

          // メール確認状態を同期
          if (profile.emailVerified !== user.emailVerified) {
            await updateEmailVerified(user.uid, user.emailVerified);
            profile.emailVerified = user.emailVerified;
          }

          setUserProfile(profile);
        } catch (err) {
          console.error('Failed to load user profile:', err);
          setError('プロフィールの読み込みに失敗しました');
        }
      } else {
        setUserProfile(null);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // 新規登録
  const signUp = useCallback(async (email, password, userData) => {
    setError(null);
    try {
      const userCredential = await authSignUp(email, password, userData.name);

      // Firestoreにプロフィールを作成
      await createUserProfile(userCredential.user.uid, {
        email,
        name: userData.name,
        department: userData.department,
        role: 'employee',
        emailVerified: false
      });

      return userCredential;
    } catch (err) {
      const message = getAuthErrorMessage(err);
      setError(message);
      throw new Error(message);
    }
  }, []);

  // ログイン
  const signIn = useCallback(async (email, password) => {
    setError(null);
    try {
      const userCredential = await authSignIn(email, password);
      return userCredential;
    } catch (err) {
      const message = getAuthErrorMessage(err);
      setError(message);
      throw new Error(message);
    }
  }, []);

  // ログアウト
  const logOut = useCallback(async () => {
    setError(null);
    try {
      await authLogOut();
      setUserProfile(null);
    } catch (err) {
      const message = getAuthErrorMessage(err);
      setError(message);
      throw new Error(message);
    }
  }, []);

  // 確認メール再送信
  const resendVerification = useCallback(async () => {
    setError(null);
    try {
      await resendVerificationEmail(currentUser);
    } catch (err) {
      const message = getAuthErrorMessage(err);
      setError(message);
      throw new Error(message);
    }
  }, [currentUser]);

  // パスワードリセット
  const resetPassword = useCallback(async (email) => {
    setError(null);
    try {
      await authResetPassword(email);
    } catch (err) {
      const message = getAuthErrorMessage(err);
      setError(message);
      throw new Error(message);
    }
  }, []);

  // プロフィール更新
  const refreshProfile = useCallback(async () => {
    if (currentUser) {
      const profile = await getUserProfile(currentUser.uid);
      setUserProfile(profile);
    }
  }, [currentUser]);

  const value = {
    currentUser,
    userProfile,
    setUserProfile,
    loading,
    error,
    setError,
    isAuthenticated: !!currentUser,
    isEmailVerified: currentUser?.emailVerified || false,
    signUp,
    signIn,
    logOut,
    resendVerification,
    resetPassword,
    refreshProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
