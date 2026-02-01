# Phase 4: スタッフ設定機能

## 概要

社員ごとの固定休日、デフォルト出退勤時間の設定機能を実装する。

## ステータス: 完了

## 作業開始日: 2025-02-01
## 完了日: 2025-02-02

## 前提条件
- Phase 1, 2, 3 完了済み
- Firestore ユーザーデータにsettingsフィールド追加済み

---

## タスク一覧

### 4.1 設定データ構造
```javascript
// users/{userId}.settings
{
  fixedHolidays: [0, 6],        // 0=日曜, 1=月曜, ..., 6=土曜
  defaultStartTime: "08:45",
  defaultEndTime: "18:00"
}
```

### 4.2 設定サービス作成
- [x] userService.js に統合済み
  - [x] updateUserSettings（設定更新）

### 4.3 固定休設定コンポーネント
- [x] components/settings/FixedHolidaySettings.js
  - [x] 曜日チェックボックス（日〜土）
  - [x] 複数選択可能
  - [x] 保存ボタン
  - [x] 現在の設定表示

### 4.4 デフォルト時間設定コンポーネント
- [x] components/settings/DefaultTimeSettings.js
  - [x] 出社時間ピッカー
  - [x] 退社時間ピッカー
  - [x] プリセットボタン（よく使う時間）
  - [x] 保存ボタン

### 4.5 設定ページ作成
- [x] pages/SettingsPage.js
  - [x] 固定休設定セクション
  - [x] デフォルト時間設定セクション
  - [x] 現在の設定確認セクション

### 4.6 勤怠入力画面のクイック設定
- [x] components/settings/QuickTimeSettings.js
  - [x] 現在のデフォルト時間表示
  - [x] ドロップダウンで変更可能
  - [x] 保存ボタンで即座にデフォルト設定更新

### 4.7 自動入力ロジック
- [x] AttendanceTable.js で区分変更時に自動入力
  - [x] 「出勤」「休日出勤」「午前休」「午後休」選択時にデフォルト時間を自動入力
  - [x] 「定休日」「有給」「振休」選択時に時間をクリア
  - [x] 既に時間が入力済みの場合は上書きしない

### 4.8 ヘッダーナビゲーション更新
- [x] 設定画面へのリンク追加済み（Phase 1 で実装）

---

## UI/UX 考慮事項

- デフォルト時間は5分単位で設定可能
- プリセットボタンで素早く設定変更
- 変更は即時反映（次回勤怠入力時から適用）
- 既に入力済みのデータには影響しない

---

## 実装記録

### 実装日: 2025-02-02

### 実装内容:

1. **FixedHolidaySettings.js**: 曜日チェックボックスによる固定休設定
   - 日〜土の7つのチェックボックス
   - 複数選択可能
   - 保存ボタンクリックで即座に Firestore 更新

2. **DefaultTimeSettings.js**: デフォルト出退勤時間の設定
   - time input による時間指定
   - プリセットボタン（出社: 8:00, 8:30, 8:45, 9:00 / 退社: 17:00, 17:30, 18:00, 18:30）
   - 保存ボタンで Firestore 更新

3. **QuickTimeSettings.js**: 勤怠入力画面でのクイック変更
   - ドロップダウン形式で現在のデフォルト時間を表示
   - その場で変更・保存可能
   - AttendancePage のヘッダー部分に配置

4. **AttendanceTable.js**: 自動入力ロジック
   - `handleKubunChange` で区分変更を検知
   - 出勤系の区分選択時: デフォルト時間を自動入力（時間が空の場合のみ）
   - 休み系の区分選択時: 時間をクリア

5. **SettingsPage.js**: 設定画面の統合
   - FixedHolidaySettings と DefaultTimeSettings を配置
   - 現在の設定確認セクションを追加

---

## 変更ファイル一覧

| ファイル | 変更種別 | 説明 |
|----------|----------|------|
| src/components/settings/FixedHolidaySettings.js | 新規 | 固定休設定コンポーネント |
| src/components/settings/DefaultTimeSettings.js | 新規 | デフォルト時間設定コンポーネント |
| src/components/settings/QuickTimeSettings.js | 新規 | クイック時間設定コンポーネント |
| src/components/settings/index.js | 更新 | エクスポート追加 |
| src/pages/SettingsPage.js | 更新 | 設定コンポーネント統合 |
| src/pages/AttendancePage.js | 更新 | QuickTimeSettings追加、userSettings props追加 |
| src/components/attendance/AttendanceTable.js | 更新 | 自動入力ロジック追加 |
| src/components/attendance/AttendanceRow.js | 更新 | onKubunChange コールバック対応 |
| src/utils/constants.js | 更新 | TIME_PRESETS 追加 |

---

## 次フェーズへの申し送り

- 固定休設定は完了したが、月の新規表示時に固定休を自動で「定休日」にする機能は未実装
  - Phase 5 または今後の改善で対応可能
- 有給設定セクションは Phase 6 で追加予定
