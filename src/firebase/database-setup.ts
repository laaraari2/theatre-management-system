// إعداد قاعدة البيانات الحقيقية - حذف البيانات التجريبية وإنشاء الهيكل الأساسي
import {
  collection,
  doc,
  setDoc,
  addDoc,
  getDocs,
  writeBatch,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './config';

// هيكل قاعدة البيانات
export interface DatabaseStructure {
  // الجدول العام للأنشطة
  activities: {
    id: string;
    title: string;
    date: string;
    time: string;
    location: string;
    description: string;
    participants: string;
    status: 'مخطط' | 'جاري التنفيذ' | 'مكتمل' | 'ملغي';
    category: 'مسرحي' | 'ثقافي' | 'تعليمي' | 'اجتماعي';
    priority: 'عالية' | 'متوسطة' | 'منخفضة';
    reportId?: string;
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
  };

  // الجدول الأسبوعي للأنشطة
  weeklyActivities: {
    id: string;
    weekNumber: number;
    year: number;
    weekStart: string; // تاريخ بداية الأسبوع
    weekEnd: string;   // تاريخ نهاية الأسبوع
    activities: string[]; // معرفات الأنشطة
    status: 'مخطط' | 'جاري' | 'مكتمل';
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
  };

  // تقارير الأنشطة
  activityReports: {
    id: string;
    activityId: string;
    title: string;
    date: string;
    content: string;
    achievements: string[];
    participants: number;
    feedback: string;
    images: string[];
    attachments: string[];
    createdAt: Date;
    createdBy: string;
  };

  // الأرشيف الموسمي
  seasonArchives: {
    id: string;
    seasonName: string;
    startDate: string;
    endDate: string;
    activities: any[];
    reports: any[];
    statistics: {
      totalActivities: number;
      completedActivities: number;
      totalReports: number;
      totalParticipants: number;
      averageRating: number;
    };
    createdAt: Date;
    isActive: boolean;
  };

  // إعدادات النظام
  systemSettings: {
    id: string;
    currentSeason: string;
    defaultLocation: string;
    organizationName: string;
    contactInfo: {
      email: string;
      phone: string;
      address: string;
    };
    preferences: {
      language: 'ar' | 'en';
      theme: 'light' | 'dark';
      notifications: boolean;
    };
    updatedAt: Date;
  };
}

// خدمة إعداد قاعدة البيانات
export class DatabaseSetupService {
  
  // حذف جميع البيانات التجريبية
  static async clearAllTestData(): Promise<void> {
    console.log('🗑️ بدء حذف البيانات التجريبية...');
    
    const collections = [
      'activities',
      'weekly-activities', 
      'activity-reports',
      'season-archives',
      'reports',
      'ratings',
      'voice-recordings'
    ];

    const batch = writeBatch(db);
    let deletedCount = 0;

    for (const collectionName of collections) {
      try {
        const querySnapshot = await getDocs(collection(db, collectionName));
        
        querySnapshot.forEach((document) => {
          batch.delete(document.ref);
          deletedCount++;
        });
        
        console.log(`📂 تم تحديد ${querySnapshot.size} مستند للحذف من ${collectionName}`);
      } catch (error) {
        console.error(`❌ خطأ في الوصول إلى مجموعة ${collectionName}:`, error);
      }
    }

    try {
      await batch.commit();
      console.log(`✅ تم حذف ${deletedCount} مستند بنجاح`);
    } catch (error) {
      console.error('❌ خطأ في حذف البيانات:', error);
      throw error;
    }

    // حذف البيانات المحلية أيضاً
    this.clearLocalStorage();
  }

  // حذف البيانات المحلية
  static clearLocalStorage(): void {
    console.log('🧹 حذف البيانات المحلية...');
    
    const keysToRemove = [
      'activities',
      'activity-reports', 
      'season-archives',
      'reports',
      'ratings',
      'voice-recordings',
      'weekly-activities'
    ];

    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
    });

    console.log('✅ تم حذف البيانات المحلية');
  }

  // إنشاء الهيكل الأساسي لقاعدة البيانات
  static async createDatabaseStructure(): Promise<void> {
    console.log('🏗️ إنشاء الهيكل الأساسي لقاعدة البيانات...');

    try {
      // إنشاء إعدادات النظام الافتراضية
      await this.createSystemSettings();
      
      // إنشاء الموسم الحالي
      await this.createCurrentSeason();
      
      // إنشاء الأسبوع الحالي
      await this.createCurrentWeek();

      console.log('✅ تم إنشاء الهيكل الأساسي بنجاح');
    } catch (error) {
      console.error('❌ خطأ في إنشاء الهيكل الأساسي:', error);
      throw error;
    }
  }

  // إنشاء إعدادات النظام
  static async createSystemSettings(): Promise<void> {
    const currentYear = new Date().getFullYear();
    
    const systemSettings = {
      id: 'main-settings',
      currentSeason: `season-${currentYear}`,
      defaultLocation: 'قاعة المسرح الرئيسية',
      organizationName: 'النادي المسرحي',
      contactInfo: {
        email: 'theatre@example.ma',
        phone: '+212-XX-XXX-XXXX',
        address: 'المملكة المغربية'
      },
      preferences: {
        language: 'ar' as const,
        theme: 'light' as const,
        notifications: true,
        country: 'المغرب',
        currency: 'درهم مغربي',
        dateFormat: 'DD/MM/YYYY'
      },
      updatedAt: serverTimestamp()
    };

    await setDoc(doc(db, 'system-settings', 'main-settings'), systemSettings);
    console.log('⚙️ تم إنشاء إعدادات النظام');
  }

  // إنشاء الموسم الحالي
  static async createCurrentSeason(): Promise<void> {
    const currentYear = new Date().getFullYear();
    const seasonId = `season-${currentYear}`;
    
    const currentSeason = {
      id: seasonId,
      seasonName: `الموسم المسرحي ${currentYear}-${currentYear + 1}`,
      startDate: `${currentYear}-09-01`,
      endDate: `${currentYear + 1}-06-30`,
      activities: [],
      reports: [],
      statistics: {
        totalActivities: 0,
        completedActivities: 0,
        totalReports: 0,
        totalParticipants: 0,
        averageRating: 0
      },
      createdAt: serverTimestamp(),
      isActive: true
    };

    await setDoc(doc(db, 'season-archives', seasonId), currentSeason);
    console.log(`📅 تم إنشاء الموسم الحالي: ${currentSeason.seasonName}`);
  }

  // إنشاء الأسبوع الحالي
  static async createCurrentWeek(): Promise<void> {
    const now = new Date();
    const currentYear = now.getFullYear();
    
    // حساب رقم الأسبوع
    const startOfYear = new Date(currentYear, 0, 1);
    const weekNumber = Math.ceil(((now.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7);
    
    // حساب بداية ونهاية الأسبوع
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    const weeklyActivity = {
      id: `week-${currentYear}-${weekNumber}`,
      weekNumber,
      year: currentYear,
      weekStart: startOfWeek.toISOString().split('T')[0],
      weekEnd: endOfWeek.toISOString().split('T')[0],
      activities: [],
      status: 'مخطط' as const,
      notes: '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    await setDoc(doc(db, 'weekly-activities', weeklyActivity.id), weeklyActivity);
    console.log(`📊 تم إنشاء الأسبوع الحالي: الأسبوع ${weekNumber} من ${currentYear}`);
  }

  // إنشاء نشاط تجريبي واحد (اختياري)
  static async createSampleActivity(): Promise<void> {
    const sampleActivity = {
      title: 'ورشة التمثيل الأساسية',
      date: new Date().toISOString().split('T')[0],
      time: '16:00',
      location: 'قاعة المسرح الرئيسية',
      description: 'ورشة تدريبية لتعلم أساسيات التمثيل والإلقاء',
      participants: 'جميع الأعضاء',
      status: 'مخطط',
      category: 'تعليمي',
      priority: 'متوسطة',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      createdBy: 'الأستاذ مصطفى لعرعري'
    };

    const docRef = await addDoc(collection(db, 'activities'), sampleActivity);
    console.log(`🎭 تم إنشاء نشاط تجريبي: ${sampleActivity.title} (${docRef.id})`);
  }

  // تشغيل الإعداد الكامل
  static async setupCompleteDatabase(includeSampleData: boolean = false): Promise<void> {
    console.log('🚀 بدء إعداد قاعدة البيانات الكاملة...');
    
    try {
      // 1. حذف البيانات التجريبية
      await this.clearAllTestData();
      
      // 2. إنشاء الهيكل الأساسي
      await this.createDatabaseStructure();
      
      // 3. إنشاء بيانات تجريبية (اختياري)
      if (includeSampleData) {
        await this.createSampleActivity();
      }
      
      console.log('🎉 تم إعداد قاعدة البيانات بنجاح!');
      console.log('📋 يمكنك الآن البدء في إضافة الأنشطة والتقارير الحقيقية');
      
    } catch (error) {
      console.error('💥 فشل في إعداد قاعدة البيانات:', error);
      throw error;
    }
  }

  // التحقق من حالة قاعدة البيانات
  static async checkDatabaseStatus(): Promise<void> {
    console.log('🔍 فحص حالة قاعدة البيانات...');
    
    const collections = ['activities', 'weekly-activities', 'activity-reports', 'season-archives', 'system-settings'];
    
    for (const collectionName of collections) {
      try {
        const querySnapshot = await getDocs(collection(db, collectionName));
        console.log(`📊 ${collectionName}: ${querySnapshot.size} مستند`);
      } catch (error) {
        console.error(`❌ خطأ في الوصول إلى ${collectionName}:`, error);
      }
    }
  }
}

// تصدير الخدمة
export default DatabaseSetupService;
