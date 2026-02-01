import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../common';

export default function EmailVerification() {
  const navigate = useNavigate();
  const { currentUser, isEmailVerified, resendVerification, logOut } = useAuth();

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);

  // メール確認済みなら勤怠ページへ
  useEffect(() => {
    if (isEmailVerified) {
      navigate('/attendance');
    }
  }, [isEmailVerified, navigate]);

  // カウントダウン
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // 確認メール再送信
  const handleResend = async () => {
    setError('');
    setMessage('');
    setLoading(true);

    try {
      await resendVerification();
      setMessage('確認メールを送信しました。メールをご確認ください。');
      setCountdown(60); // 60秒間再送信を無効化
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ページをリロードして確認状態を更新
  const handleRefresh = () => {
    window.location.reload();
  };

  // ログアウト
  const handleLogout = async () => {
    await logOut();
    navigate('/login');
  };

  return (
    <div className="w-full max-w-md">
      <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20">
        {/* アイコン */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg shadow-orange-500/30">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">メール確認</h1>
          <p className="text-slate-400 mt-2 text-sm">
            {currentUser?.email} に確認メールを送信しました
          </p>
        </div>

        {/* 説明 */}
        <div className="bg-slate-700/30 rounded-xl p-4 mb-6">
          <p className="text-slate-300 text-sm leading-relaxed">
            メールに記載されたリンクをクリックして、アカウントを有効化してください。
            メールが届かない場合は、迷惑メールフォルダもご確認ください。
          </p>
        </div>

        {/* メッセージ表示 */}
        {message && (
          <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-3 text-green-400 text-sm text-center mb-4">
            {message}
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-red-400 text-sm text-center mb-4">
            {error}
          </div>
        )}

        {/* ボタン */}
        <div className="space-y-3">
          <Button
            onClick={handleResend}
            fullWidth
            disabled={countdown > 0}
            loading={loading}
          >
            {countdown > 0 ? `再送信まで ${countdown}秒` : '確認メールを再送信'}
          </Button>

          <Button
            onClick={handleRefresh}
            variant="secondary"
            fullWidth
          >
            確認済みの場合はこちら
          </Button>

          <Button
            onClick={handleLogout}
            variant="ghost"
            fullWidth
          >
            ログアウト
          </Button>
        </div>
      </div>
    </div>
  );
}
