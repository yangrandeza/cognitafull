
import {
  auth,
  db
} from '@/lib/firebase/firebase';
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  User,
  updateProfile,
  updatePassword,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp, addDoc, collection, updateDoc } from 'firebase/firestore';
import type { UserProfile, Organization } from '../types';

const createOrganizationAndAdmin = async (user: User, fullName: string) => {
    // 1. Create the organization
    const orgData: Omit<Organization, 'id'> = {
        name: `${fullName}'s Organization`,
        createdAt: serverTimestamp(),
    };
    const orgRef = await addDoc(collection(db, 'organizations'), orgData);

    // 2. Create the admin user profile
    const userProfileData: UserProfile = {
        id: user.uid,
        email: user.email || '',
        name: fullName,
        role: 'admin',
        organizationId: orgRef.id, 
    };
    await setDoc(doc(db, 'users', user.uid), userProfileData);

    // 3. Update Firebase Auth profile
    await updateProfile(user, { displayName: fullName });
    
    return userProfileData;
}


const createUserProfileInFirestore = async (user: User, additionalData: Partial<UserProfile> = {}) => {
    const userRef = doc(db, 'users', user.uid);
    const docSnap = await getDoc(userRef);

    if (!docSnap.exists()) {
        // This is the first sign-in for this user, likely an admin creating their account
        if(additionalData.role === 'admin') {
            return await createOrganizationAndAdmin(user, additionalData.name || 'Admin');
        }

        // For subsequent users (teachers added by admin, or Google sign-ins without a profile)
        // a more complex logic for assigning organization would be needed.
        // For the MVP, we assume the first user is an admin.
        const data: UserProfile = {
            id: user.uid,
            email: user.email || '',
            name: user.displayName || additionalData.name || 'Usuário Anônimo',
            role: 'teacher', // Default role for non-admins
            ...additionalData,
        };
        await setDoc(userRef, data);
        if (user.displayName !== data.name) {
            await updateProfile(user, { displayName: data.name });
        }
        return data;
    }
    return docSnap.data() as UserProfile;
}

// Sign up with email and password (intended for the first Admin user)
export const signUpWithEmail = async (email, password, fullName) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;
    // The first user to sign up is always an admin and creates the organization.
    await createUserProfileInFirestore(user, { name: fullName, role: 'admin' });
    return { user, error: null };
  } catch (error) {
    return { user: null, error: error.message };
  }
};

// Sign in with email and password
export const signInWithEmail = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    return { user: userCredential.user, error: null };
  } catch (error) {
    return { user: null, error: error.message };
  }
};

// Sign in with Google
export const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    // This will create a profile if one doesn't exist. 
    // In a real app, you'd need logic to assign them to an org.
    // For the MVP, we'll assume they are the first user (admin) if no profile exists.
    const userRef = doc(db, 'users', user.uid);
    const docSnap = await getDoc(userRef);
    if (!docSnap.exists()) {
        await createUserProfileInFirestore(user, { name: user.displayName || 'Admin', role: 'admin' });
    }
    return { user, error: null };
  } catch (error) {
    return { user: null, error: error.message };
  }
};

// Sign out
export const userSignOut = async () => {
  try {
    await signOut(auth);
    return { success: true, error: null };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Update user password
export const updateUserPassword = async (newPassword) => {
    const user = auth.currentUser;
    if (!user) throw new Error("Nenhum usuário autenticado encontrado.");
    
    try {
        await updatePassword(user, newPassword);
        return { success: true, error: null };
    } catch (error) {
        console.error("Erro ao atualizar senha:", error);
        return { success: false, error: error.message };
    }
}
