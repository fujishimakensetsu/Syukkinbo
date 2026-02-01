import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button, Input } from '../common';

export default function LoginForm() {
  const navigate = useNavigate();
  const { signIn, error: authError, setError } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await signIn(email, password);
      navigate('/attendance');
    } catch (err) {
      // エラーはAuthContextで処理される
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20">
        {/* ロゴ */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg shadow-cyan-500/30">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">勤怠管理システム</h1>
          <p className="text-slate-400 mt-2 text-sm">Attendance Management System</p>
        </div>

        {/* フォーム */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="メールアドレス"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="example@company.com"
            required
          />

          <Input
            label="パスワード"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="パスワードを入力"
            required
          />

          {authError && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-red-400 text-sm text-center">
              {authError}
            </div>
          )}

          <Button
            type="submit"
            fullWidth
            loading={loading}
            size="lg"
          >
            ログイン
          </Button>
        </form>

        {/* リンク */}
        <div className="mt-6 space-y-3">
          <div className="text-center">
            <Link
              to="/register"
              className="text-cyan-400 text-sm hover:text-cyan-300 transition-colors"
            >
              新規アカウント登録
            </Link>
          </div>
          <div className="text-center">
            <Link
              to="/forgot-password"
              className="text-slate-400 text-sm hover:text-slate-300 transition-colors"
            >
              パスワードを忘れた方
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
