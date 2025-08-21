import React, { useState } from 'react';
import {
  seedYearProjects,
  addAntigoneProject,
  seedAllData,
  clearSeedData
} from '../utils/seedData';
import { db } from '../firebase/config';
import {
  collection,
  doc,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { getDocs } from 'firebase/firestore';

const DevSettings: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [dbStatus, setDbStatus] = useState<{[key: string]: number}>({});

  // دالة فحص حالة قاعدة البيانات
  const checkDatabaseStatus = async () => {
    setLoading(true);
    setMessage('جاري فحص قاعدة البيانات...');

    try {
      const collections = [
        'activities',
        'yearProjects',
        'weeklySchedule',
        'reports',
        'archive',
        'holidays',
        'nationalDays',
        'users'
      ];

      const status: {[key: string]: number} = {};

      for (const collectionName of collections) {
        try {
          const snapshot = await getDocs(collection(db, collectionName));
          status[collectionName] = snapshot.size;
        } catch (error) {
          status[collectionName] = -1; // خطأ في الوصول
        }
      }

      setDbStatus(status);

      const totalDocs = Object.values(status).reduce((sum, count) => sum + Math.max(0, count), 0);
      setMessage(`✅ تم فحص قاعدة البيانات. إجمالي المستندات: ${totalDocs}`);
    } catch (error) {
      setMessage('❌ خطأ في فحص قاعدة البيانات: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleSeedData = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      const success = await seedYearProjects();
      if (success) {
        setMessage('✅ تمت إضافة البيانات التجريبية بنجاح');
      } else {
        setMessage('❌ فشل في إضافة البيانات');
      }
    } catch (error) {
      setMessage('❌ خطأ: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAntigone = async () => {
    setLoading(true);
    setMessage('');

    try {
      const success = await addAntigoneProject();
      if (success) {
        setMessage('✅ تمت إضافة مشروع أنتيغون بنجاح');
      } else {
        setMessage('❌ فشل في إضافة مشروع أنتيغون');
      }
    } catch (error) {
      setMessage('❌ خطأ: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };



  const handleSeedAllData = async () => {
    setLoading(true);
    setMessage('');

    try {
      const success = await seedAllData();
      if (success) {
        setMessage('🎉 تمت إضافة جميع البيانات التجريبية بنجاح!');
      } else {
        setMessage('❌ فشل في إضافة البيانات');
      }
    } catch (error) {
      setMessage('❌ خطأ: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleClearData = async () => {
    if (!window.confirm('هل أنت متأكد من حذف جميع البيانات التجريبية؟ هذا الإجراء لا يمكن التراجع عنه.')) {
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const success = await clearSeedData();
      if (success) {
        setMessage('🗑️ تم حذف البيانات التجريبية بنجاح');
      } else {
        setMessage('❌ فشل في حذف البيانات');
      }
    } catch (error) {
      setMessage('❌ خطأ: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // دالة إنشاء قاعدة البيانات الكاملة
  const handleCreateDatabase = async () => {
    if (!window.confirm('هل تريد إنشاء قاعدة البيانات الكاملة لجميع المكونات؟ سيتم إنشاء جميع Collections المطلوبة.')) {
      return;
    }

    setLoading(true);
    setMessage('جاري إنشاء قاعدة البيانات...');

    try {
      const batch = writeBatch(db);
      const userId = 'demo-user';
      const timestamp = serverTimestamp();

      // 1. إنشاء Collection للأنشطة (activities)
      const activitiesRef = doc(collection(db, 'activities'), 'sample-activity');
      batch.set(activitiesRef, {
        title: 'نشاط تجريبي',
        description: 'هذا نشاط تجريبي لاختبار قاعدة البيانات',
        date: '2025-01-15',
        time: '10:00',
        location: 'قاعة الأنشطة',
        participants: 'جميع المستويات',
        status: 'مخطط',
        notes: 'نشاط تجريبي - يمكن حذفه',
        userId: userId,
        createdAt: timestamp,
        updatedAt: timestamp
      });

      // 2. إنشاء Collection لمشاريع السنة (yearProjects)
      const yearProjectRef = doc(collection(db, 'yearProjects'), 'sample-project');
      batch.set(yearProjectRef, {
        title: 'مشروع تجريبي',
        description: 'مشروع تجريبي لاختبار قاعدة البيانات',
        startDate: '2025-01-01',
        endDate: '2025-06-30',
        status: 'قيد التخطيط',
        director: 'مخرج تجريبي',
        budget: 10000,
        venue: 'المسرح المدرسي',
        targetAudience: 'الطلاب',
        cast: ['ممثل 1', 'ممثل 2'],
        crew: ['تقني 1', 'تقني 2'],
        objectives: ['هدف 1', 'هدف 2'],
        timeline: [],
        resources: ['مورد 1', 'مورد 2'],
        challenges: ['تحدي 1', 'تحدي 2'],
        achievements: ['إنجاز 1', 'إنجاز 2'],
        images: [],
        notes: 'مشروع تجريبي - يمكن حذفه',
        userId: userId,
        createdAt: timestamp,
        updatedAt: timestamp
      });

      // 3. إنشاء Collection للبرنامج الأسبوعي (weeklySchedule)
      const weeklyRef = doc(collection(db, 'weeklySchedule'), 'main-schedule');
      batch.set(weeklyRef, {
        title: 'البرنامج الأسبوعي الرئيسي',
        schedule: [
          {
            day: 'الأحد',
            sessions: [
              {
                time: '8:00 - 9:30',
                class: 'الأول ابتدائي',
                activity: 'تمارين التعبير',
                room: 'قاعة الأنشطة'
              }
            ]
          }
        ],
        userId: userId,
        createdAt: timestamp,
        updatedAt: timestamp
      });

      // 4. إنشاء Collection للتقارير (reports)
      const reportRef = doc(collection(db, 'reports'), 'sample-report');
      batch.set(reportRef, {
        title: 'تقرير تجريبي',
        date: '2025-01-15',
        summary: 'ملخص التقرير التجريبي',
        activities: ['نشاط 1', 'نشاط 2'],
        achievements: ['إنجاز 1', 'إنجاز 2'],
        gallery: [],
        userId: userId,
        createdAt: timestamp,
        updatedAt: timestamp
      });

      // 5. إنشاء Collection للأرشيف (archive)
      const archiveRef = doc(collection(db, 'archive'), 'sample-archive');
      batch.set(archiveRef, {
        title: 'أرشيف تجريبي',
        year: '2025',
        description: 'أرشيف تجريبي للاختبار',
        reports: [],
        totalReports: 0,
        userId: userId,
        createdAt: timestamp,
        archivedBy: 'النظام'
      });

      // 6. إنشاء Collection للعطل (holidays)
      const holidayRef = doc(collection(db, 'holidays'), 'sample-holiday');
      batch.set(holidayRef, {
        title: 'عطلة تجريبية',
        startDate: '2025-07-01',
        endDate: '2025-08-31',
        type: 'عطلة صيفية',
        description: 'عطلة تجريبية للاختبار',
        userId: userId,
        createdAt: timestamp
      });

      // 7. إنشاء Collection للأيام الوطنية (nationalDays)
      const nationalDayRef = doc(collection(db, 'nationalDays'), 'sample-national-day');
      batch.set(nationalDayRef, {
        title: 'يوم وطني تجريبي',
        date: '2025-05-01',
        description: 'يوم وطني تجريبي للاختبار',
        activities: ['نشاط احتفالي'],
        userId: userId,
        createdAt: timestamp
      });

      // 8. إنشاء Collection للمستخدمين (users)
      const userRef = doc(collection(db, 'users'), userId);
      batch.set(userRef, {
        name: 'مستخدم تجريبي',
        email: 'demo@example.com',
        role: 'admin',
        permissions: {
          canModifyProgram: true,
          canCreateReports: true,
          canManageUsers: true,
          canViewArchive: true
        },
        createdAt: timestamp,
        lastLogin: timestamp
      });

      // تنفيذ جميع العمليات
      await batch.commit();

      setMessage('🎉 تم إنشاء قاعدة البيانات الكاملة بنجاح! تم إنشاء 8 Collections مع بيانات تجريبية.');
    } catch (error) {
      console.error('خطأ في إنشاء قاعدة البيانات:', error);
      setMessage('❌ خطأ في إنشاء قاعدة البيانات: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          🔧 إعدادات المطور
        </h1>
        
        <div className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h2 className="text-lg font-semibold text-yellow-800 mb-2">
              ⚠️ تحذير
            </h2>
            <p className="text-yellow-700">
              هذه الصفحة مخصصة للمطورين فقط. لا تستخدمها إلا إذا كنت تعرف ما تفعل.
            </p>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h2 className="text-lg font-semibold text-green-800 mb-2">
              🔗 حالة الاتصال
            </h2>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-green-700">متصل بـ Firebase: theatre-activities</span>
            </div>
          </div>

          <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
            <h3 className="text-lg font-semibold text-blue-800 mb-3">
              🔍 فحص قاعدة البيانات
            </h3>
            <p className="text-sm text-blue-700 mb-3">
              فحص حالة جميع Collections ومعرفة عدد المستندات في كل منها
            </p>

            <button
              onClick={checkDatabaseStatus}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed mb-3"
            >
              {loading ? 'جاري الفحص...' : '🔍 فحص حالة قاعدة البيانات'}
            </button>

            {Object.keys(dbStatus).length > 0 && (
              <div className="bg-white rounded-lg p-3 border">
                <h4 className="font-semibold text-blue-800 mb-2">نتائج الفحص:</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {Object.entries(dbStatus).map(([collection, count]) => (
                    <div key={collection} className="flex justify-between items-center">
                      <span className="text-gray-700">{collection}:</span>
                      <span className={`font-semibold ${count === -1 ? 'text-red-600' : count === 0 ? 'text-yellow-600' : 'text-green-600'}`}>
                        {count === -1 ? 'خطأ' : count === 0 ? 'فارغ' : `${count} مستند`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="border border-red-200 rounded-lg p-4 bg-red-50">
            <h3 className="text-lg font-semibold text-red-800 mb-3">
              🗄️ إنشاء قاعدة البيانات
            </h3>
            <p className="text-sm text-red-700 mb-3">
              إنشاء جميع Collections المطلوبة لجميع مكونات التطبيق
            </p>

            <button
              onClick={handleCreateDatabase}
              disabled={loading}
              className="w-full bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
            >
              {loading ? 'جاري إنشاء قاعدة البيانات...' : '🚀 إنشاء قاعدة البيانات الكاملة'}
            </button>
          </div>

          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              📊 إضافة بيانات تجريبية
            </h3>

            <div className="space-y-3">
              <button
                onClick={handleAddAntigone}
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'جاري الإضافة...' : 'إضافة مشروع أنتيغون فقط'}
              </button>

              <button
                onClick={handleSeedData}
                disabled={loading}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'جاري الإضافة...' : 'إضافة جميع المشاريع التجريبية'}
              </button>

              <button
                onClick={handleSeedAllData}
                disabled={loading}
                className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'جاري الإضافة...' : '🎯 إضافة جميع البيانات (شامل)'}
              </button>
            </div>
          </div>

          <div className="border border-orange-200 rounded-lg p-4 bg-orange-50">
            <h3 className="text-lg font-semibold text-orange-800 mb-3">
              🗑️ إدارة البيانات
            </h3>

            <button
              onClick={handleClearData}
              disabled={loading}
              className="w-full bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'جاري الحذف...' : '🗑️ حذف جميع البيانات التجريبية'}
            </button>
          </div>

          {message && (
            <div className={`p-4 rounded-lg ${
              message.includes('✅') 
                ? 'bg-green-50 border border-green-200 text-green-800'
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}>
              {message}
            </div>
          )}

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              📋 معلومات قاعدة البيانات
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">Collections سيتم إنشاؤها:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• <strong>activities</strong> - الأنشطة المسرحية</li>
                  <li>• <strong>yearProjects</strong> - مشاريع السنة</li>
                  <li>• <strong>weeklySchedule</strong> - البرنامج الأسبوعي</li>
                  <li>• <strong>reports</strong> - التقارير</li>
                  <li>• <strong>archive</strong> - الأرشيف</li>
                  <li>• <strong>holidays</strong> - العطل</li>
                  <li>• <strong>nationalDays</strong> - الأيام الوطنية</li>
                  <li>• <strong>users</strong> - المستخدمين</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">معلومات إضافية:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• البيانات مرتبطة بـ userId: "demo-user"</li>
                  <li>• يمكن حذف البيانات من Firestore Console</li>
                  <li>• للوصول لهذه الصفحة: /dev-settings</li>
                  <li>• جميع البيانات تحتوي على timestamps</li>
                  <li>• البيانات التجريبية آمنة للحذف</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DevSettings;
