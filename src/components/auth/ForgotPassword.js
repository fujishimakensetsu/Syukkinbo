import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button, Input } from '../common';

export default function ForgotPassword() {
  const { resetPassword } = useAuth();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      await resetPassword(email);
      setMessage('パスワードリセットメールを送信しました。メールをご確認ください。');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20">
        {/* ヘッダー */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg shadow-cyan-500/30">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">パスワードリセット</h1>
          <p className="text-slate-400 mt-2 text-sm">
            登録済みのメールアドレスを入力してください
          </p>
        </div>

        {/* 成功メッセージ */}
        {message && (
          <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 text-green-400 text-sm text-center mb-6">
            <p>{message}</p>
            <Link
              to="/login"
              className="inline-block mt-3 text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              ログイン画面に戻る
            </Link>
          </div>
        )}

        {/* フォーム */}
        {!message && (
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="メールアドレス"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@company.com"
              required
            />

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-red-400 text-sm text-center">
                {error}
              </div>
            )}

            <Button
              type="submit"
              fullWidth
              loading={loading}
              size="lg"
            >
              リセットメールを送信
            </Button>
          </form>
        )}

        {/* リンク */}
        <div className="mt-6 text-center">
          <Link
            to="/login"
            className="text-slate-400 text-sm hover:text-slate-300 transition-colors"
          >
            ログイン画面に戻る
          </Link>
        </div>
      </div>
    </div>
  );
}
