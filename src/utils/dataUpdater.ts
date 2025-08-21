// أداة تحديث البيانات - تحويل التواريخ الهجرية إلى ميلادية مغربية

import {
  collection,
  getDocs,
  writeBatch
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { convertArabicToFrenchNumbers } from './numberUtils';
import { formatDateInMoroccanStyle } from './dateConverter';

/**
 * تحويل التاريخ الهجري "صفر ١٤٤٧ هـ" إلى التاريخ الميلادي المغربي
 */
export const convertHijriDateToMoroccan = (hijriDate: string): string => {
  // إذا كان التاريخ يحتوي على "صفر ١٤٤٧ هـ" أو مشابه
  if (hijriDate.includes('صفر') && hijriDate.includes('١٤٤٧') && hijriDate.includes('هـ')) {
    // صفر ١٤٤٧ هـ يقابل تقريباً 9 غشت 2025
    const gregorianDate = new Date(2025, 7, 9); // الشهر 7 = غشت
    return formatDateInMoroccanStyle(gregorianDate);
  }
  
  // إذا كان التاريخ يحتوي على أرقام عربية، حولها إلى فرنسية
  if (/[٠-٩]/.test(hijriDate)) {
    return convertArabicToFrenchNumbers(hijriDate);
  }
  
  // إذا كان التاريخ عادي، أرجعه كما هو
  return hijriDate;
};

/**
 * تحديث جميع الأنشطة في Firestore لتحويل التواريخ الهجرية إلى ميلادية
 */
export const updateActivitiesInFirestore = async (): Promise<number> => {
  console.log('🔄 بدء تحديث الأنشطة في Firestore...');
  
  try {
    const activitiesRef = collection(db, 'activities');
    const querySnapshot = await getDocs(activitiesRef);
    
    const batch = writeBatch(db);
    let updatedCount = 0;
    
    querySnapshot.forEach((docSnapshot) => {
      const data = docSnapshot.data();
      const currentDate = data.date;
      
      // تحقق إذا كان التاريخ يحتاج تحديث
      if (currentDate && (
        currentDate.includes('هـ') || 
        currentDate.includes('صفر') || 
        currentDate.includes('١٤٤٧') ||
        /[٠-٩]/.test(currentDate)
      )) {
        const newDate = convertHijriDateToMoroccan(currentDate);
        
        if (newDate !== currentDate) {
          batch.update(docSnapshot.ref, { 
            date: newDate,
            updatedAt: new Date()
          });
          updatedCount++;
          console.log(`📅 تحديث النشاط: ${data.title} من "${currentDate}" إلى "${newDate}"`);
        }
      }
    });
    
    if (updatedCount > 0) {
      await batch.commit();
      console.log(`✅ تم تحديث ${updatedCount} نشاط في Firestore`);
    } else {
      console.log('ℹ️ لا توجد أنشطة تحتاج تحديث في Firestore');
    }
    
    return updatedCount;
  } catch (error) {
    console.error('❌ خطأ في تحديث الأنشطة في Firestore:', error);
    throw error;
  }
};

/**
 * تحديث التقارير في Firestore
 */
export const updateReportsInFirestore = async (): Promise<number> => {
  console.log('🔄 بدء تحديث التقارير في Firestore...');
  
  try {
    const reportsRef = collection(db, 'activity-reports');
    const querySnapshot = await getDocs(reportsRef);
    
    const batch = writeBatch(db);
    let updatedCount = 0;
    
    querySnapshot.forEach((docSnapshot) => {
      const data = docSnapshot.data();
      const currentDate = data.date;
      
      if (currentDate && (
        currentDate.includes('هـ') || 
        currentDate.includes('صفر') || 
        currentDate.includes('١٤٤٧') ||
        /[٠-٩]/.test(currentDate)
      )) {
        const newDate = convertHijriDateToMoroccan(currentDate);
        
        if (newDate !== currentDate) {
          batch.update(docSnapshot.ref, { 
            date: newDate,
            updatedAt: new Date()
          });
          updatedCount++;
          console.log(`📄 تحديث التقرير: ${data.title} من "${currentDate}" إلى "${newDate}"`);
        }
      }
    });
    
    if (updatedCount > 0) {
      await batch.commit();
      console.log(`✅ تم تحديث ${updatedCount} تقرير في Firestore`);
    } else {
      console.log('ℹ️ لا توجد تقارير تحتاج تحديث في Firestore');
    }
    
    return updatedCount;
  } catch (error) {
    console.error('❌ خطأ في تحديث التقارير في Firestore:', error);
    throw error;
  }
};

/**
 * تحديث البيانات المحلية في localStorage
 */
export const updateLocalStorageData = (): number => {
  console.log('🔄 بدء تحديث البيانات المحلية...');

  let totalUpdated = 0;

  // قائمة جميع مفاتيح localStorage المحتملة
  const storageKeys = [
    'activities',
    'activity-reports',
    'reports',
    'yearProjects',
    'weeklyActivities',
    'season-archives',
    'nationalDays',
    'holidays'
  ];

  storageKeys.forEach(key => {
    try {
      const data = JSON.parse(localStorage.getItem(key) || '[]');
      let keyUpdated = 0;

      if (Array.isArray(data)) {
        data.forEach((item: any) => {
          if (item.date && (
            item.date.includes('هـ') ||
            item.date.includes('صفر') ||
            item.date.includes('١٤٤٧') ||
            /[٠-٩]/.test(item.date)
          )) {
            const oldDate = item.date;
            item.date = convertHijriDateToMoroccan(item.date);
            console.log(`📅 تحديث ${key}: ${item.title || item.name || 'عنصر'} من "${oldDate}" إلى "${item.date}"`);
            keyUpdated++;
          }

          // تحديث تواريخ أخرى محتملة
          ['startDate', 'endDate', 'createdAt', 'updatedAt'].forEach(dateField => {
            if (item[dateField] && typeof item[dateField] === 'string' && (
              item[dateField].includes('هـ') ||
              item[dateField].includes('صفر') ||
              item[dateField].includes('١٤٤٧') ||
              /[٠-٩]/.test(item[dateField])
            )) {
              const oldDate = item[dateField];
              item[dateField] = convertHijriDateToMoroccan(item[dateField]);
              console.log(`📅 تحديث ${key}.${dateField}: من "${oldDate}" إلى "${item[dateField]}"`);
              keyUpdated++;
            }
          });
        });

        if (keyUpdated > 0) {
          localStorage.setItem(key, JSON.stringify(data));
          totalUpdated += keyUpdated;
        }
      }
    } catch (error) {
      console.warn(`تعذر تحديث ${key}:`, error);
    }
  });

  console.log(`✅ تم تحديث ${totalUpdated} عنصر في البيانات المحلية`);
  return totalUpdated;
};

/**
 * تحديث جميع مجموعات Firestore
 */
export const updateAllFirestoreCollections = async (): Promise<number> => {
  console.log('🔄 بدء تحديث جميع مجموعات Firestore...');

  const collections = [
    'activities',
    'activity-reports',
    'reports',
    'weekly-activities',
    'season-archives',
    'yearProjects',
    'nationalDays'
  ];

  let totalUpdated = 0;

  for (const collectionName of collections) {
    try {
      console.log(`🔍 فحص مجموعة: ${collectionName}`);
      const collectionRef = collection(db, collectionName);
      const querySnapshot = await getDocs(collectionRef);

      const batch = writeBatch(db);
      let collectionUpdated = 0;

      querySnapshot.forEach((docSnapshot) => {
        const data = docSnapshot.data();
        let docNeedsUpdate = false;
        const updates: any = {};

        // فحص جميع الحقول المحتملة للتواريخ
        const dateFields = ['date', 'startDate', 'endDate', 'createdAt', 'updatedAt'];

        dateFields.forEach(field => {
          if (data[field] && typeof data[field] === 'string' && (
            data[field].includes('هـ') ||
            data[field].includes('صفر') ||
            data[field].includes('١٤٤٧') ||
            /[٠-٩]/.test(data[field])
          )) {
            const oldDate = data[field];
            const newDate = convertHijriDateToMoroccan(data[field]);
            if (newDate !== oldDate) {
              updates[field] = newDate;
              docNeedsUpdate = true;
              console.log(`📅 ${collectionName}.${field}: "${oldDate}" → "${newDate}"`);
            }
          }
        });

        if (docNeedsUpdate) {
          updates.updatedAt = new Date();
          batch.update(docSnapshot.ref, updates);
          collectionUpdated++;
        }
      });

      if (collectionUpdated > 0) {
        await batch.commit();
        console.log(`✅ تم تحديث ${collectionUpdated} مستند في ${collectionName}`);
        totalUpdated += collectionUpdated;
      } else {
        console.log(`ℹ️ لا توجد مستندات تحتاج تحديث في ${collectionName}`);
      }

    } catch (error) {
      console.warn(`⚠️ تعذر تحديث مجموعة ${collectionName}:`, error);
    }
  }

  console.log(`✅ تم تحديث ${totalUpdated} مستند في جميع مجموعات Firestore`);
  return totalUpdated;
};

/**
 * تحديث شامل لجميع البيانات
 */
export const updateAllData = async (): Promise<{
  firestoreTotal: number;
  localStorage: number;
  total: number;
}> => {
  console.log('🚀 بدء التحديث الشامل للبيانات...');

  try {
    // تحديث جميع مجموعات Firestore
    const firestoreTotal = await updateAllFirestoreCollections();

    // تحديث localStorage
    const localStorage = updateLocalStorageData();

    const total = firestoreTotal + localStorage;

    console.log('📊 ملخص التحديث:');
    console.log(`   - مجموع Firestore: ${firestoreTotal}`);
    console.log(`   - بيانات محلية: ${localStorage}`);
    console.log(`   - المجموع الكلي: ${total}`);

    if (total > 0) {
      console.log('🎉 تم تحديث البيانات بنجاح! يُنصح بإعادة تحميل الصفحة.');
    } else {
      console.log('ℹ️ جميع البيانات محدثة بالفعل.');
    }

    return {
      firestoreTotal,
      localStorage,
      total
    };
  } catch (error) {
    console.error('💥 فشل في التحديث الشامل:', error);
    throw error;
  }
};

/**
 * فحص البيانات للعثور على التواريخ الهجرية
 */
export const scanForHijriDates = async (): Promise<{
  firestoreActivities: string[];
  firestoreReports: string[];
  localStorage: string[];
}> => {
  console.log('🔍 فحص البيانات للعثور على التواريخ الهجرية...');
  
  const result = {
    firestoreActivities: [] as string[],
    firestoreReports: [] as string[],
    localStorage: [] as string[]
  };
  
  // فحص Firestore - الأنشطة
  try {
    const activitiesRef = collection(db, 'activities');
    const querySnapshot = await getDocs(activitiesRef);
    
    querySnapshot.forEach((docSnapshot) => {
      const data = docSnapshot.data();
      if (data.date && (
        data.date.includes('هـ') || 
        data.date.includes('صفر') || 
        data.date.includes('١٤٤٧') ||
        /[٠-٩]/.test(data.date)
      )) {
        result.firestoreActivities.push(`${data.title}: ${data.date}`);
      }
    });
  } catch (error) {
    console.warn('تعذر فحص أنشطة Firestore:', error);
  }
  
  // فحص Firestore - التقارير
  try {
    const reportsRef = collection(db, 'activity-reports');
    const querySnapshot = await getDocs(reportsRef);
    
    querySnapshot.forEach((docSnapshot) => {
      const data = docSnapshot.data();
      if (data.date && (
        data.date.includes('هـ') || 
        data.date.includes('صفر') || 
        data.date.includes('١٤٤٧') ||
        /[٠-٩]/.test(data.date)
      )) {
        result.firestoreReports.push(`${data.title}: ${data.date}`);
      }
    });
  } catch (error) {
    console.warn('تعذر فحص تقارير Firestore:', error);
  }
  
  // فحص localStorage
  const activities = JSON.parse(localStorage.getItem('activities') || '[]');
  activities.forEach((activity: any) => {
    if (activity.date && (
      activity.date.includes('هـ') || 
      activity.date.includes('صفر') || 
      activity.date.includes('١٤٤٧') ||
      /[٠-٩]/.test(activity.date)
    )) {
      result.localStorage.push(`${activity.title}: ${activity.date}`);
    }
  });
  
  const reports = JSON.parse(localStorage.getItem('activity-reports') || '[]');
  reports.forEach((report: any) => {
    if (report.date && (
      report.date.includes('هـ') || 
      report.date.includes('صفر') || 
      report.date.includes('١٤٤٧') ||
      /[٠-٩]/.test(report.date)
    )) {
      result.localStorage.push(`${report.title}: ${report.date}`);
    }
  });
  
  console.log('📊 نتائج الفحص:');
  console.log(`   - أنشطة Firestore: ${result.firestoreActivities.length}`);
  console.log(`   - تقارير Firestore: ${result.firestoreReports.length}`);
  console.log(`   - بيانات محلية: ${result.localStorage.length}`);
  
  return result;
};

export default {
  convertHijriDateToMoroccan,
  updateActivitiesInFirestore,
  updateReportsInFirestore,
  updateLocalStorageData,
  updateAllData,
  scanForHijriDates
};
