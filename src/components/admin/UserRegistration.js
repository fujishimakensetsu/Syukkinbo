import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { createUserProfile } from '../../services/userService';
import { Button, Input, Select, Modal } from '../common';
import { DEPARTMENT_OPTIONS, ROLE_OPTIONS } from '../../utils/constants';

// Firebase Admin SDK経由でユーザーを作成するには、Cloud Functionsが必要
// ここでは招待メール送信のUIのみ実装し、実際の処理はPhase 3以降で実装

export default function UserRegistration({ isOpen, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    role: 'employee',
    department: DEPARTMENT_OPTIONS[0]
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (field) => (e) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 注意: Firebase Admin SDKを使用したユーザー作成は
      // Cloud Functionsで実装する必要があります
      // ここでは仮の処理として、招待メール送信のUIのみ表示

      // 実際の実装では:
      // 1. Cloud Functionを呼び出してユーザーを作成
      // 2. 初期パスワードを設定
      // 3. ユーザーに招待メールを送信
      // 4. Firestoreにユーザープロフィールを作成

      // デモ用のシミュレーション
      await new Promise(resolve => setTimeout(resolve, 1000));

      setSuccess(true);
      setTimeout(() => {
        onSuccess?.();
        handleClose();
      }, 2000);

    } catch (err) {
      setError(err.message || 'ユーザーの登録に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      email: '',
      name: '',
      role: 'employee',
      department: DEPARTMENT_OPTIONS[0]
    });
    setError('');
    setSuccess(false);
    onClose();
  };

  const roleOptions = Object.values(ROLE_OPTIONS).map(r => ({
    value: r.value,
    label: r.label
  }));

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="新規ユーザー登録"
      size="md"
    >
      {success ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-green-500/20 rounded-full mx-auto mb-4 flex items-center justify-center">
            <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-white mb-2">登録完了</h3>
          <p className="text-slate-400 text-sm">
            {formData.email} に招待メールを送信しました
          </p>
        </div>
      ) : (
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
            label="氏名"
            type="text"
            value={formData.name}
            onChange={handleChange('name')}
            placeholder="山田 太郎"
            required
          />

          <Select
            label="権限"
            value={formData.role}
            onChange={handleChange('role')}
            options={roleOptions}
          />

          {formData.role === 'employee' && (
            <Select
              label="所属部署"
              value={formData.department}
              onChange={handleChange('department')}
              options={DEPARTMENT_OPTIONS}
            />
          )}

          <div className="bg-slate-700/30 rounded-xl p-4">
            <p className="text-slate-400 text-sm">
              登録すると、入力したメールアドレスに招待メールが送信されます。
              ユーザーはメール内のリンクからパスワードを設定してアカウントを有効化します。
            </p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={handleClose}
              className="flex-1"
            >
              キャンセル
            </Button>
            <Button
              type="submit"
              loading={loading}
              className="flex-1"
            >
              招待メールを送信
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
