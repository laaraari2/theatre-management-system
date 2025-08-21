import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../pages.css';
import Notification from '../components/Notification';
import useLocalStorage from '../hooks/useLocalStorage';

// مكون معرض الصور مع إمكانية الحذف
interface CreateReportImageSliderProps {
  images: string[];
  onRemoveImage: (index: number) => void;
}

const CreateReportImageSlider: React.FC<CreateReportImageSliderProps> = ({ images, onRemoveImage }) => {
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
    // إذا كانت هذه الصورة الأخيرة، ارجع للصورة السابقة
    if (currentIndex >= images.length - 1 && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
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

          {/* النص التوضيحي مع زر الحذف */}
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

// مكون معرض صور النشاط
interface ActivityImageSliderProps {
  images: string[];
  activityIndex: number;
  onRemoveImage: (activityIndex: number, imageIndex: number) => void;
}

const ActivityImageSlider: React.FC<ActivityImageSliderProps> = ({ images, activityIndex, onRemoveImage }) => {
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
    onRemoveImage(activityIndex, currentIndex);
    if (currentIndex >= images.length - 1 && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  if (!images || images.length === 0) return null;

  return (
    <div className="activity-image-slider">
      <div className="image-fit-controls">
        <button
          className={`fit-btn ${objectFit === 'contain' ? 'active' : ''}`}
          onClick={() => setObjectFit('contain')}
        >
          احتواء
        </button>
        <button
          className={`fit-btn ${objectFit === 'cover' ? 'active' : ''}`}
          onClick={() => setObjectFit('cover')}
        >
          ملء
        </button>
      </div>

      <div className="slider-container">
        <div className="slider-image-container">
          <img
            src={images[currentIndex]}
            alt={`صورة النشاط ${currentIndex + 1}`}
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
                🗑️
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
  activitiesWithImages: ActivityWithImages[];
  achievements: string[];
  gallery: string[];
}

const CreateReport: React.FC = () => {
  const navigate = useNavigate();
  const [, setReports] = useLocalStorage<Report[]>('theatre-reports', []);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  // دالة لتحديد الشهر والسنة الحاليين
  const getCurrentMonthYear = () => {
    const now = new Date();
    const months = [
      'يناير', 'فبراير', 'مارس', 'أبريل', 'ماي', 'يونيو',
      'يوليوز', 'غشت', 'شتنبر', 'أكتوبر', 'نونبر', 'دجنبر'
    ];
    const currentMonth = months[now.getMonth()];
    const currentYear = now.getFullYear();
    return { month: currentMonth, year: currentYear };
  };

  // دالة لتحديد آخر يوم في الشهر
  const getLastDayOfMonth = (month?: string, year?: number) => {
    const targetMonth = month || currentMonth;
    const targetYear = year || currentYear;
    const monthIndex = [
      'يناير', 'فبراير', 'مارس', 'أبريل', 'ماي', 'يونيو',
      'يوليوز', 'غشت', 'شتنبر', 'أكتوبر', 'نونبر', 'دجنبر'
    ].indexOf(targetMonth);

    const lastDay = new Date(targetYear, monthIndex + 1, 0);
    return lastDay.getDate();
  };

  // دالة لتحديد اسم اليوم
  const getDayName = (day: number, month: string, year: number) => {
    const monthIndex = [
      'يناير', 'فبراير', 'مارس', 'أبريل', 'ماي', 'يونيو',
      'يوليوز', 'غشت', 'شتنبر', 'أكتوبر', 'نونبر', 'دجنبر'
    ].indexOf(month);

    const date = new Date(year, monthIndex, day);
    const dayNames = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    return dayNames[date.getDay()];
  };

  // دالة لإنشاء قائمة الأيام للشهر المختار
  const getDaysOfMonth = (month: string, year: number) => {
    const daysCount = getLastDayOfMonth(month, year);
    const days = [];

    for (let day = 1; day <= daysCount; day++) {
      const dayName = getDayName(day, month, year);
      days.push({
        value: day,
        label: `${day} - ${dayName}`,
        fullDate: `${day} ${month} ${year}`
      });
    }

    return days;
  };

  const { month: currentMonth, year: currentYear } = getCurrentMonthYear();
  const lastDay = getLastDayOfMonth();

  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedDay, setSelectedDay] = useState(lastDay);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [isProcessingImages, setIsProcessingImages] = useState(false);
  const [showDetailedActivities, setShowDetailedActivities] = useState(false);

  const [formData, setFormData] = useState<Report>({
    id: 0,
    title: `تقرير شهر ${currentMonth} ${currentYear}`,
    date: `${lastDay} ${currentMonth} ${currentYear}`,
    summary: `تقرير شامل عن الأنشطة المسرحية المنفذة خلال شهر ${currentMonth} ${currentYear}`,
    image: '',
    activities: [''],
    activitiesWithImages: [{
      name: '',
      description: '',
      images: []
    }],
    achievements: [''],
    gallery: []
  });

  // اقتراحات الأنشطة حسب الشهر
  const getMonthSuggestions = (month: string) => {
    const suggestions: { [key: string]: { activities: string[], achievements: string[] } } = {
      'يناير': {
        activities: ['ورشة تدريبية للمبتدئين', 'عرض مسرحي للأطفال', 'جلسة قراءة نصوص'],
        achievements: ['تدريب 25 طفل جديد', 'إنتاج عرض مسرحي جديد', 'تطوير مهارات الإلقاء']
      },
      'فبراير': {
        activities: ['مهرجان المسرح المدرسي', 'ورشة كتابة النصوص', 'عرض مسرحي تراثي'],
        achievements: ['مشاركة 15 مدرسة', 'كتابة 5 نصوص جديدة', 'إحياء التراث المحلي']
      },
      'مارس': {
        activities: ['احتفالية يوم المسرح العالمي', 'ورشة الإخراج المسرحي', 'مسرحية تفاعلية'],
        achievements: ['تنظيم فعالية كبرى', 'تدريب 10 مخرجين جدد', 'جذب 500 متفرج']
      },
      'أبريل': {
        activities: ['مسرح الشارع', 'ورشة الماكياج المسرحي', 'عرض في الهواء الطلق'],
        achievements: ['الوصول لـ 1000 شخص', 'تعلم تقنيات جديدة', 'كسر حاجز المكان']
      },
      'ماي': {
        activities: ['مهرجان نهاية الموسم', 'عرض تخرج الطلاب', 'حفل تكريم المتميزين'],
        achievements: ['تخريج 30 طالب', 'تكريم 15 متميز', 'ختام موسم ناجح']
      },
      'يونيو': {
        activities: ['مخيم مسرحي صيفي', 'ورشة مسرح الدمى', 'عروض ترفيهية'],
        achievements: ['استقبال 100 طفل', 'إنتاج 10 عرائس', 'تسلية الأطفال']
      },
      'يوليوز': {
        activities: ['مسرح تحت النجوم', 'ورشة الارتجال', 'عروض ليلية'],
        achievements: ['تجربة فريدة', 'تطوير الإبداع', 'جو ساحر']
      },
      'غشت': {
        activities: ['مهرجان المسرح الشبابي', 'ورشة التمثيل المتقدم', 'مسابقة أفضل ممثل'],
        achievements: ['مشاركة 50 شاب', 'رفع المستوى', 'اكتشاف مواهب']
      },
      'شتنبر': {
        activities: ['بداية الموسم الجديد', 'ورشة تأهيل المدربين', 'عرض افتتاحي'],
        achievements: ['انطلاقة قوية', 'تأهيل 8 مدربين', 'حضور مميز']
      },
      'أكتوبر': {
        activities: ['أسبوع المسرح التربوي', 'ورشة المسرح العلاجي', 'عروض تعليمية'],
        achievements: ['دمج التعليم والفن', 'مساعدة ذوي الاحتياجات', 'تعلم ممتع']
      },
      'نونبر': {
        activities: ['مهرجان المسرح النسائي', 'ورشة الإضاءة والصوت', 'عرض نسائي'],
        achievements: ['تمكين المرأة', 'تعلم التقنيات', 'إبداع نسائي']
      },
      'دجنبر': {
        activities: ['احتفالية نهاية السنة', 'عرض خيري', 'حفل تكريم المتطوعين'],
        achievements: ['ختام ناجح', 'مساعدة المحتاجين', 'تقدير المتطوعين']
      }
    };
    return suggestions[month] || { activities: [''], achievements: [''] };
  };

  // تحديث البيانات عند تغيير الشهر أو السنة أو اليوم
  const updateReportData = (month: string, year: number, day?: number) => {
    const lastDayOfSelectedMonth = getLastDayOfMonth(month, year);
    const targetDay = day || lastDayOfSelectedMonth;
    const suggestions = getMonthSuggestions(month);

    // تحديث selectedDay إذا تغير الشهر وكان اليوم المختار أكبر من أيام الشهر الجديد
    if (targetDay > lastDayOfSelectedMonth) {
      setSelectedDay(lastDayOfSelectedMonth);
    } else if (day) {
      setSelectedDay(day);
    }

    const finalDay = targetDay > lastDayOfSelectedMonth ? lastDayOfSelectedMonth : targetDay;

    setFormData(prev => ({
      ...prev,
      title: `تقرير شهر ${month} ${year}`,
      date: `${finalDay} ${month} ${year}`,
      summary: `تقرير شامل عن الأنشطة المسرحية المنفذة خلال شهر ${month} ${year}`,
      activities: suggestions.activities,
      achievements: suggestions.achievements
    }));
  };

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

  // دوال للتعامل مع الأنشطة المتقدمة
  const handleActivityWithImagesChange = (index: number, field: keyof ActivityWithImages, value: string) => {
    setFormData(prev => ({
      ...prev,
      activitiesWithImages: prev.activitiesWithImages.map((activity, i) =>
        i === index ? { ...activity, [field]: value } : activity
      )
    }));
  };

  const addActivityWithImages = () => {
    setFormData(prev => ({
      ...prev,
      activitiesWithImages: [...prev.activitiesWithImages, { name: '', description: '', images: [] }]
    }));
  };

  const removeActivityWithImages = (index: number) => {
    if (formData.activitiesWithImages.length > 1) {
      setFormData(prev => ({
        ...prev,
        activitiesWithImages: prev.activitiesWithImages.filter((_, i) => i !== index)
      }));
    }
  };



  const removeImageFromActivity = (activityIndex: number, imageIndex: number) => {
    setFormData(prev => ({
      ...prev,
      activitiesWithImages: prev.activitiesWithImages.map((activity, i) =>
        i === activityIndex ? {
          ...activity,
          images: activity.images.filter((_, imgI) => imgI !== imageIndex)
        } : activity
      )
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.summary.trim()) {
      showNotification('يرجى ملء جميع الحقول المطلوبة', 'error');
      return;
    }

    const newReport: Report = {
      ...formData,
      id: Date.now(),
      activities: formData.activities.filter(activity => activity.trim() !== ''),
      // حفظ الأنشطة المفصلة فقط إذا تم إظهارها
      activitiesWithImages: showDetailedActivities
        ? formData.activitiesWithImages.filter(activity =>
            activity.name.trim() !== '' || activity.description.trim() !== '' || activity.images.length > 0
          )
        : [],
      achievements: formData.achievements.filter(achievement => achievement.trim() !== ''),
      gallery: uploadedImages // التأكد من حفظ الصور
    };



    setReports(prev => [newReport, ...prev]);
    showNotification('تم إنشاء التقرير بنجاح!', 'success');
    
    // الانتقال لصفحة التقارير بعد ثانيتين
    setTimeout(() => {
      navigate('/reports');
    }, 2000);
  };

  const handleCancel = () => {
    navigate('/reports');
  };

  // دالة لضغط الصورة وتحويلها إلى base64 مع معلومات الضغط
  const compressAndConvertToBase64 = (file: File): Promise<{
    base64: string;
    originalDimensions: { width: number; height: number };
    compressedDimensions: { width: number; height: number };
  }> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // حفظ الأبعاد الأصلية
        const originalWidth = img.width;
        const originalHeight = img.height;

        // تحديد الحد الأقصى للأبعاد
        const maxWidth = 800;
        const maxHeight = 600;

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

        canvas.width = width;
        canvas.height = height;

        // رسم الصورة المضغوطة
        ctx?.drawImage(img, 0, 0, width, height);

        // تحويل إلى base64 مع ضغط
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.8);

        resolve({
          base64: compressedBase64,
          originalDimensions: { width: originalWidth, height: originalHeight },
          compressedDimensions: { width: Math.round(width), height: Math.round(height) }
        });
      };

      img.onerror = () => reject(new Error('فشل في تحميل الصورة'));

      // قراءة الملف
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error('فشل في قراءة الملف'));
      reader.readAsDataURL(file);
    });
  };

  // دالة لرفع الصور
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    // تفعيل حالة المعالجة
    setIsProcessingImages(true);

    // إظهار رسالة بدء المعالجة
    showNotification(`🔄 بدء معالجة ${files.length} صورة...`, 'success');

    const newImages: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // التحقق من نوع الملف
      if (!file.type.startsWith('image/')) {
        showNotification('يرجى اختيار ملفات صور فقط', 'error');
        continue;
      }

      // إظهار رسالة للصور الكبيرة
      if (file.size > 5 * 1024 * 1024) {
        showNotification(`📏 الصورة ${file.name} كبيرة (${Math.round(file.size / 1024 / 1024)}MB) - سيتم ضغطها`, 'success');
      }

      try {
        // حساب الحجم الأصلي
        const originalSizeKB = Math.round(file.size / 1024);

        // ضغط الصورة
        const compressionResult = await compressAndConvertToBase64(file);

        // حساب الحجم بعد الضغط (تقريبي)
        const compressedSizeKB = Math.round((compressionResult.base64.length * 3) / 4 / 1024);

        // إظهار رسالة نجاح الضغط مع تفاصيل
        const compressionRatio = Math.round(((originalSizeKB - compressedSizeKB) / originalSizeKB) * 100);
        const { originalDimensions, compressedDimensions } = compressionResult;

        showNotification(
          `✅ تم ضغط ${file.name}:\n` +
          `📏 الأبعاد: ${originalDimensions.width}×${originalDimensions.height} ← ${compressedDimensions.width}×${compressedDimensions.height}\n` +
          `💾 الحجم: ${originalSizeKB}KB ← ${compressedSizeKB}KB (توفير ${compressionRatio}%)`,
          'success'
        );

        newImages.push(compressionResult.base64);
      } catch (error) {
        showNotification(`❌ فشل في ضغط الصورة ${file.name}`, 'error');
      }
    }

    if (newImages.length > 0) {
      setUploadedImages(prev => [...prev, ...newImages]);
      setFormData(prev => ({
        ...prev,
        gallery: [...prev.gallery, ...newImages]
      }));

      // رسالة نهائية
      setTimeout(() => {
        showNotification(
          `🎉 تم الانتهاء من معالجة وضغط ${newImages.length} صورة بنجاح!\n` +
          `📸 إجمالي الصور في المعرض: ${uploadedImages.length + newImages.length}`,
          'success'
        );
      }, 1000);
    } else {
      showNotification('لم يتم رفع أي صورة. تحقق من نوع وحجم الملفات.', 'error');
    }

    // إنهاء حالة المعالجة
    setIsProcessingImages(false);

    // إعادة تعيين input
    event.target.value = '';
  };

  // دالة لرفع صور النشاط المحدد
  const handleActivityImageUpload = async (event: React.ChangeEvent<HTMLInputElement>, activityIndex: number) => {
    const files = event.target.files;
    if (!files) return;

    setIsProcessingImages(true);
    showNotification(`🔄 بدء معالجة ${files.length} صورة للنشاط ${activityIndex + 1}...`, 'success');

    const newImages: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      if (!file.type.startsWith('image/')) {
        showNotification('يرجى اختيار ملفات صور فقط', 'error');
        continue;
      }

      if (file.size > 5 * 1024 * 1024) {
        showNotification(`📏 الصورة ${file.name} كبيرة (${Math.round(file.size / 1024 / 1024)}MB) - سيتم ضغطها`, 'success');
      }

      try {
        const originalSizeKB = Math.round(file.size / 1024);
        const compressionResult = await compressAndConvertToBase64(file);
        const compressedSizeKB = Math.round((compressionResult.base64.length * 3) / 4 / 1024);
        const compressionRatio = Math.round(((originalSizeKB - compressedSizeKB) / originalSizeKB) * 100);
        const { originalDimensions, compressedDimensions } = compressionResult;

        showNotification(
          `✅ تم ضغط ${file.name} للنشاط ${activityIndex + 1}:\n` +
          `📏 ${originalDimensions.width}×${originalDimensions.height} ← ${compressedDimensions.width}×${compressedDimensions.height}\n` +
          `💾 ${originalSizeKB}KB ← ${compressedSizeKB}KB (توفير ${compressionRatio}%)`,
          'success'
        );

        newImages.push(compressionResult.base64);
      } catch (error) {
        showNotification(`❌ فشل في ضغط الصورة ${file.name}`, 'error');
      }
    }

    if (newImages.length > 0) {
      // إضافة الصور للنشاط المحدد
      setFormData(prev => ({
        ...prev,
        activitiesWithImages: prev.activitiesWithImages.map((activity, i) =>
          i === activityIndex ? { ...activity, images: [...activity.images, ...newImages] } : activity
        )
      }));

      setTimeout(() => {
        showNotification(
          `🎉 تم إضافة ${newImages.length} صورة للنشاط ${activityIndex + 1}!`,
          'success'
        );
      }, 1000);
    } else {
      showNotification('لم يتم رفع أي صورة. تحقق من نوع وحجم الملفات.', 'error');
    }

    setIsProcessingImages(false);
    event.target.value = '';
  };

  // دالة لحذف صورة من المعرض
  const removeImage = (index: number) => {
    const newImages = uploadedImages.filter((_, i) => i !== index);
    setUploadedImages(newImages);
    setFormData(prev => ({
      ...prev,
      gallery: newImages
    }));
    showNotification('تم حذف الصورة', 'success');
  };

  return (
    <div className="page">
      <div className="page-header">
        <div className="container">
          <h1>📝 إنشاء تقرير جديد</h1>
          <p>قم بكتابة تقرير مفصل عن الأنشطة والإنجازات</p>
        </div>
      </div>

      <div className="container">
        <div className="create-report-container">
          <form onSubmit={handleSubmit} className="report-form">

            {/* اختيار الشهر والسنة */}
            <div className="form-section">
              <h3>📅 اختيار الشهر والسنة</h3>
              <p className="section-note">
                💡 <strong>ملاحظة:</strong> عند اختيار الشهر والسنة واليوم، سيتم تحديث العنوان والتاريخ والملخص تلقائياً،
                كما ستظهر اقتراحات للأنشطة والإنجازات المناسبة لهذا الشهر. اليوم سيظهر مع اسم اليوم (مثل: 15 - الثلاثاء).
              </p>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="month">
                    <span className="icon">📅</span>
                    الشهر
                  </label>
                  <select
                    id="month"
                    value={selectedMonth}
                    onChange={(e) => {
                      setSelectedMonth(e.target.value);
                      updateReportData(e.target.value, selectedYear);
                    }}
                  >
                    {['يناير', 'فبراير', 'مارس', 'أبريل', 'ماي', 'يونيو',
                      'يوليوز', 'غشت', 'شتنبر', 'أكتوبر', 'نونبر', 'دجنبر'].map(month => (
                      <option key={month} value={month}>{month}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="year">
                    <span className="icon">🗓️</span>
                    السنة
                  </label>
                  <select
                    id="year"
                    value={selectedYear}
                    onChange={(e) => {
                      const year = parseInt(e.target.value);
                      setSelectedYear(year);
                      updateReportData(selectedMonth, year);
                    }}
                  >
                    {Array.from({length: 5}, (_, i) => currentYear - 2 + i).map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="day">
                  <span className="icon">📆</span>
                  اليوم
                </label>
                <select
                  id="day"
                  value={selectedDay}
                  onChange={(e) => {
                    const day = parseInt(e.target.value);
                    setSelectedDay(day);
                    updateReportData(selectedMonth, selectedYear, day);
                  }}
                >
                  {getDaysOfMonth(selectedMonth, selectedYear).map(dayInfo => (
                    <option key={dayInfo.value} value={dayInfo.value}>
                      {dayInfo.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* معلومات أساسية */}
            <div className="form-section">
              <h3>📋 المعلومات الأساسية</h3>

              <div className="form-group">
                <label>
                  <span className="icon">📅</span>
                  التاريخ المختار
                </label>
                <div className="date-display">
                  {formData.date} - {getDayName(selectedDay, selectedMonth, selectedYear)}
                </div>
              </div>

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




            </div>

            {/* ملخص التقرير */}
            <div className="form-section">
              <h3>📝 ملخص التقرير</h3>
              <div className="form-group">
                <label htmlFor="summary">
                  <span className="icon">📄</span>
                  ملخص مفصل
                </label>
                <textarea
                  id="summary"
                  value={formData.summary}
                  onChange={(e) => handleInputChange('summary', e.target.value)}
                  placeholder="اكتب ملخصاً مفصلاً عن التقرير..."
                  rows={6}
                  required
                />
              </div>
            </div>

            {/* النشاط الرئيسي */}
            <div className="form-section">
              <h3>🎯 النشاط الرئيسي</h3>
              <div className="form-group">
                <label>
                  <span className="icon">🎪</span>
                  وصف النشاط الرئيسي
                </label>
                <input
                  type="text"
                  value={formData.activities[0] || ''}
                  onChange={(e) => {
                    const newActivities = [...formData.activities];
                    newActivities[0] = e.target.value;
                    setFormData(prev => ({ ...prev, activities: newActivities }));
                  }}
                  placeholder="اكتب وصف النشاط الرئيسي..."
                />
              </div>

              {/* زر إظهار الأنشطة المفصلة */}
              <div className="additional-activities-toggle">
                <button
                  type="button"
                  onClick={() => setShowDetailedActivities(!showDetailedActivities)}
                  className={`btn-toggle-activities ${showDetailedActivities ? 'active' : ''}`}
                >
                  {showDetailedActivities ? '🔼 إخفاء الأنشطة الأخرى' : '🔽 النشاط الآخر'}
                </button>
              </div>
            </div>

            {/* الأنشطة المفصلة مع الصور - تظهر عند الضغط على الزر */}
            {showDetailedActivities && (
            <div className="form-section detailed-activities-section">
              <h3>🎭 الأنشطة المفصلة مع الصور</h3>
              <p className="section-note">
                🎪 <strong>ملاحظة:</strong> هنا يمكنك إضافة تفاصيل كل نشاط مع صوره الخاصة.
                كل نشاط له اسم ووصف ومجموعة صور منفصلة.
              </p>

              {formData.activitiesWithImages.map((activity, activityIndex) => (
                <div key={activityIndex} className="activity-with-images">
                  <div className="activity-header">
                    <h4>🎪 النشاط {activityIndex + 1}</h4>
                    <button
                      type="button"
                      onClick={() => removeActivityWithImages(activityIndex)}
                      className="btn-remove"
                      disabled={formData.activitiesWithImages.length === 1}
                      title="حذف النشاط"
                    >
                      🗑️
                    </button>
                  </div>

                  <div className="form-group">
                    <label>
                      <span className="icon">🎭</span>
                      اسم النشاط
                    </label>
                    <input
                      type="text"
                      value={activity.name}
                      onChange={(e) => handleActivityWithImagesChange(activityIndex, 'name', e.target.value)}
                      placeholder="مثال: عرض مسرحي - حلم ليلة صيف"
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      <span className="icon">📝</span>
                      وصف النشاط
                    </label>
                    <textarea
                      value={activity.description}
                      onChange={(e) => handleActivityWithImagesChange(activityIndex, 'description', e.target.value)}
                      placeholder="اكتب وصفاً مفصلاً عن النشاط، المشاركين، المكان، والنتائج..."
                      rows={3}
                    />
                  </div>

                  <div className="activity-images">
                    <h5>📸 صور النشاط ({activity.images.length})</h5>
                    {activity.images.length > 0 ? (
                      <ActivityImageSlider
                        images={activity.images}
                        activityIndex={activityIndex}
                        onRemoveImage={removeImageFromActivity}
                      />
                    ) : (
                      <div className="no-images">
                        📷 لا توجد صور لهذا النشاط بعد
                      </div>
                    )}

                    <label className="activity-image-upload-btn">
                      <span className="icon">📷</span>
                      إضافة صور لهذا النشاط
                      <input
                        type="file"
                        multiple
                        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                        onChange={(e) => handleActivityImageUpload(e, activityIndex)}
                        style={{ display: 'none' }}
                      />
                    </label>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={addActivityWithImages}
                className="btn-add-activity"
              >
                ➕ إضافة نشاط مفصل
              </button>
            </div>
            )}

            {/* الإنجازات المحققة */}
            <div className="form-section">
              <h3>🏆 الإنجازات المحققة</h3>
              {formData.achievements.map((achievement, index) => (
                <div key={index} className="form-group array-item">
                  <label>
                    <span className="icon">🎖️</span>
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
                📸 <strong>ملاحظة:</strong> يمكنك رفع عدة صور من جهازك (أقل من 5MB لكل صورة).
                الصور المدعومة: JPG, PNG, GIF, WebP. سيتم ضغط الصور تلقائياً إلى 800x600 بكسل لتحسين الأداء.
              </p>

              <div className="image-upload-section">
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
                <p style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: '#6b7280' }}>
                  الصور المرفوعة حالياً: {uploadedImages.length}
                  {isProcessingImages && (
                    <span style={{ color: '#f59e0b', marginLeft: '0.5rem' }}>
                      🔄 جاري المعالجة...
                    </span>
                  )}
                </p>
              </div>

              {uploadedImages.length > 0 && (
                <div className="image-gallery">
                  <h4>الصور المرفوعة ({uploadedImages.length})</h4>
                  <CreateReportImageSlider
                    images={uploadedImages}
                    onRemoveImage={removeImage}
                  />
                </div>
              )}
            </div>

            {/* أزرار التحكم */}
            <div className="form-actions">
              <button type="button" onClick={handleCancel} className="btn-cancel">
                ❌ إلغاء
              </button>
              <button type="submit" className="btn-submit">
                💾 حفظ التقرير
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

export default CreateReport;
