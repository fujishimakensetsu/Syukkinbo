/**
 * 勤怠データから集計を計算
 * @param {string} userId
 * @param {Object} attendanceData
 * @returns {Object}
 */
export const calculateSummary = (userId, attendanceData) => {
  const userData = attendanceData[userId] || {};

  let workDays = 0;
  let holidayDays = 0;
  let paidLeaveDays = 0;
  let holidayWorkDays = 0;
  let transferDays = 0;
  let bereavementDays = 0;  // 忌引
  let totalMinutes = 0;

  Object.values(userData).forEach(day => {
    switch (day.kubun) {
      case '出勤':
        workDays++;
        break;
      case '休日出勤':
        workDays++;
        holidayWorkDays++;
        break;
      case '定休日':
        holidayDays++;
        break;
      case '有給':
        paidLeaveDays++;
        break;
      case '午前休':
      case '午後休':
        paidLeaveDays += 0.5;
        workDays += 0.5;
        break;
      case '振休':
        transferDays++;
        break;
      case '忌引':
        bereavementDays++;
        // 忌引は出勤日数、定休日、有給のいずれにもカウントしない
        break;
      default:
        break;
    }

    // 就業時間計算
    if (day.startTime && day.endTime) {
      const [sh, sm] = day.startTime.split(':').map(Number);
      const [eh, em] = day.endTime.split(':').map(Number);
      const workMinutes = (eh * 60 + em) - (sh * 60 + sm) - 60; // 休憩1時間
      if (workMinutes > 0) {
        totalMinutes += workMinutes;
      }
    }
  });

  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;

  return {
    workDays,
    holidayDays,
    paidLeaveDays,
    holidayWorkDays,
    transferDays,
    bereavementDays,
    totalMinutes,
    totalTime: `${hours}:${mins.toString().padStart(2, '0')}`
  };
};

/**
 * 月間の有給取得日数を計算
 * @param {string} userId
 * @param {Object} attendanceData
 * @returns {Object}
 */
export const calculatePaidLeaveUsage = (userId, attendanceData) => {
  const userData = attendanceData[userId] || {};

  let fullDays = 0;
  let halfDays = 0;

  Object.values(userData).forEach(day => {
    if (day.kubun === '有給') {
      fullDays++;
    } else if (day.kubun === '午前休' || day.kubun === '午後休') {
      halfDays++;
    }
  });

  return {
    fullDays,
    halfDays,
    totalDays: fullDays + (halfDays * 0.5)
  };
};

/**
 * 時間文字列を分に変換
 * @param {string} timeStr "HH:MM"形式
 * @returns {number}
 */
export const timeToMinutes = (timeStr) => {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
};

/**
 * 分を時間文字列に変換
 * @param {number} minutes
 * @returns {string}
 */
export const minutesToTime = (minutes) => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
};

/**
 * 就業時間を計算（休憩1時間を引く）
 * @param {string} startTime
 * @param {string} endTime
 * @returns {number} 分単位
 */
export const calculateWorkMinutes = (startTime, endTime) => {
  if (!startTime || !endTime) return 0;
  const startMinutes = timeToMinutes(startTime);
  const endMinutes = timeToMinutes(endTime);
  const workMinutes = endMinutes - startMinutes - 60; // 休憩1時間
  return workMinutes > 0 ? workMinutes : 0;
};
