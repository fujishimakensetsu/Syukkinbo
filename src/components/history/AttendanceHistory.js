import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getHistoryByUser, getAllHistory } from '../../services/historyService';
import HistoryTimeline from './HistoryTimeline';
import { Loading } from '../common';

export default function AttendanceHistory({ targetUserId = null, userName = null }) {
  const { userProfile } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterDate, setFilterDate] = useState('');

  const isAdmin = userProfile?.role === 'admin' || userProfile?.role === 'keiri';

  useEffect(() => {
    loadHistory();
  }, [targetUserId, userProfile?.uid]);

  const loadHistory = async () => {
    setLoading(true);
    setError(null);

    try {
      let data;
      if (isAdmin && !targetUserId) {
        // 管理者が全履歴を見る場合
        data = await getAllHistory(200);
      } else {
        // 特定ユーザーの履歴を見る場合
        const userId = targetUserId || userProfile?.uid;
        data = await getHistoryByUser(userId, 100);
      }
      setHistory(data);
    } catch (err) {
      console.error('Failed to load history:', err);
      setError('履歴の読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  // 日付でフィルタリング
  const filteredHistory = filterDate
    ? history.filter(h => h.date === filterDate)
    : history;

  if (loading) {
    return <Loading message="履歴を読み込み中..." />;
  }

  if (error) {
    return (
      <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 text-red-300">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* フィルター */}
      <div className="flex flex-wrap gap-4 items-center">
        <div>
          <label className="block text-sm text-gray-400 mb-1">日付でフィルター</label>
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
        </div>
        {filterDate && (
          <button
            onClick={() => setFilterDate('')}
            className="mt-6 px-3 py-2 text-sm bg-gray-700 hover:bg-gray-600 rounded-lg text-white transition-colors"
          >
            フィルターをクリア
          </button>
        )}
        <button
          onClick={loadHistory}
          className="mt-6 px-4 py-2 text-sm bg-cyan-600 hover:bg-cyan-500 rounded-lg text-white transition-colors"
        >
          更新
        </button>
      </div>

      {/* 履歴件数表示 */}
      <div className="text-sm text-gray-400">
        {filterDate ? (
          <span>{filterDate} の履歴: {filteredHistory.length}件</span>
        ) : (
          <span>全{history.length}件の履歴</span>
        )}
      </div>

      {/* タイムライン */}
      {filteredHistory.length > 0 ? (
        <HistoryTimeline history={filteredHistory} showUserName={isAdmin && !targetUserId} />
      ) : (
        <div className="text-center text-gray-500 py-8">
          履歴がありません
        </div>
      )}
    </div>
  );
}
