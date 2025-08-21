import React, { useState } from 'react';
import '../pages.css';
import useLocalStorage from '../hooks/useLocalStorage';
import Notification from '../components/Notification';

interface Holiday {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  duration: number;
  type: 'دينية' | 'وطنية' | 'بينية' | 'منتصف السنة';
  description: string;
}

const Holidays: React.FC = () => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState<number | null>(null);
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
  } | null>(null);

  const defaultHolidays: Holiday[] = [
    {
      id: 1,
      name: "عيد المولد النبوي الشريف",
      startDate: "2025-09-05",
      endDate: "2025-09-06",
      duration: 2,
      type: "دينية",
      description: "عطلة دينية بمناسبة ذكرى المولد النبوي الشريف"
    },
    {
      id: 2,
      name: "العطلة البينية الأولى",
      startDate: "2025-10-19",
      endDate: "2025-10-26",
      duration: 8,
      type: "بينية",
      description: "عطلة بينية بعد 6 أسابيع من الدراسة"
    },
    {
      id: 3,
      name: "ذكرى المسيرة الخضراء",
      startDate: "2025-11-06",
      endDate: "2025-11-06",
      duration: 1,
      type: "وطنية",
      description: "عطلة وطنية بمناسبة ذكرى المسيرة الخضراء"
    },
    {
      id: 4,
      name: "عيد الاستقلال",
      startDate: "2025-11-18",
      endDate: "2025-11-18",
      duration: 1,
      type: "وطنية",
      description: "عطلة وطنية بمناسبة عيد الاستقلال"
    },
    {
      id: 5,
      name: "العطلة البينية الثانية",
      startDate: "2025-12-21",
      endDate: "2025-12-28",
      duration: 8,
      type: "بينية",
      description: "عطلة بينية في فصل الشتاء"
    },
    {
      id: 6,
      name: "رأس السنة الميلادية",
      startDate: "2026-01-01",
      endDate: "2026-01-01",
      duration: 1,
      type: "وطنية",
      description: "عطلة رأس السنة الميلادية"
    },
    {
      id: 7,
      name: "ذكرى تقديم وثيقة الاستقلال",
      startDate: "2026-01-11",
      endDate: "2026-01-11",
      duration: 1,
      type: "وطنية",
      description: "عطلة وطنية بمناسبة ذكرى تقديم وثيقة الاستقلال"
    },
    {
      id: 8,
      name: "رأس السنة الأمازيغية",
      startDate: "2026-01-14",
      endDate: "2026-01-14",
      duration: 1,
      type: "وطنية",
      description: "عطلة رسمية بمناسبة رأس السنة الأمازيغية"
    },
    {
      id: 9,
      name: "عطلة منتصف السنة الدراسية",
      startDate: "2026-01-25",
      endDate: "2026-02-01",
      duration: 8,
      type: "منتصف السنة",
      description: "عطلة منتصف السنة الدراسية"
    },
    {
      id: 10,
      name: "العطلة البينية الثالثة (الربيع)",
      startDate: "2026-03-14",
      endDate: "2026-03-21",
      duration: 8,
      type: "بينية",
      description: "عطلة بينية في فصل الربيع"
    },
    {
      id: 11,
      name: "عيد الفطر",
      startDate: "2026-03-30",
      endDate: "2026-04-02",
      duration: 4,
      type: "دينية",
      description: "عطلة دينية بمناسبة عيد الفطر المبارك"
    },
    {
      id: 12,
      name: "عيد الشغل",
      startDate: "2026-05-01",
      endDate: "2026-05-01",
      duration: 1,
      type: "وطنية",
      description: "عطلة عيد الشغل العالمي"
    },
    {
      id: 13,
      name: "العطلة البينية الرابعة",
      startDate: "2026-05-16",
      endDate: "2026-05-23",
      duration: 8,
      type: "بينية",
      description: "العطلة البينية الأخيرة قبل نهاية السنة"
    },
    {
      id: 14,
      name: "عيد الأضحى",
      startDate: "2026-06-06",
      endDate: "2026-06-09",
      duration: 4,
      type: "دينية",
      description: "عطلة دينية بمناسبة عيد الأضحى المبارك"
    },
    {
      id: 15,
      name: "فاتح محرم",
      startDate: "2026-06-27",
      endDate: "2026-06-27",
      duration: 1,
      type: "دينية",
      description: "عطلة رأس السنة الهجرية"
    }
  ];

  const [holidays, setHolidays] = useLocalStorage('theatre-holidays', defaultHolidays);

  const showNotification = (message: string, type: 'success' | 'error' | 'warning' | 'info') => {
    setNotification({ message, type });
  };

  const hideNotification = () => {
    setNotification(null);
  };

  const toggleEditMode = () => {
    setIsEditMode(!isEditMode);
    setEditingHoliday(null);
  };

  const startEditHoliday = (id: number) => {
    setEditingHoliday(id);
  };

  const saveHoliday = (updatedHoliday: Holiday) => {
    const newHolidays = holidays.map(holiday => 
      holiday.id === updatedHoliday.id ? updatedHoliday : holiday
    );
    setHolidays(newHolidays);
    setEditingHoliday(null);
    showNotification('تم حفظ التعديل بنجاح!', 'success');
  };



  const deleteHoliday = (id: number) => {
    const holiday = holidays.find(h => h.id === id);
    if (window.confirm(`هل أنت متأكد من حذف عطلة "${holiday?.name}"؟`)) {
      const newHolidays = holidays.filter(h => h.id !== id);
      setHolidays(newHolidays);
      showNotification('تم حذف العطلة!', 'warning');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const days = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    const months = [
      'يناير', 'فبراير', 'مارس', 'أبريل', 'ماي', 'يونيو',
      'يوليوز', 'غشت', 'شتنبر', 'أكتوبر', 'نونبر', 'دجنبر'
    ];

    const dayName = days[date.getDay()];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();

    return `${dayName} ${day} ${month} ${year}`;
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'دينية': return '#10b981';
      case 'وطنية': return '#3b82f6';
      case 'بينية': return '#f59e0b';
      case 'منتصف السنة': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getTotalDays = () => {
    return holidays.reduce((total, holiday) => total + holiday.duration, 0);
  };

  const getHolidaysByType = () => {
    const types = holidays.reduce((acc, holiday) => {
      acc[holiday.type] = (acc[holiday.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return types;
  };

  const updateToNextYear = () => {
    if (confirm('هل تريد تحديث جميع تواريخ العطل للسنة الدراسية القادمة (2026-2027)؟')) {
      const updatedHolidays = holidays.map(holiday => {
        const startDate = new Date(holiday.startDate);
        const endDate = new Date(holiday.endDate);

        // إضافة سنة واحدة
        startDate.setFullYear(startDate.getFullYear() + 1);
        endDate.setFullYear(endDate.getFullYear() + 1);

        return {
          ...holiday,
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0]
        };
      });

      setHolidays(updatedHolidays);
      showNotification('تم تحديث جميع التواريخ للسنة الدراسية 2026-2027', 'success');
    }
  };

  const resetToDefault = () => {
    if (confirm('هل تريد إعادة تعيين العطل إلى القيم الافتراضية؟')) {
      setHolidays(defaultHolidays);
      showNotification('تم إعادة تعيين العطل إلى القيم الافتراضية', 'success');
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div className="container">
          <h1>📅 العطل المدرسية 2025-2026</h1>
          <p>لائحة العطل المدرسية الرسمية للموسم الدراسي 2025-2026</p>

          {/* رابط مقرر تنظيم السنة الدراسية */}
          <div style={{
            background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
            color: 'white',
            padding: '1rem',
            borderRadius: '8px',
            marginTop: '1rem',
            textAlign: 'center'
          }}>
            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem' }}>
              📋 المقرر الوزاري الرسمي
            </h3>
            <p style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', opacity: '0.9' }}>
              مقرر تنظيم السنة الدراسية 2025-2026 - وزارة التربية الوطنية والتعليم الأولي والرياضة
            </p>
            <a
              href="https://moutamadris.ma/%D9%85%D9%82%D8%B1%D8%B1-%D8%AA%D9%86%D8%B8%D9%8A%D9%85-%D8%A7%D9%84%D8%B3%D9%86%D8%A9-%D8%A7%D9%84%D8%AF%D8%B1%D8%A7%D8%B3%D9%8A%D8%A9/"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-block',
                background: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                textDecoration: 'none',
                fontWeight: '600',
                transition: 'all 0.2s ease',
                border: '1px solid rgba(255, 255, 255, 0.3)'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
              }}
            >
              📄 تحميل المقرر الرسمي (PDF)
            </a>
          </div>
        </div>
      </div>

      <div className="container">
        {/* لوحة الإحصائيات */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem',
          padding: '1rem',
          background: '#f8fafd',
          borderRadius: '8px'
        }}>
          <div style={{ textAlign: 'center', padding: '1rem', background: 'white', borderRadius: '6px' }}>
            <h3 style={{ margin: '0 0 0.5rem 0', color: '#1e40af' }}>📊 إجمالي أيام العطل</h3>
            <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold', color: '#059669' }}>
              {getTotalDays()} يوم
            </p>
          </div>

          <div style={{ textAlign: 'center', padding: '1rem', background: 'white', borderRadius: '6px' }}>
            <h3 style={{ margin: '0 0 0.5rem 0', color: '#1e40af' }}>🎯 عدد العطل</h3>
            <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold', color: '#7c3aed' }}>
              {holidays.length} عطلة
            </p>
          </div>

          <div style={{ textAlign: 'center', padding: '1rem', background: 'white', borderRadius: '6px' }}>
            <h3 style={{ margin: '0 0 0.5rem 0', color: '#1e40af' }}>📅 العطل حسب النوع</h3>
            <div style={{ fontSize: '0.9rem' }}>
              {Object.entries(getHolidaysByType()).map(([type, count]) => (
                <div key={type} style={{ margin: '0.25rem 0' }}>
                  <span style={{ color: getTypeColor(type) }}>●</span> {type}: {count}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* أزرار التحكم */}
        <div style={{
          display: 'flex',
          gap: '1rem',
          flexWrap: 'wrap',
          justifyContent: 'center',
          marginBottom: '2rem'
        }}>
          <button
            onClick={toggleEditMode}
            style={{
              padding: '0.75rem 1.5rem',
              background: isEditMode ? '#ef4444' : '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            {isEditMode ? '❌ إنهاء التعديل' : '✏️ تعديل العطل'}
          </button>

          <button
            onClick={updateToNextYear}
            style={{
              padding: '0.75rem 1.5rem',
              background: '#f59e0b',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer'
            }}
            title="تحديث جميع التواريخ للسنة الدراسية القادمة"
          >
            🔄 تحديث للسنة القادمة
          </button>

          <button
            onClick={resetToDefault}
            style={{
              padding: '0.75rem 1.5rem',
              background: '#dc2626',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer'
            }}
            title="إعادة تعيين العطل إلى القيم الافتراضية"
          >
            🔄 إعادة تعيين
          </button>
        </div>

        <div className="holidays-grid">
          {holidays.map((holiday) => (
            <HolidayCard
              key={holiday.id}
              holiday={holiday}
              isEditing={editingHoliday === holiday.id}
              isEditMode={isEditMode}
              onEdit={() => startEditHoliday(holiday.id)}
              onSave={saveHoliday}
              onCancel={() => setEditingHoliday(null)}
              onDelete={() => deleteHoliday(holiday.id)}
              formatDate={formatDate}
              getTypeColor={getTypeColor}
            />
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
  );
};

interface HolidayCardProps {
  holiday: Holiday;
  isEditing: boolean;
  isEditMode: boolean;
  onEdit: () => void;
  onSave: (holiday: Holiday) => void;
  onCancel: () => void;
  onDelete: () => void;
  formatDate: (date: string) => string;
  getTypeColor: (type: string) => string;
}

const HolidayCard: React.FC<HolidayCardProps> = ({
  holiday,
  isEditing,
  isEditMode,
  onEdit,
  onSave,
  onCancel,
  onDelete,
  formatDate,
  getTypeColor
}) => {
  const [formData, setFormData] = useState(holiday);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // حساب المدة بناءً على التواريخ
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    const duration = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    onSave({
      ...formData,
      duration
    });
  };

  if (isEditing) {
    return (
      <div className="holiday-card editing">
        <form onSubmit={handleSubmit} className="holiday-edit-form">
          <div className="form-group">
            <label>اسم العطلة:</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
            />
          </div>
          <div className="form-group">
            <label>تاريخ البداية:</label>
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({...formData, startDate: e.target.value})}
              required
            />
          </div>
          <div className="form-group">
            <label>تاريخ النهاية:</label>
            <input
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData({...formData, endDate: e.target.value})}
              required
            />
          </div>
          <div className="form-group">
            <label>نوع العطلة:</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({...formData, type: e.target.value as Holiday['type']})}
              required
            >
              <option value="دينية">دينية</option>
              <option value="وطنية">وطنية</option>
              <option value="بينية">بينية</option>
              <option value="منتصف السنة">منتصف السنة</option>
            </select>
          </div>
          <div className="form-group">
            <label>الوصف:</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              rows={3}
              required
            />
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary">حفظ</button>
            <button type="button" onClick={onCancel} className="btn btn-secondary">إلغاء</button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="holiday-card">
      <div className="holiday-header">
        <h3 className="holiday-name">{holiday.name}</h3>
        <span
          className="holiday-type"
          style={{ backgroundColor: getTypeColor(holiday.type) }}
        >
          {holiday.type}
        </span>
      </div>

      <div className="holiday-dates">
        <div className="date-info">
          <span className="date-label">من:</span>
          <span className="date-value">{formatDate(holiday.startDate)}</span>
        </div>
        <div className="date-info">
          <span className="date-label">إلى:</span>
          <span className="date-value">{formatDate(holiday.endDate)}</span>
        </div>
        <div className="duration-info">
          <span className="duration-badge">{holiday.duration} يوم</span>
        </div>
      </div>

      <p className="holiday-description">{holiday.description}</p>

      {isEditMode && (
        <div className="holiday-actions">
          <button
            onClick={onEdit}
            className="btn btn-small btn-primary"
            title="تعديل"
          >
            ✏️
          </button>
          <button
            onClick={onDelete}
            className="btn btn-small btn-danger"
            title="حذف"
          >
            🗑️
          </button>
        </div>
      )}
    </div>
  );
};

export default Holidays;
