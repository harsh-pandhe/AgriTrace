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
  role?: 'FARMER' | 'AGENT' | 'RECYCLER' | 'ADMIN';
  name?: string;
  photoURL?: string | null;
};

type AuthContextType = {
  user: User | null;
  userRole: User['role'] | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  signup: (email: string, pass: string) => Promise<void>;
  logout: () => void;
  setUserRole: (role: 'FARMER' | 'AGENT' | 'RECYCLER' | 'ADMIN') => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  resendVerification: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const userData = userDoc.data() as User;
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            role: userData.role,
            name: userData.name,
            photoURL: firebaseUser.photoURL
          });
        } else {
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            photoURL: firebaseUser.photoURL
          });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, pass: string) => {
    const cred = await signInWithEmailAndPassword(auth, email, pass);
    if (!cred.user.emailVerified) {
      // sign out so callers don't have a partially signed-in user
      await signOut(auth);
      throw new Error('Please verify your email address before signing in.');
    }
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
    await signOut(auth);
    router.push('/login');
  };

  const setUserRole = async (role: 'FARMER' | 'AGENT' | 'RECYCLER' | 'ADMIN') => {
    if (user) {
      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, { role: role }, { merge: true });
      setUser((prevUser) => ({ ...prevUser!, role }));
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
    sendPasswordReset,
    resendVerification,
  };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
