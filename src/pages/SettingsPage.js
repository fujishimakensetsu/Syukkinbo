import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Layout } from '../components/layout';
import { FixedHolidaySettings, DefaultTimeSettings, PaidLeaveSettings } from '../components/settings';
import { useAuth } from '../contexts/AuthContext';
import { updateUserSettings } from '../services/userService';
import { getCurrentFiscalYear } from '../utils/paidLeaveCalc';

export default function SettingsPage() {
  const navigate = useNavigate();
  const { userProfile, logOut, refreshProfile } = useAuth();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const handleLogout = async () => {
    await logOut();
    navigate('/login');
  };

  const handleSaveSettings = async (updates) => {
    if (!userProfile?.uid) return;

    setSaving(true);
    setMessage('');

    try {
      const newSettings = {
        ...userProfile.settings,
        ...updates
      };
      await updateUserSettings(userProfile.uid, newSettings);
      await refreshProfile();
      setMessage('設定を保存しました');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error('Failed to save settings:', err);
      setMessage('保存に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout currentUser={userProfile} onLogout={handleLogout}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">設定</h2>
          {message && (
            <span className={`text-sm ${message.includes('失敗') ? 'text-red-400' : 'text-green-400'}`}>
              {message}
            </span>
          )}
        </div>

        {/* 固定休日設定 */}
        <FixedHolidaySettings
          currentSettings={userProfile?.settings}
          onSave={handleSaveSettings}
          saving={saving}
        />

        {/* デフォルト時間設定 */}
        <DefaultTimeSettings
          currentSettings={userProfile?.settings}
          onSave={handleSaveSettings}
          saving={saving}
        />

        {/* 有給休暇設定 */}
        <PaidLeaveSettings
          currentSettings={userProfile?.settings}
          onSave={handleSaveSettings}
          saving={saving}
        />

        {/* 現在の設定確認 */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700">
          <h3 className="text-lg font-bold text-white mb-4">現在の設定</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-700/50 rounded-xl p-4">
              <p className="text-slate-400 text-xs mb-1">固定休日</p>
              <p className="text-white">
                {userProfile?.settings?.fixedHolidays?.length > 0
                  ? userProfile.settings.fixedHolidays.map(d => ['日', '月', '火', '水', '木', '金', '土'][d]).join('、')
                  : '設定なし'
                }
              </p>
            </div>
            <div className="bg-slate-700/50 rounded-xl p-4">
              <p className="text-slate-400 text-xs mb-1">デフォルト出退勤時間</p>
              <p className="text-white">
                {userProfile?.settings?.defaultStartTime || '08:45'} 〜 {userProfile?.settings?.defaultEndTime || '18:00'}
              </p>
            </div>
            <div className="bg-slate-700/50 rounded-xl p-4">
              <p className="text-slate-400 text-xs mb-1">有給付与日数（{getCurrentFiscalYear()}年度）</p>
              <p className="text-white">
                {userProfile?.settings?.paidLeave?.years?.[getCurrentFiscalYear()]?.granted
                  || userProfile?.settings?.paidLeave?.granted
                  || 0
                }日
              </p>
            </div>
          </div>

          {/* 有給管理ページへのリンク */}
          <div className="mt-4 pt-4 border-t border-slate-700">
            <Link
              to="/paid-leave"
              className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 text-sm transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              有給休暇の詳細を見る
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}
