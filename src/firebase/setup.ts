// إعداد Firebase باستخدام v9+ Modular SDK
import {
  collection,
  getDocs,
  doc,
  setDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './config';

// إعداد Collections الأساسية في Firestore
export const setupFirestore = async () => {
  try {
    console.log('🔥 بدء إعداد Firestore...');

    // إنشاء مستند إعدادات افتراضي
    const settingsRef = doc(db, 'settings', 'default');
    await setDoc(settingsRef, {
      schoolName: 'مدرسة الأنشطة المسرحية',
      academicYear: '2024-2025',
      contactInfo: {
        phone: '+212-XX-XXX-XXXX',
        email: 'theatre@example.ma',
        address: 'المملكة المغربية'
      },
      systemSettings: {
        language: 'ar',
        theme: 'light',
        autoBackup: true,
        notificationsEnabled: true,
        country: 'المغرب',
        currency: 'درهم مغربي',
        dateFormat: 'DD/MM/YYYY'
      },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }, { merge: true });

    console.log('✅ تم إعداد Firestore بنجاح!');
    return true;
  } catch (error) {
    console.error('❌ خطأ في إعداد Firestore:', error);
    return false;
  }
};

// فحص حالة Firestore
export const checkFirestoreStatus = async () => {
  try {
    console.log('🔍 فحص حالة Firestore...');

    const collections = ['activities', 'reports', 'users', 'settings'];
    const status: Record<string, number> = {};

    for (const collectionName of collections) {
      try {
        const querySnapshot = await getDocs(collection(db, collectionName));
        status[collectionName] = querySnapshot.size;
      } catch (error) {
        console.warn(`تعذر الوصول إلى collection ${collectionName}:`, error);
        status[collectionName] = 0;
      }
    }

    console.log('📊 حالة Collections:', status);
    return status;
  } catch (error) {
    console.error('❌ خطأ في فحص Firestore:', error);
    return null;
  }
};

// تنظيف البيانات التجريبية
export const clearTestData = () => {
  try {
    console.log('🧹 تنظيف البيانات التجريبية...');
    
    // حذف localStorage
    localStorage.removeItem('activities');
    localStorage.removeItem('activity-reports');
    localStorage.removeItem('season-archives');
    localStorage.removeItem('current-season-archive');
    localStorage.removeItem('reports');
    localStorage.removeItem('user-profile');
    
    // حذف sessionStorage
    sessionStorage.clear();
    
    console.log('✅ تم تنظيف البيانات التجريبية!');
    return true;
  } catch (error) {
    console.error('❌ خطأ في تنظيف البيانات:', error);
    return false;
  }
};

// إعداد شامل للنظام
export const initializeSystem = async () => {
  try {
    console.log('🚀 بدء إعداد النظام...');
    
    // 1. تنظيف البيانات التجريبية
    clearTestData();
    
    // 2. إعداد Firestore
    const firestoreSetup = await setupFirestore();
    
    if (firestoreSetup) {
      // 3. فحص الحالة
      const status = await checkFirestoreStatus();
      
      console.log('🎉 تم إعداد النظام بنجاح!');
      return { success: true, status };
    } else {
      throw new Error('فشل في إعداد Firestore');
    }
  } catch (error) {
    console.error('❌ خطأ في إعداد النظام:', error);
    return { success: false, error };
  }
};
