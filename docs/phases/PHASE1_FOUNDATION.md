# Phase 1: プロジェクト基盤整備

## 概要

既存のファイル構成をリファクタリングし、Firebase プロジェクトを設定する。

## ステータス: 完了

## 作業開始日: 2025-02-01
## 作業完了日: 2025-02-01

---

## タスク一覧

### 1.1 必要パッケージのインストール
- [x] firebase
- [x] react-router-dom

```bash
npm install firebase react-router-dom
```

### 1.2 ディレクトリ構成の作成
- [x] config/
- [x] contexts/
- [x] hooks/
- [x] services/
- [x] components/common/
- [x] components/auth/
- [x] components/attendance/
- [x] components/settings/
- [x] components/admin/
- [x] components/layout/
- [x] pages/
- [x] utils/
- [x] styles/

### 1.3 Firebase プロジェクト設定
- [x] config/firebase.js 作成
- [x] .env.example ファイル作成（認証情報テンプレート）
- [ ] Firebase Console でプロジェクト作成（Phase 2 で実施）
- [ ] Authentication 有効化（Phase 2 で実施）
- [ ] Firestore 有効化（Phase 3 で実施）

### 1.4 共通コンポーネント作成
- [x] components/common/Button.js
- [x] components/common/Input.js
- [x] components/common/Select.js
- [x] components/common/Modal.js
- [x] components/common/Loading.js
- [x] components/common/Calendar.js
- [x] components/common/index.js

### 1.5 ユーティリティ作成
- [x] utils/constants.js（定数定義）
- [x] utils/dateUtils.js（日付処理）
- [x] utils/attendanceCalc.js（勤怠計算）

### 1.6 レイアウトコンポーネント作成
- [x] components/layout/Layout.js
- [x] components/layout/Header.js
- [x] components/layout/index.js

### 1.7 コンテキスト作成
- [x] contexts/AuthContext.js
- [x] contexts/AttendanceContext.js
- [x] contexts/index.js

### 1.8 認証コンポーネント作成
- [x] components/auth/LoginForm.js
- [x] components/auth/RegisterForm.js
- [x] components/auth/index.js

### 1.9 ページコンポーネント作成
- [x] pages/LoginPage.js
- [x] pages/RegisterPage.js
- [x] pages/AttendancePage.js
- [x] pages/AdminPage.js
- [x] pages/UserManagementPage.js
- [x] pages/SettingsPage.js
- [x] pages/PaidLeavePage.js
- [x] pages/index.js

### 1.10 ルーティング設定
- [x] App.js にルーティング設定
- [x] PrivateRoute / PublicRoute 実装
- [x] 権限別アクセス制御

### 1.11 スタイル設定
- [x] styles/index.css 作成

---

## 実装記録

### 実装日: 2025-02-01

### 実装内容:

1. **パッケージインストール**
   - firebase, react-router-dom をインストール

2. **ディレクトリ構成**
   - 新しいファイル構成に従ってディレクトリを作成

3. **Firebase設定**
   - config/firebase.js: Firebase初期化設定
   - .env.example: 環境変数テンプレート

4. **共通コンポーネント**
   - Button: 複数バリアント対応のボタン
   - Input: ラベル・エラー表示対応の入力フィールド
   - Select: ドロップダウン選択
   - Modal: モーダルダイアログ
   - Loading: ローディング表示
   - Calendar: カレンダーUI（年跨ぎ対応）

5. **ユーティリティ**
   - constants.js: 区分、部署、権限、設定値の定数
   - dateUtils.js: 日付処理（勤怠期間生成、有給年度計算など）
   - attendanceCalc.js: 勤怠集計計算

6. **コンテキスト**
   - AuthContext: 認証状態管理
   - AttendanceContext: 勤怠データ管理

7. **レイアウト**
   - Layout: 共通レイアウト
   - Header: ナビゲーションヘッダー

8. **認証UI**
   - LoginForm: メールアドレス/パスワードログイン
   - RegisterForm: 新規登録フォーム

9. **ページ**
   - 各ページの基本構造を作成

10. **ルーティング**
    - React Router v6によるルーティング
    - 認証ガード（PrivateRoute）
    - 未認証リダイレクト（PublicRoute）
    - 権限別アクセス制御

---

## 変更ファイル一覧

| ファイル | 変更種別 | 説明 |
|----------|----------|------|
| package.json | 更新 | firebase, react-router-dom 追加 |
| .env.example | 新規 | Firebase環境変数テンプレート |
| src/config/firebase.js | 新規 | Firebase初期化 |
| src/contexts/AuthContext.js | 新規 | 認証状態管理 |
| src/contexts/AttendanceContext.js | 新規 | 勤怠データ管理 |
| src/contexts/index.js | 新規 | エクスポート |
| src/components/common/*.js | 新規 | 共通UIコンポーネント |
| src/components/layout/*.js | 新規 | レイアウトコンポーネント |
| src/components/auth/*.js | 新規 | 認証コンポーネント |
| src/pages/*.js | 新規 | ページコンポーネント |
| src/utils/constants.js | 新規 | 定数定義 |
| src/utils/dateUtils.js | 新規 | 日付ユーティリティ |
| src/utils/attendanceCalc.js | 新規 | 勤怠計算 |
| src/styles/index.css | 新規 | グローバルスタイル |
| src/App.js | 更新 | ルーティング対応 |
| src/index.js | 更新 | スタイル読み込み追加 |

---

## 残存する旧ファイル

以下のファイルは後続Phaseで移行・削除予定:
- src/components/LoginScreen.js
- src/components/Header.js
- src/components/AttendanceInput.js
- src/components/AdminPanel.js
- src/components/AttendanceDetail.js
- src/components/UserManagement.js
- src/components/UserModal.js
- src/data/constants.js

---

## 次フェーズへの申し送り

1. **Firebase Console設定**
   - Phase 2 で Firebase プロジェクトを作成
   - Authentication（メール/パスワード）を有効化
   - .env ファイルに認証情報を設定

2. **認証機能の実装**
   - AuthContext に Firebase Authentication を統合
   - LoginForm, RegisterForm に実際の認証処理を実装

3. **旧コンポーネントの移行**
   - 旧コンポーネントのロジックを新構成に移行
