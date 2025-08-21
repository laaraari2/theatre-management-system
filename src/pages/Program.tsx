import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import '../pages.css';
import SearchFilter from '../components/SearchFilter';
import PrintExport from '../components/PrintExport';
import Notification from '../components/Notification';
// تم إزالة useLocalStorage لاستخدام Firebase فقط
import { useActivities } from '../hooks/useFirebase';
import type { Activity } from '../types';
import SpecialReportModal from '../components/SpecialReportModal';
import { MOROCCAN_MONTHS, MOROCCAN_ACADEMIC_MONTHS } from '../utils/dateConverter';
import {
  convertArabicToFrenchNumbers,
  convertISOToArabicDateWithFrenchNumbers,
  formatTimeWithFrenchNumbers
} from '../utils/numberUtils';
import { useCustomMonths } from '../hooks/useCustomMonths';

// نوع للبيانات المحلية
interface LocalActivity {
  id: number;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  participants: string;
  status: string;
  reportId?: number; // معرف التقرير المرتبط بالنشاط
}

const Program: React.FC = () => {
  const navigate = useNavigate();

  // استخدام Firebase للبيانات
  const {
    activities: firebaseActivities,
    loading: activitiesLoading,
    error: activitiesError,
    addActivity: addFirebaseActivity,
    updateActivity: updateFirebaseActivity,
    deleteActivity: deleteFirebaseActivity
  } = useActivities();

  const [isEditMode, setIsEditMode] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [addingToMonth, setAddingToMonth] = useState<string | null>(null);
  const [showMonthSelector, setShowMonthSelector] = useState(false);
  // تم حذف متغيرات إدارة الشهور لتبسيط الواجهة
  const [isDeleting, setIsDeleting] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');

  // استخدام hook الشهور المخصصة
  const {
    months: customMonths,
    updateMonths,
    getActiveMonthNames
  } = useCustomMonths();

  // إعادة تعيين الشهور لتكون مغربية إذا كانت فارغة أو مختلفة
  React.useEffect(() => {
    const activeMonthNames = getActiveMonthNames();
    console.log('🔍 الشهور النشطة الحالية:', activeMonthNames);
    console.log('🔍 الشهور المغربية المطلوبة:', MOROCCAN_MONTHS);

    // إذا كانت الشهور النشطة لا تطابق الشهور المغربية، أعد تعيينها
    if (activeMonthNames.length === 0 || !MOROCCAN_MONTHS.every(month => activeMonthNames.includes(month))) {
      console.log('🔧 إعادة تعيين الشهور لتكون مغربية...');
      const moroccanMonthsData = MOROCCAN_MONTHS.map((monthName, index) => ({
        id: `month-${index}`,
        name: monthName,
        order: index + 1,
        isActive: true,
        createdAt: new Date()
      }));
      updateMonths(moroccanMonthsData);
    }
  }, []);

  // مراقبة تغييرات الشهور المخصصة لإعادة رسم الواجهة
  React.useEffect(() => {
    setRefreshKey(prev => prev + 1);
  }, [customMonths]);

  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
  } | null>(null);
  const [showSpecialReportModal, setShowSpecialReportModal] = useState(false);
  const [selectedActivityForReport, setSelectedActivityForReport] = useState<Activity | null>(null);
  // استخدام Firebase فقط - لا نحتاج localStorage
  // تم إزالة localStorage لاستخدام Firebase فقط

  // استخدام Firebase دائماً
  const activities: Activity[] = firebaseActivities;


  const showNotification = (message: string, type: 'success' | 'error' | 'warning' | 'info') => {
    setNotification({ message, type });
  };

  const hideNotification = () => {
    setNotification(null);
  };



  const toggleEditMode = () => {
    setIsEditMode(!isEditMode);
    setEditingActivity(null);
  };

  const startEditActivity = (id: number | string) => {
    const activity = activities.find((a: Activity) => a.id === id);
    if (activity) {
      setEditingActivity(activity);
    }
  };

  const saveActivity = async (updatedActivity: Activity) => {
    try {
      if (updatedActivity.id) {
        // استخدام Firebase دائماً
        const { id, ...activityData } = updatedActivity;
        await updateFirebaseActivity(id.toString(), activityData);
      } else {
        throw new Error('معرف النشاط مفقود');
      }
      setEditingActivity(null);
      showNotification('تم حفظ التعديل بنجاح!', 'success');
    } catch (error) {
      showNotification('خطأ في حفظ التعديل', 'error');
    }
  };

  const handleDeleteActivity = async (id: number | string) => {
    const activity = activities.find((a: Activity) => a.id === id);
    if (window.confirm(`هل أنت متأكد من حذف النشاط "${activity?.title}"؟`)) {
      try {
        if (activity?.id) {
          // استخدام Firebase دائماً
          await deleteFirebaseActivity(activity.id.toString());
        } else {
          throw new Error('معرف النشاط مفقود');
        }
        showNotification('تم حذف النشاط!', 'warning');
      } catch (error) {
        showNotification('خطأ في حذف النشاط', 'error');
      }
    }
  };



  // دالة إنشاء تقرير للنشاط
  const handleCreateReport = (activity: Activity | LocalActivity) => {
    console.log('🔵 إنشاء تقرير للنشاط:', activity.title);
    showNotification(`فتح نافذة كتابة التقرير للنشاط: ${activity.title}`, 'info');

    // تعيين النشاط المحدد وفتح النافذة المنبثقة
    setSelectedActivityForReport(activity as Activity);
    setShowSpecialReportModal(true);
  };

  // دالة عرض التقرير الموجود
  const handleViewReport = (reportId: number) => {
    console.log('🔵 عرض التقرير:', reportId);
    showNotification('جاري الانتقال إلى التقرير...', 'info');

    // الانتقال إلى صفحة التقارير مع التمرير إلى التقرير المحدد
    setTimeout(() => {
      navigate(`/reports?reportId=${reportId}`);
    }, 500);
  };



  // دالة الانتقال إلى صفحة التقارير
  const handleGoToReports = () => {
    showNotification('جاري الانتقال إلى صفحة التقارير...', 'info');
    setTimeout(() => {
      navigate('/reports');
    }, 500);
  };

  // دالة حفظ التقرير الخاص
  const handleSaveSpecialReport = async (specialReport: any) => {
    if (!selectedActivityForReport || !selectedActivityForReport.id) return;

    try {
      // تحديث حالة النشاط إلى "الأنشطة المنجزة" وإضافة معرف التقرير
      const reportId = Date.now();
      const updatedActivity = {
        ...selectedActivityForReport,
        status: 'الأنشطة المنجزة' as const,
        reportId: reportId // ربط النشاط بالتقرير
      };

      if (selectedActivityForReport.id) {
        // استخدام Firebase دائماً
        await updateFirebaseActivity(selectedActivityForReport.id as string, updatedActivity);
      } else {
        throw new Error('معرف النشاط مفقود');
      }

      // حفظ التقرير في صفحة التقارير
      // TODO: حفظ التقرير في Firebase بدلاً من localStorage
      // سيتم تطوير هذا لاحقاً لاستخدام Firebase
      console.log('تم إنشاء التقرير:', {
        id: reportId,
        title: specialReport.title,
        date: specialReport.date,
        summary: specialReport.content,
        activityId: selectedActivityForReport.id,
        activityTitle: selectedActivityForReport.title
      });

      showNotification(`✅ تم حفظ التقرير وتحديث حالة النشاط "${selectedActivityForReport.title}" إلى "منجز" بنجاح!`, 'success');
      setShowSpecialReportModal(false);
      setSelectedActivityForReport(null);
    } catch (error) {
      console.error('Error saving special report:', error);
      showNotification('حدث خطأ في حفظ التقرير', 'error');
    }
  };

  // دالة إضافة نشاط جديد
  const handleAddActivity = () => {
    console.log('🔵 فتح نافذة اختيار الشهر لإضافة نشاط');
    setShowMonthSelector(true);
  };



  // اختيار شهر وإضافة نشاط
  const handleSelectMonth = (monthYear: string) => {
    console.log('🔵 تم اختيار الشهر:', monthYear);
    setShowMonthSelector(false);
    addActivityToMonth(monthYear);
  };

  // إغلاق نافذة اختيار الشهر
  const handleCloseMonthSelector = () => {
    setShowMonthSelector(false);
  };

  // تم حذف دوال إدارة الشهور لتبسيط الواجهة







  // دالة حذف جميع البيانات
  const handleClearAllData = async () => {
    if (isDeleting) return; // منع التكرار

    const activitiesCount = activities.length;
    const confirmMessage = `هل أنت متأكد من حذف جميع الأنشطة؟\n\nسيتم حذف ${activitiesCount} نشاط نهائياً.\n\nهذا الإجراء لا يمكن التراجع عنه!`;

    if (confirm(confirmMessage)) {
      setIsDeleting(true);
      try {
        // حذف البيانات من Firebase فقط
        if (firebaseActivities.length > 0) {
          for (const activity of firebaseActivities) {
            if (activity.id) {
              try {
                await deleteFirebaseActivity(activity.id.toString());
              } catch (error) {
                console.error('خطأ في حذف النشاط:', activity.id, error);
              }
            }
          }
        }

        // إجبار إعادة رسم الواجهة
        setRefreshKey(prev => prev + 1);

        // إعادة تحميل البيانات
        setTimeout(() => {
          setRefreshKey(prev => prev + 1);
        }, 100);

        // رسالة واحدة فقط
        showNotification(`✅ تم حذف جميع الأنشطة (${activitiesCount} نشاط) بنجاح`, 'success');

      } catch (error) {
        console.error('خطأ في حذف البيانات:', error);
        showNotification('❌ حدث خطأ في حذف بعض البيانات', 'error');
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const addActivityToMonth = (monthYear: string) => {
    console.log('🔵 بدء إضافة نشاط للشهر:', monthYear);

    // استخراج الشهر والسنة
    const [month, year] = monthYear.split(' ');

    // تاريخ افتراضي في بداية الشهر
    const defaultDate = `1 ${month} ${year}`;

    // حساب ID جديد
    const activityIds = activities.map(a => typeof a.id === 'number' ? a.id : parseInt(a.id as string) || 0);
    const maxId = activityIds.length > 0 ? Math.max(...activityIds) : 0;

    const newActivity: Activity = {
      id: maxId + 1,
      title: "نشاط جديد",
      date: defaultDate,
      time: "10:00 صباحاً",
      location: "قاعة الأنشطة",
      description: "وصف النشاط الجديد",
      participants: "جميع المستويات",
      status: "قيد التحضير"
    };

    console.log('🔵 النشاط الجديد:', newActivity);
    console.log('🔵 تعيين editingActivity...');

    setEditingActivity(newActivity);
    setAddingToMonth(monthYear);
  };

  const handleSaveNewActivity = async (activityData: Activity) => {
    try {
      // التحقق من صحة التاريخ قبل الحفظ
      const parsedDate = parseDate(activityData.date);
      const monthIndex = parsedDate.getMonth();
      const year = parsedDate.getFullYear();
      const monthName = MOROCCAN_MONTHS[monthIndex];

      console.log(`💾 حفظ النشاط: ${activityData.title}`);
      console.log(`📅 التاريخ: ${activityData.date}`);
      console.log(`📅 التاريخ المحلل: ${parsedDate}`);
      console.log(`📅 الشهر: ${monthName} (${monthIndex})`);
      console.log(`📅 السنة: ${year}`);

      // استخدام Firebase دائماً
      const { id, ...newActivityData } = activityData;
      await addFirebaseActivity(newActivityData);

      setEditingActivity(null);
      setAddingToMonth(null);

      // إعادة تحديث البيانات لضمان ظهور النشاط في المكان الصحيح
      setRefreshKey(prev => prev + 1);

      showNotification(`✅ تم إضافة النشاط "${activityData.title}" لشهر ${monthName} بنجاح!`, 'success');
    } catch (error) {
      console.error('خطأ في إضافة النشاط:', error);
      showNotification('❌ خطأ في إضافة النشاط', 'error');
    }
  };

  const handleCancelEdit = () => {
    setEditingActivity(null);
    setAddingToMonth(null);
  };

  const ActivityEditForm: React.FC<{
    activity: Activity;
    onSave: (activity: Activity) => void;
    onCancel: () => void;
    isNew?: boolean;
  }> = ({ activity, onSave, onCancel, isNew = false }) => {
    const [formData, setFormData] = useState(activity);

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();

      // التحقق من صحة التاريخ قبل الحفظ
      const testDate = parseDate(formData.date);
      const parts = formData.date.split(' ');

      if (parts.length < 3) {
        alert('⚠️ يرجى إدخال التاريخ بالصيغة الصحيحة: يوم شهر سنة\nمثال: 12 شتنبر 2025');
        return;
      }

      const monthName = parts[1];
      if (!MOROCCAN_MONTHS.includes(monthName)) {
        alert(`⚠️ اسم الشهر "${monthName}" غير صحيح.\nالأشهر المتاحة: ${MOROCCAN_MONTHS.join(', ')}`);
        return;
      }

      console.log(`✅ التاريخ صحيح: ${formData.date} -> ${testDate}`);
      onSave(formData);
    };

    return (
      <div className="activity-edit-modal">
        <div className="modal-overlay" onClick={onCancel}></div>
        <div className="modal-content">
          <h3>{isNew ? 'إضافة نشاط جديد' : 'تعديل النشاط'}</h3>
          <form onSubmit={handleSubmit} className="activity-edit-form">
            <div className="form-group">
              <label>اسم النشاط:</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="مثال: عرض مسرحي"
                required
              />
            </div>
            <div className="form-group">
              <label>التاريخ:</label>
              <input
                type="text"
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                placeholder="مثال: 12 شتنبر 2025 (يوم شهر سنة)"
                required
              />
            </div>
            <div className="form-group">
              <label>الوقت:</label>
              <input
                type="text"
                value={formData.time}
                onChange={(e) => setFormData({...formData, time: e.target.value})}
                placeholder="مثال: 10:00 صباحاً"
                required
              />
            </div>
            <div className="form-group">
              <label>المكان:</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
                placeholder="مثال: قاعة المسرح الرئيسية"
                required
              />
            </div>
            <div className="form-group">
              <label>المشاركون:</label>
              <input
                type="text"
                value={formData.participants}
                onChange={(e) => setFormData({...formData, participants: e.target.value})}
                placeholder="مثال: طلاب الأولى إعدادي"
                required
              />
            </div>
            <div className="form-group">
              <label>الحالة:</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
                required
              >
                <option value="الأنشطة المنجزة">الأنشطة المنجزة</option>
                <option value="قيد التحضير">قيد التحضير</option>
              </select>
            </div>
            <div className="form-group">
              <label>الوصف:</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows={3}
                placeholder="وصف النشاط..."
                required
              />
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                {isNew ? 'إضافة النشاط' : 'حفظ التعديل'}
              </button>
              <button type="button" onClick={onCancel} className="btn btn-secondary">
                إلغاء
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const handleSearch = () => {
    // لا نحتاج البحث النصي بعد الآن
  };

  const handleFilter = (filterType: string, filterValue: string) => {
    if (filterType === 'status') {
      setStatusFilter(filterValue);
    }
  };

  const handleClearFilters = () => {
    setStatusFilter('');
  };

  const parseDate = (dateString: string | undefined | null) => {
    // التحقق من وجود التاريخ
    if (!dateString || typeof dateString !== 'string') {
      return new Date();
    }

    // إذا كان التاريخ بصيغة ISO (من Firestore)
    if (dateString.includes('-') && dateString.length === 10) {
      return new Date(dateString);
    }

    // تحويل التاريخ العربي إلى تاريخ قابل للمعالجة - استخدام MOROCCAN_MONTHS
    const months: { [key: string]: number } = {};
    MOROCCAN_MONTHS.forEach((month, index) => {
      months[month] = index;
    });

    try {
      const parts = dateString.split(' ');
      if (parts.length >= 3) {
        const day = parseInt(parts[0]);
        const monthName = parts[1];
        const year = parseInt(parts[2]);

        // البحث عن الشهر في MOROCCAN_MONTHS
        const monthIndex = months[monthName];

        if (!isNaN(day) && monthIndex !== undefined && !isNaN(year)) {
          console.log(`🔍 تحليل التاريخ: "${dateString}"`);
          console.log(`📅 اليوم: ${day}, الشهر: "${monthName}", السنة: ${year}`);
          console.log(`📅 فهرس الشهر في MOROCCAN_MONTHS: ${monthIndex}`);
          console.log(`📅 الشهر المقابل: ${MOROCCAN_MONTHS[monthIndex]}`);

          const resultDate = new Date(year, monthIndex, day);
          console.log(`📅 التاريخ النهائي: ${resultDate}`);
          console.log(`📅 الشهر النهائي: ${resultDate.getMonth()} (${MOROCCAN_MONTHS[resultDate.getMonth()]})`);

          return resultDate;
        } else {
          console.warn(`⚠️ لم يتم العثور على الشهر: "${monthName}" في قائمة الأشهر المغربية`);
          console.log(`📋 الأشهر المتاحة:`, MOROCCAN_MONTHS);
        }
      }
    } catch (error) {
      console.warn('خطأ في تحليل التاريخ:', dateString, error);
    }

    return new Date();
  };



  const formatDateWithDay = (dateString: string | undefined | null) => {
    if (!dateString) {
      return 'تاريخ غير محدد';
    }

    const date = parseDate(dateString);
    const days = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    const dayName = days[date.getDay()];

    // إذا كان التاريخ بصيغة ISO، قم بتحويله لتاريخ عربي مع أرقام فرنسية
    if (dateString.includes('-') && dateString.length === 10) {
      const arabicDate = convertISOToArabicDateWithFrenchNumbers(dateString);
      return `${dayName} ${arabicDate}`;
    }

    // تحويل الأرقام العربية إلى فرنسية في التاريخ الموجود
    const dateWithFrenchNumbers = convertArabicToFrenchNumbers(dateString);
    return `${dayName} ${dateWithFrenchNumbers}`;
  };



  const filteredActivities = useMemo(() => {
    return activities.filter((activity: Activity) => {
      // Status filter only
      const matchesStatus = statusFilter === '' || activity.status === statusFilter;
      return matchesStatus;
    });
  }, [activities, statusFilter, refreshKey]);

  const activitiesByMonth = useMemo(() => {
    const grouped: { [key: string]: any[] } = {};

    // لا ننشئ مجموعات فارغة - سنضيف الشهور فقط عند وجود أنشطة بها
    console.log('🔄 بدء تجميع الأنشطة حسب الشهور...');
    console.log('🔍 الأنشطة المفلترة:', filteredActivities.length);
    console.log('🔍 getActiveMonthNames():', getActiveMonthNames());
    console.log('🔍 MOROCCAN_MONTHS:', MOROCCAN_MONTHS);

    // إضافة الأنشطة إلى المجموعات المناسبة حسب تاريخ كل نشاط
    filteredActivities.forEach((activity: Activity) => {
      // التحقق من وجود النشاط وخصائصه الأساسية
      if (!activity || typeof activity !== 'object') {
        console.warn('نشاط غير صالح:', activity);
        return;
      }

      // التأكد من وجود الخصائص الأساسية
      const safeActivity = {
        ...activity,
        title: activity.title || 'نشاط بدون عنوان',
        time: activity.time || '--:--',
        location: activity.location || 'مكان غير محدد',
        participants: activity.participants || 'غير محدد',
        status: activity.status || 'قيد التحضير'
      };

      // التحقق من وجود التاريخ
      if (!safeActivity.date) {
        // إضافة الأنشطة بدون تاريخ إلى مجموعة منفصلة
        const noDateKey = 'بدون تاريخ محدد';
        if (!grouped[noDateKey]) {
          grouped[noDateKey] = [];
        }
        grouped[noDateKey].push(safeActivity);
        return;
      }

      try {
        const date = parseDate(safeActivity.date);
        // استخدام الشهور المغربية الثابتة لضمان الاتساق
        const monthIndex = date.getMonth();
        const year = date.getFullYear();

        // التأكد من استخدام الشهور المغربية
        const activeMonthNames = getActiveMonthNames();
        const monthName = activeMonthNames.length > 0 && activeMonthNames[monthIndex]
          ? activeMonthNames[monthIndex]
          : MOROCCAN_MONTHS[monthIndex];

        const monthYear = `${monthName} ${year}`;

        console.log(`🔧 التجميع: monthIndex=${monthIndex}, monthName=${monthName}`);

        console.log(`📊 تجميع النشاط: "${safeActivity.title}"`);
        console.log(`📅 التاريخ الأصلي: ${safeActivity.date}`);
        console.log(`📅 التاريخ المحلل: ${date}`);
        console.log(`📅 الشهر: ${monthName} (${monthIndex})`);
        console.log(`📅 المجموعة: ${monthYear}`);

        if (!grouped[monthYear]) {
          grouped[monthYear] = [];
          console.log(`📁 إنشاء مجموعة جديدة: ${monthYear}`);
        }
        grouped[monthYear].push(safeActivity);
        console.log(`✅ تم إضافة النشاط للمجموعة: ${monthYear}`);
      } catch (error) {
        console.warn('❌ خطأ في معالجة تاريخ النشاط:', safeActivity, error);
        // إضافة الأنشطة مع أخطاء التاريخ إلى مجموعة منفصلة
        const errorKey = 'تاريخ غير صحيح';
        if (!grouped[errorKey]) {
          grouped[errorKey] = [];
        }
        grouped[errorKey].push(safeActivity);
      }
    });

    // ترتيب الأنشطة داخل كل شهر حسب التاريخ
    Object.keys(grouped).forEach(month => {
      grouped[month].sort((a, b) => {
        const dateA = parseDate(a.date);
        const dateB = parseDate(b.date);
        return dateA.getTime() - dateB.getTime();
      });
    });

    // ترتيب الشهور حسب الترتيب الأكاديمي المغربي
    const sortedMonths = Object.keys(grouped).sort((a, b) => {
      const [monthA, yearA] = a.split(' ');
      const [monthB, yearB] = b.split(' ');

      // إذا كانت السنوات مختلفة، رتب حسب السنة
      if (yearA !== yearB) {
        return parseInt(yearA) - parseInt(yearB);
      }

      // رتب حسب الترتيب الأكاديمي المغربي
      const indexA = MOROCCAN_ACADEMIC_MONTHS.indexOf(monthA);
      const indexB = MOROCCAN_ACADEMIC_MONTHS.indexOf(monthB);

      return indexA - indexB;
    });

    const result: { [key: string]: any[] } = {};
    sortedMonths.forEach(month => {
      // إظهار الشهور التي تحتوي على أنشطة فقط
      if (grouped[month] && grouped[month].length > 0) {
        result[month] = grouped[month];
      }
    });

    console.log('📊 الشهور النهائية مع الأنشطة:', Object.keys(result));
    return result;
  }, [filteredActivities, refreshKey, customMonths]);



  return (
    <div className="page">
      <div className="page-header">
        <div className="container">
          <h1>البرنامج العام للأنشطة المسرحية</h1>
          <p>جدولة الأنشطة والفعاليات المسرحية المقررة للموسم الدراسي 2025-2026</p>
        </div>
      </div>

      <div className="container">


        <SearchFilter
          onSearch={handleSearch}
          onFilter={handleFilter}
          onClearFilters={handleClearFilters}
        />



        {/* تم حذف واجهة إدارة الشهور لتبسيط الواجهة */}

        {/* مؤشر التحميل */}
        {activitiesLoading && (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>جاري تحميل البيانات من Firebase...</p>
          </div>
        )}

        {/* رسالة الخطأ */}
        {activitiesError && (
          <div className="error-container">
            <p>⚠️ خطأ في الاتصال بـ Firebase. يتم استخدام البيانات المحلية.</p>
          </div>
        )}

        {/* أزرار إدارة البرنامج */}
        <div className="print-export-container">
          <button
            onClick={handleAddActivity}
            className="create-btn"
            title="إضافة نشاط جديد"
          >
            ➕ إضافة نشاط
          </button>

          {/* تم حذف زر إضافة شهر لتبسيط الواجهة */}

          <button
            onClick={handleGoToReports}
            className="program-btn"
            title="الانتقال إلى صفحة التقارير"
          >
            📊 التقارير
          </button>

          {activities.length > 0 && (
            <button
              onClick={handleClearAllData}
              className="edit-btn"
              title="حذف جميع الأنشطة"
              style={{
                background: isDeleting ? '#9ca3af' : '#dc2626',
                cursor: isDeleting ? 'not-allowed' : 'pointer'
              }}
              disabled={isDeleting}
            >
              {isDeleting ? '⏳ جاري الحذف...' : '🗑️ حذف الكل'}
            </button>
          )}

          {/* مكون PrintExport مدمج */}
          <PrintExport
            title="البرنامج العام للأنشطة المسرحية"
            data={filteredActivities}
            type="activities"
            showEditButton={true}
            isEditMode={isEditMode}
            onToggleEdit={toggleEditMode}
          />
        </div>

        {activities.length === 0 ? (
          <div className="no-activities">
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🎭</div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">لا توجد أنشطة مسرحية حالياً</h3>
              <p className="text-gray-600 mb-6">ابدأ بإضافة أنشطة جديدة لبناء برنامجك المسرحي</p>
              <p className="text-sm text-gray-500">
                استخدم زر "➕ إضافة نشاط" أعلاه أو اذهب لـ <a href="/settings" className="text-blue-600 hover:underline">⚙️ الإعدادات</a> لإعداد Firestore
              </p>
            </div>
          </div>
        ) : filteredActivities.length === 0 ? (
          <div className="no-activities">
            <p>لا توجد أنشطة تطابق معايير البحث</p>
          </div>
        ) : null}

        <div className="program-by-month" key={refreshKey}>
          {Object.keys(activitiesByMonth).length === 0 ? (
            <div className="no-activities-message" style={{
              textAlign: 'center',
              padding: '3rem',
              backgroundColor: '#f8fafc',
              borderRadius: '12px',
              border: '2px dashed #cbd5e1',
              margin: '2rem 0'
            }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎭</div>
              <h3 style={{ color: '#64748b', marginBottom: '1rem' }}>لا توجد أنشطة مجدولة حالياً</h3>
              <p style={{ color: '#94a3b8', marginBottom: '2rem' }}>
                ابدأ بإضافة أنشطة جديدة لتنظيم برنامجك المسرحي
              </p>
              {isEditMode && (
                <button
                  onClick={() => setShowMonthSelector(true)}
                  className="btn btn-primary"
                  style={{
                    padding: '1rem 2rem',
                    fontSize: '1.1rem',
                    borderRadius: '8px'
                  }}
                >
                  ➕ إضافة أول نشاط
                </button>
              )}
            </div>
          ) : (
            Object.entries(activitiesByMonth).map(([month, monthActivities]) => (
            <div key={`${month}-${refreshKey}`} className="month-section">
              <div className="month-header" style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1rem',
                padding: '1rem',
                background: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)',
                borderRadius: '12px',
                color: 'white'
              }}>
                {/* عرض عنوان الشهر فقط - تم حذف إمكانية التعديل لتبسيط الواجهة */}
                <h2 className="month-title" style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold' }}>
                  📅 {month}
                </h2>
              </div>
              <div className="program-grid">
                {monthActivities.map(activity => (
                  <div key={activity.id} className="session-card">
                    <div className="session-time" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>
                        {formatDateWithDay(activity.date)} - {formatTimeWithFrenchNumbers(activity.time || '--:--')}
                      </span>
                      <span className={`status ${activity.status === 'الأنشطة المنجزة' ? 'confirmed' : activity.status === 'قيد التحضير' ? 'pending' : 'cancelled'}`}>
                        {activity.status}
                      </span>
                    </div>
                    <div className="session-details">
                      <h4 style={{
                        color: '#f59e0b',
                        fontWeight: 'bold',
                        fontSize: '1.2rem',
                        marginBottom: '0.5rem'
                      }}>{activity.title}</h4>
                      <p className="activity-name">{activity.description}</p>
                      <p className="room-info">📍 {activity.location}</p>
                      <p className="participants-info">👥 {activity.participants}</p>

                      {/* زر إنشاء/قراءة التقرير */}
                      <div className="create-report-section" style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #e5e7eb' }}>
                        {activity.status === 'الأنشطة المنجزة' && activity.reportId ? (
                          <button
                            onClick={() => handleViewReport(activity.reportId)}
                            className="view-report-btn"
                            title="قراءة تقرير هذا النشاط"
                          >
                            📖 قراءة التقرير
                          </button>
                        ) : (
                          <button
                            onClick={() => handleCreateReport(activity)}
                            className="create-report-btn"
                            title="إنشاء تقرير لهذا النشاط"
                          >
                            📝 إنشاء تقرير
                          </button>
                        )}
                      </div>
                    </div>

                    {/* أزرار الإجراءات */}
                    {isEditMode && (
                      <div className="session-actions">
                        <button
                          onClick={() => startEditActivity(activity.id)}
                          className="btn btn-small btn-primary"
                          title="تعديل"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDeleteActivity(activity.id)}
                          className="btn btn-small btn-danger"
                          title="حذف"
                        >
                          🗑️
                        </button>
                      </div>
                    )}
                  </div>
                ))}

                {isEditMode && (
                  <div className="add-activity-card">
                    <button
                      onClick={() => addActivityToMonth(month)}
                      className="add-activity-card-btn"
                      title="إضافة نشاط جديد لهذا الشهر"
                    >
                      <div className="add-icon">➕</div>
                      <div className="add-text">إضافة نشاط جديد</div>
                      <div className="add-subtext">لشهر {month.split(' ')[0]}</div>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
          )}
        </div>



        {editingActivity && (
          <ActivityEditForm
            activity={editingActivity}
            onSave={addingToMonth ? handleSaveNewActivity : saveActivity}
            onCancel={handleCancelEdit}
            isNew={!!addingToMonth}
          />
        )}

        {notification && (
          <Notification
            message={notification.message}
            type={notification.type}
            onClose={hideNotification}
          />
        )}

        {/* نافذة اختيار الشهر */}
        {showMonthSelector && (
          <div className="modal-overlay" onClick={handleCloseMonthSelector}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3 style={{
                  color: '#1e40af',
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  margin: 0,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  📅 اختر الشهر لإضافة النشاط الجديد
                </h3>
                <button
                  onClick={handleCloseMonthSelector}
                  className="close-btn"
                  style={{
                    background: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '50%',
                    width: '35px',
                    height: '35px',
                    cursor: 'pointer',
                    fontSize: '1.2rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  ✕
                </button>
              </div>
              <div className="modal-body">
                <p style={{
                  textAlign: 'center',
                  color: '#6b7280',
                  marginBottom: '1.5rem',
                  fontSize: '1rem'
                }}>
                  🎭 اختر الشهر الذي تريد إضافة النشاط إليه من الشهور الأكاديمية المغربية
                </p>
                <div className="months-grid">
                  {MOROCCAN_ACADEMIC_MONTHS.map((monthName) => {
                    const currentYear = new Date().getFullYear();
                    // تحديد السنة المناسبة حسب الموسم الدراسي
                    let year = currentYear;
                    if (['شتنبر', 'أكتوبر', 'نونبر', 'دجنبر'].includes(monthName)) {
                      year = currentYear; // الفصل الأول
                    } else {
                      year = currentYear + 1; // الفصل الثاني والصيف
                    }

                    const monthWithYear = `${monthName} ${year}`;
                    return (
                      <button
                        key={monthWithYear}
                        onClick={() => handleSelectMonth(monthWithYear)}
                        className="month-btn"
                        title={`إضافة نشاط جديد لشهر ${monthName}`}
                      >
                        📅 {monthWithYear}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* نافذة التقرير الخاص */}
        <SpecialReportModal
          isOpen={showSpecialReportModal}
          onClose={() => {
            setShowSpecialReportModal(false);
            setSelectedActivityForReport(null);
          }}
          onSave={handleSaveSpecialReport}
          selectedActivity={selectedActivityForReport}
        />

        {/* تم حذف نموذج إضافة شهر جديد لتبسيط الواجهة */}

        {/* إشعار */}
        {notification && (
          <Notification
            message={notification.message}
            type={notification.type}
            onClose={() => setNotification(null)}
          />
        )}
      </div>
    </div>
  );
};

export default Program;
