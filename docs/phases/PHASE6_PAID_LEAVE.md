# Phase 6: 年間有給管理

## 概要

有給休暇の付与日数、取得日数、残日数を管理する機能を実装する。

## ステータス: 完了

## 作業開始日: 2025-02-02
## 完了日: 2025-02-02

## 前提条件
- Phase 1, 2, 3, 4, 5 完了済み

---

## 仕様

### 年度の定義
- **起算日**: 4月15日
- **年度期間**: 4/15 〜 翌年4/14
- 例: 2025年度 = 2025/4/15 〜 2026/4/14

### 有給の種類と日数カウント
| 区分 | カウント |
|------|----------|
| 有給 | 1日 |
| 午前休 | 0.5日 |
| 午後休 | 0.5日 |

---

## タスク一覧

### 6.1 データ構造

```javascript
// users/{userId}.paidLeave
{
  granted: 10,                    // 付与日数（手動設定）
  fiscalYearStart: "2025-04-15",  // 年度開始日
  // 将来: 入社日からの自動計算用
  // hireDate: "2020-04-01"
}
```

### 6.2 有給計算ユーティリティ
- [x] utils/paidLeaveCalc.js
  - [x] calculateUsedDays（年度内取得日数計算）
  - [x] calculateRemainingDays（残日数計算）
  - [x] getPaidLeaveSummary（サマリー取得）
  - [x] getMonthlyPaidLeaveUsage（月別取得状況）
  - [x] getCurrentFiscalYear（現在年度取得）

※ getFiscalYear, getFiscalYearRange は dateUtils.js に実装済み

### 6.3 有給サービス作成
- [x] services/paidLeaveService.js
  - [x] getPaidLeaveSettings（設定取得）
  - [x] updateGrantedDays（付与日数更新）
  - [x] getGrantedDaysForYear（年度別付与日数取得）
  - [x] getPaidLeaveUsage（年度内取得状況取得）
  - [x] fetchPaidLeaveSummary（有給サマリー取得）

### 6.4 有給フック作成
- [x] フックは作成せず、PaidLeavePage で直接管理

### 6.5 有給設定コンポーネント
- [x] components/settings/PaidLeaveSettings.js
  - [x] 年度選択ドロップダウン
  - [x] 付与日数入力
  - [x] プリセットボタン（10, 11, 12, 14, 16, 18, 20日）
  - [x] 保存ボタン

```
┌─────────────────────────────────────┐
│ 有給休暇設定                         │
├─────────────────────────────────────┤
│ 年度: [2025年度 ▼]                  │
│      （2025/4/15 〜 2026/4/14）      │
│                                     │
│ 付与日数: [  10  ] 日               │
│                                     │
│                        [保存]       │
└─────────────────────────────────────┘
```

### 6.6 年間サマリーコンポーネント
- [x] components/attendance/YearlySummary.js
  - [x] 付与日数表示
  - [x] 取得日数表示（内訳: 有給/午前休/午後休）
  - [x] 残日数表示（残り3日以下で警告色）
  - [x] 年度選択ドロップダウン
  - [x] 月別取得履歴表示

```
┌─────────────────────────────────────────────────┐
│ 有給休暇 年間サマリー                            │
│ 2025年度（2025/4/15 〜 2026/4/14）               │
├─────────────────────────────────────────────────┤
│                                                 │
│   付与日数        取得日数        残日数         │
│   ┌─────┐        ┌─────┐        ┌─────┐        │
│   │ 10  │   −    │ 3.5 │   =    │ 6.5 │        │
│   └─────┘        └─────┘        └─────┘        │
│                                                 │
│   取得内訳:                                     │
│   ・有給: 2日                                   │
│   ・午前休: 2回（1日）                          │
│   ・午後休: 1回（0.5日）                        │
│                                                 │
└─────────────────────────────────────────────────┘
```

### 6.7 有給ページ作成
- [x] pages/PaidLeavePage.js
  - [x] 年間サマリー表示（YearlySummary）
  - [x] 設定パネル（PaidLeaveSettings）
  - [x] カウント方法のヒント表示

### 6.8 月間サマリーの更新
- [x] components/attendance/AttendanceSummary.js
  - [x] 有給残日数表示（年度）
  - [x] 有給ページへのリンク

### 6.9 ヘッダーナビゲーション更新
- [x] Phase 1 で実装済み

### 6.10 管理者向け機能
- [ ] 全社員の有給状況一覧（今後の拡張）
- [ ] 付与日数の一括設定（今後の拡張）

---

## 将来の拡張（入社日からの自動計算）

```javascript
// 勤続年数に応じた付与日数テーブル（労働基準法準拠）
const PAID_LEAVE_TABLE = [
  { years: 0.5, days: 10 },
  { years: 1.5, days: 11 },
  { years: 2.5, days: 12 },
  { years: 3.5, days: 14 },
  { years: 4.5, days: 16 },
  { years: 5.5, days: 18 },
  { years: 6.5, days: 20 },
];
```

---

## 実装記録

### 実装日: 2025-02-02

### 実装内容:

1. **paidLeaveCalc.js**: 有給計算ユーティリティ
   - calculateUsedDays: 年度内の有給取得日数を計算（有給=1日、午前休/午後休=0.5日）
   - calculateRemainingDays: 残日数計算
   - getPaidLeaveSummary: 付与・取得・残日数のサマリー
   - getMonthlyPaidLeaveUsage: 月別取得履歴

2. **paidLeaveService.js**: Firestore連携
   - 年度別に付与日数を保存（paidLeave.years.{fiscalYear}.granted）
   - 勤怠データから有給取得状況を取得

3. **PaidLeaveSettings.js**: 付与日数設定コンポーネント
   - 年度選択（前後2年）
   - 付与日数入力（0.5日単位）
   - プリセットボタン

4. **YearlySummary.js**: 年間サマリー表示
   - 付与・取得・残日数をカード形式で表示
   - 取得内訳（有給/午前休/午後休）
   - 月別取得履歴

5. **PaidLeavePage.js**: 有給管理ページ
   - サマリーと設定を2カラムで表示
   - カウント方法のヘルプ

6. **AttendanceSummary.js**: 更新
   - 有給残日数の表示を追加
   - 有給ページへのリンク

7. **SettingsPage.js**: 更新
   - PaidLeaveSettingsを追加
   - 現在の有給設定表示

---

## 変更ファイル一覧

| ファイル | 変更種別 | 説明 |
|----------|----------|------|
| src/utils/paidLeaveCalc.js | 新規 | 有給計算ユーティリティ |
| src/services/paidLeaveService.js | 新規 | 有給サービス |
| src/components/settings/PaidLeaveSettings.js | 新規 | 有給設定コンポーネント |
| src/components/attendance/YearlySummary.js | 新規 | 年間サマリーコンポーネント |
| src/pages/PaidLeavePage.js | 更新 | 有給管理ページ |
| src/components/attendance/AttendanceSummary.js | 更新 | 残日数表示追加 |
| src/pages/SettingsPage.js | 更新 | 有給設定追加 |
| src/pages/AttendancePage.js | 更新 | paidLeaveSettings props追加 |
| src/components/attendance/index.js | 更新 | YearlySummary エクスポート |
| src/components/settings/index.js | 更新 | PaidLeaveSettings エクスポート |

---

## 次フェーズへの申し送り

- 管理者向け機能（全社員の有給状況一覧、一括設定）は今後の拡張として残す
- 入社日からの自動付与計算も将来の拡張として残す
- AttendanceSummaryの残日数計算は、現在読み込まれているデータに基づく（完全な計算は有給ページで可能）
