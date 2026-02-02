import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { getFiscalYearRange, calculateYearlyStatistics } from '../utils/attendanceCalc';

const ATTENDANCE_COLLECTION = 'attendance';

/**
 * 年度内の出勤データを取得
 * @param {string} userId
 * @param {number} fiscalYear 年度（例: 2025 = 2025年度 = 2025/4/16〜2026/4/15）
 * @returns {Promise<Object>} { dateKey: data } 形式
 */
export const getAttendanceByFiscalYear = async (userId, fiscalYear) => {
  const { startDate, endDate } = getFiscalYearRange(fiscalYear);

  const attendanceRef = collection(db, ATTENDANCE_COLLECTION);
  const q = query(
    attendanceRef,
    where('userId', '==', userId),
    where('date', '>=', startDate),
    where('date', '<=', endDate)
  );

  const snapshot = await getDocs(q);
  const result = {};

  snapshot.docs.forEach(doc => {
    const data = doc.data();
    result[data.date] = { id: doc.id, ...data };
  });

  return result;
};

/**
 * 年間統計を取得
 * @param {string} userId
 * @param {number} fiscalYear 年度
 * @returns {Promise<Object>}
 */
export const getYearlyStatistics = async (userId, fiscalYear) => {
  const attendanceData = await getAttendanceByFiscalYear(userId, fiscalYear);
  const statistics = calculateYearlyStatistics(attendanceData);

  const { startDate, endDate } = getFiscalYearRange(fiscalYear);

  return {
    fiscalYear,
    periodStart: startDate,
    periodEnd: endDate,
    ...statistics,
    rawData: attendanceData
  };
};

/**
 * 複数ユーザーの年間統計を取得（管理者用）
 * @param {Array<string>} userIds
 * @param {number} fiscalYear
 * @returns {Promise<Object>} { userId: statistics }
 */
export const getYearlyStatisticsForUsers = async (userIds, fiscalYear) => {
  const results = {};

  await Promise.all(
    userIds.map(async (userId) => {
      try {
        results[userId] = await getYearlyStatistics(userId, fiscalYear);
      } catch (err) {
        console.error(`Failed to get statistics for user ${userId}:`, err);
        results[userId] = null;
      }
    })
  );

  return results;
};

/**
 * 月別集計を取得
 * @param {string} userId
 * @param {number} fiscalYear
 * @returns {Promise<Array>}
 */
export const getMonthlyBreakdown = async (userId, fiscalYear) => {
  const attendanceData = await getAttendanceByFiscalYear(userId, fiscalYear);

  // 月ごとにグループ化
  const monthlyData = {};

  Object.entries(attendanceData).forEach(([dateKey, day]) => {
    const yearMonth = dateKey.substring(0, 7); // YYYY-MM
    if (!monthlyData[yearMonth]) {
      monthlyData[yearMonth] = {};
    }
    monthlyData[yearMonth][dateKey] = day;
  });

  // 各月の統計を計算
  const breakdown = Object.entries(monthlyData)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([yearMonth, data]) => {
      const stats = calculateYearlyStatistics(data);
      return {
        yearMonth,
        ...stats
      };
    });

  return breakdown;
};
