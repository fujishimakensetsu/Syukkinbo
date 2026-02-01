# Firebase プロジェクト設定ガイド

## 1. Firebase プロジェクト作成

1. [Firebase Console](https://console.firebase.google.com/) にアクセス
2. 「プロジェクトを追加」をクリック
3. プロジェクト名を入力（例: `attendance-app`）
4. Google Analytics は任意（不要ならオフ）
5. 「プロジェクトを作成」をクリック

## 2. Webアプリの追加

1. プロジェクト概要ページで「</>」（Web）アイコンをクリック
2. アプリのニックネームを入力（例: `勤怠管理システム`）
3. 「Firebase Hosting も設定する」はチェック不要
4. 「アプリを登録」をクリック
5. 表示される設定情報をメモ

## 3. Authentication の設定

1. 左メニューから「Authentication」を選択
2. 「始める」をクリック
3. 「メール/パスワード」を選択して有効化
4. 「メールリンク（パスワードなしログイン）」はオフのまま
5. 「保存」をクリック

### メールテンプレートのカスタマイズ（任意）

1. Authentication > Templates タブ
2. 各メールテンプレートをカスタマイズ可能:
   - メールアドレスの確認
   - パスワードの再設定
   - メールアドレスの変更

## 4. Firestore Database の設定

1. 左メニューから「Firestore Database」を選択
2. 「データベースを作成」をクリック
3. 「本番モードで開始」を選択
4. ロケーションを選択（例: `asia-northeast1` = 東京）
5. 「有効にする」をクリック

### セキュリティルールの設定

「ルール」タブで以下を設定:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 認証済みユーザーのみアクセス可能
    match /users/{userId} {
      // 自分のデータは読み書き可能
      allow read, write: if request.auth != null && request.auth.uid == userId;
      // 管理者・経理は全ユーザー読み取り可能
      allow read: if request.auth != null &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'keiri'];
    }

    match /attendance/{docId} {
      // 自分の勤怠データは読み書き可能
      allow read, write: if request.auth != null &&
        request.auth.uid == resource.data.userId;
      // 管理者・経理は全勤怠データ読み取り可能
      allow read: if request.auth != null &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'keiri'];
    }
  }
}
```

## 5. 環境変数の設定

1. プロジェクトのルートディレクトリに `.env` ファイルを作成
2. Firebase Console > プロジェクト設定 > 全般 > マイアプリ から設定情報をコピー
3. 以下の形式で `.env` に記載:

```
REACT_APP_FIREBASE_API_KEY=AIza...
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
REACT_APP_FIREBASE_APP_ID=1:123456789:web:abc123
```

## 6. 動作確認

1. `.env` ファイルを保存
2. 開発サーバーを再起動: `npm start`
3. 新規登録画面でテストユーザーを作成
4. 確認メールが届くことを確認
5. ログインできることを確認

## トラブルシューティング

### 「permission-denied」エラー
- Firestoreのセキュリティルールを確認
- ユーザーが正しく認証されているか確認

### メールが届かない
- 迷惑メールフォルダを確認
- Firebase Console > Authentication > Templates でメール設定を確認

### 「auth/unauthorized-domain」エラー
- Firebase Console > Authentication > Settings > Authorized domains にドメインを追加

## 参考リンク

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Authentication](https://firebase.google.com/docs/auth)
- [Cloud Firestore](https://firebase.google.com/docs/firestore)
