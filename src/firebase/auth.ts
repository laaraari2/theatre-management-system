// خدمات المصادقة باستخدام Firebase v9+ Modular SDK
import { auth, db } from './config';

// Firebase Auth functions - استخدام import للتوافق مع ES modules
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  deleteUser
} from 'firebase/auth';

// Firebase Firestore functions
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp
} from 'firebase/firestore';

// تعريف نوع المستخدم محلياً
export interface FirebaseUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  emailVerified: boolean;
}

// نوع بيانات المستخدم
export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: 'admin' | 'teacher' | 'student';
  school?: string;
  grade?: string;
  createdAt: Date;
}

// إعداد Google Provider
const googleProvider = new GoogleAuthProvider();

// دالة ترجمة الأخطاء
function getAuthErrorMessage(error: any): string {
  switch (error.code) {
    case 'auth/user-not-found':
      return 'المستخدم غير موجود';
    case 'auth/wrong-password':
      return 'كلمة المرور غير صحيحة';
    case 'auth/email-already-in-use':
      return 'هذا البريد مستخدم بالفعل';
    case 'auth/invalid-email':
      return 'البريد الإلكتروني غير صالح';
    default:
      return 'حدث خطأ غير متوقع';
  }
}

// خدمات المصادقة
export const authService = {
  // تسجيل الدخول بالإيميل وكلمة المرور
  async signInWithEmail(email: string, password: string) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('تم تسجيل الدخول بنجاح:', userCredential.user.email);
      return userCredential.user;
    } catch (error: any) {
      console.error('خطأ في تسجيل الدخول:', error);
      throw new Error(getAuthErrorMessage(error));
    }
  },

  // إنشاء حساب جديد
  async createAccount(email: string, password: string, displayName: string, role: 'admin' | 'teacher' | 'student') {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // تحديث الملف الشخصي
      await updateProfile(user, { displayName });

      // إنشاء مستند المستخدم في Firestore
      const userProfile: UserProfile = {
        uid: user.uid,
        email,
        displayName,
        role,
        createdAt: new Date()
      };

      await setDoc(doc(db, 'users', user.uid), {
        ...userProfile,
        createdAt: serverTimestamp()
      });

      console.log('تم إنشاء الحساب بنجاح:', displayName);
      return user;
    } catch (error: any) {
      console.error('خطأ في إنشاء الحساب:', error);
      throw new Error(getAuthErrorMessage(error));
    }
  },

  // تسجيل الدخول بـ Google
  async signInWithGoogle() {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // التحقق من وجود ملف المستخدم في Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));

      if (!userDoc.exists()) {
        const userProfile: UserProfile = {
          uid: user.uid,
          email: user.email || '',
          displayName: user.displayName || '',
          role: 'student',
          createdAt: new Date()
        };

        await setDoc(doc(db, 'users', user.uid), {
          ...userProfile,
          createdAt: serverTimestamp()
        });
      }

      console.log('تم تسجيل الدخول بـ Google بنجاح:', user.displayName);
      return user;
    } catch (error: any) {
      console.error('خطأ في تسجيل الدخول بـ Google:', error);
      throw new Error(getAuthErrorMessage(error));
    }
  },

  // تسجيل الخروج
  async signOut() {
    try {
      await firebaseSignOut(auth);
      console.log('تم تسجيل الخروج بنجاح');
      return true;
    } catch (error: any) {
      console.error('خطأ في تسجيل الخروج:', error);
      throw new Error(getAuthErrorMessage(error));
    }
  },

  // مراقبة حالة المصادقة
  onAuthStateChanged(callback: (user: any | null) => void) {
    return onAuthStateChanged(auth, callback);
  },

  // الحصول على ملف المستخدم
  async getUserProfile(uid: string): Promise<UserProfile | null> {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));

      if (userDoc.exists()) {
        const data = userDoc.data();
        return {
          uid: data.uid,
          email: data.email,
          displayName: data.displayName,
          role: data.role,
          school: data.school,
          grade: data.grade,
          createdAt: data.createdAt?.toDate() || new Date()
        };
      }

      return null;
    } catch (error) {
      console.error('خطأ في الحصول على ملف المستخدم:', error);
      return null;
    }
  },

  // إعادة تعيين كلمة المرور
  async resetPassword(email: string) {
    try {
      await sendPasswordResetEmail(auth, email);
      console.log('تم إرسال رابط إعادة تعيين كلمة المرور إلى:', email);
      return true;
    } catch (error: any) {
      console.error('خطأ في إعادة تعيين كلمة المرور:', error);
      throw new Error(getAuthErrorMessage(error));
    }
  },

  // تحديث الملف الشخصي
  async updateUserProfile(uid: string, data: Partial<UserProfile>) {
    try {
      await updateDoc(doc(db, 'users', uid), {
        ...data,
        updatedAt: serverTimestamp()
      });

      console.log('تم تحديث الملف الشخصي بنجاح:', uid);
      return true;
    } catch (error: any) {
      console.error('خطأ في تحديث الملف الشخصي:', error);
      throw new Error(getAuthErrorMessage(error));
    }
  },

  // حذف الحساب (اختياري)
  async deleteAccount(uid: string) {
    try {
      const user = auth.currentUser;
      if (user) {
        await deleteUser(user);
        await deleteDoc(doc(db, 'users', uid));
        console.log('تم حذف الحساب بنجاح');
        return true;
      }
      return false;
    } catch (error: any) {
      console.error('خطأ في حذف الحساب:', error);
      throw new Error(getAuthErrorMessage(error));
    }
  }
};

export default authService;
