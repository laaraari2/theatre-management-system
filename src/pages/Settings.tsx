import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { initializeSystem, checkFirestoreStatus, clearTestData } from '../firebase/setup';
import { userService } from '../firebase/services';
import SyncStatus from '../components/SyncStatus';
import DatabaseManager from '../components/DatabaseManager';
import DatabaseCreator from '../components/DatabaseCreator';
import DataUpdater from '../components/DataUpdater';
import MonthManager from '../components/MonthManager';
import '../components/Settings.css';

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<any>(null);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | 'info'>('info');
  const [activeTab, setActiveTab] = useState('system');
  const [darkMode, setDarkMode] = useState(localStorage.getItem('darkMode') === 'true');
  const [notifications, setNotifications] = useState(localStorage.getItem('notifications') !== 'false');
  const [language, setLanguage] = useState(localStorage.getItem('language') || 'ar');
  const [autoSave, setAutoSave] = useState(localStorage.getItem('autoSave') !== 'false');

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    const firestoreStatus = await checkFirestoreStatus();
    setStatus(firestoreStatus);
  };

  const showMessage = (text: string, type: 'success' | 'error' | 'info') => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => setMessage(''), 5000);
  };

  const handleInitializeSystem = async () => {
    setLoading(true);
    try {
      const result = await initializeSystem();
      if (result.success) {
        showMessage('تم إعداد النظام بنجاح! 🎉', 'success');
        setStatus(result.status);
      } else {
        showMessage('فشل في إعداد النظام ❌', 'error');
      }
    } catch (error) {
      showMessage('حدث خطأ في إعداد النظام', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleClearTestData = () => {
    if (window.confirm('هل أنت متأكد من حذف جميع البيانات التجريبية؟')) {
      const success = clearTestData();
      if (success) {
        showMessage('تم حذف البيانات التجريبية بنجاح! 🧹', 'success');
        window.location.reload();
      } else {
        showMessage('فشل في حذف البيانات', 'error');
      }
    }
  };

  const handleRefreshStatus = async () => {
    setLoading(true);
    await checkStatus();
    setLoading(false);
    showMessage('تم تحديث الحالة', 'info');
  };

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode.toString());
    document.documentElement.classList.toggle('dark', newDarkMode);
    showMessage(`تم ${newDarkMode ? 'تفعيل' : 'إلغاء'} الوضع المظلم`, 'success');
  };

  const toggleNotifications = () => {
    const newNotifications = !notifications;
    setNotifications(newNotifications);
    localStorage.setItem('notifications', newNotifications.toString());
    showMessage(`تم ${newNotifications ? 'تفعيل' : 'إلغاء'} الإشعارات`, 'success');
  };

  const changeLanguage = (newLanguage: string) => {
    setLanguage(newLanguage);
    localStorage.setItem('language', newLanguage);
    showMessage(`تم تغيير اللغة إلى ${newLanguage === 'ar' ? 'العربية' : 'الإنجليزية'}`, 'success');
  };

  const toggleAutoSave = () => {
    const newAutoSave = !autoSave;
    setAutoSave(newAutoSave);
    localStorage.setItem('autoSave', newAutoSave.toString());
    showMessage(`تم ${newAutoSave ? 'تفعيل' : 'إلغاء'} الحفظ التلقائي`, 'success');
  };

  const exportData = () => {
    const data = {
      activities: JSON.parse(localStorage.getItem('activities') || '[]'),
      reports: JSON.parse(localStorage.getItem('reports') || '[]'),
      settings: {
        darkMode,
        notifications,
        language,
        autoSave
      }
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `theatre-data-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showMessage('تم تصدير البيانات بنجاح', 'success');
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (data.activities) localStorage.setItem('activities', JSON.stringify(data.activities));
        if (data.reports) localStorage.setItem('reports', JSON.stringify(data.reports));
        if (data.settings) {
          const { darkMode: dm, notifications: n, language: l, autoSave: as } = data.settings;
          if (dm !== undefined) {
            setDarkMode(dm);
            localStorage.setItem('darkMode', dm.toString());
          }
          if (n !== undefined) {
            setNotifications(n);
            localStorage.setItem('notifications', n.toString());
          }
          if (l !== undefined) {
            setLanguage(l);
            localStorage.setItem('language', l);
          }
          if (as !== undefined) {
            setAutoSave(as);
            localStorage.setItem('autoSave', as.toString());
          }
        }
        showMessage('تم استيراد البيانات بنجاح', 'success');
        setTimeout(() => window.location.reload(), 2000);
      } catch (error) {
        showMessage('خطأ في استيراد البيانات', 'error');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="settings-container" dir="rtl">
      {/* زر العودة */}
      <button
        onClick={() => navigate('/')}
        className="back-button"
        title="العودة للرئيسية"
      >
        ←
      </button>

      {/* العنوان الرئيسي */}
      <div className="settings-header">
        <h1 className="settings-title">⚙️ إعدادات النظام</h1>
        <p className="settings-subtitle">تخصيص وإدارة إعدادات منصة الأنشطة المسرحية</p>

        {message && (
          <div className={`status-message ${messageType}`}>
            {message}
          </div>
        )}
      </div>

      {/* شريط التبويبات */}
      <div className="settings-tabs">
        <button
          className={`tab-button ${activeTab === 'system' ? 'active' : ''}`}
          onClick={() => setActiveTab('system')}
        >
          🛠️ النظام
        </button>
        <button
          className={`tab-button ${activeTab === 'sync' ? 'active' : ''}`}
          onClick={() => setActiveTab('sync')}
        >
          🔄 المزامنة
        </button>
        <button
          className={`tab-button ${activeTab === 'database' ? 'active' : ''}`}
          onClick={() => setActiveTab('database')}
        >
          🗄️ قاعدة البيانات
        </button>
        <button
          className={`tab-button ${activeTab === 'dataUpdate' ? 'active' : ''}`}
          onClick={() => setActiveTab('dataUpdate')}
        >
          🔄 تحديث البيانات
        </button>
        <button
          className={`tab-button ${activeTab === 'monthManager' ? 'active' : ''}`}
          onClick={() => setActiveTab('monthManager')}
        >
          📅 إدارة الشهور
        </button>
        <button
          className={`tab-button ${activeTab === 'appearance' ? 'active' : ''}`}
          onClick={() => setActiveTab('appearance')}
        >
          🎨 المظهر
        </button>
        <button
          className={`tab-button ${activeTab === 'data' ? 'active' : ''}`}
          onClick={() => setActiveTab('data')}
        >
          💾 البيانات
        </button>
        <button
          className={`tab-button ${activeTab === 'about' ? 'active' : ''}`}
          onClick={() => setActiveTab('about')}
        >
          ℹ️ حول
        </button>
      </div>

      {/* محتوى التبويبات */}
      <div className="settings-content">
        {/* تبويب النظام */}
        {activeTab === 'system' && (
          <div className="settings-sections">
            {/* حالة النظام */}
            <div className="settings-section">
              <h2 className="section-title">🔥 حالة النظام</h2>
              <p className="section-description">معلومات حول حالة قاعدة البيانات والنظام</p>

              {status ? (
                <div className="status-grid">
                  <div className="status-card">
                    <div className="status-number">{status.activities || 0}</div>
                    <div className="status-label">الأنشطة</div>
                  </div>
                  <div className="status-card">
                    <div className="status-number">{status['activity-reports'] || 0}</div>
                    <div className="status-label">التقارير</div>
                  </div>
                  <div className="status-card">
                    <div className="status-number">{status['season-archives'] || 0}</div>
                    <div className="status-label">الأرشيف</div>
                  </div>
                  <div className="status-card">
                    <div className="status-number">{status.settings || 0}</div>
                    <div className="status-label">الإعدادات</div>
                  </div>
                </div>
              ) : (
                <div className="loading-container">
                  <div className="loading-spinner"></div>
                  <p>جاري فحص حالة النظام...</p>
                </div>
              )}

              <div className="settings-buttons">
                <button
                  onClick={handleRefreshStatus}
                  disabled={loading}
                  className="settings-btn info"
                >
                  {loading && <div className="loading-spinner"></div>}
                  🔄 تحديث الحالة
                </button>
              </div>
            </div>

            {/* إدارة المستخدمين */}
            {userService.isAdmin() && (
              <div className="settings-section">
                <h2 className="section-title">👥 إدارة المستخدمين</h2>
                <p className="section-description">إضافة وإدارة حسابات المستخدمين وصلاحياتهم</p>

                <div className="settings-buttons">
                  <button
                    onClick={() => navigate('/user-management')}
                    className="settings-btn primary"
                  >
                    👥 إدارة المستخدمين
                  </button>
                </div>
              </div>
            )}

            {/* إجراءات النظام */}
            <div className="settings-section">
              <h2 className="section-title">🛠️ إجراءات النظام</h2>
              <p className="section-description">إعداد وصيانة النظام</p>

              <div className="settings-buttons">
                <button
                  onClick={handleInitializeSystem}
                  disabled={loading}
                  className="settings-btn success"
                >
                  {loading && <div className="loading-spinner"></div>}
                  🚀 إعداد النظام الشامل
                </button>

                <button
                  onClick={handleClearTestData}
                  className="settings-btn danger"
                >
                  🗑️ حذف البيانات التجريبية
                </button>
              </div>
            </div>
          </div>
        )}

        {/* تبويب المزامنة */}
        {activeTab === 'sync' && (
          <div className="settings-sections">
            <div className="settings-section">
              <h2 className="section-title">🔄 حالة المزامنة</h2>
              <p className="section-description">مراقبة وإدارة مزامنة البيانات بين الجهاز وقاعدة البيانات السحابية</p>

              <SyncStatus compact={false} />
            </div>
          </div>
        )}

        {/* تبويب قاعدة البيانات */}
        {activeTab === 'database' && (
          <div className="settings-sections">
            <div className="settings-section">
              <h2 className="section-title">🗄️ إدارة قاعدة البيانات</h2>
              <p className="section-description">إعداد وإدارة قاعدة البيانات، حذف البيانات التجريبية وإنشاء الهيكل الحقيقي</p>

              {/* إنشاء قاعدة البيانات */}
              <div style={{ marginBottom: '3rem' }}>
                <h3 style={{ marginBottom: '1rem', color: '#374151' }}>🏗️ إنشاء قاعدة البيانات الجديدة</h3>
                <DatabaseCreator />
              </div>

              {/* إدارة قاعدة البيانات الموجودة */}
              <div>
                <h3 style={{ marginBottom: '1rem', color: '#374151' }}>🔧 إدارة قاعدة البيانات الموجودة</h3>
                <DatabaseManager />
              </div>
            </div>
          </div>
        )}

        {/* تبويب تحديث البيانات */}
        {activeTab === 'dataUpdate' && (
          <div className="settings-sections">
            <div className="settings-section">
              <h2 className="section-title">🔄 تحديث البيانات</h2>
              <p className="section-description">تحويل التواريخ الهجرية إلى ميلادية مغربية وتحديث الأرقام</p>

              <DataUpdater />
            </div>
          </div>
        )}

        {/* تبويب إدارة الشهور */}
        {activeTab === 'monthManager' && (
          <div className="settings-sections">
            <div className="settings-section">
              <h2 className="section-title">📅 إدارة الشهور الأكاديمية</h2>
              <p className="section-description">إدارة الشهور حسب الموسم الدراسي المغربي (شتنبر → يوليوز)</p>

              <MonthManager />
            </div>
          </div>
        )}

        {/* تبويب المظهر */}
        {activeTab === 'appearance' && (
          <div className="settings-sections">
            <div className="settings-section">
              <h2 className="section-title">🎨 إعدادات المظهر</h2>
              <p className="section-description">تخصيص مظهر التطبيق حسب تفضيلاتك</p>

              <div className="settings-options">
                <div className="setting-item">
                  <div className="setting-info">
                    <h3>🌙 الوضع المظلم</h3>
                    <p>تفعيل أو إلغاء الوضع المظلم</p>
                  </div>
                  <button
                    onClick={toggleDarkMode}
                    className={`toggle-btn ${darkMode ? 'active' : ''}`}
                  >
                    <div className="toggle-slider"></div>
                  </button>
                </div>

                <div className="setting-item">
                  <div className="setting-info">
                    <h3>🔔 الإشعارات</h3>
                    <p>تفعيل أو إلغاء الإشعارات</p>
                  </div>
                  <button
                    onClick={toggleNotifications}
                    className={`toggle-btn ${notifications ? 'active' : ''}`}
                  >
                    <div className="toggle-slider"></div>
                  </button>
                </div>

                <div className="setting-item">
                  <div className="setting-info">
                    <h3>💾 الحفظ التلقائي</h3>
                    <p>حفظ التغييرات تلقائياً</p>
                  </div>
                  <button
                    onClick={toggleAutoSave}
                    className={`toggle-btn ${autoSave ? 'active' : ''}`}
                  >
                    <div className="toggle-slider"></div>
                  </button>
                </div>

                <div className="setting-item">
                  <div className="setting-info">
                    <h3>🌐 اللغة</h3>
                    <p>اختيار لغة التطبيق</p>
                  </div>
                  <select
                    value={language}
                    onChange={(e) => changeLanguage(e.target.value)}
                    className="language-select"
                  >
                    <option value="ar">العربية</option>
                    <option value="en">English</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* تبويب البيانات */}
        {activeTab === 'data' && (
          <div className="settings-sections">
            <div className="settings-section">
              <h2 className="section-title">💾 إدارة البيانات</h2>
              <p className="section-description">تصدير واستيراد البيانات</p>

              <div className="settings-buttons">
                <button
                  onClick={exportData}
                  className="settings-btn primary"
                >
                  📤 تصدير البيانات
                </button>

                <label className="settings-btn secondary file-input-label">
                  📥 استيراد البيانات
                  <input
                    type="file"
                    accept=".json"
                    onChange={importData}
                    className="file-input"
                  />
                </label>
              </div>
            </div>
          </div>
        )}

        {/* تبويب حول */}
        {activeTab === 'about' && (
          <div className="settings-sections">
            <div className="settings-section">
              <h2 className="section-title">ℹ️ معلومات التطبيق</h2>
              <p className="section-description">معلومات حول النظام والمطور</p>

              <div className="about-info">
                <div className="info-item">
                  <strong>اسم التطبيق:</strong>
                  <span>منصة الأنشطة المسرحية</span>
                </div>
                <div className="info-item">
                  <strong>الإصدار:</strong>
                  <span>2.0.0</span>
                </div>
                <div className="info-item">
                  <strong>المسؤول:</strong>
                  <span>الأستاذ مصطفى لعرعري</span>
                </div>
                <div className="info-item">
                  <strong>المؤسسة:</strong>
                  <span>مجموعة مدارس العمران</span>
                </div>
                <div className="info-item">
                  <strong>الموسم الحالي:</strong>
                  <span>2024-2025</span>
                </div>
                <div className="info-item">
                  <strong>التقنيات:</strong>
                  <span>React, TypeScript, Firebase</span>
                </div>
              </div>
            </div>

            <div className="settings-section warning-section">
              <h2 className="section-title">⚠️ تحذيرات مهمة</h2>
              <ul className="warning-list">
                <li>تأكد من اتصالك بالإنترنت قبل إعداد النظام</li>
                <li>حذف البيانات التجريبية لا يمكن التراجع عنه</li>
                <li>يُنصح بعمل نسخة احتياطية قبل أي تغيير كبير</li>
                <li>إعداد النظام يتطلب صلاحيات Firebase</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;
