import React, { useState, useEffect } from 'react';
import { MOROCCAN_ACADEMIC_MONTHS } from '../utils/dateConverter';

interface Month {
  id: string;
  name: string;
  order: number;
  isActive: boolean;
  createdAt: Date;
}

const MonthManager: React.FC = () => {
  const [months, setMonths] = useState<Month[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingMonth, setEditingMonth] = useState<Month | null>(null);
  const [newMonthName, setNewMonthName] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  // تحميل الشهور من localStorage
  useEffect(() => {
    loadMonths();
  }, []);

  const loadMonths = () => {
    const savedMonths = localStorage.getItem('customMonths');
    if (savedMonths) {
      const parsedMonths = JSON.parse(savedMonths);
      // تحويل التواريخ من string إلى Date objects
      const monthsWithDates = parsedMonths.map((month: any) => ({
        ...month,
        createdAt: new Date(month.createdAt)
      }));
      setMonths(monthsWithDates);
    } else {
      // إنشاء الشهور الافتراضية حسب الموسم الدراسي المغربي
      const defaultMonths: Month[] = MOROCCAN_ACADEMIC_MONTHS.map((name, index) => ({
        id: `month-${index + 1}`,
        name,
        order: index + 1,
        isActive: true,
        createdAt: new Date()
      }));
      setMonths(defaultMonths);
      saveMonths(defaultMonths);
    }
  };

  const saveMonths = (monthsToSave: Month[]) => {
    localStorage.setItem('customMonths', JSON.stringify(monthsToSave));
  };

  // إضافة شهر جديد
  const addMonth = () => {
    if (!newMonthName.trim()) return;

    const newMonth: Month = {
      id: `month-${Date.now()}`,
      name: newMonthName.trim(),
      order: months.length + 1,
      isActive: true,
      createdAt: new Date()
    };

    const updatedMonths = [...months, newMonth];
    setMonths(updatedMonths);
    saveMonths(updatedMonths);
    setNewMonthName('');
    setShowAddForm(false);
  };

  // تعديل شهر
  const editMonth = (month: Month) => {
    setEditingMonth(month);
    setNewMonthName(month.name);
    setIsEditing(true);
  };

  const saveEdit = () => {
    if (!editingMonth || !newMonthName.trim()) return;

    const updatedMonths = months.map(month =>
      month.id === editingMonth.id
        ? { ...month, name: newMonthName.trim() }
        : month
    );

    setMonths(updatedMonths);
    saveMonths(updatedMonths);
    setIsEditing(false);
    setEditingMonth(null);
    setNewMonthName('');
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setEditingMonth(null);
    setNewMonthName('');
  };

  // حذف شهر
  const deleteMonth = (monthId: string) => {
    if (months.length <= 1) {
      alert('لا يمكن حذف جميع الشهور. يجب أن يبقى شهر واحد على الأقل.');
      return;
    }

    if (confirm('هل أنت متأكد من حذف هذا الشهر؟')) {
      const updatedMonths = months.filter(month => month.id !== monthId);
      // إعادة ترقيم الشهور
      const reorderedMonths = updatedMonths.map((month, index) => ({
        ...month,
        order: index + 1
      }));
      
      setMonths(reorderedMonths);
      saveMonths(reorderedMonths);
    }
  };

  // تفعيل/إلغاء تفعيل شهر
  const toggleMonthStatus = (monthId: string) => {
    const updatedMonths = months.map(month =>
      month.id === monthId
        ? { ...month, isActive: !month.isActive }
        : month
    );

    setMonths(updatedMonths);
    saveMonths(updatedMonths);
  };

  // إعادة ترتيب الشهور
  const moveMonth = (monthId: string, direction: 'up' | 'down') => {
    const currentIndex = months.findIndex(month => month.id === monthId);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= months.length) return;

    const updatedMonths = [...months];
    [updatedMonths[currentIndex], updatedMonths[newIndex]] = 
    [updatedMonths[newIndex], updatedMonths[currentIndex]];

    // إعادة ترقيم الشهور
    const reorderedMonths = updatedMonths.map((month, index) => ({
      ...month,
      order: index + 1
    }));

    setMonths(reorderedMonths);
    saveMonths(reorderedMonths);
  };

  // إعادة تعيين الشهور الافتراضية
  const resetToDefault = () => {
    if (confirm('هل أنت متأكد من إعادة تعيين الشهور إلى الترتيب الأكاديمي المغربي (شتنبر إلى يوليوز)؟')) {
      const defaultMonths: Month[] = MOROCCAN_ACADEMIC_MONTHS.map((name, index) => ({
        id: `month-${index + 1}`,
        name,
        order: index + 1,
        isActive: true,
        createdAt: new Date()
      }));
      setMonths(defaultMonths);
      saveMonths(defaultMonths);
    }
  };

  return (
    <div style={{
      maxWidth: '800px',
      margin: '2rem auto',
      padding: '2rem',
      background: 'white',
      borderRadius: '16px',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem',
        paddingBottom: '1rem',
        borderBottom: '2px solid #f3f4f6'
      }}>
        <h2 style={{ margin: 0, color: '#1f2937', fontSize: '1.8rem', fontWeight: '700' }}>
          📅 إدارة الشهور المغربية
        </h2>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            style={{
              padding: '0.5rem 1rem',
              background: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: '600'
            }}
          >
            ➕ إضافة شهر
          </button>
          <button
            onClick={resetToDefault}
            style={{
              padding: '0.5rem 1rem',
              background: '#6b7280',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: '600'
            }}
          >
            🔄 إعادة تعيين
          </button>
        </div>
      </div>

      {/* نموذج إضافة شهر جديد */}
      {showAddForm && (
        <div style={{
          marginBottom: '2rem',
          padding: '1.5rem',
          background: '#f9fafb',
          border: '1px solid #e5e7eb',
          borderRadius: '12px'
        }}>
          <h3 style={{ margin: '0 0 1rem 0', color: '#374151' }}>➕ إضافة شهر جديد</h3>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <input
              type="text"
              value={newMonthName}
              onChange={(e) => setNewMonthName(e.target.value)}
              placeholder="اسم الشهر الجديد"
              style={{
                flex: 1,
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '1rem'
              }}
              onKeyPress={(e) => e.key === 'Enter' && addMonth()}
            />
            <button
              onClick={addMonth}
              disabled={!newMonthName.trim()}
              style={{
                padding: '0.75rem 1.5rem',
                background: newMonthName.trim() ? '#10b981' : '#9ca3af',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: newMonthName.trim() ? 'pointer' : 'not-allowed',
                fontWeight: '600'
              }}
            >
              إضافة
            </button>
            <button
              onClick={() => {
                setShowAddForm(false);
                setNewMonthName('');
              }}
              style={{
                padding: '0.75rem 1.5rem',
                background: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              إلغاء
            </button>
          </div>
        </div>
      )}

      {/* قائمة الشهور */}
      <div style={{ display: 'grid', gap: '1rem' }}>
        {months.map((month, index) => (
          <div
            key={month.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '1rem',
              background: month.isActive ? '#f9fafb' : '#f3f4f6',
              border: `1px solid ${month.isActive ? '#e5e7eb' : '#d1d5db'}`,
              borderRadius: '8px',
              opacity: month.isActive ? 1 : 0.6
            }}
          >
            {/* رقم الترتيب */}
            <div style={{
              minWidth: '40px',
              height: '40px',
              background: month.isActive ? '#3b82f6' : '#9ca3af',
              color: 'white',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              marginLeft: '1rem'
            }}>
              {month.order}
            </div>

            {/* اسم الشهر */}
            <div style={{ flex: 1 }}>
              {isEditing && editingMonth?.id === month.id ? (
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <input
                    type="text"
                    value={newMonthName}
                    onChange={(e) => setNewMonthName(e.target.value)}
                    style={{
                      flex: 1,
                      padding: '0.5rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px',
                      fontSize: '1rem'
                    }}
                    onKeyPress={(e) => e.key === 'Enter' && saveEdit()}
                    autoFocus
                  />
                  <button
                    onClick={saveEdit}
                    style={{
                      padding: '0.5rem 1rem',
                      background: '#10b981',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '0.8rem'
                    }}
                  >
                    حفظ
                  </button>
                  <button
                    onClick={cancelEdit}
                    style={{
                      padding: '0.5rem 1rem',
                      background: '#ef4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '0.8rem'
                    }}
                  >
                    إلغاء
                  </button>
                </div>
              ) : (
                <div>
                  <h4 style={{ margin: '0 0 0.25rem 0', color: '#1f2937', fontSize: '1.1rem' }}>
                    {month.name}
                  </h4>
                  <p style={{ margin: 0, color: '#6b7280', fontSize: '0.9rem' }}>
                    {month.isActive ? 'مفعل' : 'غير مفعل'} • تم الإنشاء: {month.createdAt.toLocaleDateString('ar-SA')}
                  </p>
                </div>
              )}
            </div>

            {/* أزرار التحكم */}
            {!isEditing && (
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                {/* أزرار الترتيب */}
                <button
                  onClick={() => moveMonth(month.id, 'up')}
                  disabled={index === 0}
                  style={{
                    padding: '0.25rem 0.5rem',
                    background: index === 0 ? '#d1d5db' : '#6b7280',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: index === 0 ? 'not-allowed' : 'pointer',
                    fontSize: '0.8rem'
                  }}
                >
                  ↑
                </button>
                <button
                  onClick={() => moveMonth(month.id, 'down')}
                  disabled={index === months.length - 1}
                  style={{
                    padding: '0.25rem 0.5rem',
                    background: index === months.length - 1 ? '#d1d5db' : '#6b7280',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: index === months.length - 1 ? 'not-allowed' : 'pointer',
                    fontSize: '0.8rem'
                  }}
                >
                  ↓
                </button>

                {/* تفعيل/إلغاء تفعيل */}
                <button
                  onClick={() => toggleMonthStatus(month.id)}
                  style={{
                    padding: '0.25rem 0.5rem',
                    background: month.isActive ? '#f59e0b' : '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '0.8rem'
                  }}
                >
                  {month.isActive ? '⏸️' : '▶️'}
                </button>

                {/* تعديل */}
                <button
                  onClick={() => editMonth(month)}
                  style={{
                    padding: '0.25rem 0.5rem',
                    background: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '0.8rem'
                  }}
                >
                  ✏️
                </button>

                {/* حذف */}
                <button
                  onClick={() => deleteMonth(month.id)}
                  style={{
                    padding: '0.25rem 0.5rem',
                    background: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '0.8rem'
                  }}
                >
                  🗑️
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* معلومات إضافية */}
      <div style={{
        marginTop: '2rem',
        padding: '1rem',
        background: '#eff6ff',
        border: '1px solid #3b82f6',
        borderRadius: '8px'
      }}>
        <h4 style={{ margin: '0 0 0.5rem 0', color: '#1e40af' }}>
          📋 معلومات:
        </h4>
        <ul style={{ margin: 0, paddingRight: '1.5rem', color: '#1e40af', fontSize: '0.9rem' }}>
          <li>يمكنك إضافة شهور جديدة أو تعديل الموجودة</li>
          <li>استخدم أزرار الترتيب (↑↓) لتغيير ترتيب الشهور</li>
          <li>يمكنك تفعيل/إلغاء تفعيل الشهور حسب الحاجة</li>
          <li>الشهور المُلغاة لن تظهر في قوائم التواريخ</li>
          <li>إعادة التعيين ستعيد الترتيب الأكاديمي المغربي (شتنبر → يوليوز)</li>
        </ul>
      </div>
    </div>
  );
};

export default MonthManager;
