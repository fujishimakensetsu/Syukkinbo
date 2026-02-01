import { getFiscalYear, getFiscalYearRange, formatDateKey } from './dateUtils';

/**
 * 有給休暇の消化日数マッピング
 */
const PAID_LEAVE_DAYS_MAP = {
  '有給': 1,
  '午前休': 0.5,
  '午後休': 0.5
};

/**
 * 勤怠データから有給取得日数を計算
 * @param {Object} attendanceData { dateKey: { kubun, ... } }
 * @param {number} fiscalYear 対象年度
 * @returns {{total: number, breakdown: {yukyu: number, amRest: number, pmRest: number}}}
 */
export const calculateUsedDays = (attendanceData, fiscalYear) => {
  const { start, end } = getFiscalYearRange(fiscalYear);
  const startKey = formatDateKey(start);
  const endKey = formatDateKey(end);

  let yukyu = 0;      // 有給の回数
  let amRest = 0;     // 午前休の回数
  let pmRest = 0;     // 午後休の回数

  Object.entries(attendanceData).forEach(([dateKey, data]) => {
    // 年度期間内かチェック
    if (dateKey < startKey || dateKey > endKey) return;

    const kubun = data?.kubun;
    if (kubun === '有給') {
      yukyu++;
    } else if (kubun === '午前休') {
      amRest++;
    } else if (kubun === '午後休') {
      pmRest++;
    }
  });

  const total = yukyu + (amRest * 0.5) + (pmRest * 0.5);

  return {
    total,
    breakdown: {
      yukyu,
      amRest,
      pmRest
    }
  };
};

/**
 * 残日数を計算
 * @param {number} granted 付与日数
 * @param {number} used 取得日数
 * @returns {number}
 */
export const calculateRemainingDays = (granted, used) => {
  return Math.max(0, granted - used);
};

/**
 * 有給サマリーを取得
 * @param {Object} attendanceData 勤怠データ
 * @param {number} granted 付与日数
 * @param {number} fiscalYear 対象年度
 * @returns {{granted: number, used: number, remaining: number, breakdown: Object}}
 */
export const getPaidLeaveSummary = (attendanceData, granted, fiscalYear) => {
  const usedData = calculateUsedDays(attendanceData, fiscalYear);
  const remaining = calculateRemainingDays(granted, usedData.total);

  return {
    granted,
    used: usedData.total,
    remaining,
    breakdown: usedData.breakdown
  };
};

/**
 * 月別の有給取得状況を取得
 * @param {Object} attendanceData 勤怠データ
 * @param {number} fiscalYear 対象年度
 * @returns {Array<{month: string, yukyu: number, amRest: number, pmRest: number, total: number}>}
 */
export const getMonthlyPaidLeaveUsage = (attendanceData, fiscalYear) => {
  const { start, end } = getFiscalYearRange(fiscalYear);
  const startKey = formatDateKey(start);
  const endKey = formatDateKey(end);

  // 月別集計用
  const monthlyData = {};

  Object.entries(attendanceData).forEach(([dateKey, data]) => {
    // 年度期間内かチェック
    if (dateKey < startKey || dateKey > endKey) return;

    const kubun = data?.kubun;
    if (!['有給', '午前休', '午後休'].includes(kubun)) return;

    // 月キーを生成（YYYY-MM形式）
    const monthKey = dateKey.substring(0, 7);

    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = { yukyu: 0, amRest: 0, pmRest: 0 };
    }

    if (kubun === '有給') {
      monthlyData[monthKey].yukyu++;
    } else if (kubun === '午前休') {
      monthlyData[monthKey].amRest++;
    } else if (kubun === '午後休') {
      monthlyData[monthKey].pmRest++;
    }
  });

  // 配列に変換してソート
  return Object.entries(monthlyData)
    .map(([month, data]) => ({
      month,
      ...data,
      total: data.yukyu + (data.amRest * 0.5) + (data.pmRest * 0.5)
    }))
    .sort((a, b) => a.month.localeCompare(b.month));
};

/**
 * 現在の年度を取得
 * @returns {number}
 */
export const getCurrentFiscalYear = () => {
  return getFiscalYear(new Date());
};
