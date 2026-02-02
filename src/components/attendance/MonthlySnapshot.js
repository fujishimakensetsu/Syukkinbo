import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useAttendance } from '../../contexts/AttendanceContext';
import {
  getMonthlySnapshot,
  saveMonthlySnapshot,
  isMonthConfirmed
} from '../../services/snapshotService';
import { Button, Modal, Loading } from '../common';
import { AttendanceSummary } from './AttendanceSummary';
import { minutesToTime } from '../../utils/attendanceCalc';

export default function MonthlySnapshot({ userId, year, month }) {
  const { userProfile } = useAuth();
  const { attendanceData } = useAttendance();
  const [snapshot, setSnapshot] = useState(null);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [error, setError] = useState(null);

  const targetUserId = userId || userProfile?.uid;

  useEffect(() => {
    if (targetUserId) {
      loadSnapshot();
    }
  }, [targetUserId, year, month]);

  const loadSnapshot = async () => {
    setLoading(true);
    setError(null);
    try {
      const [snapshotData, confirmed] = await Promise.all([
        getMonthlySnapshot(targetUserId, year, month),
        isMonthConfirmed(targetUserId, year, month)
      ]);
      setSnapshot(snapshotData);
      setIsConfirmed(confirmed);
    } catch (err) {
      console.error('Failed to load snapshot:', err);
      setError('スナップショットの読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    setSaving(true);
    setError(null);
    try {
      const result = await saveMonthlySnapshot(
        targetUserId,
        year,
        month,
        userProfile?.uid
      );
      setSnapshot(result);
      setIsConfirmed(true);
      setShowConfirmModal(false);
    } catch (err) {
      console.error('Failed to save snapshot:', err);
      setError(err.message || 'スナップショットの保存に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Loading message="読み込み中..." />;
  }

  const displayData = isConfirmed && snapshot
    ? snapshot.attendanceData
    : attendanceData[targetUserId] || {};

  const displaySummary = isConfirmed && snapshot
    ? snapshot.summary
    : null;

  return (
    <div className="space-y-4">
      {/* ステータス表示 */}
      <div className={`rounded-lg p-4 border ${
        isConfirmed
          ? 'bg-green-500/10 border-green-500/30'
          : 'bg-yellow-500/10 border-yellow-500/30'
      }`}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {isConfirmed ? (
              <>
                <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-green-400 font-medium">提出済み</p>
                  {snapshot?.confirmedAt && (
                    <p className="text-sm text-green-300/70">
                      {snapshot.confirmedAt.toLocaleString('ja-JP')} に提出
                      {snapshot?.version > 1 && ` (Ver.${snapshot.version})`}
                    </p>
                  )}
                </div>
              </>
            ) : (
              <>
                <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-yellow-400 font-medium">未提出</p>
                  <p className="text-sm text-yellow-300/70">
                    内容を確認し、提出ボタンを押してください
                  </p>
                </div>
              </>
            )}
          </div>

          <Button
            onClick={() => setShowConfirmModal(true)}
            variant={isConfirmed ? 'secondary' : 'primary'}
            disabled={saving}
          >
            {isConfirmed ? '再提出' : 'この月を提出'}
          </Button>
        </div>
      </div>

      {/* エラー表示 */}
      {error && (
        <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 text-red-300">
          {error}
        </div>
      )}

      {/* 確定済みの場合はスナップショットの集計を表示 */}
      {isConfirmed && displaySummary && (
        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
          <h3 className="text-lg font-medium text-white mb-4">確定時の集計</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-900/50 rounded-lg p-3">
              <p className="text-sm text-gray-400">出勤日数</p>
              <p className="text-xl font-bold text-white">{displaySummary.workDays}日</p>
            </div>
            <div className="bg-gray-900/50 rounded-lg p-3">
              <p className="text-sm text-gray-400">定休日</p>
              <p className="text-xl font-bold text-white">{displaySummary.holidayDays}日</p>
            </div>
            <div className="bg-gray-900/50 rounded-lg p-3">
              <p className="text-sm text-gray-400">有給取得</p>
              <p className="text-xl font-bold text-white">{displaySummary.paidLeaveDays}日</p>
            </div>
            <div className="bg-gray-900/50 rounded-lg p-3">
              <p className="text-sm text-gray-400">振休</p>
              <p className="text-xl font-bold text-white">{displaySummary.transferDays}日</p>
            </div>
            <div className="bg-gray-900/50 rounded-lg p-3 col-span-2">
              <p className="text-sm text-gray-400">総就業時間</p>
              <p className="text-xl font-bold text-cyan-400">{displaySummary.totalTime}</p>
            </div>
          </div>
        </div>
      )}

      {/* 提出確認モーダル */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title={isConfirmed ? '月次出勤簿の再提出' : '月次出勤簿の提出'}
      >
        <div className="space-y-4">
          <p className="text-slate-300">
            {year}年{month}月（{month}月16日〜{month === 12 ? year + 1 : year}年{month === 12 ? 1 : month + 1}月15日）の出勤簿を{isConfirmed ? '再提出' : '提出'}しますか？
          </p>
          {isConfirmed && (
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-sm text-blue-300">
                  <p>再提出すると、現在の勤怠データで上書きされます。</p>
                  <p>以前の提出内容は履歴として保存されます。</p>
                </div>
              </div>
            </div>
          )}
          <div className="flex gap-3 pt-2">
            <Button
              onClick={() => setShowConfirmModal(false)}
              variant="secondary"
              className="flex-1"
              disabled={saving}
            >
              キャンセル
            </Button>
            <Button
              onClick={handleConfirm}
              variant="primary"
              className="flex-1"
              disabled={saving}
            >
              {saving ? '提出中...' : (isConfirmed ? '再提出する' : '提出する')}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
