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
  orderBy,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from '../config/firebase';

const ATTENDANCE_COLLECTION = 'attendance';

/**
 * 勤怠データのドキュメントIDを生成
 * @param {string} userId
 * @param {string} dateKey YYYY-MM-DD形式
 * @returns {string}
 */
const generateDocId = (userId, dateKey) => {
  return `${userId}_${dateKey}`;
};

/**
 * 勤怠データを保存（作成または更新）
 * @param {string} userId
 * @param {string} dateKey YYYY-MM-DD形式
 * @param {Object} data
 * @returns {Promise<void>}
 */
export const saveAttendance = async (userId, dateKey, data) => {
  const docId = generateDocId(userId, dateKey);
  const docRef = doc(db, ATTENDANCE_COLLECTION, docId);

  const attendanceDoc = {
    userId,
    date: dateKey,
    year: parseInt(dateKey.split('-')[0]),
    month: parseInt(dateKey.split('-')[1]),
    day: parseInt(dateKey.split('-')[2]),
    kubun: data.kubun || '',
    startTime: data.startTime || '',
    endTime: data.endTime || '',
    furikaeDate: data.furikaeDate || null,
    furikaeLinkedId: data.furikaeLinkedId || null,
    furikaeType: data.furikaeType || null,
    memo: data.memo || '',
    updatedAt: serverTimestamp()
  };

  // ドキュメントが存在するかチェック
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    await updateDoc(docRef, attendanceDoc);
  } else {
    attendanceDoc.createdAt = serverTimestamp();
    await setDoc(docRef, attendanceDoc);
  }

  return docId;
};

/**
 * 勤怠データを取得
 * @param {string} userId
 * @param {string} dateKey YYYY-MM-DD形式
 * @returns {Promise<Object|null>}
 */
export const getAttendance = async (userId, dateKey) => {
  const docId = generateDocId(userId, dateKey);
  const docRef = doc(db, ATTENDANCE_COLLECTION, docId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() };
  }
  return null;
};

/**
 * 期間内の勤怠データを取得
 * @param {string} userId
 * @param {number} year
 * @param {number} month
 * @returns {Promise<Object>} { dateKey: data } 形式
 */
export const getAttendanceByPeriod = async (userId, year, month) => {
  const attendanceRef = collection(db, ATTENDANCE_COLLECTION);

  // 16日〜翌月15日の範囲で取得
  // 当月16日〜月末
  const q1 = query(
    attendanceRef,
    where('userId', '==', userId),
    where('year', '==', year),
    where('month', '==', month),
    where('day', '>=', 16)
  );

  // 翌月1日〜15日
  const nextMonth = month === 12 ? 1 : month + 1;
  const nextYear = month === 12 ? year + 1 : year;
  const q2 = query(
    attendanceRef,
    where('userId', '==', userId),
    where('year', '==', nextYear),
    where('month', '==', nextMonth),
    where('day', '<=', 15)
  );

  const [snapshot1, snapshot2] = await Promise.all([
    getDocs(q1),
    getDocs(q2)
  ]);

  const result = {};

  snapshot1.docs.forEach(doc => {
    const data = doc.data();
    result[data.date] = { id: doc.id, ...data };
  });

  snapshot2.docs.forEach(doc => {
    const data = doc.data();
    result[data.date] = { id: doc.id, ...data };
  });

  return result;
};

/**
 * ユーザーの全勤怠データを取得
 * @param {string} userId
 * @returns {Promise<Array>}
 */
export const getAttendanceByUser = async (userId) => {
  const attendanceRef = collection(db, ATTENDANCE_COLLECTION);
  const q = query(
    attendanceRef,
    where('userId', '==', userId),
    orderBy('date', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

/**
 * 年度内の勤怠データを取得（有給計算用）
 * @param {string} userId
 * @param {string} startDate YYYY-MM-DD形式
 * @param {string} endDate YYYY-MM-DD形式
 * @returns {Promise<Array>}
 */
export const getAttendanceByDateRange = async (userId, startDate, endDate) => {
  const attendanceRef = collection(db, ATTENDANCE_COLLECTION);
  const q = query(
    attendanceRef,
    where('userId', '==', userId),
    where('date', '>=', startDate),
    where('date', '<=', endDate)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

/**
 * 勤怠データを削除
 * @param {string} userId
 * @param {string} dateKey
 * @returns {Promise<void>}
 */
export const deleteAttendance = async (userId, dateKey) => {
  const docId = generateDocId(userId, dateKey);
  const docRef = doc(db, ATTENDANCE_COLLECTION, docId);
  await deleteDoc(docRef);
};

/**
 * 複数の勤怠データを一括保存
 * @param {string} userId
 * @param {Object} attendanceMap { dateKey: data }
 * @returns {Promise<void>}
 */
export const batchSaveAttendance = async (userId, attendanceMap) => {
  const batch = writeBatch(db);

  for (const [dateKey, data] of Object.entries(attendanceMap)) {
    const docId = generateDocId(userId, dateKey);
    const docRef = doc(db, ATTENDANCE_COLLECTION, docId);

    const attendanceDoc = {
      userId,
      date: dateKey,
      year: parseInt(dateKey.split('-')[0]),
      month: parseInt(dateKey.split('-')[1]),
      day: parseInt(dateKey.split('-')[2]),
      kubun: data.kubun || '',
      startTime: data.startTime || '',
      endTime: data.endTime || '',
      furikaeDate: data.furikaeDate || null,
      furikaeLinkedId: data.furikaeLinkedId || null,
      furikaeType: data.furikaeType || null,
      memo: data.memo || '',
      updatedAt: serverTimestamp(),
      createdAt: serverTimestamp()
    };

    batch.set(docRef, attendanceDoc, { merge: true });
  }

  await batch.commit();
};

/**
 * 振替休日の連動処理
 * @param {string} userId
 * @param {string} sourceDateKey 休日出勤日
 * @param {string} targetDateKey 振替休日
 * @returns {Promise<void>}
 */
export const linkTransferDays = async (userId, sourceDateKey, targetDateKey) => {
  const batch = writeBatch(db);

  const sourceDocId = generateDocId(userId, sourceDateKey);
  const targetDocId = generateDocId(userId, targetDateKey);
  const sourceRef = doc(db, ATTENDANCE_COLLECTION, sourceDocId);
  const targetRef = doc(db, ATTENDANCE_COLLECTION, targetDocId);

  // 休日出勤側を更新
  batch.set(sourceRef, {
    userId,
    date: sourceDateKey,
    year: parseInt(sourceDateKey.split('-')[0]),
    month: parseInt(sourceDateKey.split('-')[1]),
    day: parseInt(sourceDateKey.split('-')[2]),
    kubun: '休日出勤',
    furikaeDate: targetDateKey,
    furikaeLinkedId: targetDocId,
    furikaeType: 'source',
    updatedAt: serverTimestamp()
  }, { merge: true });

  // 振休側を更新
  batch.set(targetRef, {
    userId,
    date: targetDateKey,
    year: parseInt(targetDateKey.split('-')[0]),
    month: parseInt(targetDateKey.split('-')[1]),
    day: parseInt(targetDateKey.split('-')[2]),
    kubun: '振休',
    furikaeDate: sourceDateKey,
    furikaeLinkedId: sourceDocId,
    furikaeType: 'target',
    startTime: '',
    endTime: '',
    updatedAt: serverTimestamp()
  }, { merge: true });

  await batch.commit();
};

/**
 * 振替休日の連動を解除
 * @param {string} userId
 * @param {string} dateKey
 * @returns {Promise<void>}
 */
export const unlinkTransferDay = async (userId, dateKey) => {
  const docId = generateDocId(userId, dateKey);
  const docRef = doc(db, ATTENDANCE_COLLECTION, docId);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) return;

  const data = docSnap.data();
  const batch = writeBatch(db);

  // 自身の連動情報をクリア
  batch.update(docRef, {
    furikaeDate: null,
    furikaeLinkedId: null,
    furikaeType: null,
    updatedAt: serverTimestamp()
  });

  // 連動先の連動情報もクリア
  if (data.furikaeLinkedId) {
    const linkedRef = doc(db, ATTENDANCE_COLLECTION, data.furikaeLinkedId);
    batch.update(linkedRef, {
      furikaeDate: null,
      furikaeLinkedId: null,
      furikaeType: null,
      updatedAt: serverTimestamp()
    });
  }

  await batch.commit();
};
