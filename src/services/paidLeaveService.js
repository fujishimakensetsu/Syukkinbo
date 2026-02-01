import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { getAttendanceByDateRange } from './attendanceService';
import { getFiscalYearRange, formatDateKey } from '../utils/dateUtils';
import { calculateUsedDays, getPaidLeaveSummary } from '../utils/paidLeaveCalc';

const USERS_COLLECTION = 'users';

/**
 * ユーザーの有給設定を取得
 * @param {string} userId
 * @returns {Promise<Object>}
 */
export const getPaidLeaveSettings = async (userId) => {
  const docRef = doc(db, USERS_COLLECTION, userId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    const data = docSnap.data();
    return data.paidLeave || { granted: 0 };
  }
  return { granted: 0 };
};

/**
 * 有給の付与日数を更新
 * @param {string} userId
 * @param {number} granted 付与日数
 * @param {number} fiscalYear 年度
 * @returns {Promise<void>}
 */
export const updateGrantedDays = async (userId, granted, fiscalYear) => {
  const docRef = doc(db, USERS_COLLECTION, userId);

  // 年度別に保存
  const fieldKey = `paidLeave.years.${fiscalYear}`;

  await updateDoc(docRef, {
    [fieldKey]: {
      granted,
      updatedAt: serverTimestamp()
    },
    updatedAt: serverTimestamp()
  });
};

/**
 * 年度の有給付与日数を取得
 * @param {string} userId
 * @param {number} fiscalYear
 * @returns {Promise<number>}
 */
export const getGrantedDaysForYear = async (userId, fiscalYear) => {
  const settings = await getPaidLeaveSettings(userId);
  return settings?.years?.[fiscalYear]?.granted || settings?.granted || 0;
};

/**
 * 年度内の有給取得状況を取得
 * @param {string} userId
 * @param {number} fiscalYear
 * @returns {Promise<Object>}
 */
export const getPaidLeaveUsage = async (userId, fiscalYear) => {
  const { start, end } = getFiscalYearRange(fiscalYear);
  const startKey = formatDateKey(start);
  const endKey = formatDateKey(end);

  // 年度内の勤怠データを取得
  const attendanceList = await getAttendanceByDateRange(userId, startKey, endKey);

  // 配列からオブジェクトに変換
  const attendanceData = {};
  attendanceList.forEach(item => {
    attendanceData[item.date] = item;
  });

  return calculateUsedDays(attendanceData, fiscalYear);
};

/**
 * 有給サマリーを取得
 * @param {string} userId
 * @param {number} fiscalYear
 * @returns {Promise<Object>}
 */
export const fetchPaidLeaveSummary = async (userId, fiscalYear) => {
  const [granted, usage] = await Promise.all([
    getGrantedDaysForYear(userId, fiscalYear),
    getPaidLeaveUsage(userId, fiscalYear)
  ]);

  const remaining = Math.max(0, granted - usage.total);

  return {
    fiscalYear,
    granted,
    used: usage.total,
    remaining,
    breakdown: usage.breakdown
  };
};
