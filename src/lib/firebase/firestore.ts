import { db, auth } from './firebase';
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
  serverTimestamp,
  runTransaction,
} from 'firebase/firestore';
import type {
  UserProfile,
  Class,
  Student,
  UnifiedProfile,
  ClassWithStudentData,
  NewClass,
  NewStudent,
  NewUnifiedProfile,
  QuizAnswers,
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
export const createClass = async (className: string, teacherId: string) => {
    const newClass: NewClass = {
        name: className,
        teacherId,
        studentCount: 0,
        responsesCount: 0,
        createdAt: serverTimestamp(),
    };
    const docRef = await addDoc(collection(db, "classes"), newClass);
    return docRef.id;
}


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
export const submitQuizAnswers = async (classId: string, studentInfo: { name: string; age: string}, answers: QuizAnswers) => {
     await runTransaction(db, async (transaction) => {
        // 1. Create the new student document
        const newStudentData: NewStudent = {
            name: studentInfo.name,
            age: parseInt(studentInfo.age, 10),
            classId,
            quizStatus: 'completed',
            createdAt: serverTimestamp(),
        };
        const studentRef = doc(collection(db, 'students'));
        transaction.set(studentRef, newStudentData);

        // 2. Create the unified profile with raw answers
        const newProfileData: NewUnifiedProfile = {
            studentId: studentRef.id,
            classId: classId,
            rawAnswers: answers,
            createdAt: serverTimestamp(),
        };
        const profileRef = doc(collection(db, 'unifiedProfiles'));
        transaction.set(profileRef, newProfileData);
        
        // 3. Update the student with the profile ID
        transaction.update(studentRef, { unifiedProfileId: profileRef.id });

        // 4. Atomically update the class counters
        const classRef = doc(db, 'classes', classId);
        const classDoc = await transaction.get(classRef);
        if (!classDoc.exists()) {
            throw new Error("Class does not exist!");
        }
        const newStudentCount = (classDoc.data().studentCount || 0) + 1;
        // The responsesCount will be incremented by the cloud function after processing
        transaction.update(classRef, { studentCount: newStudentCount });
    });
};


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