
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

// Sign up with email and password
export const signUpWithEmail = async (email, password, fullName) => {
  try {
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
    await createUserProfileInFirestore(user, { name: user.displayName || 'Usuário Google' });
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
