

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
  setDoc,
} from 'firebase/firestore';
import { updateProfile, User } from "firebase/auth";
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
  NewLearningStrategy,
  LearningStrategy,
} from '../types';
import { processProfiles } from '../insights-generator';

const createOrganizationAndUser = async (transaction: any, user: User, fullName: string) => {
    // 1. Create the organization
    const orgData: Omit<Organization, 'id'> = {
        name: `${fullName}'s Organization`,
        createdAt: serverTimestamp(),
    };
    const orgRef = doc(collection(db, 'organizations'));
    transaction.set(orgRef, orgData);

    // 2. Create the user profile with default admin role
    const userProfileData: UserProfile = {
        id: user.uid,
        email: user.email || '',
        name: fullName,
        role: 'admin',
        organizationId: orgRef.id,
    };
    const userRef = doc(db, 'users', user.uid);
    transaction.set(userRef, userProfileData);

    // Auth profile is updated outside transaction

    return userProfileData;
}


export const createUserProfileInFirestore = async (user: User, additionalData: Partial<UserProfile> = {}) => {
    const userRef = doc(db, 'users', user.uid);

    return await runTransaction(db, async (transaction) => {
        const docSnap = await transaction.get(userRef);

        if (!docSnap.exists()) {
            // Check if there's a pending teacher invitation for this email
            const pendingTeacherQuery = query(
                collection(db, 'users'),
                where('email', '==', user.email),
                where('status', '==', 'pending'),
                where('role', '==', 'teacher')
            );
            const pendingTeacherSnapshot = await getDocs(pendingTeacherQuery);

            if (!pendingTeacherSnapshot.empty) {
                // Found pending teacher invitation - activate it
                const pendingTeacherDoc = pendingTeacherSnapshot.docs[0];
                const teacherData = pendingTeacherDoc.data();

                const activatedProfile: UserProfile = {
                    id: user.uid,
                    email: user.email || '',
                    name: teacherData.name || user.displayName || 'Professor',
                    role: teacherData.role || 'teacher', // ✅ Garante que seja professor
                    organizationId: teacherData.organizationId,
                    status: 'active',
                };

                // Create the new user document with the activated profile
                transaction.set(userRef, activatedProfile);

                // Delete the old pending document to prevent duplication
                transaction.delete(pendingTeacherDoc.ref);

                // Update Firebase Auth display name
                updateProfile(user, { displayName: activatedProfile.name });

                return activatedProfile;
            } else {
                // No pending invitation - create new organization and admin user
                const fullName = additionalData.name || user.displayName || 'Admin';
                const profile = await createOrganizationAndUser(transaction, user, fullName);

                // This needs to be run outside the transaction, but we can't await it here.
                // It's a "best effort" update for the display name.
                updateProfile(user, { displayName: fullName });

                return profile;
            }
        }
        return docSnap.data() as UserProfile;
    });
}

// User Profile Functions
export const getUserProfile = async (userId: string) => {
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);
  if (userSnap.exists()) {
    return { id: userSnap.id, ...userSnap.data() } as UserProfile;
  }
  // If user exists in Auth but not in Firestore, create their profile.
  // This can happen if Firestore was set up after initial user registration.
  const user = auth.currentUser;
  if (user && user.uid === userId) {
      console.log(`User ${userId} found in Auth but not Firestore. Creating profile...`);
      // Use the existing createUserProfileInFirestore function which handles transactions
      return await createUserProfileInFirestore(user, { name: user.displayName || 'Novo usuário' });
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

export const getAdminsByOrganization = async (organizationId: string) => {
    const q = query(
        collection(db, 'users'),
        where('organizationId', '==', organizationId),
        where('role', '==', 'admin')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as UserProfile);
}

export const getAllUsersByOrganization = async (organizationId: string) => {
    const q = query(
        collection(db, 'users'),
        where('organizationId', '==', organizationId)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as UserProfile);
}

export const getAllOrganizations = async () => {
    const q = query(collection(db, 'organizations'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Organization));
}

export const getAllUsers = async () => {
    const q = query(collection(db, 'users'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as UserProfile);
}

export const updateUserRole = async (userId: string, newRole: UserProfile['role']) => {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, { role: newRole });
}

export const createTeacher = async (organizationId: string, teacherData: { name: string; email: string }) => {
    // Check if user already exists
    const existingUserQuery = query(
        collection(db, 'users'),
        where('email', '==', teacherData.email)
    );
    const existingUserSnapshot = await getDocs(existingUserQuery);

    if (!existingUserSnapshot.empty) {
        throw new Error("Já existe um usuário com este e-mail.");
    }

    // Create a pending teacher invitation
    const teacherDoc = {
        name: teacherData.name,
        email: teacherData.email,
        role: 'teacher' as const,
        organizationId,
        status: 'pending', // Will be set to 'active' when user signs up
        createdAt: serverTimestamp(),
    };
    const docRef = await addDoc(collection(db, 'users'), teacherDoc);

    // ✅ TRIGGER: Send invitation email to teacher
    try {
        // Import email service dynamically to avoid circular dependencies
        const { emailService } = await import('../email-service');

        // Get admin info for the invitation
        const adminQuery = query(
            collection(db, 'users'),
            where('organizationId', '==', organizationId),
            where('role', '==', 'admin')
        );
        const adminSnapshot = await getDocs(adminQuery);
        const adminData = adminSnapshot.docs[0]?.data();

        if (adminData) {
            await emailService.sendTeacherInvitationEmail(
                teacherData.email,
                teacherData.name,
                adminData.name || 'Administrador',
                'Escola MUDEAI', // schoolName
                `${process.env.NEXT_PUBLIC_APP_URL}/accept-invitation/${docRef.id}`,
                new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days expiry
            );
        }
    } catch (emailError) {
        console.error('Erro ao enviar email de convite para professor:', emailError);
        // Don't fail the teacher creation if email fails
    }

    // Return invitation details including shareable link
    return {
        teacherId: docRef.id,
        invitationLink: `${process.env.NEXT_PUBLIC_APP_URL}/accept-invitation/${docRef.id}`,
        emailSent: true, // Email was attempted (doesn't mean it succeeded)
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    };
}

export const updateTeacher = async (teacherId: string, updates: Partial<Pick<UserProfile, 'name' | 'status'>>) => {
    const userRef = doc(db, 'users', teacherId);
    await updateDoc(userRef, updates);
}

export const deleteTeacher = async (teacherId: string) => {
    const userRef = doc(db, 'users', teacherId);
    await deleteDoc(userRef);
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
  const classes = querySnapshot.docs.map(
    (doc) => ({ id: doc.id, ...doc.data() } as Class)
  );
  // Sort manually after fetching to avoid needing a composite index
  return classes.sort((a, b) => {
    const aTimestamp = a.createdAt as Timestamp;
    const bTimestamp = b.createdAt as Timestamp;
    if (!aTimestamp || !bTimestamp) return 0;
    return bTimestamp.toMillis() - aTimestamp.toMillis();
  });
};

export const getClassesByOrganization = async (organizationId: string): Promise<Class[]> => {
  const q = query(collection(db, 'classes'), where('organizationId', '==', organizationId));
  const querySnapshot = await getDocs(q);
  const classes = querySnapshot.docs.map(
    (doc) => ({ id: doc.id, ...doc.data() } as Class)
  );
  // Sort manually after fetching to avoid needing a composite index
  return classes.sort((a, b) => {
    const aTimestamp = a.createdAt as Timestamp;
    const bTimestamp = b.createdAt as Timestamp;
    if (!aTimestamp || !bTimestamp) return 0;
    return bTimestamp.toMillis() - aTimestamp.toMillis();
  });
};

export const getAllClasses = async (): Promise<Class[]> => {
  const q = query(collection(db, 'classes'));
  const querySnapshot = await getDocs(q);
  const classes = querySnapshot.docs.map(
    (doc) => ({ id: doc.id, ...doc.data() } as Class)
  );
  // Sort manually after fetching to avoid needing a composite index
  return classes.sort((a, b) => {
    const aTimestamp = a.createdAt as Timestamp;
    const bTimestamp = b.createdAt as Timestamp;
    if (!aTimestamp || !bTimestamp) return 0;
    return bTimestamp.toMillis() - aTimestamp.toMillis();
  });
};

export const getClassById = async (classId: string): Promise<Class | null> => {
    const classRef = doc(db, 'classes', classId);
    const classSnap = await getDoc(classRef);
    return classSnap.exists() ? ({ id: classSnap.id, ...classSnap.data() } as Class) : null;
};

export const updateClass = async (classId: string, updates: Partial<Pick<Class, 'enableCustomFields' | 'customFields'>>) => {
    const classRef = doc(db, 'classes', classId);

    // Filter out undefined values to avoid Firestore errors
    const cleanUpdates: Record<string, any> = {};
    Object.entries(updates).forEach(([key, value]) => {
        if (value !== undefined) {
            cleanUpdates[key] = value;
        } else {
            console.log(`Filtering out undefined value for key: ${key}`);
        }
    });

    console.log('Clean updates:', cleanUpdates);

    if (Object.keys(cleanUpdates).length > 0) {
        await updateDoc(classRef, cleanUpdates);
    } else {
        console.log('No valid updates to save');
    }
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
        if (classId) {
            classRef = doc(db, 'classes', classId);
        }

        transaction.delete(studentRef);

        if (profileId) {
            const profileRef = doc(db, 'unifiedProfiles', profileId);
            transaction.delete(profileRef);
        }

        if (classRef) {
            const classDoc = await transaction.get(classRef);
            if (classDoc.exists()) {
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
        }
    });
};



export const submitQuizAnswers = async (classId: string, studentInfo: { name: string; age: string, email?: string, gender?: string, customFields?: Record<string, string>}, answers: QuizAnswers): Promise<string> => {
     let studentId = "";
     let classData: any = null;
     let profileId = "";

     await runTransaction(db, async (transaction) => {
        const classRef = doc(db, 'classes', classId);
        const classDoc = await transaction.get(classRef);
        if (!classDoc.exists()) {
            throw new Error("Turma não existe!");
        }

        // Store class data for use outside transaction
        classData = classDoc.data();

        // Generate IDs for the documents we'll create
        const studentRef = doc(collection(db, 'students'));
        const profileRef = doc(collection(db, 'unifiedProfiles'));
        studentId = studentRef.id; // Capture the new student's ID
        profileId = profileRef.id; // Capture the profile ID

        // 1. Create the unified profile with raw answers first
        const newProfileData: NewUnifiedProfile = {
            studentId: studentRef.id,
            classId: classId,
            rawAnswers: answers,
            createdAt: serverTimestamp(),
        };
        transaction.set(profileRef, newProfileData);

        // 2. Create the new student document with the profile ID already included
        const newStudentData: NewStudent = {
            name: studentInfo.name,
            age: parseInt(studentInfo.age, 10),
            email: studentInfo.email || '',
            gender: studentInfo.gender || 'Não informado',
            classId,
            quizStatus: 'completed',
            createdAt: serverTimestamp(),
            unifiedProfileId: profileRef.id, // Include profile ID in creation
            customFields: studentInfo.customFields || {},
        };
        transaction.set(studentRef, newStudentData);

        // 3. Atomically update the class counters
        const newStudentCount = (classData.studentCount || 0) + 1;
        const newResponsesCount = (classData.responsesCount || 0) + 1;
        transaction.update(classRef, { studentCount: newStudentCount, responsesCount: newResponsesCount });
    });

    // ✅ TRIGGER: Send emails after quiz completion
    try {
        // Import email service dynamically to avoid circular dependencies
        const { emailService } = await import('../email-service');

        // Get teacher info
        const teacherProfile = await getUserProfile(classData.teacherId);

        // Process quiz results
        const rawProfile = {
            id: profileId,
            studentId: studentId,
            classId: classId,
            rawAnswers: answers,
            createdAt: new Date().toISOString(),
        } as RawUnifiedProfile;

        const [processedProfile] = processProfiles([rawProfile]);

        // ✅ Send quiz results to student (if email provided)
        if (studentInfo.email) {
            await emailService.sendQuizResultsEmail(
                studentInfo.email,
                studentInfo.name,
                classData.name,
                studentId,
                {
                    vark: processedProfile.varkProfile?.dominant || 'Não determinado',
                    disc: processedProfile.discProfile?.dominant || 'Não determinado',
                    jung: processedProfile.jungianProfile?.type || 'Não determinado',
                    schwartz: processedProfile.schwartzValues?.top_values?.join(', ') || 'Não determinado',
                },
                undefined, // whatsappNumber (not available in quiz submission)
                teacherProfile?.name
            );
        }

        // ✅ Send notification to teacher (using welcome email as notification)
        if (teacherProfile?.email) {
            await emailService.sendWelcomeEmail(
                teacherProfile.email,
                teacherProfile.name,
                `${studentInfo.name} completou o questionário na turma ${classData.name}`
            );
        }

    } catch (emailError) {
        console.error('Erro ao enviar emails após conclusão do quiz:', emailError);
        // Don't fail the quiz submission if emails fail
    }

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

// Learning Strategy Functions

export const saveStrategy = async (strategy: NewLearningStrategy): Promise<string> => {
    const dataWithTimestamp = {
        ...strategy,
        createdAt: serverTimestamp()
    };
    const docRef = await addDoc(collection(db, "learningStrategies"), dataWithTimestamp);
    return docRef.id;
}

export const getStrategiesByClass = async (classId: string): Promise<LearningStrategy[]> => {
    const q = query(
        collection(db, 'learningStrategies'), 
        where('classId', '==', classId),
        // orderBy('createdAt', 'desc') // Requires a composite index, removed for simplicity
    );
    const querySnapshot = await getDocs(q);
    const strategies = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            ...data,
            createdAt: (data.createdAt as Timestamp)?.toDate().toISOString(),
        } as LearningStrategy
    });
    // Sort manually after fetching to avoid needing a composite index
    return strategies.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export const deleteStrategy = async (strategyId: string): Promise<void> => {
    const strategyRef = doc(db, 'learningStrategies', strategyId);
    await deleteDoc(strategyRef);
};

export const deleteClass = async (classId: string): Promise<void> => {
    await runTransaction(db, async (transaction) => {
        // Get the class document
        const classRef = doc(db, 'classes', classId);
        const classDoc = await transaction.get(classRef);

        if (!classDoc.exists()) {
            throw new Error("Turma não existe!");
        }

        // Get all students in the class
        const studentsQuery = query(collection(db, 'students'), where('classId', '==', classId));
        const studentsSnapshot = await getDocs(studentsQuery);

        // Get all profiles in the class
        const profilesQuery = query(collection(db, 'unifiedProfiles'), where('classId', '==', classId));
        const profilesSnapshot = await getDocs(profilesQuery);

        // Get all strategies in the class
        const strategiesQuery = query(collection(db, 'learningStrategies'), where('classId', '==', classId));
        const strategiesSnapshot = await getDocs(strategiesQuery);

        // Delete all students
        studentsSnapshot.docs.forEach((studentDoc) => {
            transaction.delete(studentDoc.ref);
        });

        // Delete all profiles
        profilesSnapshot.docs.forEach((profileDoc) => {
            transaction.delete(profileDoc.ref);
        });

        // Delete all strategies
        strategiesSnapshot.docs.forEach((strategyDoc) => {
            transaction.delete(strategyDoc.ref);
        });

        // Finally, delete the class itself
        transaction.delete(classRef);
    });
};
