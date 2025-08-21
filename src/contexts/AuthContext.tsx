import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../firebase/config';
import { authService } from '../firebase/auth';

// استخدام import بدلاً من require
import { onAuthStateChanged, signInAnonymously } from "firebase/auth";

// استخدام any type مؤقتاً لتجاوز مشكلة TypeScript
type User = any;

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string) => Promise<void>;
  loginAnonymously: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user: User | null) => {
      if (user) {
        setUser(user);
      } else {
        console.log('لا يوجد مستخدم مسجل دخول');
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const user = await authService.signInWithEmail(email, password);
      console.log('تم تسجيل الدخول بنجاح:', user?.email);
    } catch (error) {
      console.error('خطأ في تسجيل الدخول:', error);
      throw error;
    }
  };

  const register = async (email: string, password: string, displayName: string) => {
    try {
      const user = await authService.createAccount(email, password, displayName, 'student');
      console.log('تم إنشاء الحساب بنجاح:', user?.email);
    } catch (error) {
      console.error('خطأ في إنشاء الحساب:', error);
      throw error;
    }
  };

  const loginAnonymously = async () => {
    try {
      const userCredential = await signInAnonymously(auth);
      console.log('تم تسجيل الدخول كمجهول:', userCredential.user.uid);
    } catch (error) {
      console.error('خطأ في تسجيل الدخول المجهول:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.signOut();
      setUser(null);
      console.log('تم تسجيل الخروج بنجاح');
    } catch (error) {
      console.error('خطأ في تسجيل الخروج:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    loginAnonymously,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
