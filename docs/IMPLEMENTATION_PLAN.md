# 勤怠管理システム 改修計画

## 概要

既存の勤怠管理システムを大幅に改修し、以下の機能を追加・改善する。

## 改修要件一覧

| No | 要件 | 説明 |
|----|------|------|
| 1 | 認証方法の修正 | メールアドレス + パスワード認証、メール確認コード |
| 2 | Excelフォーマット | 社内フォーマットに対応（後日対応） |
| 3 | 自動入力機能 | 固定休・デフォルト出退勤時間の設定 |
| 4 | 年間有給管理 | 付与日数、取得日数、残日数の管理 |
| 5 | 振替休日連動 | 休日出勤⇄振休の双方向自動連動 |
| 6 | 振替日カレンダー | 年月日をカレンダーUIから選択 |

## 技術仕様

### バックエンド
- **Firebase Authentication**: メール認証
- **Cloud Firestore**: データベース
- **Firebase Hosting**: ホスティング（任意）

### フロントエンド
- **React 18**: UIフレームワーク
- **Tailwind CSS**: スタイリング
- **xlsx**: Excel出力

### 設定値
| 項目 | 値 |
|------|-----|
| 有給年度起算日 | 4月15日 |
| デフォルト出社時間 | 8:45 |
| デフォルト退社時間 | 18:00 |
| 勤怠締め期間 | 16日〜翌月15日 |

---

## 実装フェーズ

### Phase 1: プロジェクト基盤整備
- [ ] ファイル構成のリファクタリング
- [ ] Firebase プロジェクト設定
- [ ] 必要パッケージのインストール
- [ ] 共通コンポーネントの作成

**詳細**: [PHASE1_FOUNDATION.md](./phases/PHASE1_FOUNDATION.md)

### Phase 2: 認証システム
- [ ] Firebase Authentication 設定
- [ ] ログイン画面（メール/パスワード）
- [ ] 自己登録機能（メール確認付き）
- [ ] 管理者によるユーザー登録
- [ ] パスワードリセット機能

**詳細**: [PHASE2_AUTH.md](./phases/PHASE2_AUTH.md)

### Phase 3: データ永続化
- [ ] Firestore データ構造設計
- [ ] ユーザーデータ CRUD
- [ ] 勤怠データ CRUD
- [ ] 設定データ CRUD

**詳細**: [PHASE3_DATA.md](./phases/PHASE3_DATA.md)

### Phase 4: スタッフ設定機能
- [ ] 固定休設定（曜日指定）
- [ ] デフォルト出退勤時間設定
- [ ] 設定画面UI
- [ ] 勤怠入力画面でのクイック変更UI
- [ ] 自動入力ロジック

**詳細**: [PHASE4_SETTINGS.md](./phases/PHASE4_SETTINGS.md)

### Phase 5: 振替休日連動
- [ ] 休日出勤→振休の自動連動
- [ ] 振休→休日出勤の逆連動
- [ ] カレンダーUI（年月日選択）
- [ ] 連動データの整合性チェック

**詳細**: [PHASE5_TRANSFER.md](./phases/PHASE5_TRANSFER.md)

### Phase 6: 年間有給管理
- [ ] 有給付与日数の手動設定
- [ ] 年間取得日数の自動集計（4/15起算）
- [ ] 残日数の計算・表示
- [ ] 年間サマリー画面

**詳細**: [PHASE6_PAID_LEAVE.md](./phases/PHASE6_PAID_LEAVE.md)

### Phase 7: Excelフォーマット対応
- [ ] 社内テンプレート読み込み
- [ ] セル位置マッピング
- [ ] データ出力

**詳細**: [PHASE7_EXCEL.md](./phases/PHASE7_EXCEL.md)

---

## ファイル構成（目標）

```
src/
├── index.js
├── App.js
│
├── config/
│   └── firebase.js
│
├── contexts/
│   ├── AuthContext.js
│   └── AttendanceContext.js
│
├── hooks/
│   ├── useAuth.js
│   ├── useAttendance.js
│   ├── useUsers.js
│   └── usePaidLeave.js
│
├── services/
│   ├── authService.js
│   ├── userService.js
│   ├── attendanceService.js
│   └── paidLeaveService.js
│
├── components/
│   ├── common/
│   │   ├── Button.js
│   │   ├── Input.js
│   │   ├── Select.js
│   │   ├── Modal.js
│   │   ├── Calendar.js
│   │   └── Loading.js
│   │
│   ├── auth/
│   │   ├── LoginForm.js
│   │   ├── RegisterForm.js
│   │   ├── EmailVerification.js
│   │   └── ForgotPassword.js
│   │
│   ├── attendance/
│   │   ├── AttendanceTable.js
│   │   ├── AttendanceRow.js
│   │   ├── AttendanceSummary.js
│   │   ├── PeriodSelector.js
│   │   ├── TransferDayPicker.js
│   │   └── YearlySummary.js
│   │
│   ├── settings/
│   │   ├── UserSettings.js
│   │   ├── FixedHolidaySettings.js
│   │   ├── DefaultTimeSettings.js
│   │   └── PaidLeaveSettings.js
│   │
│   ├── admin/
│   │   ├── EmployeeList.js
│   │   ├── EmployeeDetail.js
│   │   └── UserRegistration.js
│   │
│   └── layout/
│       ├── Header.js
│       ├── Sidebar.js
│       └── Layout.js
│
├── pages/
│   ├── LoginPage.js
│   ├── RegisterPage.js
│   ├── AttendancePage.js
│   ├── AdminPage.js
│   ├── SettingsPage.js
│   └── PaidLeavePage.js
│
├── utils/
│   ├── dateUtils.js
│   ├── attendanceCalc.js
│   ├── paidLeaveCalc.js
│   ├── excelExport.js
│   └── constants.js
│
└── styles/
    └── index.css
```

---

## 進捗管理

| Phase | ステータス | 開始日 | 完了日 | 備考 |
|-------|----------|--------|--------|------|
| 1 | 完了 | 2025-02-01 | 2025-02-01 | 基盤構築完了 |
| 2 | 完了 | 2025-02-01 | 2025-02-01 | 認証システム構築完了 |
| 3 | 完了 | 2025-02-01 | 2025-02-01 | Firestore連携完了 |
| 4 | 完了 | 2025-02-01 | 2025-02-02 | 設定機能完了 |
| 5 | 完了 | 2025-02-02 | 2025-02-02 | 振替休日連動完了 |
| 6 | 完了 | 2025-02-02 | 2025-02-02 | 年間有給管理完了 |
| 7 | 未着手 | - | - | 後日対応（Excelテンプレート待ち） |

---

## 注意事項

- 各フェーズ完了時に対応するmdファイルを更新すること
- 作業中断時は現在の状態をmdファイルに記録すること
- Firebase の認証情報は `.env` ファイルで管理し、Git にコミットしないこと
