# Firebase Authentication 実装ガイド

Reactアプリケーションに Firebase Authentication（メール/パスワード認証）を実装するための手順書です。

---

## 目次

1. [Firebase プロジェクトの作成](#1-firebase-プロジェクトの作成)
2. [Firebase Authentication の設定](#2-firebase-authentication-の設定)
3. [Cloud Firestore の設定](#3-cloud-firestore-の設定)
4. [React プロジェクトへの導入](#4-react-プロジェクトへの導入)
5. [認証機能の実装](#5-認証機能の実装)
6. [ユーザー管理機能の実装](#6-ユーザー管理機能の実装)
7. [本番環境へのデプロイ](#7-本番環境へのデプロイ)

---

## 1. Firebase プロジェクトの作成

### 1.1 Firebase Console にアクセス

1. [Firebase Console](https://console.firebase.google.com/) にアクセス
2. Google アカウントでログイン
3. 「プロジェクトを追加」をクリック

### 1.2 プロジェクトの設定

1. **プロジェクト名**: 任意の名前を入力（例: `my-app-project`）
2. **Google アナリティクス**: 必要に応じて有効化（後から変更可能）
3. 「プロジェクトを作成」をクリック

### 1.3 Web アプリの追加

1. プロジェクトのダッシュボードで「</>」（Web）アイコンをクリック
2. **アプリのニックネーム**: 任意の名前を入力
3. 「Firebase Hosting も設定する」は任意（Cloud Run を使う場合は不要）
4. 「アプリを登録」をクリック
5. 表示される **firebaseConfig** をメモしておく

```javascript
// この値をメモしておく
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};
```

---

## 2. Firebase Authentication の設定

### 2.1 Authentication の有効化

1. Firebase Console の左メニューから「Authentication」を選択
2. 「始める」をクリック

### 2.2 メール/パスワード認証の有効化

1. 「Sign-in method」タブを選択
2. 「メール/パスワード」をクリック
3. 「有効にする」をオンにする
4. 「メールリンク（パスワードなしでログイン）」は任意
5. 「保存」をクリック

### 2.3 承認済みドメインの設定（本番用）

1. 「Settings」タブを選択
2. 「承認済みドメイン」セクション
3. 本番環境のドメインを追加（例: `your-app.run.app`）

---

## 3. Cloud Firestore の設定

### 3.1 Firestore の作成

1. Firebase Console の左メニューから「Firestore Database」を選択
2. 「データベースを作成」をクリック
3. **エディション**: 「Standard エディション」を選択
4. **ロケーション**: `asia-northeast1`（東京）を推奨
5. 「次へ」をクリック

### 3.2 セキュリティルールの設定

開発時は以下のルールを設定（本番前に適切なルールに変更すること）：

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // ユーザーは自分のドキュメントのみ読み書き可能
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // 管理者は全てのユーザーを読み取り可能
    match /users/{userId} {
      allow read: if request.auth != null &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

---

## 4. React プロジェクトへの導入

### 4.1 必要なパッケージのインストール

```bash
npm install firebase
```

### 4.2 環境変数ファイルの作成

プロジェクトルートに `.env` ファイルを作成：

```env
# .env（開発用）
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
```

本番用に `.env.production` も作成：

```env
# .env.production（本番用）
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
```

> ⚠️ `.env` は `.gitignore` に追加し、Git にコミットしないこと

### 4.3 Firebase 設定ファイルの作成

`src/config/firebase.js`:

```javascript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
```

---

## 5. 認証機能の実装

### 5.1 認証サービスの作成

`src/services/authService.js`:

```javascript
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  onAuthStateChanged
} from 'firebase/auth';
import { auth } from '../config/firebase';

// ユーザー登録
export const registerUser = async (email, password) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  // メール確認を送信
  await sendEmailVerification(userCredential.user);
  return userCredential.user;
};

// ログイン
export const loginUser = async (email, password) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
};

// ログアウト
export const logoutUser = async () => {
  await signOut(auth);
};

// パスワードリセットメール送信
export const resetPassword = async (email) => {
  await sendPasswordResetEmail(auth, email);
};

// メール確認を再送信
export const resendVerificationEmail = async () => {
  if (auth.currentUser) {
    await sendEmailVerification(auth.currentUser);
  }
};

// 認証状態の監視
export const subscribeToAuthChanges = (callback) => {
  return onAuthStateChanged(auth, callback);
};

// 現在のユーザーを取得
export const getCurrentUser = () => {
  return auth.currentUser;
};
```

### 5.2 認証コンテキストの作成

`src/contexts/AuthContext.js`:

```javascript
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  loginUser,
  logoutUser,
  registerUser,
  resetPassword,
  resendVerificationEmail,
  subscribeToAuthChanges
} from '../services/authService';
import { getUserById, createUser } from '../services/userService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // 認証状態
  const isAuthenticated = !!currentUser;
  const isEmailVerified = currentUser?.emailVerified || false;

  // ユーザープロファイル読み込み
  const loadUserProfile = useCallback(async (user) => {
    if (!user) {
      setUserProfile(null);
      return;
    }
    try {
      const profile = await getUserById(user.uid);
      setUserProfile(profile);
    } catch (err) {
      console.error('Failed to load user profile:', err);
    }
  }, []);

  // プロファイル再読み込み
  const refreshProfile = useCallback(async () => {
    if (currentUser) {
      await loadUserProfile(currentUser);
    }
  }, [currentUser, loadUserProfile]);

  // ログイン
  const logIn = async (email, password) => {
    const user = await loginUser(email, password);
    await loadUserProfile(user);
    return user;
  };

  // ログアウト
  const logOut = async () => {
    await logoutUser();
    setUserProfile(null);
  };

  // 新規登録
  const signUp = async (email, password, userData) => {
    const user = await registerUser(email, password);
    // Firestore にユーザー情報を保存
    await createUser(user.uid, {
      email: user.email,
      name: userData.name,
      department: userData.department || '',
      role: 'employee', // デフォルト権限
      createdAt: new Date()
    });
    return user;
  };

  // パスワードリセット
  const sendPasswordReset = async (email) => {
    await resetPassword(email);
  };

  // メール確認再送信
  const resendEmailVerification = async () => {
    await resendVerificationEmail();
  };

  // 認証状態の監視
  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges(async (user) => {
      setCurrentUser(user);
      if (user) {
        await loadUserProfile(user);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [loadUserProfile]);

  const value = {
    currentUser,
    userProfile,
    isAuthenticated,
    isEmailVerified,
    loading,
    logIn,
    logOut,
    signUp,
    sendPasswordReset,
    resendEmailVerification,
    refreshProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
```

---

## 6. ユーザー管理機能の実装

### 6.1 ユーザーサービスの作成

`src/services/userService.js`:

```javascript
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  getDocs,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';

const USERS_COLLECTION = 'users';

// ユーザー作成
export const createUser = async (userId, userData) => {
  const docRef = doc(db, USERS_COLLECTION, userId);
  await setDoc(docRef, {
    ...userData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  return userId;
};

// ユーザー取得
export const getUserById = async (userId) => {
  const docRef = doc(db, USERS_COLLECTION, userId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return { uid: docSnap.id, ...docSnap.data() };
  }
  return null;
};

// 全ユーザー取得
export const getAllUsers = async () => {
  const usersRef = collection(db, USERS_COLLECTION);
  const q = query(usersRef, orderBy('name'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() }));
};

// ユーザー更新
export const updateUser = async (userId, updates) => {
  const docRef = doc(db, USERS_COLLECTION, userId);
  await updateDoc(docRef, {
    ...updates,
    updatedAt: serverTimestamp()
  });
};

// ユーザー設定更新
export const updateUserSettings = async (userId, settings) => {
  const docRef = doc(db, USERS_COLLECTION, userId);
  await updateDoc(docRef, {
    settings,
    updatedAt: serverTimestamp()
  });
};

// ユーザー削除
export const deleteUser = async (userId) => {
  const docRef = doc(db, USERS_COLLECTION, userId);
  await deleteDoc(docRef);
};
```

### 6.2 Firestore のデータ構造

```
users/
  {userId}/
    email: string
    name: string
    department: string
    role: 'admin' | 'keiri' | 'employee'
    settings: {
      // アプリ固有の設定
    }
    createdAt: timestamp
    updatedAt: timestamp
```

---

## 7. 本番環境へのデプロイ

### 7.1 Cloud Run へのデプロイ

#### Dockerfile の作成

```dockerfile
# Build stage
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
```

#### nginx.conf の作成

```nginx
server {
    listen 8080;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

#### .env.production の準備

本番用の Firebase 設定を `.env.production` に記載（前述参照）

#### デプロイコマンド

```bash
# gcloud CLI にログイン
gcloud auth login

# プロジェクトを設定
gcloud config set project your-project-id

# Cloud Run にデプロイ
gcloud run deploy your-app-name \
  --source . \
  --region asia-northeast1 \
  --allow-unauthenticated
```

### 7.2 Firebase Hosting へのデプロイ（代替）

```bash
# Firebase CLI をインストール
npm install -g firebase-tools

# ログイン
firebase login

# プロジェクトを初期化
firebase init hosting

# ビルド
npm run build

# デプロイ
firebase deploy --only hosting
```

---

## トラブルシューティング

### エラー: auth/invalid-api-key

- `.env` ファイルの `REACT_APP_FIREBASE_API_KEY` を確認
- 開発サーバーを再起動（`npm start`）

### エラー: auth/unauthorized-domain

- Firebase Console → Authentication → Settings → 承認済みドメイン
- 本番環境のドメインを追加

### エラー: permission-denied (Firestore)

- Firestore のセキュリティルールを確認
- ユーザーが認証されているか確認

### メール確認が届かない

- 迷惑メールフォルダを確認
- Firebase Console → Authentication → Templates でメールテンプレートを確認

---

## セキュリティのベストプラクティス

1. **環境変数**: API キーは `.env` ファイルで管理し、Git にコミットしない
2. **Firestore ルール**: 本番環境では適切なセキュリティルールを設定
3. **HTTPS**: 本番環境では必ず HTTPS を使用
4. **ドメイン制限**: 承認済みドメインを適切に設定
5. **権限管理**: ユーザーの role に基づいたアクセス制御を実装

---

## 参考リンク

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Authentication](https://firebase.google.com/docs/auth)
- [Cloud Firestore](https://firebase.google.com/docs/firestore)
- [Firebase Console](https://console.firebase.google.com/)
