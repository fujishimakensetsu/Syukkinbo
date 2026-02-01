import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button, Input, Select } from '../common';
import { DEPARTMENT_OPTIONS } from '../../utils/constants';

export default function RegisterForm() {
  const navigate = useNavigate();
  const { signUp, error: authError, setError } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    department: DEPARTMENT_OPTIONS[0]
  });
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState('');

  const handleChange = (field) => (e) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    setLocalError('');
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    setError(null);

    // バリデーション
    if (formData.password !== formData.confirmPassword) {
      setLocalError('パスワードが一致しません');
      return;
    }

    if (formData.password.length < 6) {
      setLocalError('パスワードは6文字以上で入力してください');
      return;
    }

    if (!formData.name.trim()) {
      setLocalError('氏名を入力してください');
      return;
    }

    setLoading(true);

    try {
      await signUp(formData.email, formData.password, {
        name: formData.name,
        department: formData.department
      });

      // メール確認画面へ
      navigate('/verify-email');
    } catch (err) {
      // エラーはAuthContextで処理される
    } finally {
      setLoading(false);
    }
  };

  const displayError = localError || authError;

  return (
    <div className="w-full max-w-md">
      <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20">
        {/* ヘッダー */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg shadow-cyan-500/30">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">アカウント登録</h1>
          <p className="text-slate-400 mt-2 text-sm">新規アカウントを作成します</p>
        </div>

        {/* フォーム */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="メールアドレス"
            type="email"
            value={formData.email}
            onChange={handleChange('email')}
            placeholder="example@company.com"
            required
          />

          <Input
            label="パスワード"
            type="password"
            value={formData.password}
            onChange={handleChange('password')}
            placeholder="6文字以上"
            required
          />

          <Input
            label="パスワード（確認）"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange('confirmPassword')}
            placeholder="もう一度入力"
            required
          />

          <Input
            label="氏名"
            type="text"
            value={formData.name}
            onChange={handleChange('name')}
            placeholder="山田 太郎"
            required
          />

          <Select
            label="所属部署"
            value={formData.department}
            onChange={handleChange('department')}
            options={DEPARTMENT_OPTIONS}
            required
          />

          {displayError && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-red-400 text-sm text-center">
              {displayError}
            </div>
          )}

          <Button
            type="submit"
            fullWidth
            loading={loading}
            size="lg"
          >
            登録する
          </Button>
        </form>

        {/* リンク */}
        <div className="mt-6 text-center">
          <Link
            to="/login"
            className="text-slate-400 text-sm hover:text-slate-300 transition-colors"
          >
            すでにアカウントをお持ちの方
          </Link>
        </div>
      </div>
    </div>
  );
}
