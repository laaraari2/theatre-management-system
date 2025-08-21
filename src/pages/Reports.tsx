import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../pages.css';
import PrintExport from '../components/PrintExport';
import AnimatedCounter from '../components/AnimatedCounter';
import Notification from '../components/Notification';
// تم إزالة useLocalStorage لاستخدام Firebase فقط

import SpecialReportModal from '../components/SpecialReportModal';
import PermissionGuard from '../components/PermissionGuard';

// مكون معرض الصور مع التنقل
interface ImageSliderProps {
  images: string[];
}

const ImageSlider: React.FC<ImageSliderProps> = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [objectFit, setObjectFit] = useState<'cover' | 'contain' | 'fill'>('contain');

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const goToPrevious = () => {
    setCurrentIndex(currentIndex === 0 ? images.length - 1 : currentIndex - 1);
  };

  const goToNext = () => {
    setCurrentIndex(currentIndex === images.length - 1 ? 0 : currentIndex + 1);
  };

  if (!images || images.length === 0) return null;

  return (
    <div className="image-slider">
      {/* أزرار التحكم في نوع العرض */}
      <div className="image-fit-controls">
        <button
          className={`fit-btn ${objectFit === 'contain' ? 'active' : ''}`}
          onClick={() => setObjectFit('contain')}
        >
          احتواء كامل
        </button>
        <button
          className={`fit-btn ${objectFit === 'cover' ? 'active' : ''}`}
          onClick={() => setObjectFit('cover')}
        >
          ملء الإطار
        </button>
        <button
          className={`fit-btn ${objectFit === 'fill' ? 'active' : ''}`}
          onClick={() => setObjectFit('fill')}
        >
          تمديد كامل
        </button>
      </div>

      <div className="slider-container">
        <div className="slider-image-container">
          <img
            src={images[currentIndex]}
            alt={`صورة ${currentIndex + 1}`}
            className="slider-image"
            style={{ objectFit }}
          />

          {/* النص التوضيحي */}
          <div className="image-caption">
            <p>صورة من الأنشطة المسرحية المنفذة - {currentIndex + 1} من {images.length}</p>
          </div>

          {/* أسهم التنقل */}
          {images.length > 1 && (
            <>
              <button className="slider-btn prev-btn" onClick={goToPrevious}>
                ❮
              </button>
              <button className="slider-btn next-btn" onClick={goToNext}>
                ❯
              </button>
            </>
          )}
        </div>

        {/* النقاط للتنقل */}
        {images.length > 1 && (
          <div className="slider-dots">
            {images.map((_, index) => (
              <button
                key={index}
                className={`dot ${index === currentIndex ? 'active' : ''}`}
                onClick={() => goToSlide(index)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

interface ActivityWithImages {
  name: string;
  description: string;
  images: string[];
}

interface Report {
  id: number;
  title: string;
  date: string;
  summary: string;
  image: string;
  activities: string[];
  activitiesWithImages?: ActivityWithImages[];
  achievements: string[];
  gallery: string[];
  // خصائص التقرير الخاص
  activityProgram?: string;
  targetGroup?: string;
  location?: string;
  specialReportData?: any;
  // خصائص الأرشفة
  isArchived?: boolean;
  archivedAt?: string;
}

const Reports: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
  } | null>(null);
  const [showArchiveModal, setShowArchiveModal] = useState(false);

  const [showSpecialReportModal, setShowSpecialReportModal] = useState(false);

  const monthlyStats = {
    totalActivities: 12,
    completedActivities: 8,
    upcomingActivities: 4,
    totalParticipants: 245,
    averageAttendance: 92
  };

  // استخدام Firebase فقط - البيانات التجريبية ستأتي من Firebase
  const [reports, setReports] = useState<Report[]>([
    {
      id: 1,
      title: "تقرير شهر يناير 2025",
      date: "31 يناير 2025",
      summary: "تم تنفيذ 8 أنشطة مسرحية بمشاركة 180 طالب وطالبة",
      image: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjI1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMWU0MGFmIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj7YqtmC2LHZitixINmK2YbYp9mK2LEgMjAyNTwvdGV4dD48L3N2Zz4=",
      activities: [
        "عرض مسرحي: حلم ليلة صيف (الثالثة إعدادي 1) - 25 مشارك",
        "ورشة الإلقاء والتعبير (الأولى و الثانية إعدادي) - 48 مشارك",
        "مسابقة أفضل نص مسرحي (الخامس و السادس ابتدائي) - 32 مشارك",
        "تدريب على الارتجال (جميع المستويات الإعدادية) - 65 مشارك",
        "مسرح العرائس للصغار (ما قبل التمدرس) - 28 مشارك",
        "ورشة التمثيل الصامت (الثالث و الرابع ابتدائي) - 35 مشارك"
      ],
      achievements: [
        "زيادة المشاركة بنسبة 15% عن الشهر الماضي",
        "تطوير 3 نصوص مسرحية جديدة",
        "تدريب 12 طالب على الإخراج المسرحي"
      ],
      gallery: [
        "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjM2I4MmY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyMCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj7ZhtmI2KfYtyAxPC90ZXh0Pjwvc3ZnPg==",
        "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMTBiOTgxIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyMCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj7ZhtmI2KfYtyAyPC90ZXh0Pjwvc3ZnPg==",
        "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjU5ZTBiIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyMCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj7ZhtmI2KfYtyAzPC90ZXh0Pjwvc3ZnPg=="
      ]
    },
    {
      id: 2,
      title: "تقرير شهر ديسمبر 2024",
      date: "31 ديسمبر 2024",
      summary: "شهر مميز بتنظيم المهرجان السنوي للمسرح المدرسي",
      image: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjI1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMDU5NjY5Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyMCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj7YqtmC2LHZitixINiv2YrYs9mF2KjYsCAyMDI0PC90ZXh0Pjwvc3ZnPg==",
      activities: [
        "المهرجان السنوي للمسرح (جميع المستويات) - 180 مشارك",
        "عرض نهاية الفصل (الثانية و الثالثة إعدادي) - 65 مشارك",
        "ورشة الماكياج المسرحي (الأولى إعدادي 1 و 2) - 28 مشارك",
        "مسابقة التمثيل الصامت (الأول إلى الرابع ابتدائي) - 45 مشارك",
        "عروض ما قبل التمدرس (ما قبل التمدرس الأول و الثاني) - 32 مشارك"
      ],
      achievements: [
        "نجاح المهرجان السنوي بحضور 300 ولي أمر",
        "فوز المدرسة بالمركز الأول على مستوى المنطقة",
        "إنتاج 5 عروض مسرحية متكاملة"
      ],
      gallery: [
        "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjOGI1Y2Y2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyMCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj7Yl9mG2KzYp9iyIDE8L3RleHQ+PC9zdmc+",
        "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZWY0NDQ0Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyMCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj7Yl9mG2KzYp9iyIDI8L3RleHQ+PC9zdmc+",
        "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMDZiNmQ0Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyMCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj7Yl9mG2KzYp9iyIDM8L3RleHQ+PC9zdmc+"
      ]
    }
  ]);

  const showNotification = (message: string, type: 'success' | 'error' | 'warning' | 'info') => {
    setNotification({ message, type });
  };

  const hideNotification = () => {
    setNotification(null);
  };

  // التمرير إلى التقرير المحدد عند الوصول من رابط
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const reportId = searchParams.get('reportId');

    if (reportId) {
      // انتظار تحميل الصفحة ثم التمرير إلى التقرير
      setTimeout(() => {
        const reportElement = document.getElementById(`report-${reportId}`);
        if (reportElement) {
          reportElement.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
          });
          // إضافة تأثير بصري للتقرير المحدد
          reportElement.style.border = '3px solid #3b82f6';
          reportElement.style.boxShadow = '0 0 20px rgba(59, 130, 246, 0.3)';

          // إزالة التأثير بعد 3 ثوان
          setTimeout(() => {
            reportElement.style.border = '';
            reportElement.style.boxShadow = '';
          }, 3000);

          showNotification('تم العثور على التقرير المطلوب', 'success');
        } else {
          showNotification('لم يتم العثور على التقرير المحدد', 'warning');
        }
      }, 1000);
    }
  }, [location.search]);



  const archiveCurrentSeason = () => {
    const currentYear = new Date().getFullYear();
    const seasonTitle = `الموسم المسرحي ${currentYear}-${currentYear + 1}`;

    // التأكد من وجود تقارير للأرشفة
    if (reports.length === 0) {
      showNotification('لا توجد تقارير للأرشفة', 'warning');
      return;
    }

    // طلب تأكيد من المستخدم
    const confirmMessage = `هل أنت متأكد من رفع جميع التقارير (${reports.length} تقرير) إلى الأرشيف؟\n\nسيتم نقل التقارير إلى أرشيف "${seasonTitle}" ومسحها من الصفحة الحالية.`;

    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      // إنشاء كائن الموسم المؤرشف
      const archivedSeason = {
        id: Date.now().toString(),
        year: `${currentYear}-${currentYear + 1}`,
        title: seasonTitle,
        description: `أرشيف الأنشطة المسرحية للموسم الدراسي ${currentYear}-${currentYear + 1}`,
        reports: reports,
        totalReports: reports.length,
        createdAt: new Date().toISOString().split('T')[0],
        archivedBy: 'الأستاذ مصطفى لعرعري'
      };

      // TODO: حفظ في Firebase بدلاً من localStorage
      console.log('أرشفة الموسم:', archivedSeason);

      // مسح التقارير الحالية
      setReports([]);

      showNotification(`✅ تم أرشفة ${reports.length} تقرير للموسم ${seasonTitle} بنجاح!`, 'success');
    } catch (error) {
      console.error('Error archiving reports:', error);
      showNotification('حدث خطأ أثناء الأرشفة', 'error');
    }
  };

  // دالة أرشفة تقرير منفرد
  const archiveSingleReport = (reportId: number) => {
    const reportToArchive = reports.find(r => r.id === reportId);
    if (!reportToArchive) {
      showNotification('لم يتم العثور على التقرير', 'error');
      return;
    }

    const confirmMessage = `هل أنت متأكد من رفع التقرير "${reportToArchive.title}" إلى الأرشيف؟`;

    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      // تحديث التقرير ليصبح مؤرشف
      const updatedReports = reports.map(report =>
        report.id === reportId
          ? { ...report, isArchived: true, archivedAt: new Date().toISOString() }
          : report
      );

      setReports(updatedReports);

      // TODO: حفظ التقرير في Firebase بدلاً من localStorage
      console.log('أرشفة التقرير:', reportToArchive);

      showNotification(`✅ تم أرشفة التقرير "${reportToArchive.title}" بنجاح!`, 'success');
    } catch (error) {
      console.error('Error archiving single report:', error);
      showNotification('حدث خطأ أثناء أرشفة التقرير', 'error');
    }
  };

  const deleteReport = (id: number) => {
    const report = reports.find(r => r.id === id);
    if (window.confirm(`هل أنت متأكد من حذف التقرير "${report?.title}"؟`)) {
      const newReports = reports.filter(r => r.id !== id);
      setReports(newReports);
      showNotification('تم حذف التقرير!', 'warning');
    }
  };

  const editReport = (id: number) => {
    navigate(`/edit-report/${id}`);
  };

  // دالة لحفظ التقرير الخاص في الأرشيف
  const handleSaveSpecialReport = (specialReport: any) => {
    // TODO: حفظ التقرير الخاص في Firebase بدلاً من localStorage
    console.log('حفظ التقرير الخاص:', specialReport);

    // سيتم تطوير هذا لاحقاً لاستخدام Firebase

    showNotification('تم حفظ التقرير الخاص في الأرشيف بنجاح!', 'success');
  };



  // دالة لاستخراج الشهر والسنة من التاريخ
  const parseDate = (dateStr: string) => {
    const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'ماي', 'يونيو', 'يوليوز', 'غشت', 'شتنبر', 'أكتوبر', 'نونبر', 'دجنبر'];
    const parts = dateStr.split(' ');

    if (parts.length >= 3) {
      const day = parseInt(parts[0]);
      const monthName = parts[1];
      const year = parseInt(parts[2]);
      const monthIndex = months.indexOf(monthName);

      if (monthIndex !== -1) {
        return new Date(year, monthIndex, day);
      }
    }

    return new Date();
  };

  // تجميع التقارير حسب الشهور
  const reportsByMonth = React.useMemo(() => {
    const grouped: { [key: string]: Report[] } = {};

    reports.forEach(report => {
      const date = parseDate(report.date);
      const monthYear = `${date.toLocaleDateString('ar-MA', { month: 'long', year: 'numeric' })}`;

      if (!grouped[monthYear]) {
        grouped[monthYear] = [];
      }
      grouped[monthYear].push(report);
    });

    // ترتيب التقارير داخل كل شهر حسب التاريخ
    Object.keys(grouped).forEach(month => {
      grouped[month].sort((a, b) => {
        const dateA = parseDate(a.date);
        const dateB = parseDate(b.date);
        return dateB.getTime() - dateA.getTime(); // الأحدث أولاً
      });
    });

    return grouped;
  }, [reports]);



  return (
    <div className="page">
      <div className="page-header">
        <div className="container">
          <h1>📊 التقارير والإحصائيات</h1>
          <p>تقارير شاملة عن الأنشطة المسرحية والإنجازات المحققة</p>
        </div>
      </div>

      <div className="container">
        {/* أزرار الإدارة */}
        <div className="reports-actions" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
          <PermissionGuard requirePermission="canCreateReports">
            <button
              onClick={archiveCurrentSeason}
              className="btn btn-archive"
              style={{
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                fontSize: '1rem',
                fontWeight: '600',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(245, 158, 11, 0.4)',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(245, 158, 11, 0.6)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(245, 158, 11, 0.4)';
              }}
            >
              📦 رفع التقارير إلى الأرشيف
            </button>
          </PermissionGuard>

          <button
            onClick={() => setShowSpecialReportModal(true)}
            className="btn btn-special"
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              fontSize: '1rem',
              fontWeight: '600',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.6)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
            }}
          >
            ⭐ تقرير خاص سريع
          </button>

          {reports.length > 0 && (
            <button
              onClick={() => {
                console.log('Archive button clicked, reports:', reports.length);
                setShowArchiveModal(true);
              }}
              className="btn btn-warning"
              title="أرشفة جميع التقارير الحالية"
              style={{
                padding: '12px 24px',
                fontSize: '1rem',
                fontWeight: '600',
                borderRadius: '8px'
              }}
            >
              📚 أرشفة الموسم الحالي ({reports.length})
            </button>
          )}
        </div>
        {/* Statistics Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-number">
              <AnimatedCounter end={monthlyStats.totalActivities} />
            </div>
            <div className="stat-label">إجمالي الأنشطة</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">
              <AnimatedCounter end={monthlyStats.completedActivities} />
            </div>
            <div className="stat-label">الأنشطة المكتملة</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">
              <AnimatedCounter end={monthlyStats.upcomingActivities} />
            </div>
            <div className="stat-label">الأنشطة القادمة</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">
              <AnimatedCounter end={monthlyStats.totalParticipants} />
            </div>
            <div className="stat-label">إجمالي المشاركين</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">
              <AnimatedCounter end={monthlyStats.averageAttendance} suffix="%" />
            </div>
            <div className="stat-label">متوسط الحضور</div>
          </div>
        </div>

        {/* Monthly Reports */}
        <div className="reports-section">
          <PrintExport
            title="التقارير الشهرية للأنشطة المسرحية"
            data={reports}
            type="reports"
            showEditButton={false}
            showCreateButton={false}
          />
          <div className="reports-header">
            <h2>التقارير الشهرية</h2>
          </div>

          <div className="reports-by-month">
            {Object.entries(reportsByMonth).map(([month, monthReports]) => (
              <div key={month} className="month-section">
                <h2 className="month-title">📊 {month}</h2>
                <div className="reports-grid">
                  {monthReports.map(report => (
                    <div key={report.id} id={`report-${report.id}`} className="report-card">
                      <div className="report-header">
                        <h3>{report.title}</h3>
                        <span className="report-date">{report.date}</span>
                      </div>

                      <div className="report-actions">
                        <PermissionGuard requirePermission="canEdit">
                          <button
                            onClick={() => editReport(report.id)}
                            className="btn btn-small btn-primary"
                            title="تعديل التقرير"
                          >
                            ✏️ تعديل
                          </button>
                        </PermissionGuard>
                        <PermissionGuard requirePermission="canDelete">
                          <button
                            onClick={() => deleteReport(report.id)}
                            className="btn btn-small btn-danger"
                            title="حذف التقرير"
                          >
                            🗑️ حذف
                          </button>
                        </PermissionGuard>
                      </div>

                      {/* Report Main Image */}
                      {report.image && (
                        <div className="report-image">
                          <img src={report.image} alt={report.title} />
                        </div>
                      )}

                      <div className="report-summary">
                        <p>{report.summary}</p>
                      </div>

                      {/* عرض برنامج النشاط إذا كان متوفراً (للتقارير الخاصة) */}
                      {report.activityProgram ? (
                        <div className="report-section">
                          <h4>📅 برنامج النشاط:</h4>
                          <div className="activity-program">
                            {report.activityProgram.split('\n').map((line: string, index: number) => (
                              <p key={index} className="program-line">
                                {line.trim() && (
                                  <>
                                    {line.includes(':') ? (
                                      <>
                                        <strong>{line.split(':')[0]}:</strong>
                                        <span>{line.split(':').slice(1).join(':')}</span>
                                      </>
                                    ) : (
                                      line
                                    )}
                                  </>
                                )}
                              </p>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="report-section">
                          <h4>الأنشطة المنفذة:</h4>
                          <ul>
                            {report.activities.map((activity, index) => (
                              <li key={index}>{activity}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* عرض الفئة المستفيدة ومكان النشاط للتقارير الخاصة */}
                      {(report.targetGroup || report.location) && (
                        <div className="report-section">
                          <div className="activity-details">
                            {report.targetGroup && (
                              <div className="detail-item">
                                <span className="detail-label">👥 الفئة المستفيدة:</span>
                                <span className="detail-value">{report.targetGroup}</span>
                              </div>
                            )}
                            {report.location && (
                              <div className="detail-item">
                                <span className="detail-label">📍 مكان النشاط:</span>
                                <span className="detail-value">{report.location}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}



                      {/* Detailed Activities */}
                      {report.activitiesWithImages && report.activitiesWithImages.length > 0 && (
                        <div className="report-section">
                          <h4>🎭 الأنشطة المفصلة ({report.activitiesWithImages.length}):</h4>
                          {report.activitiesWithImages.map((activity, index) => (
                            <div key={index} className="detailed-activity">
                              <div className="activity-info">
                                <h5>🎪 {activity.name || `النشاط ${index + 1}`}</h5>
                                {activity.description && (
                                  <p className="activity-description">{activity.description}</p>
                                )}
                              </div>
                              {activity.images && activity.images.length > 0 && (
                                <div className="activity-gallery">
                                  <h6>📸 صور النشاط ({activity.images.length}):</h6>
                                  <ImageSlider images={activity.images} />
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Image Gallery */}
                      {report.gallery && report.gallery.length > 0 && (
                        <div className="report-section">
                          <h4>معرض الصور ({report.gallery.length}):</h4>
                          <ImageSlider images={report.gallery} />
                        </div>
                      )}

                      {/* زر الأرشفة */}
                      <div className="report-archive-section" style={{
                        marginTop: '2rem',
                        paddingTop: '1rem',
                        borderTop: '2px solid #e5e7eb',
                        textAlign: 'center'
                      }}>
                        {report.isArchived ? (
                          <div className="archived-status">
                            <span style={{
                              background: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
                              color: 'white',
                              padding: '0.75rem 1.5rem',
                              borderRadius: '8px',
                              fontSize: '0.9rem',
                              fontWeight: '600',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.5rem',
                              cursor: 'default'
                            }}>
                              📦 التقرير مؤرشف
                            </span>
                            {report.archivedAt && (
                              <p style={{
                                fontSize: '0.8rem',
                                color: '#6b7280',
                                marginTop: '0.5rem'
                              }}>
                                تم الأرشفة في: {new Date(report.archivedAt).toLocaleDateString('ar-EG')}
                              </p>
                            )}
                          </div>
                        ) : (
                          <button
                            onClick={() => archiveSingleReport(report.id)}
                            className="archive-single-btn"
                            style={{
                              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                              color: 'white',
                              border: 'none',
                              padding: '0.75rem 1.5rem',
                              borderRadius: '8px',
                              fontSize: '0.9rem',
                              fontWeight: '600',
                              cursor: 'pointer',
                              transition: 'all 0.3s ease',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.5rem',
                              boxShadow: '0 2px 4px rgba(245, 158, 11, 0.3)'
                            }}
                            onMouseOver={(e) => {
                              e.currentTarget.style.transform = 'translateY(-2px)';
                              e.currentTarget.style.boxShadow = '0 4px 12px rgba(245, 158, 11, 0.4)';
                            }}
                            onMouseOut={(e) => {
                              e.currentTarget.style.transform = 'translateY(0)';
                              e.currentTarget.style.boxShadow = '0 2px 4px rgba(245, 158, 11, 0.3)';
                            }}
                            title="رفع هذا التقرير إلى الأرشيف"
                          >
                            📦 رفع إلى الأرشيف
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {notification && (
          <Notification
            message={notification.message}
            type={notification.type}
            onClose={hideNotification}
          />
        )}
      </div>

      {/* نافذة التقرير الخاص */}
      <SpecialReportModal
        isOpen={showSpecialReportModal}
        onClose={() => setShowSpecialReportModal(false)}
        onSave={handleSaveSpecialReport}
      />

      {/* مودال تأكيد الأرشفة */}
      {showArchiveModal && (
        <div className="form-overlay">
          <div className="form-container">
            <div className="form-header">
              <h2>🗃️ أرشفة الموسم الحالي</h2>
              <button
                onClick={() => setShowArchiveModal(false)}
                className="close-btn"
              >
                ✕
              </button>
            </div>
            <div className="form-body">
              <div className="archive-warning">
                <div className="warning-icon">⚠️</div>
                <div className="warning-content">
                  <h3>تأكيد الأرشفة</h3>
                  <p>
                    سيتم نقل جميع التقارير الحالية ({reports.length} تقرير) إلى الأرشيف.
                    <br />
                    هذا الإجراء سيمسح التقارير من القائمة الحالية وينقلها للأرشيف.
                  </p>
                  <p><strong>هل أنت متأكد من المتابعة؟</strong></p>
                </div>
              </div>
              <div className="archive-actions">
                <button
                  onClick={() => setShowArchiveModal(false)}
                  className="btn btn-secondary"
                >
                  إلغاء
                </button>
                <button
                  onClick={archiveCurrentSeason}
                  className="btn btn-warning"
                >
                  📚 تأكيد الأرشفة
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};



export default Reports;
