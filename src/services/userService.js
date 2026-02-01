import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { DEFAULT_SETTINGS } from '../utils/constants';

const USERS_COLLECTION = 'users';

/**
 * ユーザープロフィールを作成
 * @param {string} uid - Firebase Auth UID
 * @param {Object} userData
 * @returns {Promise<void>}
 */
export const createUserProfile = async (uid, userData) => {
  const userRef = doc(db, USERS_COLLECTION, uid);

  const userDoc = {
    uid,
    email: userData.email,
    name: userData.name,
    role: userData.role || 'employee',
    department: userData.department || '',
    emailVerified: userData.emailVerified || false,
    settings: {
      fixedHolidays: userData.settings?.fixedHolidays || DEFAULT_SETTINGS.fixedHolidays,
      defaultStartTime: userData.settings?.defaultStartTime || DEFAULT_SETTINGS.defaultStartTime,
      defaultEndTime: userData.settings?.defaultEndTime || DEFAULT_SETTINGS.defaultEndTime
    },
    paidLeave: {
      granted: userData.paidLeave?.granted || 0,
      fiscalYearStart: userData.paidLeave?.fiscalYearStart || null
    },
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };

  await setDoc(userRef, userDoc);
  return userDoc;
};

/**
 * ユーザープロフィールを取得
 * @param {string} uid
 * @returns {Promise<Object|null>}
 */
export const getUserProfile = async (uid) => {
  const userRef = doc(db, USERS_COLLECTION, uid);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    return { id: userSnap.id, ...userSnap.data() };
  }
  return null;
};

/**
 * ユーザープロフィールを更新
 * @param {string} uid
 * @param {Object} updates
 * @returns {Promise<void>}
 */
export const updateUserProfile = async (uid, updates) => {
  const userRef = doc(db, USERS_COLLECTION, uid);
  await updateDoc(userRef, {
    ...updates,
    updatedAt: serverTimestamp()
  });
};

/**
 * ユーザーを削除
 * @param {string} uid
 * @returns {Promise<void>}
 */
export const deleteUserProfile = async (uid) => {
  const userRef = doc(db, USERS_COLLECTION, uid);
  await deleteDoc(userRef);
};

/**
 * 全ユーザーを取得
 * @returns {Promise<Array>}
 */
export const getAllUsers = async () => {
  const usersRef = collection(db, USERS_COLLECTION);
  const snapshot = await getDocs(usersRef);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

/**
 * 社員のみを取得
 * @returns {Promise<Array>}
 */
export const getEmployees = async () => {
  const usersRef = collection(db, USERS_COLLECTION);
  const q = query(usersRef, where('role', '==', 'employee'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

/**
 * 部署別にユーザーを取得
 * @param {string} department
 * @returns {Promise<Array>}
 */
export const getUsersByDepartment = async (department) => {
  const usersRef = collection(db, USERS_COLLECTION);
  const q = query(usersRef, where('department', '==', department));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

/**
 * ユーザー設定を更新
 * @param {string} uid
 * @param {Object} settings
 * @returns {Promise<void>}
 */
export const updateUserSettings = async (uid, settings) => {
  const userRef = doc(db, USERS_COLLECTION, uid);
  await updateDoc(userRef, {
    settings,
    updatedAt: serverTimestamp()
  });
};

/**
 * 有給設定を更新
 * @param {string} uid
 * @param {Object} paidLeave
 * @returns {Promise<void>}
 */
export const updatePaidLeaveSettings = async (uid, paidLeave) => {
  const userRef = doc(db, USERS_COLLECTION, uid);
  await updateDoc(userRef, {
    paidLeave,
    updatedAt: serverTimestamp()
  });
};

/**
 * メール確認状態を更新
 * @param {string} uid
 * @param {boolean} emailVerified
 * @returns {Promise<void>}
 */
export const updateEmailVerified = async (uid, emailVerified) => {
  const userRef = doc(db, USERS_COLLECTION, uid);
  await updateDoc(userRef, {
    emailVerified,
    updatedAt: serverTimestamp()
  });
};
