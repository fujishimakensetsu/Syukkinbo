# Phase 2: 認証システム

## 概要

Firebase Authentication を使用したメール認証システムを構築する。

## ステータス: 完了

## 作業開始日: 2025-02-01
## 作業完了日: 2025-02-01

## 前提条件
- Phase 1 完了済み
- Firebase プロジェクト設定済み

---

## タスク一覧

### 2.1 Firebase Authentication 設定
- [x] Firebase設定ガイド作成（docs/FIREBASE_SETUP.md）
- [ ] Firebase Consoleでプロジェクト作成（ユーザー作業）
- [ ] メール/パスワード認証を有効化（ユーザー作業）

### 2.2 認証サービス作成
- [x] services/authService.js
  - [x] signUp（新規登録）
  - [x] signIn（ログイン）
  - [x] logOut（ログアウト）
  - [x] resendVerificationEmail（メール確認送信）
  - [x] resetPassword（パスワードリセット）
  - [x] getCurrentUser（現在のユーザー取得）
  - [x] getAuthErrorMessage（エラーメッセージ変換）

### 2.3 ユーザーサービス作成
- [x] services/userService.js
  - [x] createUserProfile（プロフィール作成）
  - [x] getUserProfile（プロフィール取得）
  - [x] updateUserProfile（プロフィール更新）
  - [x] deleteUserProfile（プロフィール削除）
  - [x] getAllUsers（全ユーザー取得）
  - [x] getEmployees（社員のみ取得）
  - [x] getUsersByDepartment（部署別取得）
  - [x] updateUserSettings（設定更新）
  - [x] updatePaidLeaveSettings（有給設定更新）

### 2.4 認証コンテキスト更新
- [x] contexts/AuthContext.js
  - [x] Firebase Authentication 統合
  - [x] Firestore プロフィール連携
  - [x] signUp / signIn / logOut メソッド
  - [x] resendVerification メソッド
  - [x] resetPassword メソッド
  - [x] refreshProfile メソッド

### 2.5 ログイン画面
- [x] components/auth/LoginForm.js
  - [x] メールアドレス入力
  - [x] パスワード入力
  - [x] ログインボタン
  - [x] 新規登録リンク
  - [x] パスワード忘れリンク
  - [x] エラー表示
- [x] pages/LoginPage.js

### 2.6 新規登録画面（自己登録）
- [x] components/auth/RegisterForm.js
  - [x] メールアドレス入力
  - [x] パスワード入力
  - [x] パスワード確認入力
  - [x] 氏名入力
  - [x] 所属部署選択
  - [x] 登録ボタン
- [x] pages/RegisterPage.js

### 2.7 メール確認画面
- [x] components/auth/EmailVerification.js
  - [x] 確認メール再送信ボタン
  - [x] 再送信のクールダウン表示
  - [x] 確認済みの場合のリダイレクト
- [x] pages/EmailVerificationPage.js

### 2.8 パスワードリセット
- [x] components/auth/ForgotPassword.js
  - [x] メールアドレス入力
  - [x] リセットメール送信ボタン
  - [x] 成功メッセージ表示
- [x] pages/ForgotPasswordPage.js

### 2.9 管理者によるユーザー登録
- [x] components/admin/UserRegistration.js
  - [x] メールアドレス入力
  - [x] 氏名入力
  - [x] 権限選択（社員/経理/管理者）
  - [x] 所属部署選択
  - [x] 招待メール送信UI
  - 注: 実際のユーザー作成はCloud Functions実装が必要

### 2.10 認証ガード
- [x] PrivateRoute（認証必須ルート）
- [x] PublicRoute（未認証専用ルート）
- [x] EmailVerificationRoute（メール確認用ルート）
- [x] 権限によるアクセス制御

---

## Firestore ユーザーデータ構造

```javascript
// users/{userId}
{
  uid: "firebase_auth_uid",
  email: "user@example.com",
  name: "山田太郎",
  role: "employee", // "admin" | "keiri" | "employee"
  department: "営業部",
  createdAt: Timestamp,
  updatedAt: Timestamp,
  emailVerified: true,
  settings: {
    fixedHolidays: [0, 6], // 日曜・土曜
    defaultStartTime: "08:45",
    defaultEndTime: "18:00"
  },
  paidLeave: {
    granted: 10,
    fiscalYearStart: "2025-04-15"
  }
}
```

---

## 実装記録

### 実装日: 2025-02-01

### 実装内容:

1. **認証サービス（authService.js）**
   - Firebase Authentication のラッパー関数
   - エラーメッセージの日本語化

2. **ユーザーサービス（userService.js）**
   - Firestore ユーザープロフィール CRUD
   - 設定・有給設定の更新機能

3. **AuthContext 更新**
   - Firebase Authentication との統合
   - Firestore プロフィール自動取得
   - 認証メソッド提供

4. **認証UI**
   - LoginForm: メール/パスワードログイン
   - RegisterForm: 新規登録（部署選択付き）
   - EmailVerification: メール確認画面
   - ForgotPassword: パスワードリセット

5. **管理者機能**
   - UserRegistration: 管理者によるユーザー登録UI

6. **ルーティング更新**
   - 認証ガード（PrivateRoute / PublicRoute）
   - メール確認必須の制御
   - 権限別アクセス制御

---

## 変更ファイル一覧

| ファイル | 変更種別 | 説明 |
|----------|----------|------|
| src/services/authService.js | 新規 | 認証サービス |
| src/services/userService.js | 新規 | ユーザーCRUDサービス |
| src/services/index.js | 新規 | エクスポート |
| src/contexts/AuthContext.js | 更新 | Firebase統合 |
| src/components/auth/LoginForm.js | 更新 | 認証処理追加 |
| src/components/auth/RegisterForm.js | 更新 | 認証処理追加 |
| src/components/auth/EmailVerification.js | 新規 | メール確認画面 |
| src/components/auth/ForgotPassword.js | 新規 | パスワードリセット |
| src/components/auth/index.js | 更新 | エクスポート追加 |
| src/components/admin/UserRegistration.js | 新規 | 管理者登録UI |
| src/components/admin/index.js | 新規 | エクスポート |
| src/pages/EmailVerificationPage.js | 新規 | メール確認ページ |
| src/pages/ForgotPasswordPage.js | 新規 | パスワードリセットページ |
| src/pages/index.js | 更新 | エクスポート追加 |
| src/App.js | 更新 | ルーティング追加 |
| docs/FIREBASE_SETUP.md | 新規 | Firebase設定ガイド |

---

## 次フェーズへの申し送り

1. **Firebase Console 設定**
   - ユーザーがdocs/FIREBASE_SETUP.mdに従ってFirebaseプロジェクトを作成
   - .envファイルに認証情報を設定

2. **管理者によるユーザー作成**
   - 現在はUIのみ実装
   - 実際のユーザー作成にはCloud Functionsが必要
   - Phase 3 または別途実装

3. **Firestore データ永続化**
   - Phase 3 で勤怠データのCRUDを実装
