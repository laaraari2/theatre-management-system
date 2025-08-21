import React, { useState } from 'react';
import { convertISOToArabicDateWithFrenchNumbers } from '../utils/numberUtils';
import './Forms.css';

interface AddActivityFormProps {
  onSubmit: (activity: any) => void;
  onCancel: () => void;
  onNotification?: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

const AddActivityForm: React.FC<AddActivityFormProps> = ({ onSubmit, onCancel, onNotification }) => {
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    time: '',
    location: '',
    description: '',
    participants: '',
    status: 'قيد التحضير' as 'مؤكد' | 'قيد التحضير' | 'ملغي'
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const levels = [
    'ما قبل التمدرس الأول',
    'ما قبل التمدرس الثاني',
    'الأول ابتدائي',
    'الثاني ابتدائي',
    'الثالث ابتدائي',
    'الرابع ابتدائي',
    'الخامس ابتدائي',
    'السادس ابتدائي',
    'الأولى إعدادي 1',
    'الأولى إعدادي 2',
    'الثانية إعدادي 1',
    'الثانية إعدادي 2',
    'الثالثة إعدادي 1',
    'الثالثة إعدادي 2',
    'جميع المستويات'
  ];

  const locations = [
    'قاعة المسرح الرئيسية',
    'قاعة الأنشطة',
    'المسرح الخارجي',
    'الفناء الرئيسي',
    'قاعة متعددة الأغراض'
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.title.trim()) {
      newErrors.title = 'عنوان النشاط مطلوب';
    }

    if (!formData.date) {
      newErrors.date = 'تاريخ النشاط مطلوب';
    }

    if (!formData.time.trim()) {
      newErrors.time = 'وقت النشاط مطلوب';
    }

    if (!formData.location.trim()) {
      newErrors.location = 'مكان النشاط مطلوب';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'وصف النشاط مطلوب';
    }

    if (!formData.participants.trim()) {
      newErrors.participants = 'المشاركون مطلوبون';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      const newActivity = {
        id: Date.now(), // Simple ID generation
        ...formData,
        // تحويل التاريخ إلى صيغة عربية مع أرقام فرنسية
        date: convertISOToArabicDateWithFrenchNumbers(formData.date)
      };

      onSubmit(newActivity);
      onNotification?.('تم إضافة النشاط بنجاح!', 'success');
    }
  };

  return (
    <div className="form-overlay">
      <div className="form-container">
        <div className="form-header">
          <h2>إضافة نشاط جديد</h2>
          <button className="close-btn" onClick={onCancel}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="activity-form">
          <div className="form-group">
            <label htmlFor="title">عنوان النشاط *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className={errors.title ? 'error' : ''}
              placeholder="مثال: عرض مسرحي: الأسد والفأر"
            />
            {errors.title && <span className="error-message">{errors.title}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="date">التاريخ *</label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className={errors.date ? 'error' : ''}
              />
              {errors.date && <span className="error-message">{errors.date}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="time">الوقت *</label>
              <input
                type="text"
                id="time"
                name="time"
                value={formData.time}
                onChange={handleChange}
                className={errors.time ? 'error' : ''}
                placeholder="مثال: 10:00 صباحاً"
              />
              {errors.time && <span className="error-message">{errors.time}</span>}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="location">المكان *</label>
            <select
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className={errors.location ? 'error' : ''}
            >
              <option value="">اختر المكان</option>
              {locations.map((location, index) => (
                <option key={index} value={location}>{location}</option>
              ))}
            </select>
            {errors.location && <span className="error-message">{errors.location}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="participants">المشاركون *</label>
            <select
              id="participants"
              name="participants"
              value={formData.participants}
              onChange={handleChange}
              className={errors.participants ? 'error' : ''}
            >
              <option value="">اختر المستوى</option>
              {levels.map((level, index) => (
                <option key={index} value={level}>{level}</option>
              ))}
            </select>
            {errors.participants && <span className="error-message">{errors.participants}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="status">حالة النشاط</label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="قيد التحضير">قيد التحضير</option>
              <option value="مؤكد">مؤكد</option>
              <option value="ملغي">ملغي</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="description">وصف النشاط *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className={errors.description ? 'error' : ''}
              placeholder="وصف مفصل للنشاط وأهدافه..."
              rows={4}
            />
            {errors.description && <span className="error-message">{errors.description}</span>}
          </div>

          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={onCancel}>
              إلغاء
            </button>
            <button type="submit" className="btn-submit">
              إضافة النشاط
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddActivityForm;
