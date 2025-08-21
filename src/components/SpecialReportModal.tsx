import React, { useState } from 'react';
import './SpecialReportModal.css';
import Notification from './Notification';

// مكون سلايدر الصور
interface ImageSliderProps {
  images: string[];
  onRemoveImage: (index: number) => void;
}

const ImageSlider: React.FC<ImageSliderProps> = ({ images, onRemoveImage }) => {
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

  if (!images || images.length === 0) {
    return (
      <div className="no-images-placeholder">
        📷 لا توجد صور بعد - قم برفع صور للنشاط
      </div>
    );
  }

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

interface SpecialReport {
  id: number;
  title: string;
  date: string;
  type: 'urgent' | 'special' | 'summary' | 'achievement';
  content: string;
  priority: 'high' | 'medium' | 'low';
  tags: string[];
  createdBy: string;
  createdAt: string;
  // الحقول الجديدة
  activityProgram: string;
  targetGroup: string;
  location: string;
  images: string[];
}

interface SpecialReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (report: SpecialReport) => void;
  selectedActivity?: {
    id?: string | number;
    title?: string;
    date?: string;
    time?: string;
    location?: string;
    description?: string;
    participants?: string;
  } | null;
}

const SpecialReportModal: React.FC<SpecialReportModalProps> = ({
  isOpen,
  onClose,
  onSave,
  selectedActivity
}) => {
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
  } | null>(null);

  // دالة للحصول على التاريخ الحالي بالعربية
  const getCurrentDate = () => {
    const now = new Date();
    const days = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    const months = [
      'يناير', 'فبراير', 'مارس', 'أبريل', 'ماي', 'يونيو',
      'يوليوز', 'غشت', 'شتنبر', 'أكتوبر', 'نونبر', 'دجنبر'
    ];

    const dayName = days[now.getDay()];
    const day = now.getDate();
    const month = months[now.getMonth()];
    const year = now.getFullYear();

    return `${day} ${dayName} ${month} ${year}`;
  };

  const [formData, setFormData] = useState({
    title: '',
    type: 'special' as 'urgent' | 'special' | 'summary' | 'achievement',
    content: '',
    priority: 'medium' as 'high' | 'medium' | 'low',
    tags: [] as string[],
    tagInput: '',
    // الحقول الجديدة
    activityProgram: '',
    targetGroup: '',
    location: '',
    images: [] as string[]
  });

  const [isProcessingImages, setIsProcessingImages] = useState(false);

  // ملء البيانات تلقائياً عند فتح النافذة مع نشاط محدد
  React.useEffect(() => {
    if (isOpen && selectedActivity) {
      const activityTitle = selectedActivity.title || 'نشاط غير محدد';
      const activityDate = selectedActivity.date || 'غير محدد';
      const activityTime = selectedActivity.time || 'غير محدد';
      const activityLocation = selectedActivity.location || 'غير محدد';
      const activityDescription = selectedActivity.description || 'غير محدد';
      const activityParticipants = selectedActivity.participants || 'غير محدد';

      setFormData(prev => ({
        ...prev,
        title: `تقرير ${activityTitle}`,
        content: `تقرير مفصل عن النشاط: ${activityTitle}\n\nالتاريخ: ${activityDate}\nالوقت: ${activityTime}\nالمكان: ${activityLocation}\n\nوصف النشاط:\n${activityDescription}\n\nالمشاركون:\n${activityParticipants}\n\n--- تفاصيل التقرير ---\n`,
        activityProgram: activityTitle,
        targetGroup: activityParticipants,
        location: activityLocation,
        type: 'special'
      }));
    } else if (isOpen && !selectedActivity) {
      // إعادة تعيين النموذج إذا لم يكن هناك نشاط محدد
      setFormData({
        title: '',
        type: 'special',
        content: '',
        priority: 'medium',
        tags: [],
        tagInput: '',
        activityProgram: '',
        targetGroup: '',
        location: '',
        images: []
      });
    }
  }, [isOpen, selectedActivity]);

  const reportTypes = [
    { value: 'urgent', label: '🚨 تقرير عاجل', description: 'للأحداث المهمة والعاجلة' },
    { value: 'special', label: '⭐ تقرير خاص', description: 'للمناسبات والأحداث المميزة' },
    { value: 'summary', label: '📊 تقرير موجز', description: 'ملخص سريع للأنشطة' },
    { value: 'achievement', label: '🏆 تقرير إنجاز', description: 'للإنجازات والنجاحات' }
  ];

  const priorityLevels = [
    { value: 'high', label: '🔴 عالية', color: '#ef4444' },
    { value: 'medium', label: '🟡 متوسطة', color: '#f59e0b' },
    { value: 'low', label: '🟢 منخفضة', color: '#10b981' }
  ];

  const showNotification = (message: string, type: 'success' | 'error' | 'warning' | 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddTag = () => {
    const tag = formData.tagInput.trim();
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag],
        tagInput: ''
      }));
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  // دالة ضغط الصور المحسنة - تدعم أي حجم
  const compressAndConvertToBase64 = (file: File, strongCompression = false): Promise<string> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // إعدادات الضغط حسب حجم الملف الأصلي
        let maxWidth, maxHeight, quality;

        if (strongCompression || file.size > 10 * 1024 * 1024) { // أكثر من 10MB
          maxWidth = 600;
          maxHeight = 450;
          quality = 0.6; // ضغط قوي
        } else if (file.size > 5 * 1024 * 1024) { // أكثر من 5MB
          maxWidth = 800;
          maxHeight = 600;
          quality = 0.7; // ضغط متوسط
        } else { // أقل من 5MB
          maxWidth = 1000;
          maxHeight = 750;
          quality = 0.8; // ضغط خفيف
        }

        let { width, height } = img;

        // حساب الأبعاد الجديدة مع الحفاظ على النسبة
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }

        // التأكد من أن الأبعاد صحيحة
        canvas.width = Math.round(width);
        canvas.height = Math.round(height);

        // رسم الصورة مع تحسين الجودة
        if (ctx) {
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        }

        // تحويل إلى base64 مع الضغط
        const compressedBase64 = canvas.toDataURL('image/jpeg', quality);

        // فحص إضافي: إذا كانت النتيجة كبيرة جداً، ضغط أكثر
        if (compressedBase64.length > 1024 * 1024 && !strongCompression) { // أكثر من 1MB
          // إعادة الضغط بقوة أكبر
          const recompressed = canvas.toDataURL('image/jpeg', 0.5);
          resolve(recompressed);
        } else {
          resolve(compressedBase64);
        }
      };

      img.onerror = () => reject(new Error('فشل في تحميل الصورة'));

      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error('فشل في قراءة الملف'));
      reader.readAsDataURL(file);
    });
  };

  // دالة رفع الصور - تقبل أي حجم وتضغط تلقائياً
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    setIsProcessingImages(true);
    showNotification(`🔄 بدء معالجة ${files.length} صورة...`, 'info');

    const newImages: string[] = [];
    let processedCount = 0;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      if (!file.type.startsWith('image/')) {
        showNotification(`الملف ${file.name} ليس صورة - تم تجاهله`, 'warning');
        continue;
      }

      try {
        // عرض تقدم المعالجة
        showNotification(`🔄 معالجة الصورة ${i + 1} من ${files.length}: ${file.name}`, 'info');

        const compressedImage = await compressAndConvertToBase64(file);
        newImages.push(compressedImage);
        processedCount++;

        // حساب نسبة الضغط
        const originalSize = (file.size / 1024 / 1024).toFixed(2);
        const compressedSize = (compressedImage.length * 0.75 / 1024 / 1024).toFixed(2); // تقدير تقريبي
        console.log(`ضغط ${file.name}: من ${originalSize}MB إلى ${compressedSize}MB`);

      } catch (error) {
        console.error(`خطأ في معالجة ${file.name}:`, error);
        showNotification(`فشل في معالجة الصورة ${file.name} - سيتم المحاولة مرة أخرى`, 'warning');

        // محاولة ثانية بضغط أقوى
        try {
          const compressedImage = await compressAndConvertToBase64(file, true); // ضغط قوي
          newImages.push(compressedImage);
          processedCount++;
        } catch (secondError) {
          showNotification(`تعذر معالجة الصورة ${file.name}`, 'error');
        }
      }
    }

    if (newImages.length > 0) {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...newImages]
      }));
      showNotification(`✅ تم رفع وضغط ${processedCount} صورة بنجاح!`, 'success');
    } else {
      showNotification('لم يتم رفع أي صورة', 'warning');
    }

    setIsProcessingImages(false);
    event.target.value = '';
  };

  // دالة حذف صورة
  const handleRemoveImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
    showNotification('تم حذف الصورة', 'info');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      showNotification('يرجى إدخال عنوان التقرير', 'error');
      return;
    }

    if (!formData.content.trim()) {
      showNotification('يرجى إدخال محتوى التقرير', 'error');
      return;
    }

    const newReport: SpecialReport = {
      id: Date.now(),
      title: formData.title.trim(),
      date: getCurrentDate(),
      type: formData.type,
      content: formData.content.trim(),
      priority: formData.priority,
      tags: formData.tags,
      createdBy: 'الأستاذ مصطفى لعرعري',
      createdAt: new Date().toISOString(),
      // الحقول الجديدة
      activityProgram: formData.activityProgram.trim(),
      targetGroup: formData.targetGroup.trim(),
      location: formData.location.trim(),
      images: formData.images
    };

    onSave(newReport);
    showNotification('تم إنشاء التقرير الخاص بنجاح!', 'success');

    // إعادة تعيين النموذج
    setFormData({
      title: '',
      type: 'special',
      content: '',
      priority: 'medium',
      tags: [],
      tagInput: '',
      activityProgram: '',
      targetGroup: '',
      location: '',
      images: []
    });

    // إغلاق النافذة بعد ثانيتين
    setTimeout(() => {
      onClose();
    }, 2000);
  };

  const handleCancel = () => {
    // إعادة تعيين النموذج
    setFormData({
      title: '',
      type: 'special',
      content: '',
      priority: 'medium',
      tags: [],
      tagInput: '',
      activityProgram: '',
      targetGroup: '',
      location: '',
      images: []
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="special-report-overlay">
      <div className="special-report-modal">
        <div className="modal-header">
          <h2>📝 إنشاء تقرير خاص</h2>
          <button onClick={handleCancel} className="close-btn">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {/* نوع التقرير */}
          <div className="form-group">
            <label>نوع التقرير</label>
            <div className="report-types">
              {reportTypes.map(type => (
                <div
                  key={type.value}
                  className={`report-type-option ${formData.type === type.value ? 'selected' : ''}`}
                  onClick={() => handleInputChange('type', type.value)}
                >
                  <div className="type-label">{type.label}</div>
                  <div className="type-description">{type.description}</div>
                </div>
              ))}
            </div>
          </div>

          {/* عنوان التقرير */}
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

          {/* الأولوية */}
          <div className="form-group">
            <label>مستوى الأولوية</label>
            <div className="priority-levels">
              {priorityLevels.map(priority => (
                <button
                  key={priority.value}
                  type="button"
                  className={`priority-btn ${formData.priority === priority.value ? 'selected' : ''}`}
                  onClick={() => handleInputChange('priority', priority.value)}
                  style={{ borderColor: priority.color }}
                >
                  {priority.label}
                </button>
              ))}
            </div>
          </div>

          {/* محتوى التقرير */}
          <div className="form-group">
            <label htmlFor="content">
              <span className="icon">📝</span>
              الموضوع (محتوى التقرير)
            </label>
            <textarea
              id="content"
              value={formData.content}
              onChange={(e) => handleInputChange('content', e.target.value)}
              placeholder="اكتب موضوع وتفاصيل التقرير هنا..."
              rows={6}
              required
            />
          </div>

          {/* برنامج النشاط */}
          <div className="form-group">
            <label htmlFor="activityProgram">
              <span className="icon">📅</span>
              برنامج النشاط
            </label>
            <textarea
              id="activityProgram"
              value={formData.activityProgram}
              onChange={(e) => handleInputChange('activityProgram', e.target.value)}
              placeholder="مثال:&#10;النشاط الأول: التحضير والإعداد&#10;النشاط الثاني: العرض المسرحي&#10;النشاط الثالث: النقاش والتقييم&#10;النشاط الرابع: الختام والتوزيع"
              rows={4}
            />
          </div>

          {/* الفئة المستفيدة */}
          <div className="form-group">
            <label htmlFor="targetGroup">
              <span className="icon">👥</span>
              الفئة المستفيدة
            </label>
            <input
              type="text"
              id="targetGroup"
              value={formData.targetGroup}
              onChange={(e) => handleInputChange('targetGroup', e.target.value)}
              placeholder="مثال: طلاب المرحلة الثانوية، جميع المستويات..."
            />
          </div>

          {/* مكان النشاط */}
          <div className="form-group">
            <label htmlFor="location">
              <span className="icon">📍</span>
              مكان النشاط
            </label>
            <input
              type="text"
              id="location"
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              placeholder="مثال: قاعة المسرح، الساحة الرئيسية..."
            />
          </div>

          {/* معرض الصور */}
          <div className="form-group">
            <label>
              <span className="icon">📸</span>
              معرض الصور
            </label>
            <p className="field-description">
              قم برفع صور النشاط (أي حجم - سيتم ضغطها تلقائياً). الصور المدعومة: JPG, PNG, GIF, WebP
            </p>

            <label
              htmlFor="images"
              className={`image-upload-btn ${isProcessingImages ? 'processing' : ''}`}
            >
              <span className="icon">
                {isProcessingImages ? '⏳' : '📷'}
              </span>
              {isProcessingImages ? 'جاري المعالجة...' : 'اختر صور من جهازك'}
              <input
                type="file"
                id="images"
                multiple
                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                onChange={handleImageUpload}
                disabled={isProcessingImages}
                style={{ display: 'none' }}
              />
            </label>

            {formData.images.length > 0 && (
              <div className="images-preview">
                <h4>الصور المرفوعة ({formData.images.length})</h4>
                <ImageSlider
                  images={formData.images}
                  onRemoveImage={handleRemoveImage}
                />
              </div>
            )}
          </div>

          {/* العلامات */}
          <div className="form-group">
            <label>
              <span className="icon">🏷️</span>
              العلامات (اختيارية)
            </label>
            <div className="tags-input">
              <input
                type="text"
                value={formData.tagInput}
                onChange={(e) => handleInputChange('tagInput', e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="أضف علامة واضغط Enter..."
              />
              <button type="button" onClick={handleAddTag} className="add-tag-btn">
                إضافة
              </button>
            </div>
            {formData.tags.length > 0 && (
              <div className="tags-list">
                {formData.tags.map(tag => (
                  <span key={tag} className="tag">
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="remove-tag"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* معلومات إضافية */}
          <div className="report-info">
            <div className="info-item">
              <span className="icon">📅</span>
              <span>التاريخ: {getCurrentDate()}</span>
            </div>
            <div className="info-item">
              <span className="icon">👤</span>
              <span>المؤلف: الأستاذ مصطفى لعرعري</span>
            </div>
          </div>

          {/* أزرار التحكم */}
          <div className="modal-actions">
            <button type="button" onClick={handleCancel} className="btn-cancel">
              ❌ إلغاء
            </button>
            <button type="submit" className="btn-submit">
              💾 حفظ التقرير
            </button>
          </div>
        </form>

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

export default SpecialReportModal;
