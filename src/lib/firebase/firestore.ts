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
  Timestamp,
  orderBy,
} from 'firebase/firestore';
import { updateProfile } from "firebase/auth";
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
  NewLessonPlan,
  LessonPlan,
} from '../types';
import { processProfiles } from '../insights-generator';

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

export const updateUserProfile = async (userId: string, data: Partial<Pick<UserProfile, 'name'>>) => {
    const user = auth.currentUser;
    if (!user || user.uid !== userId) {
        throw new Error("Não autorizado.");
    }
    
    // Update Firestore
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, data);

    // Update Firebase Auth display name
    if (data.name) {
        await updateProfile(user, { displayName: data.name });
    }
}

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

export const updateStudent = async (studentId: string, data: Partial<Pick<Student, 'name' | 'age'>>) => {
    const studentRef = doc(db, 'students', studentId);
    await updateDoc(studentRef, data);
}

export const deleteStudent = async (studentId: string): Promise<void> => {
    await runTransaction(db, async (transaction) => {
        const studentRef = doc(db, 'students', studentId);
        const studentDoc = await transaction.get(studentRef);

        if (!studentDoc.exists()) {
            throw new Error("Aluno não existe!");
        }

        const studentData = studentDoc.data() as Student;
        const classId = studentData.classId;
        const profileId = studentData.unifiedProfileId;
        
        let classRef;
        let classDoc;
        if (classId) {
            classRef = doc(db, 'classes', classId);
            classDoc = await transaction.get(classRef);
        }

        transaction.delete(studentRef);

        if (profileId) {
            const profileRef = doc(db, 'unifiedProfiles', profileId);
            transaction.delete(profileRef);
        }

        if (classRef && classDoc?.exists()) {
            const currentStudentCount = classDoc.data().studentCount || 0;
            const currentResponsesCount = classDoc.data().responsesCount || 0;
            
            const newStudentCount = Math.max(0, currentStudentCount - 1);
            const newResponsesCount = studentData.quizStatus === 'completed' 
                ? Math.max(0, currentResponsesCount - 1)
                : currentResponsesCount;
            
            transaction.update(classRef, { 
                studentCount: newStudentCount,
                responsesCount: newResponsesCount,
            });
        }
    });
};



export const submitQuizAnswers = async (classId: string, studentInfo: { name: string; age: string, email?: string, gender?: string}, answers: QuizAnswers): Promise<string> => {
     let studentId = "";
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
            email: studentInfo.email || '',
            gender: studentInfo.gender || 'Não informado',
            classId,
            quizStatus: 'completed',
            createdAt: serverTimestamp(),
        };
        const studentRef = doc(collection(db, 'students'));
        transaction.set(studentRef, newStudentData);
        studentId = studentRef.id; // Capture the new student's ID

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
    return studentId; // Return the student ID
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
    return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
             id: doc.id,
             ...data,
             createdAt: (data.createdAt as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
        } as RawUnifiedProfile
    });
};

export const getStudentAndProfileById = async (studentId: string): Promise<{student: Student, profile: UnifiedProfile} | null> => {
    const studentRef = doc(db, 'students', studentId);
    const studentSnap = await getDoc(studentRef);

    if (!studentSnap.exists()) return null;
    
    const studentData = studentSnap.data();
    // Convert Firestore Timestamp to a serializable format (ISO string)
    const student: Student = { 
        id: studentSnap.id,
        ...studentData,
        createdAt: (studentData.createdAt as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
    } as Student;

    if (!student.unifiedProfileId) {
         // This case might happen if the quiz submission failed midway.
         // For now, we return null, but a more robust solution could be to return the student data anyway.
         return null;
    };

    const profileRef = doc(db, 'unifiedProfiles', student.unifiedProfileId);
    const profileSnap = await getDoc(profileRef);

    if (!profileSnap.exists()) return null;
    
    const profileData = profileSnap.data();
    const rawProfile = { 
        id: profileSnap.id, 
        ...profileData,
        createdAt: (profileData.createdAt as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
    } as RawUnifiedProfile;

    // We process the single raw profile into a full unified profile
    const [processedProfile] = processProfiles([rawProfile]);

    return { student, profile: processedProfile };
}


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

// Lesson Plan Functions

export const saveLessonPlan = async (plan: NewLessonPlan): Promise<string> => {
    const docRef = await addDoc(collection(db, "lessonPlans"), plan);
    return docRef.id;
}

export const getLessonPlansByClass = async (classId: string): Promise<LessonPlan[]> => {
    const q = query(
        collection(db, 'lessonPlans'), 
        where('classId', '==', classId),
        orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            ...data,
            createdAt: (data.createdAt as Timestamp)?.toDate().toISOString(),
        } as LessonPlan
    });
}
