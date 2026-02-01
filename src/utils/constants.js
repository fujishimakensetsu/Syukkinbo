// 区分の選択肢
export const KUBUN_OPTIONS = [
  '',
  '出勤',
  '定休日',
  '休日出勤',
  '振休',
  '有給',
  '午前休',
  '午後休',
  '忌引'
];

// 部署の選択肢
export const DEPARTMENT_OPTIONS = [
  '営業部',
  '特販部',
  '設計部',
  '工事部',
  'お客様相談室'
];

// 権限の種類
export const ROLE_OPTIONS = {
  admin: { value: 'admin', label: '管理者' },
  keiri: { value: 'keiri', label: '経理' },
  employee: { value: 'employee', label: '社員' }
};

// 曜日
export const DAY_OF_WEEK = ['日', '月', '火', '水', '木', '金', '土'];

// デフォルト設定
export const DEFAULT_SETTINGS = {
  defaultStartTime: '08:45',
  defaultEndTime: '18:00',
  fixedHolidays: [0, 6] // 日曜・土曜
};

// 有給年度の起算日（月-日）
export const PAID_LEAVE_FISCAL_START = {
  month: 4,
  day: 15
};

// 勤怠期間（締め日）
export const ATTENDANCE_PERIOD = {
  startDay: 16,  // 開始日
  endDay: 15     // 終了日（翌月）
};

// 時間プリセット
export const TIME_PRESETS = {
  start: ['08:00', '08:30', '08:45', '09:00', '09:30', '10:00'],
  end: ['17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00']
};

// 半休の時間設定
export const HALF_DAY_TIMES = {
  午前休: { startTime: '13:00', endTime: '18:00' },  // 午前休：13:00出勤、18:00退勤
  午後休: { startTime: '08:45', endTime: '13:00' }   // 午後休：8:45出勤、13:00退勤
};
