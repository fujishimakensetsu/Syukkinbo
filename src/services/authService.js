import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendEmailVerification,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged
} from 'firebase/auth';
import { auth } from '../config/firebase';

/**
 * メールアドレスとパスワードで新規登録
 * @param {string} email
 * @param {string} password
 * @param {string} displayName
 * @returns {Promise<UserCredential>}
 */
export const signUp = async (email, password, displayName) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);

  // 表示名を設定
  if (displayName) {
    await updateProfile(userCredential.user, { displayName });
  }

  // 確認メールを送信
  await sendEmailVerification(userCredential.user);

  return userCredential;
};

/**
 * メールアドレスとパスワードでログイン
 * @param {string} email
 * @param {string} password
 * @returns {Promise<UserCredential>}
 */
export const signIn = async (email, password) => {
  return signInWithEmailAndPassword(auth, email, password);
};

/**
 * ログアウト
 * @returns {Promise<void>}
 */
export const logOut = async () => {
  return signOut(auth);
};

/**
 * 確認メールを再送信
 * @param {User} user
 * @returns {Promise<void>}
 */
export const resendVerificationEmail = async (user) => {
  if (user && !user.emailVerified) {
    return sendEmailVerification(user);
  }
  throw new Error('ユーザーが存在しないか、既に確認済みです');
};

/**
 * パスワードリセットメールを送信
 * @param {string} email
 * @returns {Promise<void>}
 */
export const resetPassword = async (email) => {
  return sendPasswordResetEmail(auth, email);
};

/**
 * 現在のユーザーを取得
 * @returns {User|null}
 */
export const getCurrentUser = () => {
  return auth.currentUser;
};

/**
 * 認証状態の変更を監視
 * @param {function} callback
 * @returns {function} unsubscribe
 */
export const subscribeToAuthChanges = (callback) => {
  return onAuthStateChanged(auth, callback);
};

/**
 * Firebaseエラーを日本語メッセージに変換
 * @param {Error} error
 * @returns {string}
 */
export const getAuthErrorMessage = (error) => {
  const errorMessages = {
    'auth/email-already-in-use': 'このメールアドレスは既に使用されています',
    'auth/invalid-email': 'メールアドレスの形式が正しくありません',
    'auth/operation-not-allowed': 'この操作は許可されていません',
    'auth/weak-password': 'パスワードが弱すぎます（6文字以上必要）',
    'auth/user-disabled': 'このアカウントは無効化されています',
    'auth/user-not-found': 'ユーザーが見つかりません',
    'auth/wrong-password': 'パスワードが正しくありません',
    'auth/invalid-credential': 'メールアドレスまたはパスワードが正しくありません',
    'auth/too-many-requests': 'ログイン試行回数が多すぎます。しばらく待ってから再試行してください',
    'auth/network-request-failed': 'ネットワークエラーが発生しました',
    'auth/requires-recent-login': '再度ログインしてください'
  };

  return errorMessages[error.code] || 'エラーが発生しました。もう一度お試しください';
};
