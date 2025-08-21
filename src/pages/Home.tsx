import React, { useState } from 'react';
import '../pages.css';
import DataManager from '../components/DataManager';
import Notification from '../components/Notification';
import SmartNotifications from '../components/SmartNotifications';
import ThemeToggle from '../components/ThemeToggle';
import AdvancedSearch from '../components/AdvancedSearch';
import InteractiveCharts from '../components/InteractiveCharts';
import VoiceRecorder from '../components/VoiceRecorder';

const Home: React.FC = () => {
  const [showDataManager, setShowDataManager] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showThemeToggle, setShowThemeToggle] = useState(false);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [showCharts, setShowCharts] = useState(false);
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
  } | null>(null);

  const showNotification = (message: string, type: 'success' | 'error' | 'warning' | 'info') => {
    setNotification({ message, type });
  };

  const hideNotification = () => {
    setNotification(null);
  };

  // بيانات وهمية للمكونات الجديدة - أنشطة قريبة من الوقت الحالي
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  const currentHour = now.getHours();
  const nextHour = (currentHour + 1).toString().padStart(2, '0') + ':00';
  const in30Minutes = new Date(now.getTime() + 30 * 60000);
  const in30MinutesTime = in30Minutes.getHours().toString().padStart(2, '0') + ':' +
                         in30Minutes.getMinutes().toString().padStart(2, '0');

  const mockActivities = [
    {
      id: '1',
      title: 'ورشة المسرح التفاعلي',
      date: today,
      time: in30MinutesTime, // خلال 30 دقيقة
      type: 'workshop' as const,
      priority: 'high' as const,
      location: 'قاعة المسرح الرئيسية',
      participants: ['طلاب الثانوي']
    },
    {
      id: '2',
      title: 'عرض حكايات الخريف',
      date: today,
      time: nextHour, // خلال ساعة
      type: 'performance' as const,
      priority: 'medium' as const,
      location: 'المسرح الخارجي',
      participants: ['طلاب الابتدائي']
    },
    {
      id: '3',
      title: 'تدريب الكورال',
      date: today,
      time: '23:59', // اليوم
      type: 'rehearsal' as const,
      priority: 'low' as const,
      location: 'قاعة الموسيقى',
      participants: ['جميع المراحل']
    }
  ];

  const mockChartData = {
    activities: [
      { label: 'ورش تدريبية', value: 15, color: '#FF6B6B', icon: '🎭' },
      { label: 'عروض مسرحية', value: 8, color: '#4ECDC4', icon: '🎪' },
      { label: 'مهرجانات', value: 3, color: '#45B7D1', icon: '🎊' },
      { label: 'احتفالات', value: 12, color: '#96CEB4', icon: '🎉' }
    ],
    participants: [
      { label: 'ابتدائي', value: 120, color: '#FFEAA7', icon: '👶' },
      { label: 'إعدادي', value: 85, color: '#DDA0DD', icon: '🧒' },
      { label: 'ثانوي', value: 65, color: '#98D8C8', icon: '👦' }
    ],
    timeline: [
      { date: '2024-09', value: 5, category: 'أنشطة' },
      { date: '2024-10', value: 8, category: 'أنشطة' },
      { date: '2024-11', value: 12, category: 'أنشطة' },
      { date: '2024-12', value: 15, category: 'أنشطة' },
      { date: '2025-01', value: 18, category: 'أنشطة' }
    ],
    categories: [
      { label: 'تعليمية', value: 20, color: '#74B9FF', icon: '📚' },
      { label: 'ترفيهية', value: 15, color: '#FD79A8', icon: '🎮' },
      { label: 'ثقافية', value: 10, color: '#FDCB6E', icon: '🎨' }
    ]
  };

  const handleNotificationAction = (action: string, activityId: string) => {
    showNotification(`تم ${action} للنشاط ${activityId}`, 'success');
  };

  const handleSearchResult = (result: any) => {
    showNotification(`تم اختيار: ${result.title}`, 'info');
    setShowAdvancedSearch(false);
  };

  const handleRecordingSaved = (recording: any) => {
    showNotification(`تم حفظ التسجيل: ${recording.title}`, 'success');
  };

  return (
    <div className="page">
      <section className="hero">
        <div className="container">
          <h2 className="hero-title">الأنشطة المسرحية</h2>
          <p className="hero-subtitle">
            مرحباً بكم في منصة الأنشطة المسرحية لمجموعة مدارس العمران - الموسم الدراسي 2025-2026
          </p>
        </div>
      </section>

      <section className="activities-overview">
        <div className="container">
          <div className="cards-grid">
            <div className="card">
              <h3>العطل المدرسية</h3>
              <p>لائحة العطل المدرسية الرسمية للموسم 2025-2026</p>
              <a href="/holidays" className="card-link">عرض العطل</a>
            </div>
            <div className="card">
              <h3>البرنامج العام</h3>
              <p>جدولة الأنشطة والفعاليات المسرحية</p>
              <a href="/program" className="card-link">عرض البرنامج</a>
            </div>
            <div className="card">
              <h3>البرنامج الأسبوعي</h3>
              <p>جدول الحصص المسرحية الأسبوعية</p>
              <a href="/weekly" className="card-link">عرض الجدول</a>
            </div>
            <div className="card">
              <h3>التقارير</h3>
              <p>تقارير الأنشطة المنجزة والإحصائيات</p>
              <a href="/reports" className="card-link">عرض التقارير</a>
            </div>
            <div className="card">
              <h3>الأيام الوطنية والعالمية</h3>
              <p>الأيام المحتفى بها في المؤسسات التعليمية</p>
              <a href="/national-days" className="card-link">عرض الأيام</a>
            </div>
            <div className="card">
              <h3>الأرشيف</h3>
              <p>أرشيف الأنشطة والعروض المسرحية للمواسم السابقة</p>
              <a href="/archive" className="card-link">عرض الأرشيف</a>
            </div>
            <div className="card">
              <h3>إدارة البيانات</h3>
              <p>تصدير واستيراد البيانات، النسخ الاحتياطية</p>
              <button
                className="card-link"
                onClick={() => setShowDataManager(true)}
                style={{ border: 'none', cursor: 'pointer' }}
              >
                إدارة البيانات
              </button>
            </div>
            <div className="card">
              <h3>🔔 الإشعارات الذكية</h3>
              <p>تنبيهات تلقائية للأنشطة القادمة مع أصوات تفاعلية</p>
              <button
                className="card-link"
                onClick={() => setShowNotifications(true)}
                style={{ border: 'none', cursor: 'pointer' }}
              >
                عرض الإشعارات
              </button>
            </div>
            <div className="card">
              <h3>🌙 الوضع المظلم</h3>
              <p>تبديل بين الأوضاع الفاتح والمظلم والتلقائي</p>
              <button
                className="card-link"
                onClick={() => setShowThemeToggle(true)}
                style={{ border: 'none', cursor: 'pointer' }}
              >
                إعدادات الثيم
              </button>
            </div>
            <div className="card">
              <h3>🔍 البحث المتقدم</h3>
              <p>بحث ذكي مع فلاتر متقدمة واقتراحات تلقائية</p>
              <button
                className="card-link"
                onClick={() => setShowAdvancedSearch(true)}
                style={{ border: 'none', cursor: 'pointer' }}
              >
                فتح البحث
              </button>
            </div>
            <div className="card">
              <h3>📊 الإحصائيات التفاعلية</h3>
              <p>رسوم بيانية متحركة وتفاعلية للأنشطة</p>
              <button
                className="card-link"
                onClick={() => setShowCharts(true)}
                style={{ border: 'none', cursor: 'pointer' }}
              >
                عرض الإحصائيات
              </button>
            </div>
            <div className="card">
              <h3>🎤 مسجل الصوت</h3>
              <p>تسجيل الملاحظات والتعليقات الصوتية للأنشطة</p>
              <button
                className="card-link"
                onClick={() => setShowVoiceRecorder(true)}
                style={{ border: 'none', cursor: 'pointer' }}
              >
                فتح المسجل
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="latest-activities">
        <div className="container">
          <h2>آخر الأنشطة</h2>
          <div className="activity-list">
            <div className="activity-item">
              <div className="activity-date">الأحد 15 شتنبر 2025</div>
              <div className="activity-content">
                <h4>ورشة تأهيلية للمسرح المدرسي</h4>
                <p>ورشة تدريبية لبداية الموسم المسرحي الجديد 2025-2026</p>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-date">السبت 25 أكتوبر 2025</div>
              <div className="activity-content">
                <h4>عرض مسرحي: "حكايات الخريف"</h4>
                <p>عرض مسرحي موسمي قدمه طلاب الأول والثاني ابتدائي</p>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-date">الخميس 12 دجنبر 2025</div>
              <div className="activity-content">
                <h4>مهرجان المسرح المدرسي الشتوي</h4>
                <p>مهرجان شتوي ضم عروض من جميع المراحل التعليمية</p>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-date">الاثنين 20 يناير 2026</div>
              <div className="activity-content">
                <h4>عرض مسرحي: "ألف ليلة وليلة"</h4>
                <p>عرض مسرحي من التراث العربي قدمه طلاب الإعدادي</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {showDataManager && (
        <DataManager
          onClose={() => setShowDataManager(false)}
          onNotification={showNotification}
        />
      )}

      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={hideNotification}
        />
      )}

      {showNotifications && (
        <SmartNotifications
          activities={mockActivities}
          onClose={() => setShowNotifications(false)}
          onNotificationAction={handleNotificationAction}
        />
      )}

      {showThemeToggle && (
        <div className="theme-toggle-overlay" onClick={() => setShowThemeToggle(false)}>
          <div onClick={(e) => e.stopPropagation()}>
            <ThemeToggle
              onThemeChange={(theme) => {
                showNotification(`تم تغيير الثيم إلى: ${theme}`, 'success');
              }}
            />
            <button
              onClick={() => setShowThemeToggle(false)}
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                background: 'rgba(255,255,255,0.2)',
                border: 'none',
                color: 'white',
                borderRadius: '50%',
                width: '30px',
                height: '30px',
                cursor: 'pointer'
              }}
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {showAdvancedSearch && (
        <AdvancedSearch
          data={[]}
          onClose={() => setShowAdvancedSearch(false)}
          onResultSelect={handleSearchResult}
        />
      )}

      {showCharts && (
        <InteractiveCharts
          data={mockChartData}
          onClose={() => setShowCharts(false)}
        />
      )}

      {showVoiceRecorder && (
        <VoiceRecorder
          onClose={() => setShowVoiceRecorder(false)}
          onRecordingSaved={handleRecordingSaved}
        />
      )}
    </div>
  );
};

export default Home;
