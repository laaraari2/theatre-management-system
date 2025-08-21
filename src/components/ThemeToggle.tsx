import React, { useState, useEffect } from 'react';
import './ThemeToggle.css';

interface ThemeToggleProps {
  onThemeChange?: (theme: 'light' | 'dark' | 'auto') => void;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ onThemeChange }) => {
  const [theme, setTheme] = useState<'light' | 'dark' | 'auto'>('auto');
  const [isAnimating, setIsAnimating] = useState(false);

  // تحديد الوقت الحالي لتطبيق الوضع التلقائي
  const getAutoTheme = () => {
    const hour = new Date().getHours();
    return (hour >= 18 || hour <= 6) ? 'dark' : 'light';
  };

  // تطبيق الثيم
  const applyTheme = (selectedTheme: 'light' | 'dark' | 'auto') => {
    const actualTheme = selectedTheme === 'auto' ? getAutoTheme() : selectedTheme;
    
    // إضافة كلاس الانتقال
    document.body.classList.add('theme-transitioning');
    
    // إزالة الثيمات السابقة
    document.body.classList.remove('light-theme', 'dark-theme');
    
    // تطبيق الثيم الجديد
    setTimeout(() => {
      document.body.classList.add(`${actualTheme}-theme`);
      
      // إزالة كلاس الانتقال بعد انتهاء الأنيميشن
      setTimeout(() => {
        document.body.classList.remove('theme-transitioning');
      }, 500);
    }, 50);

    // حفظ التفضيل
    localStorage.setItem('preferred-theme', selectedTheme);
    
    if (onThemeChange) {
      onThemeChange(selectedTheme);
    }
  };

  // تحميل الثيم المحفوظ
  useEffect(() => {
    const savedTheme = localStorage.getItem('preferred-theme') as 'light' | 'dark' | 'auto' || 'auto';
    setTheme(savedTheme);
    applyTheme(savedTheme);

    // تحديث الوضع التلقائي كل ساعة
    const interval = setInterval(() => {
      if (savedTheme === 'auto') {
        applyTheme('auto');
      }
    }, 3600000); // كل ساعة

    return () => clearInterval(interval);
  }, []);

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'auto') => {
    setIsAnimating(true);
    setTheme(newTheme);
    applyTheme(newTheme);
    
    // تأثير بصري للتغيير
    setTimeout(() => setIsAnimating(false), 600);
  };

  const getThemeIcon = (themeType: 'light' | 'dark' | 'auto') => {
    switch (themeType) {
      case 'light': return '☀️';
      case 'dark': return '🌙';
      case 'auto': return '🌓';
    }
  };

  const getThemeLabel = (themeType: 'light' | 'dark' | 'auto') => {
    switch (themeType) {
      case 'light': return 'فاتح';
      case 'dark': return 'مظلم';
      case 'auto': return 'تلقائي';
    }
  };

  const getCurrentTimeBasedTheme = () => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 12) return 'صباح';
    if (hour >= 12 && hour < 18) return 'ظهيرة';
    if (hour >= 18 && hour < 22) return 'مساء';
    return 'ليل';
  };

  return (
    <div className={`theme-toggle-container ${isAnimating ? 'animating' : ''}`}>
      <div className="theme-toggle-wrapper">
        <div className="theme-info">
          <span className="current-theme-icon">
            {getThemeIcon(theme)}
          </span>
          <div className="theme-details">
            <span className="theme-label">
              الوضع: {getThemeLabel(theme)}
            </span>
            {theme === 'auto' && (
              <span className="auto-theme-info">
                {getCurrentTimeBasedTheme()} - {getAutoTheme() === 'dark' ? 'مظلم' : 'فاتح'}
              </span>
            )}
          </div>
        </div>

        <div className="theme-options">
          {(['light', 'dark', 'auto'] as const).map((themeOption) => (
            <button
              key={themeOption}
              className={`theme-option ${theme === themeOption ? 'active' : ''}`}
              onClick={() => handleThemeChange(themeOption)}
              title={`تغيير إلى الوضع ${getThemeLabel(themeOption)}`}
            >
              <span className="theme-option-icon">
                {getThemeIcon(themeOption)}
              </span>
              <span className="theme-option-label">
                {getThemeLabel(themeOption)}
              </span>
              {themeOption === 'auto' && (
                <span className="auto-indicator">
                  ⚡
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="theme-preview">
          <div className="preview-card light-preview">
            <div className="preview-header"></div>
            <div className="preview-content">
              <div className="preview-line"></div>
              <div className="preview-line short"></div>
            </div>
          </div>
          <div className="preview-card dark-preview">
            <div className="preview-header"></div>
            <div className="preview-content">
              <div className="preview-line"></div>
              <div className="preview-line short"></div>
            </div>
          </div>
        </div>

        {theme === 'auto' && (
          <div className="auto-schedule">
            <h4>📅 الجدول التلقائي</h4>
            <div className="schedule-timeline">
              <div className="schedule-item">
                <span className="schedule-time">6:00 - 18:00</span>
                <span className="schedule-theme">☀️ فاتح</span>
              </div>
              <div className="schedule-item">
                <span className="schedule-time">18:00 - 6:00</span>
                <span className="schedule-theme">🌙 مظلم</span>
              </div>
            </div>
          </div>
        )}

        <div className="theme-benefits">
          <div className="benefit-item">
            <span className="benefit-icon">👁️</span>
            <span className="benefit-text">راحة للعينين</span>
          </div>
          <div className="benefit-item">
            <span className="benefit-icon">🔋</span>
            <span className="benefit-text">توفير البطارية</span>
          </div>
          <div className="benefit-item">
            <span className="benefit-icon">🎨</span>
            <span className="benefit-text">تجربة أفضل</span>
          </div>
        </div>
      </div>

      {/* تأثير الانتقال */}
      {isAnimating && (
        <div className="theme-transition-effect">
          <div className="transition-wave"></div>
          <div className="transition-particles">
            {Array.from({ length: 12 }, (_, i) => (
              <div key={i} className="particle" style={{
                '--delay': `${i * 0.1}s`,
                '--angle': `${i * 30}deg`
              } as React.CSSProperties}></div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ThemeToggle;
