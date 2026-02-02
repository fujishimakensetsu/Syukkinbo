import {
  doc,
  collection,
  addDoc,
  query,
  where,
  getDocs,
  orderBy,
  serverTimestamp,
  limit
} from 'firebase/firestore';
import { db } from '../config/firebase';

const HISTORY_COLLECTION = 'attendance_history';

/**
 * 履歴を保存（作成専用、更新・削除不可）
 * @param {Object} historyData
 * @returns {Promise<string>} 作成されたドキュメントID
 */
export const createHistory = async (historyData) => {
  const historyRef = collection(db, HISTORY_COLLECTION);

  const historyDoc = {
    userId: historyData.userId,
    date: historyData.date,
    attendanceDocId: historyData.attendanceDocId,
    action: historyData.action, // 'create' | 'update' | 'delete'
    snapshot: historyData.snapshot || {},
    changedFields: historyData.changedFields || [],
    previousValues: historyData.previousValues || {},
    changedAt: serverTimestamp(),
    changedBy: historyData.changedBy
  };

  const docRef = await addDoc(historyRef, historyDoc);
  return docRef.id;
};

/**
 * ユーザーの履歴を取得
 * @param {string} userId
 * @param {number} limitCount 取得件数（デフォルト: 100）
 * @returns {Promise<Array>}
 */
export const getHistoryByUser = async (userId, limitCount = 100) => {
  const historyRef = collection(db, HISTORY_COLLECTION);
  const q = query(
    historyRef,
    where('userId', '==', userId),
    orderBy('changedAt', 'desc'),
    limit(limitCount)
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    changedAt: doc.data().changedAt?.toDate() || null
  }));
};

/**
 * 特定日の履歴を取得
 * @param {string} userId
 * @param {string} dateKey YYYY-MM-DD
 * @returns {Promise<Array>}
 */
export const getHistoryByDate = async (userId, dateKey) => {
  const historyRef = collection(db, HISTORY_COLLECTION);
  const q = query(
    historyRef,
    where('userId', '==', userId),
    where('date', '==', dateKey),
    orderBy('changedAt', 'desc')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    changedAt: doc.data().changedAt?.toDate() || null
  }));
};

/**
 * 全ユーザーの履歴を取得（管理者・経理用）
 * @param {number} limitCount 取得件数（デフォルト: 200）
 * @returns {Promise<Array>}
 */
export const getAllHistory = async (limitCount = 200) => {
  const historyRef = collection(db, HISTORY_COLLECTION);
  const q = query(
    historyRef,
    orderBy('changedAt', 'desc'),
    limit(limitCount)
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    changedAt: doc.data().changedAt?.toDate() || null
  }));
};

/**
 * 期間内の履歴を取得
 * @param {string} userId
 * @param {Date} startDate
 * @param {Date} endDate
 * @returns {Promise<Array>}
 */
export const getHistoryByPeriod = async (userId, startDate, endDate) => {
  const historyRef = collection(db, HISTORY_COLLECTION);
  const q = query(
    historyRef,
    where('userId', '==', userId),
    where('changedAt', '>=', startDate),
    where('changedAt', '<=', endDate),
    orderBy('changedAt', 'desc')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    changedAt: doc.data().changedAt?.toDate() || null
  }));
};

/**
 * 変更内容を比較して差分を抽出
 * @param {Object} oldData 変更前のデータ
 * @param {Object} newData 変更後のデータ
 * @returns {{ changedFields: string[], previousValues: Object }}
 */
export const compareChanges = (oldData, newData) => {
  const changedFields = [];
  const previousValues = {};

  const fieldsToCompare = ['kubun', 'startTime', 'endTime', 'furikaeDate', 'memo'];

  fieldsToCompare.forEach(field => {
    const oldValue = oldData?.[field] ?? '';
    const newValue = newData?.[field] ?? '';

    if (oldValue !== newValue) {
      changedFields.push(field);
      previousValues[field] = oldValue;
    }
  });

  return { changedFields, previousValues };
};
