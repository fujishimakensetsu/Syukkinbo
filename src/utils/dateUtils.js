import { DAY_OF_WEEK, ATTENDANCE_PERIOD, PAID_LEAVE_FISCAL_START } from './constants';

/**
 * 日付をYYYY-MM-DD形式の文字列に変換
 * @param {Date} date
 * @returns {string}
 */
export const formatDateKey = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * YYYY-MM-DD形式の文字列をDateオブジェクトに変換
 * @param {string} dateKey
 * @returns {Date}
 */
export const parseDateKey = (dateKey) => {
  const [year, month, day] = dateKey.split('-').map(Number);
  return new Date(year, month - 1, day);
};

/**
 * 日付をM/D形式でフォーマット
 * @param {Date} date
 * @returns {string}
 */
export const formatShortDate = (date) => {
  return `${date.getMonth() + 1}/${date.getDate()}`;
};

/**
 * 日付をYYYY/MM/DD形式でフォーマット
 * @param {Date} date
 * @returns {string}
 */
export const formatFullDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}/${month}/${day}`;
};

/**
 * 曜日を取得
 * @param {Date} date
 * @returns {string}
 */
export const getDayOfWeek = (date) => {
  return DAY_OF_WEEK[date.getDay()];
};

/**
 * 週末かどうか判定
 * @param {Date} date
 * @returns {boolean}
 */
export const isWeekend = (date) => {
  const day = date.getDay();
  return day === 0 || day === 6;
};

/**
 * 勤怠期間の日付配列を生成（16日〜翌月15日）
 * @param {number} year
 * @param {number} month
 * @returns {Array<{date: Date, dayOfWeek: string, isWeekend: boolean}>}
 */
export const generateAttendanceDates = (year, month) => {
  const dates = [];
  const startDate = new Date(year, month - 1, ATTENDANCE_PERIOD.startDay);

  for (let i = 0; i < 31; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);

    // 翌月15日を超えたら終了
    if (date.getMonth() !== month - 1 && date.getDate() > ATTENDANCE_PERIOD.endDay) {
      break;
    }

    // 当月16日以降、または翌月15日以前のみ追加
    if (date.getDate() >= ATTENDANCE_PERIOD.startDay || date.getMonth() !== month - 1) {
      if (date.getMonth() === month - 1 || date.getDate() <= ATTENDANCE_PERIOD.endDay) {
        dates.push({
          date: date,
          dateKey: formatDateKey(date),
          dayOfWeek: getDayOfWeek(date),
          isWeekend: isWeekend(date)
        });
      }
    }
  }

  return dates;
};

/**
 * 有給年度を取得（4/15起算）
 * @param {Date} date
 * @returns {number}
 */
export const getFiscalYear = (date) => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  // 4/15より前なら前年度
  if (month < PAID_LEAVE_FISCAL_START.month ||
      (month === PAID_LEAVE_FISCAL_START.month && day < PAID_LEAVE_FISCAL_START.day)) {
    return year - 1;
  }
  return year;
};

/**
 * 有給年度の開始日・終了日を取得
 * @param {number} fiscalYear
 * @returns {{start: Date, end: Date}}
 */
export const getFiscalYearRange = (fiscalYear) => {
  const start = new Date(
    fiscalYear,
    PAID_LEAVE_FISCAL_START.month - 1,
    PAID_LEAVE_FISCAL_START.day
  );
  const end = new Date(
    fiscalYear + 1,
    PAID_LEAVE_FISCAL_START.month - 1,
    PAID_LEAVE_FISCAL_START.day - 1
  );
  return { start, end };
};

/**
 * 2つの日付が同じ日かどうか判定
 * @param {Date} date1
 * @param {Date} date2
 * @returns {boolean}
 */
export const isSameDay = (date1, date2) => {
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getDate() === date2.getDate();
};

/**
 * 月の日数を取得
 * @param {number} year
 * @param {number} month
 * @returns {number}
 */
export const getDaysInMonth = (year, month) => {
  return new Date(year, month, 0).getDate();
};

/**
 * 月の最初の曜日を取得（0=日曜）
 * @param {number} year
 * @param {number} month
 * @returns {number}
 */
export const getFirstDayOfMonth = (year, month) => {
  return new Date(year, month - 1, 1).getDay();
};
