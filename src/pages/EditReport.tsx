import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import '../pages.css';
import Notification from '../components/Notification';
import useLocalStorage from '../hooks/useLocalStorage';

// مكون معرض الصور مع إمكانية الحذف (نفس المكون من CreateReport)
interface EditReportImageSliderProps {
  images: string[];
  onRemoveImage: (index: number) => void;
}

const EditReportImageSlider: React.FC<EditReportImageSliderProps> = ({ images, onRemoveImage }) => {
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

  const handleRemove = () => {
    onRemoveImage(currentIndex);
    if (currentIndex >= images.length - 1 && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  if (!images || images.length === 0) return null;

  return (
    <div className="image-slider">
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
          
          <div className="image-caption">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <p>صورة {currentIndex + 1} من {images.length}</p>
              <button
                type="button"
                onClick={handleRemove}
                className="remove-image-btn-slider"
                title="حذف هذه الصورة"
              >
                🗑️ حذف
              </button>
            </div>
          </div>

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

interface Report {
  id: number;
  title: string;
  date: string;
  summary: string;
  image: string;
  activities: string[];
  achievements: string[];
  gallery: string[];
}

const EditReport: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [reports, setReports] = useLocalStorage<Report[]>('theatre-reports', []);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);


  const [formData, setFormData] = useState<Report>({
    id: 0,
    title: '',
    date: '',
    summary: '',
    image: '',
    activities: [''],
    achievements: [''],
    gallery: []
  });

  // تحميل بيانات التقرير عند فتح الصفحة
  useEffect(() => {
    if (id) {
      const reportId = parseInt(id);
      const report = reports.find(r => r.id === reportId);
      if (report) {
        setFormData(report);
        setUploadedImages(report.gallery || []);
      } else {
        showNotification('التقرير غير موجود!', 'error');
        navigate('/reports');
      }
    }
  }, [id, reports, navigate]);

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleInputChange = (field: keyof Report, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleArrayChange = (field: 'activities' | 'achievements', index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const addArrayItem = (field: 'activities' | 'achievements') => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeArrayItem = (field: 'activities' | 'achievements', index: number) => {
    if (formData[field].length > 1) {
      setFormData(prev => ({
        ...prev,
        [field]: prev[field].filter((_, i) => i !== index)
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.summary.trim()) {
      showNotification('يرجى ملء جميع الحقول المطلوبة', 'error');
      return;
    }

    const updatedReport: Report = {
      ...formData,
      activities: formData.activities.filter(activity => activity.trim() !== ''),
      achievements: formData.achievements.filter(achievement => achievement.trim() !== ''),
      gallery: uploadedImages
    };

    const updatedReports = reports.map(report => 
      report.id === updatedReport.id ? updatedReport : report
    );

    setReports(updatedReports);
    showNotification('تم تحديث التقرير بنجاح!', 'success');
    
    setTimeout(() => {
      navigate('/reports');
    }, 2000);
  };

  const handleCancel = () => {
    navigate('/reports');
  };

  return (
    <div className="page">
      <div className="page-header">
        <div className="container">
          <h1>✏️ تعديل التقرير</h1>
          <p>قم بتعديل بيانات التقرير</p>
        </div>
      </div>

      <div className="container">
        <div className="create-report-container">
          <form onSubmit={handleSubmit} className="report-form">
            
            {/* معلومات أساسية */}
            <div className="form-section">
              <h3>📋 المعلومات الأساسية</h3>
              
              <div className="form-group">
                <label htmlFor="title">
                  <span className="icon">📄</span>
                  عنوان التقرير
                </label>
                <input
                  type="text"
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="أدخل عنوان التقرير..."
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="date">
                  <span className="icon">📅</span>
                  التاريخ
                </label>
                <input
                  type="text"
                  id="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  placeholder="مثال: 31 يناير 2025"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="summary">
                  <span className="icon">📝</span>
                  ملخص التقرير
                </label>
                <textarea
                  id="summary"
                  value={formData.summary}
                  onChange={(e) => handleInputChange('summary', e.target.value)}
                  placeholder="اكتب ملخصاً مختصراً عن التقرير..."
                  rows={3}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="image">
                  <span className="icon">🖼️</span>
                  رابط الصورة الرئيسية
                </label>
                <input
                  type="url"
                  id="image"
                  value={formData.image}
                  onChange={(e) => handleInputChange('image', e.target.value)}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            </div>

            {/* الأنشطة المنفذة */}
            <div className="form-section">
              <h3>🎯 الأنشطة المنفذة</h3>
              {formData.activities.map((activity, index) => (
                <div key={index} className="form-group">
                  <label>
                    <span className="icon">🎭</span>
                    النشاط {index + 1}
                  </label>
                  <div className="array-input">
                    <input
                      type="text"
                      value={activity}
                      onChange={(e) => handleArrayChange('activities', index, e.target.value)}
                      placeholder={`اكتب النشاط ${index + 1}...`}
                    />
                    <button
                      type="button"
                      onClick={() => removeArrayItem('activities', index)}
                      className="btn-remove"
                      disabled={formData.activities.length === 1}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addArrayItem('activities')}
                className="btn-add"
              >
                ➕ إضافة نشاط
              </button>
            </div>

            {/* الإنجازات المحققة */}
            <div className="form-section">
              <h3>🏆 الإنجازات المحققة</h3>
              {formData.achievements.map((achievement, index) => (
                <div key={index} className="form-group">
                  <label>
                    <span className="icon">🌟</span>
                    الإنجاز {index + 1}
                  </label>
                  <div className="array-input">
                    <input
                      type="text"
                      value={achievement}
                      onChange={(e) => handleArrayChange('achievements', index, e.target.value)}
                      placeholder={`اكتب الإنجاز ${index + 1}...`}
                    />
                    <button
                      type="button"
                      onClick={() => removeArrayItem('achievements', index)}
                      className="btn-remove"
                      disabled={formData.achievements.length === 1}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addArrayItem('achievements')}
                className="btn-add"
              >
                ➕ إضافة إنجاز
              </button>
            </div>

            {/* معرض الصور */}
            <div className="form-section">
              <h3>🖼️ معرض الصور</h3>
              <p className="section-note">
                📸 <strong>ملاحظة:</strong> يمكنك إضافة صور جديدة أو حذف الصور الموجودة.
              </p>

              {uploadedImages.length > 0 && (
                <div className="image-gallery">
                  <h4>الصور الحالية ({uploadedImages.length})</h4>
                  <EditReportImageSlider
                    images={uploadedImages}
                    onRemoveImage={(index) => {
                      const newImages = uploadedImages.filter((_, i) => i !== index);
                      setUploadedImages(newImages);
                      setFormData(prev => ({
                        ...prev,
                        gallery: newImages
                      }));
                      showNotification('تم حذف الصورة', 'success');
                    }}
                  />
                </div>
              )}

              {uploadedImages.length === 0 && (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                  📷 لا توجد صور في هذا التقرير
                </div>
              )}
            </div>

            {/* أزرار التحكم */}
            <div className="form-actions">
              <button type="button" onClick={handleCancel} className="btn-cancel">
                ❌ إلغاء
              </button>
              <button type="submit" className="btn-submit">
                💾 حفظ التعديلات
              </button>
            </div>
          </form>
        </div>
      </div>

      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  );
};

export default EditReport;
