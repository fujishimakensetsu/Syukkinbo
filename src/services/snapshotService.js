import {
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { getAttendanceByPeriod } from './attendanceService';
import { calculateSummary } from '../utils/attendanceCalc';

const SNAPSHOT_COLLECTION = 'monthly_snapshots';

/**
 * スナップショットのドキュメントIDを生成
 * @param {string} userId
 * @param {number} year
 * @param {number} month
 * @returns {string}
 */
const generateSnapshotId = (userId, year, month) => {
  return `${userId}_${year}-${String(month).padStart(2, '0')}`;
};

/**
 * 期間の開始日・終了日を計算
 * @param {number} year
 * @param {number} month
 * @returns {{ periodStart: string, periodEnd: string }}
 */
const calculatePeriod = (year, month) => {
  // 当月16日〜翌月15日
  const periodStart = `${year}-${String(month).padStart(2, '0')}-16`;

  const nextMonth = month === 12 ? 1 : month + 1;
  const nextYear = month === 12 ? year + 1 : year;
  const periodEnd = `${nextYear}-${String(nextMonth).padStart(2, '0')}-15`;

  return { periodStart, periodEnd };
};

/**
 * 月次スナップショットを保存（確定）
 * @param {string} userId
 * @param {number} year
 * @param {number} month
 * @param {string} confirmedBy 確定者のユーザーID
 * @returns {Promise<Object>}
 */
export const saveMonthlySnapshot = async (userId, year, month, confirmedBy) => {
  const snapshotId = generateSnapshotId(userId, year, month);
  const docRef = doc(db, SNAPSHOT_COLLECTION, snapshotId);

  // 既存のスナップショットがあるかチェック
  const existingSnapshot = await getDoc(docRef);
  if (existingSnapshot.exists() && existingSnapshot.data().status === 'confirmed') {
    throw new Error('この月は既に確定済みです。確定後は変更できません。');
  }

  // 現在の出勤データを取得
  const attendanceData = await getAttendanceByPeriod(userId, year, month);

  // 集計を計算
  const summary = calculateSummary(userId, { [userId]: attendanceData });

  const { periodStart, periodEnd } = calculatePeriod(year, month);

  const snapshotDoc = {
    userId,
    year,
    month,
    periodStart,
    periodEnd,
    attendanceData,
    summary,
    status: 'confirmed',
    confirmedAt: serverTimestamp(),
    confirmedBy
  };

  await setDoc(docRef, snapshotDoc);

  return {
    id: snapshotId,
    ...snapshotDoc
  };
};

/**
 * 月次スナップショットを取得
 * @param {string} userId
 * @param {number} year
 * @param {number} month
 * @returns {Promise<Object|null>}
 */
export const getMonthlySnapshot = async (userId, year, month) => {
  const snapshotId = generateSnapshotId(userId, year, month);
  const docRef = doc(db, SNAPSHOT_COLLECTION, snapshotId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      ...data,
      confirmedAt: data.confirmedAt?.toDate() || null
    };
  }
  return null;
};

/**
 * ユーザーの全スナップショットを取得
 * @param {string} userId
 * @returns {Promise<Array>}
 */
export const getSnapshotsByUser = async (userId) => {
  const snapshotRef = collection(db, SNAPSHOT_COLLECTION);
  const q = query(
    snapshotRef,
    where('userId', '==', userId),
    orderBy('year', 'desc'),
    orderBy('month', 'desc')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      confirmedAt: data.confirmedAt?.toDate() || null
    };
  });
};

/**
 * 月が確定済みかどうかを確認
 * @param {string} userId
 * @param {number} year
 * @param {number} month
 * @returns {Promise<boolean>}
 */
export const isMonthConfirmed = async (userId, year, month) => {
  const snapshot = await getMonthlySnapshot(userId, year, month);
  return snapshot?.status === 'confirmed';
};

/**
 * 全ユーザーの特定月のスナップショット状況を取得（管理者用）
 * @param {number} year
 * @param {number} month
 * @returns {Promise<Array>}
 */
export const getSnapshotStatusByMonth = async (year, month) => {
  const snapshotRef = collection(db, SNAPSHOT_COLLECTION);
  const q = query(
    snapshotRef,
    where('year', '==', year),
    where('month', '==', month)
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      confirmedAt: data.confirmedAt?.toDate() || null
    };
  });
};
