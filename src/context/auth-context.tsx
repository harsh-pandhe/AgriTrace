'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  User as FirebaseUser,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendEmailVerification,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

type User = {
  uid: string;
  email: string | null;
  role?: 'FARMER' | 'AGENT' | 'ADMIN';
  name?: string;
  phone?: string;
  photoURL?: string | null;
};

type AuthContextType = {
  user: User | null;
  userRole: User['role'] | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  signup: (email: string, pass: string) => Promise<void>;
  logout: () => void;
  setUserRole: (role: 'FARMER' | 'AGENT' | 'ADMIN') => Promise<void>;
  updateUserProfile: (profile: { name?: string; phone?: string }) => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  resendVerification: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Log to verify persistence is being checked
    console.log('AuthProvider: Setting up auth state listener');

    // onAuthStateChanged will automatically check for persisted sessions
    // and trigger whenever auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      console.log('AuthProvider: Auth state changed', { user: firebaseUser?.uid, email: firebaseUser?.email });

      if (firebaseUser) {
        try {
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            const userData = userDoc.data() as User;
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              role: userData.role,
              name: userData.name,
              phone: userData.phone,
              photoURL: firebaseUser.photoURL
            });
          } else {
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              photoURL: firebaseUser.photoURL
            });
          }
        } catch (error) {
          console.error('Auth state change error:', error);
          // Still set user even if Firestore read fails
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            photoURL: firebaseUser.photoURL
          });
        } finally {
          setLoading(false);
        }
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, pass: string) => {
    await signInWithEmailAndPassword(auth, email, pass);
  };

  const signup = async (email: string, pass: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
    const firebaseUser = userCredential.user;
    const userDocRef = doc(db, 'users', firebaseUser.uid);
    await setDoc(userDocRef, {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      createdAt: serverTimestamp(),
    });

    // Send verification email and prompt the user to check their inbox
    await sendEmailVerification(firebaseUser);
  };

  const logout = async () => {
    // Set loading and clear local user immediately to prevent flicker/redirect loops
    setLoading(true);
    setUser(null);
    try {
      await signOut(auth);
    } finally {
      router.push('/login');
      setLoading(false);
    }
  };

  const setUserRole = async (role: 'FARMER' | 'AGENT' | 'ADMIN') => {
    if (user) {
      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, { role: role }, { merge: true });
      setUser((prevUser) => ({ ...prevUser!, role }));
    }
  };

  const updateUserProfile = async (profile: { name?: string; phone?: string }) => {
    if (user) {
      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, profile, { merge: true });
      setUser((prevUser) => ({ ...prevUser!, ...profile }));
    }
  };

  const sendPasswordReset = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const resendVerification = async () => {
    if (!auth.currentUser) throw new Error('No current user to resend verification for.');
    await sendEmailVerification(auth.currentUser);
  };

  const value = {
    user,
    userRole: user?.role || null,
    loading,
    login,
    signup,
    logout,
    setUserRole,
    updateUserProfile,
    sendPasswordReset,
    resendVerification,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
