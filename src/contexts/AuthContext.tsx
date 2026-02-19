import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  signInWithPopup,
  updateProfile,
  type User,
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, googleProvider, isFirebaseConfigured } from '../lib/firebase';
import type { UserProfile, Household } from '../types';

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  updateUserProfile: (data: Partial<UserProfile>) => Promise<void>;
  isDemoMode: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

const DEFAULT_HOUSEHOLD: Household = {
  adults: 1,
  children: 0,
  infants: 0,
  pets: [],
  specialNeeds: [],
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const isDemoMode = !isFirebaseConfigured;

  async function fetchUserProfile(uid: string) {
    try {
      const docRef = doc(db, 'users', uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setUserProfile(docSnap.data() as UserProfile);
      }
    } catch (err) {
      console.error('Error fetching user profile:', err);
    }
  }

  useEffect(() => {
    if (isDemoMode) {
      setLoading(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        await fetchUserProfile(user.uid);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, [isDemoMode]);

  async function signUp(email: string, password: string, displayName: string) {
    const { user } = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(user, { displayName });
    const profile: UserProfile = {
      uid: user.uid,
      email,
      displayName,
      createdAt: serverTimestamp(),
      profileComplete: false,
      locations: [],
      household: DEFAULT_HOUSEHOLD,
      emergencyContacts: [],
    };
    await setDoc(doc(db, 'users', user.uid), profile);
    setUserProfile(profile);
  }

  async function signIn(email: string, password: string) {
    await signInWithEmailAndPassword(auth, email, password);
  }

  async function signInWithGoogle() {
    const { user } = await signInWithPopup(auth, googleProvider);
    const docRef = doc(db, 'users', user.uid);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      const profile: UserProfile = {
        uid: user.uid,
        email: user.email ?? '',
        displayName: user.displayName ?? 'User',
        createdAt: serverTimestamp(),
        profileComplete: false,
        locations: [],
        household: DEFAULT_HOUSEHOLD,
        emergencyContacts: [],
      };
      await setDoc(docRef, profile);
      setUserProfile(profile);
    }
  }

  async function signOut() {
    await firebaseSignOut(auth);
    setUserProfile(null);
  }

  async function updateUserProfile(data: Partial<UserProfile>) {
    if (!currentUser) return;
    const docRef = doc(db, 'users', currentUser.uid);
    await updateDoc(docRef, data as Record<string, unknown>);
    setUserProfile((prev) => (prev ? { ...prev, ...data } : null));
  }

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        loading,
        signUp,
        signIn,
        signInWithGoogle,
        signOut,
        updateUserProfile,
        isDemoMode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
