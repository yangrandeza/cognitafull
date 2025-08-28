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
  RawUnifiedProfile,
  Organization,
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

export const getTeachersByOrganization = async (organizationId: string) => {
    const q = query(
        collection(db, 'users'), 
        where('organizationId', '==', organizationId),
        where('role', '==', 'teacher')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as UserProfile);
}


// Class Functions
export const createClass = async (className: string, teacherId: string) => {
    const teacherProfile = await getUserProfile(teacherId);
    if (!teacherProfile || !teacherProfile.organizationId) {
        throw new Error("Professor não encontrado ou não associado a uma organização.");
    }

    const newClass: NewClass = {
        name: className,
        teacherId,
        organizationId: teacherProfile.organizationId,
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
        const classRef = doc(db, 'classes', classId);
        const classDoc = await transaction.get(classRef);
        if (!classDoc.exists()) {
            throw new Error("Turma não existe!");
        }

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
        const newStudentCount = (classDoc.data().studentCount || 0) + 1;
        const newResponsesCount = (classDoc.data().responsesCount || 0) + 1;
        transaction.update(classRef, { studentCount: newStudentCount, responsesCount: newResponsesCount });
    });
};


export const getStudentsByClass = async (classId: string): Promise<Student[]> => {
  const q = query(collection(db, 'students'), where('classId', '==', classId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(
    (doc) => ({ id: doc.id, ...doc.data() } as Student)
  );
};

export const getProfilesByClass = async (classId: string): Promise<RawUnifiedProfile[]> => {
    const q = query(collection(db, 'unifiedProfiles'), where('classId', '==', classId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as RawUnifiedProfile));
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
