# Phase 3: データ永続化

## 概要

Cloud Firestore を使用してデータの永続化を実装する。

## ステータス: 完了

## 作業開始日: 2025-02-01
## 作業完了日: 2025-02-01

## 前提条件
- Phase 1, 2 完了済み
- Firebase Authentication 動作確認済み

---

## タスク一覧

### 3.1 Firestore セキュリティルール設定
- [x] docs/FIREBASE_SETUP.md にルール記載済み
- [ ] Firebase Consoleで設定（ユーザー作業）

### 3.2 勤怠サービス作成
- [x] services/attendanceService.js
  - [x] saveAttendance（勤怠保存）
  - [x] getAttendance（勤怠取得）
  - [x] getAttendanceByPeriod（期間指定取得）
  - [x] getAttendanceByUser（ユーザー別取得）
  - [x] getAttendanceByDateRange（日付範囲取得）
  - [x] deleteAttendance（勤怠削除）
  - [x] batchSaveAttendance（一括保存）
  - [x] linkTransferDays（振替連動）
  - [x] unlinkTransferDay（振替解除）

### 3.3 勤怠コンテキスト更新
- [x] contexts/AttendanceContext.js
  - [x] Firestore連携
  - [x] 自動データ読み込み
  - [x] リアルタイム保存
  - [x] 振替連動機能

### 3.4 勤怠コンポーネント作成
- [x] components/attendance/PeriodSelector.js
- [x] components/attendance/AttendanceSummary.js
- [x] components/attendance/AttendanceTable.js
- [x] components/attendance/AttendanceRow.js
- [x] components/attendance/TransferDayPicker.js

### 3.5 ページ更新
- [x] pages/AttendancePage.js（Firestore対応）
- [x] pages/AdminPage.js（社員一覧・勤怠読み込み）
- [x] pages/UserManagementPage.js（ユーザー管理）

---

## Firestore データ構造

### users コレクション
```javascript
// users/{userId}
{
  uid: "firebase_auth_uid",
  email: "user@example.com",
  name: "山田太郎",
  role: "employee",
  department: "営業部",
  createdAt: Timestamp,
  updatedAt: Timestamp,
  emailVerified: true,
  settings: {
    fixedHolidays: [0, 6],
    defaultStartTime: "08:45",
    defaultEndTime: "18:00"
  },
  paidLeave: {
    granted: 10,
    fiscalYearStart: "2025-04-15"
  }
}
```

### attendance コレクション
```javascript
// attendance/{userId}_{date}
{
  userId: "user_id",
  date: "2025-02-01",
  year: 2025,
  month: 2,
  day: 1,
  kubun: "出勤",
  startTime: "08:45",
  endTime: "18:00",
  furikaeDate: null,
  furikaeLinkedId: null,
  furikaeType: null,
  memo: "",
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

---

## 実装記録

### 実装日: 2025-02-01

### 実装内容:

1. **勤怠サービス（attendanceService.js）**
   - Firestore勤怠データのCRUD
   - 期間指定での一括取得（16日〜翌月15日対応）
   - 振替休日の連動・解除機能
   - バッチ処理による一括保存

2. **AttendanceContext更新**
   - Firestore自動連携
   - 期間変更時の自動データ読み込み
   - リアルタイム保存（変更即時反映）
   - 振替連動メソッド

3. **勤怠コンポーネント**
   - PeriodSelector: 期間選択UI
   - AttendanceSummary: 月間集計表示
   - AttendanceTable: 勤怠入力テーブル
   - AttendanceRow: 日別入力行
   - TransferDayPicker: 振替日カレンダー選択

4. **ページ更新**
   - AttendancePage: 勤怠入力画面
   - AdminPage: 社員一覧画面
   - UserManagementPage: ユーザー管理画面

---

## 変更ファイル一覧

| ファイル | 変更種別 | 説明 |
|----------|----------|------|
| src/services/attendanceService.js | 新規 | 勤怠CRUD |
| src/services/index.js | 更新 | エクスポート追加 |
| src/contexts/AttendanceContext.js | 更新 | Firestore連携 |
| src/components/attendance/PeriodSelector.js | 新規 | 期間選択 |
| src/components/attendance/AttendanceSummary.js | 新規 | 集計表示 |
| src/components/attendance/AttendanceTable.js | 新規 | 勤怠テーブル |
| src/components/attendance/AttendanceRow.js | 新規 | 勤怠行 |
| src/components/attendance/TransferDayPicker.js | 新規 | 振替日選択 |
| src/components/attendance/index.js | 新規 | エクスポート |
| src/pages/AttendancePage.js | 更新 | Firestore対応 |
| src/pages/AdminPage.js | 更新 | 社員一覧 |
| src/pages/UserManagementPage.js | 更新 | ユーザー管理 |

---

## 次フェーズへの申し送り

1. **Phase 4: スタッフ設定機能**
   - 固定休・デフォルト時間の設定UI
   - 自動入力ロジック

2. **振替連動**
   - 基本的な連動機能は実装済み
   - Phase 5で詳細なUI改善を行う
