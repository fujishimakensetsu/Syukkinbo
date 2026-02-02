import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useAuth } from './AuthContext';
import {
  saveAttendance,
  getAttendanceByPeriod,
  batchSaveAttendance,
  linkTransferDays,
  unlinkTransferDay
} from '../services/attendanceService';

const AttendanceContext = createContext(null);

export function AttendanceProvider({ children }) {
  const { userProfile, isAuthenticated } = useAuth();

  // 選択中の期間
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

  // 勤怠データ（ユーザーIDごと）
  const [attendanceData, setAttendanceData] = useState({});

  // ローディング・保存状態
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // 期間変更時にデータを読み込む
  useEffect(() => {
    if (isAuthenticated && userProfile?.uid) {
      loadAttendanceData(userProfile.uid, selectedYear, selectedMonth);
    }
  }, [isAuthenticated, userProfile?.uid, selectedYear, selectedMonth]);

  // 勤怠データを読み込む
  const loadAttendanceData = useCallback(async (userId, year, month) => {
    setLoading(true);
    setError(null);

    try {
      const data = await getAttendanceByPeriod(userId, year, month);
      setAttendanceData(prev => ({
        ...prev,
        [userId]: {
          ...prev[userId],
          ...data
        }
      }));
    } catch (err) {
      console.error('Failed to load attendance data:', err);
      setError('勤怠データの読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  }, []);

  // 特定ユーザーの勤怠データを読み込む（管理者用）
  const loadUserAttendance = useCallback(async (userId, year, month) => {
    setLoading(true);
    setError(null);

    try {
      const data = await getAttendanceByPeriod(userId, year, month);
      setAttendanceData(prev => ({
        ...prev,
        [userId]: {
          ...prev[userId],
          ...data
        }
      }));
      return data;
    } catch (err) {
      console.error('Failed to load user attendance:', err);
      setError('勤怠データの読み込みに失敗しました');
      return {};
    } finally {
      setLoading(false);
    }
  }, []);

  // 勤怠データを更新（ローカル＋Firestore）
  const updateAttendance = useCallback(async (userId, dateKey, field, value) => {
    // ローカル状態を即時更新
    setAttendanceData(prev => ({
      ...prev,
      [userId]: {
        ...prev[userId],
        [dateKey]: {
          ...prev[userId]?.[dateKey],
          [field]: value
        }
      }
    }));

    // Firestoreに保存（変更者のUIDを渡す）
    setSaving(true);
    try {
      const currentData = attendanceData[userId]?.[dateKey] || {};
      await saveAttendance(userId, dateKey, {
        ...currentData,
        [field]: value
      }, userProfile?.uid);
    } catch (err) {
      console.error('Failed to save attendance:', err);
      setError('保存に失敗しました');
    } finally {
      setSaving(false);
    }
  }, [attendanceData, userProfile?.uid]);

  // 日付の勤怠データを一括更新
  const setDayAttendance = useCallback(async (userId, dateKey, dayData) => {
    // ローカル状態を即時更新
    setAttendanceData(prev => ({
      ...prev,
      [userId]: {
        ...prev[userId],
        [dateKey]: dayData
      }
    }));

    // Firestoreに保存（変更者のUIDを渡す）
    setSaving(true);
    try {
      await saveAttendance(userId, dateKey, dayData, userProfile?.uid);
    } catch (err) {
      console.error('Failed to save attendance:', err);
      setError('保存に失敗しました');
    } finally {
      setSaving(false);
    }
  }, [userProfile?.uid]);

  // 複数日の勤怠データを一括保存
  const saveBatchAttendance = useCallback(async (userId, dataMap) => {
    setSaving(true);
    try {
      await batchSaveAttendance(userId, dataMap);

      // ローカル状態も更新
      setAttendanceData(prev => ({
        ...prev,
        [userId]: {
          ...prev[userId],
          ...dataMap
        }
      }));
    } catch (err) {
      console.error('Failed to batch save:', err);
      setError('一括保存に失敗しました');
      throw err;
    } finally {
      setSaving(false);
    }
  }, []);

  // 振替休日を連動設定
  const setTransferLink = useCallback(async (userId, sourceDateKey, targetDateKey) => {
    setSaving(true);
    try {
      await linkTransferDays(userId, sourceDateKey, targetDateKey);

      // ローカル状態も更新
      setAttendanceData(prev => ({
        ...prev,
        [userId]: {
          ...prev[userId],
          [sourceDateKey]: {
            ...prev[userId]?.[sourceDateKey],
            kubun: '休日出勤',
            furikaeDate: targetDateKey,
            furikaeType: 'source'
          },
          [targetDateKey]: {
            ...prev[userId]?.[targetDateKey],
            kubun: '振休',
            furikaeDate: sourceDateKey,
            furikaeType: 'target',
            startTime: '',
            endTime: ''
          }
        }
      }));
    } catch (err) {
      console.error('Failed to link transfer days:', err);
      setError('振替日の設定に失敗しました');
      throw err;
    } finally {
      setSaving(false);
    }
  }, []);

  // 振替休日の連動を解除
  const removeTransferLink = useCallback(async (userId, dateKey) => {
    const dayData = attendanceData[userId]?.[dateKey];
    if (!dayData?.furikaeDate) return;

    const linkedDateKey = dayData.furikaeDate;

    setSaving(true);
    try {
      await unlinkTransferDay(userId, dateKey);

      // ローカル状態も更新
      setAttendanceData(prev => ({
        ...prev,
        [userId]: {
          ...prev[userId],
          [dateKey]: {
            ...prev[userId]?.[dateKey],
            furikaeDate: null,
            furikaeLinkedId: null,
            furikaeType: null
          },
          [linkedDateKey]: {
            ...prev[userId]?.[linkedDateKey],
            furikaeDate: null,
            furikaeLinkedId: null,
            furikaeType: null
          }
        }
      }));
    } catch (err) {
      console.error('Failed to unlink transfer days:', err);
      setError('振替日の解除に失敗しました');
      throw err;
    } finally {
      setSaving(false);
    }
  }, [attendanceData]);

  // ユーザーの勤怠データを取得
  const getUserAttendance = useCallback((userId) => {
    return attendanceData[userId] || {};
  }, [attendanceData]);

  // 特定日の勤怠データを取得
  const getDayAttendance = useCallback((userId, dateKey) => {
    return attendanceData[userId]?.[dateKey] || {};
  }, [attendanceData]);

  // データを再読み込み
  const refreshData = useCallback(async () => {
    if (userProfile?.uid) {
      await loadAttendanceData(userProfile.uid, selectedYear, selectedMonth);
    }
  }, [userProfile?.uid, selectedYear, selectedMonth, loadAttendanceData]);

  const value = {
    selectedYear,
    setSelectedYear,
    selectedMonth,
    setSelectedMonth,
    attendanceData,
    setAttendanceData,
    updateAttendance,
    setDayAttendance,
    saveBatchAttendance,
    getUserAttendance,
    getDayAttendance,
    loadUserAttendance,
    setTransferLink,
    removeTransferLink,
    refreshData,
    loading,
    saving,
    error,
    setError
  };

  return (
    <AttendanceContext.Provider value={value}>
      {children}
    </AttendanceContext.Provider>
  );
}

export function useAttendance() {
  const context = useContext(AttendanceContext);
  if (!context) {
    throw new Error('useAttendance must be used within an AttendanceProvider');
  }
  return context;
}

export default AttendanceContext;
