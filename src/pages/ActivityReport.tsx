import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArchiveService } from '../services/ArchiveService';
import { activityReportService, activityService } from '../firebase/services';
import { DataSyncService } from '../services/DataSyncService';
import type { Activity, ActivityReport } from '../types';

const ActivityReportPage: React.FC = () => {
  const { activityId } = useParams<{ activityId: string }>();
  const navigate = useNavigate();
  
  const [activity, setActivity] = useState<Activity | null>(null);
  const [report, setReport] = useState<ActivityReport>({
    id: '',
    activityId: activityId || '',
    title: '',
    date: new Date().toISOString().split('T')[0],
    content: '',
    images: [],
    achievements: [''],
    participants: 0,
    feedback: '',
    createdAt: new Date(),
    createdBy: 'الأستاذ مصطفى لعرعري'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadActivity = async () => {
      if (activityId) {
        console.log('Looking for activity with ID:', activityId);
        setLoading(true);

        try {
          // محاولة جلب النشاط من Firestore أولاً
          const firestoreActivity = await activityService.getActivityById(activityId);

          if (firestoreActivity) {
            console.log('Found activity in Firestore:', firestoreActivity);
            setActivity(firestoreActivity);
            setReport(prev => ({
              ...prev,
              title: `تقرير ${firestoreActivity.title}`,
              activityId: firestoreActivity.id?.toString() || activityId
            }));
          } else {
            // إذا لم يوجد في Firestore، جرب localStorage
            const activities = JSON.parse(localStorage.getItem('activities') || '[]');
            console.log('All activities from localStorage:', activities);

            const foundActivity = activities.find((act: any) =>
              act.id === activityId ||
              act.id === parseInt(activityId) ||
              act.id.toString() === activityId
            );

            console.log('Found activity in localStorage:', foundActivity);

            if (foundActivity) {
              setActivity(foundActivity);
              setReport(prev => ({
                ...prev,
                title: `تقرير ${foundActivity.title}`,
                activityId: foundActivity.id
              }));
            } else {
              setError(`لم يتم العثور على النشاط بالمعرف: ${activityId}`);
            }
          }
        } catch (error) {
          console.error('خطأ في جلب النشاط:', error);
          setError('حدث خطأ في جلب بيانات النشاط');
        } finally {
          setLoading(false);
        }
      }
    };

    loadActivity();
  }, [activityId]);

  const handleInputChange = (field: keyof ActivityReport, value: any) => {
    setReport(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAchievementChange = (index: number, value: string) => {
    const newAchievements = [...(report.achievements || [])];
    newAchievements[index] = value;
    setReport(prev => ({
      ...prev,
      achievements: newAchievements
    }));
  };

  const addAchievement = () => {
    setReport(prev => ({
      ...prev,
      achievements: [...(prev.achievements || []), '']
    }));
  };

  const removeAchievement = (index: number) => {
    const newAchievements = (report.achievements || []).filter((_, i) => i !== index);
    setReport(prev => ({
      ...prev,
      achievements: newAchievements
    }));
  };

  const handleSaveReport = async () => {
    if (!report.title.trim() || !report.content.trim()) {
      setError('يرجى ملء العنوان والمحتوى');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // حفظ التقرير باستخدام نظام المزامنة
      const reportData = {
        activityId: report.activityId,
        title: report.title,
        date: report.date,
        content: report.content,
        images: report.images || [],
        achievements: report.achievements || [],
        participants: report.participants || 0,
        feedback: report.feedback || '',
        createdBy: report.createdBy || 'الأستاذ مصطفى لعرعري'
      };

      const reportId = await DataSyncService.saveLocallyWithSync(
        'activity-reports',
        reportData,
        () => activityReportService.addActivityReport(reportData)
      );

      // تحديث حالة النشاط
      if (activity && activity.id) {
        // محاولة تحديث في Firestore إذا كان متصلاً
        if (DataSyncService.getSyncStatus().isOnline) {
          try {
            await activityService.linkReportToActivity(activity.id.toString(), reportId);
          } catch (error) {
            console.error('فشل في ربط التقرير بالنشاط في Firestore:', error);
          }
        }

        // تحديث محلياً في جميع الأحوال
        const activities = JSON.parse(localStorage.getItem('activities') || '[]');
        const updatedActivities = activities.map((act: Activity) =>
          act.id === activity.id
            ? { ...act, status: 'الأنشطة المنجزة' as const, reportId: reportId }
            : act
        );
        localStorage.setItem('activities', JSON.stringify(updatedActivities));
      }

      // إضافة للأرشيف التلقائي (سيتم تحديثه لاحقاً لاستخدام Firestore)
      const finalReport: ActivityReport = {
        id: reportId,
        activityId: report.activityId,
        title: report.title,
        date: report.date,
        content: report.content,
        images: report.images || [],
        achievements: report.achievements || [],
        participants: report.participants || 0,
        feedback: report.feedback || '',
        createdAt: new Date(),
        createdBy: report.createdBy || 'الأستاذ مصطفى لعرعري'
      };

      if (activity) {
        ArchiveService.addActivityToCurrentSeason({
          ...activity,
          status: 'الأنشطة المنجزة',
          reportId: reportId
        } as Activity, finalReport);
      }

      // الانتقال لصفحة الأرشيف
      navigate('/archive', { 
        state: { 
          message: 'تم حفظ التقرير بنجاح وإضافته للأرشيف!',
          newReport: finalReport 
        }
      });

    } catch (err) {
      setError('حدث خطأ في حفظ التقرير');
      console.error('Error saving report:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!activity) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-xl shadow-lg max-w-md">
          {error ? (
            <>
              <div className="text-red-500 text-6xl mb-4">❌</div>
              <h2 className="text-xl font-bold text-gray-800 mb-4">خطأ في تحميل النشاط</h2>
              <p className="text-gray-600 mb-6">{error}</p>
              <div className="space-y-3">
                <button
                  onClick={() => {
                    const activities = JSON.parse(localStorage.getItem('activities') || '[]');
                    console.log('Debug - All activities:', activities);
                    alert(`عدد الأنشطة المحفوظة: ${activities.length}\nمعرف النشاط المطلوب: ${activityId}`);
                  }}
                  className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors mr-2"
                >
                  🔍 تشخيص المشكلة
                </button>
                <button
                  onClick={() => {
                    // إنشاء نشاط تجريبي
                    const testActivity = {
                      id: parseInt(activityId || '1'),
                      title: 'نشاط تجريبي - عرض مسرحي',
                      date: '2025-01-15',
                      time: '10:00',
                      location: 'قاعة المسرح',
                      participants: 'طلاب المرحلة الثانوية',
                      description: 'عرض مسرحي تجريبي للاختبار',
                      status: 'قيد التحضير',
                      createdAt: new Date()
                    };

                    const activities = [testActivity];
                    localStorage.setItem('activities', JSON.stringify(activities));

                    alert('تم إنشاء نشاط تجريبي! اضغط العودة للبرنامج ثم جرب مرة أخرى.');
                  }}
                  className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors mr-2"
                >
                  ➕ إنشاء نشاط تجريبي
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors mr-2"
                >
                  🔄 إعادة تحميل
                </button>
                <button
                  onClick={() => navigate('/program')}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  العودة للبرنامج
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">جاري تحميل بيانات النشاط...</p>
              <p className="text-sm text-gray-500 mt-2">معرف النشاط: {activityId}</p>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100" dir="rtl">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigate('/program')}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
            >
              ← العودة للبرنامج
            </button>
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-800">📝 كتابة تقرير النشاط</h1>
              <p className="text-gray-600 mt-1">النشاط: {activity.title}</p>
            </div>
            <div></div>
          </div>
          
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-red-600 text-center">{error}</p>
            </div>
          )}
        </div>

        {/* معلومات النشاط */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            📄 معلومات النشاط
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">العنوان</label>
              <p className="bg-gray-50 p-3 rounded-lg">{activity.title}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">التاريخ</label>
              <p className="bg-gray-50 p-3 rounded-lg">{activity.date}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">الوقت</label>
              <p className="bg-gray-50 p-3 rounded-lg">{activity.time}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">المكان</label>
              <p className="bg-gray-50 p-3 rounded-lg">{activity.location}</p>
            </div>
          </div>
        </div>

        {/* نموذج التقرير */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            📝 تفاصيل التقرير
          </h2>

          <div className="space-y-6">
            {/* عنوان التقرير */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">عنوان التقرير</label>
              <input
                type="text"
                value={report.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="مثال: تقرير عرض مسرحية الأحلام"
              />
            </div>

            {/* تاريخ التقرير */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">تاريخ التقرير</label>
              <input
                type="date"
                value={report.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* عدد المشاركين */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                👥 عدد المشاركين
              </label>
              <input
                type="number"
                value={report.participants || ''}
                onChange={(e) => handleInputChange('participants', parseInt(e.target.value) || 0)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="عدد الطلاب المشاركين"
                min="0"
              />
            </div>

            {/* محتوى التقرير */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">محتوى التقرير</label>
              <textarea
                value={report.content}
                onChange={(e) => handleInputChange('content', e.target.value)}
                rows={8}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="اكتب تقريراً مفصلاً عن النشاط، ما تم إنجازه، التحديات، والنتائج..."
              />
            </div>

            {/* الإنجازات */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                ⭐ الإنجازات والنقاط المميزة
              </label>
              {(report.achievements || []).map((achievement, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={achievement}
                    onChange={(e) => handleAchievementChange(index, e.target.value)}
                    className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={`الإنجاز ${index + 1}`}
                  />
                  {(report.achievements || []).length > 1 && (
                    <button
                      onClick={() => removeAchievement(index)}
                      className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    >
                      حذف
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={addAchievement}
                className="mt-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                إضافة إنجاز
              </button>
            </div>

            {/* التقييم والملاحظات */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">التقييم والملاحظات</label>
              <textarea
                value={report.feedback || ''}
                onChange={(e) => handleInputChange('feedback', e.target.value)}
                rows={4}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="تقييم عام للنشاط، ملاحظات للتحسين، اقتراحات للمستقبل..."
              />
            </div>
          </div>

          {/* أزرار الحفظ */}
          <div className="flex gap-4 mt-8">
            <button
              onClick={handleSaveReport}
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  💾 حفظ التقرير وإضافة للأرشيف
                </>
              )}
            </button>
            <button
              onClick={() => navigate('/program')}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              إلغاء
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityReportPage;
