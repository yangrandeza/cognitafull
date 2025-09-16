

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
import { createUserProfileInFirestore } from './firestore';

// Check if new registrations are blocked
export const checkRegistrationStatus = async () => {
  try {
    const configDoc = await getDoc(doc(db, 'system', 'registrationConfig'));
    if (configDoc.exists()) {
      const config = configDoc.data();
      return {
        blocked: config.blocked || false,
        message: config.message || 'Novos registros estão temporariamente bloqueados.'
      };
    }
    return { blocked: false, message: '' };
  } catch (error) {
    console.error('Error checking registration status:', error);
    return { blocked: false, message: '' };
  }
};

// Update registration block status
export const updateRegistrationStatus = async (blocked: boolean, message: string) => {
  try {
    await setDoc(doc(db, 'system', 'registrationConfig'), {
      blocked,
      message: message.trim() || 'Novos registros estão temporariamente bloqueados.',
      updatedAt: new Date(),
    });
    return { success: true, error: null };
  } catch (error) {
    console.error('Error updating registration status:', error);
    return { success: false, error: (error as Error).message };
  }
};

// Sign up with email and password
export const signUpWithEmail = async (email: string, password: string, fullName: string) => {
  try {
    // Check if new registrations are blocked
    const registrationStatus = await checkRegistrationStatus();
    if (registrationStatus.blocked) {
      return {
        user: null,
        error: registrationStatus.message || 'Novos registros estão temporariamente bloqueados.'
      };
    }

    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;
    // This will create a profile if one doesn't exist.
    await createUserProfileInFirestore(user, { name: fullName });
    return { user, error: null };
  } catch (error) {
    return { user: null, error: (error as Error).message };
  }
};

// Sign in with email and password
export const signInWithEmail = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    return { user: userCredential.user, error: null };
  } catch (error) {
    return { user: null, error: (error as Error).message };
  }
};

// Sign in with Google
export const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    // Check if this is a new user (no profile exists yet)
    const userProfileDoc = await getDoc(doc(db, 'users', user.uid));
    const isNewUser = !userProfileDoc.exists();

    // If it's a new user and registrations are blocked, prevent registration
    if (isNewUser) {
      const registrationStatus = await checkRegistrationStatus();
      if (registrationStatus.blocked) {
        // Sign out the user since we don't want to create the account
        await signOut(auth);
        return {
          user: null,
          error: registrationStatus.message || 'Novos registros estão temporariamente bloqueados.'
        };
      }
    }

    // This will create a profile if one doesn't exist.
    await createUserProfileInFirestore(user, { name: user.displayName || 'Usuário Google' });
    return { user, error: null };
  } catch (error) {
    return { user: null, error: (error as Error).message };
  }
};

// Sign out
export const userSignOut = async () => {
  try {
    await signOut(auth);
    return { success: true, error: null };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
};

// Update user password
export const updateUserPassword = async (newPassword: string) => {
    const user = auth.currentUser;
    if (!user) throw new Error("Nenhum usuário autenticado encontrado.");

    try {
        await updatePassword(user, newPassword);
        return { success: true, error: null };
    } catch (error) {
        console.error("Erro ao atualizar senha:", error);
        return { success: false, error: (error as Error).message };
    }
}
