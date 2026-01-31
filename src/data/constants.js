// 区分の選択肢
export const KUBUN_OPTIONS = ['', '出勤', '定休日', '休日出勤', '振休', '有給', '午前休', '午後休'];

// 部署の選択肢
export const DEPARTMENT_OPTIONS = ['営業部', '特販部', '設計部', '工事部', 'お客様相談室'];

// サンプルユーザーデータ
export const SAMPLE_USERS = [
  { id: 'admin', password: 'admin123', name: '管理者', role: 'admin', department: '' },
  { id: 'keiri', password: 'keiri123', name: '経理担当', role: 'keiri', department: '' },
  { id: 'user001', password: 'pass001', name: '山田太郎', role: 'employee', department: '営業部' },
  { id: 'user002', password: 'pass002', name: '鈴木花子', role: 'employee', department: '設計部' },
];

// 日付を生成（16日～翌月15日）
export const generateDates = (year, month) => {
  const dates = [];
  const startDate = new Date(year, month - 1, 16);
  for (let i = 0; i < 31; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    if (date.getDate() <= 15 || date.getMonth() === month - 1) {
      dates.push({
        date: date,
        dayOfWeek: ['日', '月', '火', '水', '木', '金', '土'][date.getDay()],
        isWeekend: date.getDay() === 0 || date.getDay() === 6
      });
    }
    if (date.getMonth() !== month - 1 && date.getDate() > 15) break;
  }
  return dates;
};

// 集計計算
export const calculateSummary = (userId, attendanceData) => {
  const userData = attendanceData[userId] || {};
  let workDays = 0;
  let holidayDays = 0;
  let paidLeaveDays = 0;
  let totalMinutes = 0;
  
  Object.values(userData).forEach(day => {
    if (day.kubun === '出勤' || day.kubun === '休日出勤') workDays++;
    if (day.kubun === '定休日') holidayDays++;
    if (day.kubun === '有給') paidLeaveDays++;
    if (day.kubun === '午前休' || day.kubun === '午後休') paidLeaveDays += 0.5;
    
    if (day.startTime && day.endTime) {
      const [sh, sm] = day.startTime.split(':').map(Number);
      const [eh, em] = day.endTime.split(':').map(Number);
      totalMinutes += (eh * 60 + em) - (sh * 60 + sm) - 60; // 休憩1時間引く
    }
  });
  
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  
  return { 
    workDays, 
    holidayDays, 
    paidLeaveDays, 
    totalTime: `${hours}:${mins.toString().padStart(2, '0')}` 
  };
};
