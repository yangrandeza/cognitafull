
"use client";

import { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebase/firebase";
import { getUserProfile } from "@/lib/firebase/firestore";
import type { UserProfile } from "@/lib/types";
import { User } from "firebase/auth";

type UserProfileState = {
  user: User | null | undefined;
  userProfile: UserProfile | null;
  loading: boolean;
  error: Error | undefined;
};

export function useUserProfile(): UserProfileState {
  const [user, loadingAuth, errorAuth] = useAuthState(auth);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user) {
        setLoadingProfile(true);
        try {
          const profile = await getUserProfile(user.uid);
          setUserProfile(profile);
        } catch (error) {
          console.error("Error fetching user profile:", error);
          setUserProfile(null);
        } finally {
          setLoadingProfile(false);
        }
      } else {
        setUserProfile(null);
        setLoadingProfile(false);
      }
    };

    if (!loadingAuth) {
      fetchUserProfile();
    }
  }, [user, loadingAuth]);

  return {
    user,
    userProfile,
    loading: loadingAuth || loadingProfile,
    error: errorAuth,
  };
}
