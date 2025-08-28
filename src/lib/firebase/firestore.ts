import { db } from './firebase';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  writeBatch,
  documentId,
} from 'firebase/firestore';
import type {
  UserProfile,
  Class,
  Student,
  UnifiedProfile,
  ClassWithStudentData,
} from '../types';

// User Profile Functions
export const createUserProfile = async (
  userId: string,
  data: Omit<UserProfile, 'id'>
) => {
  const userRef = doc(db, 'users', userId);
  await writeBatch(db).set(userRef, data).commit();
};

export const getUserProfile = async (userId: string) => {
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);
  if (userSnap.exists()) {
    return { id: userSnap.id, ...userSnap.data() } as UserProfile;
  }
  return null;
};

// Class Functions
export const getClassesByTeacher = async (teacherId: string): Promise<Class[]> => {
  const q = query(collection(db, 'classes'), where('teacherId', '==', teacherId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(
    (doc) => ({ id: doc.id, ...doc.data() } as Class)
  );
};

export const getClassById = async (classId: string): Promise<Class | null> => {
    const classRef = doc(db, 'classes', classId);
    const classSnap = await getDoc(classRef);
    return classSnap.exists() ? ({ id: classSnap.id, ...classSnap.data() } as Class) : null;
};


// Student and Profile Functions
export const getStudentsByClass = async (classId: string): Promise<Student[]> => {
  const q = query(collection(db, 'students'), where('classId', '==', classId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(
    (doc) => ({ id: doc.id, ...doc.data() } as Student)
  );
};

export const getProfilesByClass = async (classId: string): Promise<UnifiedProfile[]> => {
    const q = query(collection(db, 'unifiedProfiles'), where('classId', '==', classId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UnifiedProfile));
};


export const getClassWithStudentsAndProfiles = async (
  classId: string
): Promise<ClassWithStudentData | null> => {
  const classData = await getClassById(classId);
  if (!classData) return null;

  const students = await getStudentsByClass(classId);
  const profiles = await getProfilesByClass(classId);

  return {
    ...classData,
    students,
    profiles,
  };
};
