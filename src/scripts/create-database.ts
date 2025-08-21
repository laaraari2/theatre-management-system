// سكريبت إنشاء قاعدة البيانات في Firestore
import {
  collection,
  doc,
  setDoc,
  addDoc,
  deleteDoc,
  getDocs,
  writeBatch,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { convertISOToArabicDateWithFrenchNumbers } from '../utils/numberUtils';

// حذف قاعدة البيانات بالكامل
export async function deleteEntireDatabase(): Promise<void> {
  console.log('🗑️ بدء حذف قاعدة البيانات بالكامل...');

  const collections = [
    'activities',
    'weekly-activities',
    'activity-reports',
    'season-archives',
    'system-settings',
    'ratings',
    'voice-recordings',
    'reports',
    'users',
    'settings',
    'yearProjects',
    'nationalDays'
  ];

  let totalDeleted = 0;

  for (const collectionName of collections) {
    try {
      console.log(`🔍 حذف مجموعة: ${collectionName}`);
      const querySnapshot = await getDocs(collection(db, collectionName));

      const batch = writeBatch(db);
      let batchCount = 0;

      querySnapshot.forEach((document) => {
        batch.delete(document.ref);
        batchCount++;
        totalDeleted++;
      });

      if (batchCount > 0) {
        await batch.commit();
        console.log(`✅ تم حذف ${batchCount} مستند من ${collectionName}`);
      } else {
        console.log(`ℹ️ مجموعة ${collectionName} فارغة بالفعل`);
      }

    } catch (error) {
      console.warn(`⚠️ تعذر حذف مجموعة ${collectionName}:`, error);
    }
  }

  console.log(`🗑️ تم حذف ${totalDeleted} مستند من قاعدة البيانات`);
}

// دالة إنشاء قاعدة البيانات الكاملة
export async function createFirestoreDatabase() {
  console.log('🚀 بدء إنشاء قاعدة البيانات في Firestore...');

  try {
    // التحقق من الصلاحيات أولاً
    await checkFirestorePermissions();

    // 1. إنشاء إعدادات النظام
    await createSystemSettings();

    // 2. إنشاء الموسم الحالي
    await createCurrentSeason();

    // 3. إنشاء الأسبوع الحالي
    await createCurrentWeek();

    // 4. إنشاء مجموعات فارغة (لضمان وجودها)
    await createEmptyCollections();

    console.log('✅ تم إنشاء قاعدة البيانات بنجاح!');
    console.log('📊 المجموعات المُنشأة:');
    console.log('   - activities (الأنشطة)');
    console.log('   - weekly-activities (الأنشطة الأسبوعية)');
    console.log('   - activity-reports (تقارير الأنشطة)');
    console.log('   - season-archives (الأرشيف الموسمي)');
    console.log('   - system-settings (إعدادات النظام)');
    console.log('   - ratings (التقييمات)');
    console.log('   - voice-recordings (التسجيلات الصوتية)');

  } catch (error: any) {
    if (error.code === 'permission-denied') {
      console.error('❌ خطأ في الصلاحيات! يرجى اتباع الخطوات التالية:');
      console.error('1. اذهب إلى Firebase Console');
      console.error('2. اختر مشروعك → Firestore Database → Rules');
      console.error('3. استبدل القواعد بـ: allow read, write: if true;');
      console.error('4. انقر Publish');
      console.error('5. أعد المحاولة');
    } else {
      console.error('❌ فشل في إنشاء قاعدة البيانات:', error);
    }
    throw error;
  }
}

// التحقق من صلاحيات Firestore
async function checkFirestorePermissions() {
  console.log('🔍 التحقق من صلاحيات Firestore...');

  try {
    // محاولة كتابة مستند تجريبي
    const testDoc = doc(db, 'test', 'permission-check');
    await setDoc(testDoc, {
      test: true,
      timestamp: serverTimestamp()
    });

    console.log('✅ الصلاحيات متاحة');

    // حذف المستند التجريبي
    await deleteDoc(testDoc);

  } catch (error: any) {
    if (error.code === 'permission-denied') {
      throw new Error('permission-denied');
    }
    throw error;
  }
}

// إنشاء إعدادات النظام
async function createSystemSettings() {
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
      language: 'ar',
      theme: 'light',
      notifications: true,
      country: 'المغرب',
      currency: 'درهم مغربي',
      dateFormat: 'DD/MM/YYYY'
    },
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };

  await setDoc(doc(db, 'system-settings', 'main-settings'), systemSettings);
  console.log('⚙️ تم إنشاء إعدادات النظام');
}

// إنشاء الموسم الحالي
async function createCurrentSeason() {
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
async function createCurrentWeek() {
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
    status: 'مخطط',
    notes: '',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };

  await setDoc(doc(db, 'weekly-activities', weeklyActivity.id), weeklyActivity);
  console.log(`📊 تم إنشاء الأسبوع الحالي: الأسبوع ${weekNumber} من ${currentYear}`);
}

// إنشاء مجموعات فارغة لضمان وجودها
async function createEmptyCollections() {
  // إنشاء مستند وهمي في كل مجموعة ثم حذفه (لإنشاء المجموعة)
  const collections = [
    'activities',
    'activity-reports', 
    'ratings',
    'voice-recordings'
  ];

  for (const collectionName of collections) {
    try {
      // إضافة مستند وهمي
      await addDoc(collection(db, collectionName), {
        _placeholder: true,
        createdAt: serverTimestamp()
      });

      console.log(`📁 تم إنشاء مجموعة: ${collectionName}`);
      
    } catch (error) {
      console.error(`❌ خطأ في إنشاء مجموعة ${collectionName}:`, error);
    }
  }
}

// إنشاء بيانات تجريبية (اختياري)
export async function createSampleData() {
  console.log('🎭 إنشاء بيانات تجريبية...');

  // نشاط تجريبي
  const currentDate = new Date().toISOString().split('T')[0];
  const sampleActivity = {
    title: 'ورشة التمثيل الأساسية',
    date: convertISOToArabicDateWithFrenchNumbers(currentDate),
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

  const activityRef = await addDoc(collection(db, 'activities'), sampleActivity);
  console.log(`✅ تم إنشاء نشاط تجريبي: ${sampleActivity.title}`);

  // تقرير تجريبي
  const sampleReport = {
    activityId: activityRef.id,
    title: 'تقرير ورشة التمثيل الأساسية',
    date: convertISOToArabicDateWithFrenchNumbers(currentDate),
    content: 'تم تنفيذ الورشة بنجاح مع مشاركة فعالة من جميع الأعضاء',
    achievements: [
      'تعلم أساسيات التمثيل',
      'تحسين مهارات الإلقاء',
      'بناء الثقة بالنفس'
    ],
    participants: 15,
    feedback: 'ورشة ممتازة ومفيدة جداً',
    images: [],
    attachments: [],
    createdAt: serverTimestamp(),
    createdBy: 'الأستاذ مصطفى لعرعري'
  };

  await addDoc(collection(db, 'activity-reports'), sampleReport);
  console.log(`✅ تم إنشاء تقرير تجريبي: ${sampleReport.title}`);
}

// حذف البيانات المحلية أيضاً
export function clearLocalStorage(): void {
  console.log('🧹 حذف البيانات المحلية...');

  const keysToRemove = [
    'activities',
    'activity-reports',
    'reports',
    'season-archives',
    'ratings',
    'voice-recordings',
    'weekly-activities',
    'yearProjects',
    'nationalDays',
    'users',
    'settings'
  ];

  keysToRemove.forEach(key => {
    localStorage.removeItem(key);
  });

  console.log('✅ تم حذف البيانات المحلية');
}

// دالة شاملة لحذف قاعدة البيانات بالكامل
export async function deleteCompleteDatabase(): Promise<void> {
  console.log('🗑️ بدء حذف قاعدة البيانات بالكامل...');

  try {
    // 1. حذف قاعدة البيانات في Firestore
    await deleteEntireDatabase();

    // 2. حذف البيانات المحلية
    clearLocalStorage();

    console.log('🎉 تم حذف قاعدة البيانات بالكامل!');
    console.log('📋 يمكنك الآن إنشاء قاعدة بيانات جديدة');

  } catch (error) {
    console.error('💥 فشل في حذف قاعدة البيانات:', error);
    throw error;
  }
}

// دالة شاملة لحذف وإعادة إنشاء قاعدة البيانات
export async function recreateCompleteDatabase(includeSampleData: boolean = false): Promise<void> {
  console.log('🔄 بدء حذف وإعادة إنشاء قاعدة البيانات...');

  try {
    // 1. حذف قاعدة البيانات الحالية
    await deleteCompleteDatabase();

    // انتظار قصير للتأكد من اكتمال الحذف
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 2. إنشاء قاعدة البيانات الجديدة
    await createFirestoreDatabase();

    // 3. إضافة البيانات التجريبية إذا طُلب ذلك
    if (includeSampleData) {
      await createSampleData();
    }

    console.log('🎉 تم حذف وإعادة إنشاء قاعدة البيانات بنجاح!');
    console.log('📋 قاعدة البيانات الآن نظيفة ومحدثة');
    console.log('💡 يُنصح بإعادة تحميل الصفحة');

  } catch (error) {
    console.error('💥 فشل في حذف وإعادة إنشاء قاعدة البيانات:', error);
    throw error;
  }
}

// دالة شاملة لإنشاء قاعدة البيانات مع البيانات التجريبية
export async function setupCompleteDatabase(includeSampleData: boolean = false) {
  try {
    await createFirestoreDatabase();

    if (includeSampleData) {
      await createSampleData();
    }

    console.log('🎉 تم إعداد قاعدة البيانات الكاملة بنجاح!');

  } catch (error) {
    console.error('💥 فشل في إعداد قاعدة البيانات:', error);
    throw error;
  }
}

// تصدير الدوال
export default {
  createFirestoreDatabase,
  createSampleData,
  setupCompleteDatabase,
  deleteEntireDatabase,
  deleteCompleteDatabase,
  recreateCompleteDatabase,
  clearLocalStorage
};
