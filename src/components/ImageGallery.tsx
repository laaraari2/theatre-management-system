import React, { useState, useEffect, useRef } from 'react';
import './ImageGallery.css';

interface GalleryImage {
  id: string;
  src: string;
  thumbnail: string;
  title: string;
  description?: string;
  category: string;
  date: string;
  photographer?: string;
  tags: string[];
}

interface ImageGalleryProps {
  images: GalleryImage[];
  onClose: () => void;
  activityTitle?: string;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({
  images,
  onClose,
  activityTitle = "معرض الصور"
}) => {
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [filter, setFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'masonry' | 'carousel'>('grid');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isSlideshow, setIsSlideshow] = useState(false);
  const slideshowRef = useRef<NodeJS.Timeout | null>(null);

  // تصفية الصور
  const filteredImages = images.filter(image => {
    const matchesFilter = filter === 'all' || image.category === filter;
    const matchesSearch = searchTerm === '' || 
      image.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      image.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      image.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesFilter && matchesSearch;
  });

  // الحصول على الفئات المتاحة
  const categories = ['all', ...Array.from(new Set(images.map(img => img.category)))];

  // فتح الصورة في Lightbox
  const openLightbox = (image: GalleryImage, index: number) => {
    setSelectedImage(image);
    setCurrentIndex(index);
    setZoomLevel(1);
  };

  // إغلاق Lightbox
  const closeLightbox = () => {
    setSelectedImage(null);
    setIsFullscreen(false);
    setZoomLevel(1);
    stopSlideshow();
  };

  // الانتقال للصورة التالية
  const nextImage = () => {
    const nextIndex = (currentIndex + 1) % filteredImages.length;
    setCurrentIndex(nextIndex);
    setSelectedImage(filteredImages[nextIndex]);
    setZoomLevel(1);
  };

  // الانتقال للصورة السابقة
  const prevImage = () => {
    const prevIndex = currentIndex === 0 ? filteredImages.length - 1 : currentIndex - 1;
    setCurrentIndex(prevIndex);
    setSelectedImage(filteredImages[prevIndex]);
    setZoomLevel(1);
  };

  // تبديل الشاشة الكاملة
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // التحكم في التكبير
  const handleZoom = (direction: 'in' | 'out' | 'reset') => {
    switch (direction) {
      case 'in':
        setZoomLevel(prev => Math.min(prev + 0.25, 3));
        break;
      case 'out':
        setZoomLevel(prev => Math.max(prev - 0.25, 0.5));
        break;
      case 'reset':
        setZoomLevel(1);
        break;
    }
  };

  // بدء/إيقاف العرض التلقائي
  const toggleSlideshow = () => {
    if (isSlideshow) {
      stopSlideshow();
    } else {
      startSlideshow();
    }
  };

  const startSlideshow = () => {
    setIsSlideshow(true);
    slideshowRef.current = setInterval(() => {
      nextImage();
    }, 3000);
  };

  const stopSlideshow = () => {
    setIsSlideshow(false);
    if (slideshowRef.current) {
      clearInterval(slideshowRef.current);
      slideshowRef.current = null;
    }
  };

  // التحكم بلوحة المفاتيح
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!selectedImage) return;

      switch (e.key) {
        case 'ArrowRight':
          nextImage();
          break;
        case 'ArrowLeft':
          prevImage();
          break;
        case 'Escape':
          closeLightbox();
          break;
        case 'f':
        case 'F':
          toggleFullscreen();
          break;
        case '+':
        case '=':
          handleZoom('in');
          break;
        case '-':
          handleZoom('out');
          break;
        case '0':
          handleZoom('reset');
          break;
        case ' ':
          e.preventDefault();
          toggleSlideshow();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [selectedImage, currentIndex, isSlideshow]);

  // تنظيف العرض التلقائي عند الإغلاق
  useEffect(() => {
    return () => {
      if (slideshowRef.current) {
        clearInterval(slideshowRef.current);
      }
    };
  }, []);

  // مشاركة الصورة
  const shareImage = async (image: GalleryImage) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: image.title,
          text: image.description || '',
          url: window.location.href
        });
      } catch (error) {
        console.log('مشاركة ملغاة');
      }
    } else {
      // نسخ الرابط
      navigator.clipboard.writeText(window.location.href);
      alert('تم نسخ الرابط!');
    }
  };

  // تحميل الصورة
  const downloadImage = (image: GalleryImage) => {
    const link = document.createElement('a');
    link.href = image.src;
    link.download = `${image.title}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="image-gallery-overlay">
      <div className="image-gallery-container">
        {/* Header */}
        <div className="gallery-header">
          <h3>📸 {activityTitle}</h3>
          <div className="gallery-controls">
            <div className="search-box">
              <input
                type="text"
                placeholder="🔍 البحث في الصور..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="category-filter"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'جميع الفئات' : category}
                </option>
              ))}
            </select>
            <div className="view-mode-buttons">
              <button
                className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
                title="عرض شبكي"
              >
                ⊞
              </button>
              <button
                className={`view-btn ${viewMode === 'masonry' ? 'active' : ''}`}
                onClick={() => setViewMode('masonry')}
                title="عرض متدرج"
              >
                ⊟
              </button>
              <button
                className={`view-btn ${viewMode === 'carousel' ? 'active' : ''}`}
                onClick={() => setViewMode('carousel')}
                title="عرض دائري"
              >
                ◐
              </button>
            </div>
            <button className="close-btn" onClick={onClose}>✕</button>
          </div>
        </div>

        {/* Gallery Content */}
        <div className={`gallery-content ${viewMode}`}>
          {filteredImages.length === 0 ? (
            <div className="no-images">
              <div className="no-images-icon">📷</div>
              <p>لا توجد صور متطابقة</p>
              <small>جرب تغيير الفلتر أو البحث</small>
            </div>
          ) : (
            <div className={`images-container ${viewMode}`}>
              {filteredImages.map((image, index) => (
                <div
                  key={image.id}
                  className="image-item"
                  onClick={() => openLightbox(image, index)}
                >
                  <div className="image-wrapper">
                    <img
                      src={image.thumbnail}
                      alt={image.title}
                      loading="lazy"
                    />
                    <div className="image-overlay">
                      <div className="image-info">
                        <h4>{image.title}</h4>
                        {image.description && (
                          <p>{image.description}</p>
                        )}
                        <div className="image-meta">
                          <span className="image-date">📅 {image.date}</span>
                          {image.photographer && (
                            <span className="photographer">📷 {image.photographer}</span>
                          )}
                        </div>
                      </div>
                      <div className="image-actions">
                        <button
                          className="action-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            shareImage(image);
                          }}
                          title="مشاركة"
                        >
                          📤
                        </button>
                        <button
                          className="action-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            downloadImage(image);
                          }}
                          title="تحميل"
                        >
                          💾
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="image-tags">
                    {image.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="tag">#{tag}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Gallery Stats */}
        <div className="gallery-stats">
          <span>📊 {filteredImages.length} من {images.length} صورة</span>
          <span>🏷️ {categories.length - 1} فئة</span>
        </div>
      </div>

      {/* Lightbox */}
      {selectedImage && (
        <div className={`lightbox-overlay ${isFullscreen ? 'fullscreen' : ''}`}>
          <div className="lightbox-container">
            <div className="lightbox-header">
              <div className="lightbox-info">
                <h4>{selectedImage.title}</h4>
                <span>{currentIndex + 1} / {filteredImages.length}</span>
              </div>
              <div className="lightbox-controls">
                <button
                  className={`control-btn ${isSlideshow ? 'active' : ''}`}
                  onClick={toggleSlideshow}
                  title={isSlideshow ? 'إيقاف العرض التلقائي' : 'بدء العرض التلقائي'}
                >
                  {isSlideshow ? '⏸️' : '▶️'}
                </button>
                <button
                  className="control-btn"
                  onClick={() => handleZoom('out')}
                  title="تصغير"
                >
                  🔍-
                </button>
                <span className="zoom-level">{Math.round(zoomLevel * 100)}%</span>
                <button
                  className="control-btn"
                  onClick={() => handleZoom('in')}
                  title="تكبير"
                >
                  🔍+
                </button>
                <button
                  className="control-btn"
                  onClick={() => handleZoom('reset')}
                  title="إعادة تعيين"
                >
                  🎯
                </button>
                <button
                  className="control-btn"
                  onClick={toggleFullscreen}
                  title="شاشة كاملة"
                >
                  {isFullscreen ? '🗗' : '🗖'}
                </button>
                <button
                  className="control-btn"
                  onClick={() => shareImage(selectedImage)}
                  title="مشاركة"
                >
                  📤
                </button>
                <button
                  className="control-btn"
                  onClick={() => downloadImage(selectedImage)}
                  title="تحميل"
                >
                  💾
                </button>
                <button className="control-btn close" onClick={closeLightbox}>✕</button>
              </div>
            </div>

            <div className="lightbox-content">
              <button className="nav-btn prev" onClick={prevImage}>‹</button>
              <div className="image-container">
                <img
                  src={selectedImage.src}
                  alt={selectedImage.title}
                  style={{ transform: `scale(${zoomLevel})` }}
                  className="lightbox-image"
                />
              </div>
              <button className="nav-btn next" onClick={nextImage}>›</button>
            </div>

            <div className="lightbox-footer">
              <div className="image-details">
                {selectedImage.description && (
                  <p className="image-description">{selectedImage.description}</p>
                )}
                <div className="image-metadata">
                  <span>📅 {selectedImage.date}</span>
                  {selectedImage.photographer && (
                    <span>📷 {selectedImage.photographer}</span>
                  )}
                  <span>🏷️ {selectedImage.category}</span>
                </div>
                <div className="image-tags-full">
                  {selectedImage.tags.map(tag => (
                    <span key={tag} className="tag">#{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageGallery;
