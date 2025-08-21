import React, { useState, useEffect } from 'react';
import './RatingSystem.css';

interface Rating {
  id: string;
  activityId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  timestamp: Date;
  helpful: number;
  categories: {
    performance: number;
    organization: number;
    creativity: number;
    participation: number;
  };
}

interface RatingSystemProps {
  activityId: string;
  activityTitle: string;
  onClose: () => void;
  onRatingSubmit: (rating: Rating) => void;
}

const RatingSystem: React.FC<RatingSystemProps> = ({
  activityId,
  activityTitle,
  onClose,
  onRatingSubmit
}) => {
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [currentRating, setCurrentRating] = useState({
    overall: 0,
    performance: 0,
    organization: 0,
    creativity: 0,
    participation: 0
  });
  const [comment, setComment] = useState('');
  const [userName, setUserName] = useState('');
  const [hoveredStar, setHoveredStar] = useState<{category: string, value: number} | null>(null);
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [filterBy, setFilterBy] = useState<'all' | 'recent' | 'highest' | 'lowest'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'rating' | 'helpful'>('newest');

  // تحميل التقييمات المحفوظة
  useEffect(() => {
    const savedRatings = localStorage.getItem(`ratings_${activityId}`);
    if (savedRatings) {
      setRatings(JSON.parse(savedRatings));
    }
  }, [activityId]);

  // حفظ التقييمات
  const saveRatings = (newRatings: Rating[]) => {
    localStorage.setItem(`ratings_${activityId}`, JSON.stringify(newRatings));
    setRatings(newRatings);
  };

  // حساب المتوسط العام
  const getAverageRating = (): string => {
    if (ratings.length === 0) return '0';
    const sum = ratings.reduce((acc, rating) => acc + rating.rating, 0);
    return (sum / ratings.length).toFixed(1);
  };

  // حساب متوسط كل فئة
  const getCategoryAverage = (category: keyof Rating['categories']): string => {
    if (ratings.length === 0) return '0';
    const sum = ratings.reduce((acc, rating) => acc + rating.categories[category], 0);
    return (sum / ratings.length).toFixed(1);
  };

  // إرسال التقييم
  const handleSubmitRating = () => {
    if (!userName.trim() || currentRating.overall === 0) {
      alert('يرجى إدخال اسمك وتقييم عام للنشاط');
      return;
    }

    const newRating: Rating = {
      id: Date.now().toString(),
      activityId,
      userId: Date.now().toString(),
      userName: userName.trim(),
      rating: currentRating.overall,
      comment: comment.trim(),
      timestamp: new Date(),
      helpful: 0,
      categories: {
        performance: currentRating.performance,
        organization: currentRating.organization,
        creativity: currentRating.creativity,
        participation: currentRating.participation
      }
    };

    const updatedRatings = [...ratings, newRating];
    saveRatings(updatedRatings);
    onRatingSubmit(newRating);

    // إعادة تعيين النموذج
    setCurrentRating({
      overall: 0,
      performance: 0,
      organization: 0,
      creativity: 0,
      participation: 0
    });
    setComment('');
    setUserName('');
    setShowSubmitForm(false);
  };

  // تصفية وترتيب التقييمات
  const getFilteredAndSortedRatings = () => {
    let filtered = [...ratings];

    // التصفية
    switch (filterBy) {
      case 'recent':
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        filtered = filtered.filter(rating => new Date(rating.timestamp) > weekAgo);
        break;
      case 'highest':
        filtered = filtered.filter(rating => rating.rating >= 4);
        break;
      case 'lowest':
        filtered = filtered.filter(rating => rating.rating <= 2);
        break;
    }

    // الترتيب
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'helpful':
        filtered.sort((a, b) => b.helpful - a.helpful);
        break;
    }

    return filtered;
  };

  // تقييم التعليق كمفيد
  const markAsHelpful = (ratingId: string) => {
    const updatedRatings = ratings.map(rating =>
      rating.id === ratingId
        ? { ...rating, helpful: rating.helpful + 1 }
        : rating
    );
    saveRatings(updatedRatings);
  };

  // رسم النجوم
  const renderStars = (
    category: string,
    value: number,
    onChange?: (value: number) => void,
    size: 'small' | 'medium' | 'large' = 'medium'
  ) => {
    const isInteractive = !!onChange;
    const displayValue = hoveredStar?.category === category ? hoveredStar.value : value;

    return (
      <div className={`stars-container ${size} ${isInteractive ? 'interactive' : ''}`}>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            className={`star ${star <= displayValue ? 'filled' : ''}`}
            onClick={() => onChange && onChange(star)}
            onMouseEnter={() => isInteractive && setHoveredStar({category, value: star})}
            onMouseLeave={() => isInteractive && setHoveredStar(null)}
            disabled={!isInteractive}
          >
            ⭐
          </button>
        ))}
      </div>
    );
  };

  const getRatingText = (rating: number) => {
    if (rating >= 4.5) return 'ممتاز';
    if (rating >= 3.5) return 'جيد جداً';
    if (rating >= 2.5) return 'جيد';
    if (rating >= 1.5) return 'مقبول';
    return 'ضعيف';
  };

  const getTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(timestamp).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor(diff / (1000 * 60));

    if (days > 0) return `منذ ${days} يوم`;
    if (hours > 0) return `منذ ${hours} ساعة`;
    if (minutes > 0) return `منذ ${minutes} دقيقة`;
    return 'الآن';
  };

  const filteredRatings = getFilteredAndSortedRatings();

  return (
    <div className="rating-system-overlay">
      <div className="rating-system-panel">
        <div className="rating-header">
          <h3>⭐ تقييم النشاط</h3>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="activity-info">
          <h4>🎭 {activityTitle}</h4>
          <div className="overall-rating">
            <div className="rating-display">
              <span className="rating-number">{getAverageRating()}</span>
              {renderStars('display', parseFloat(getAverageRating()), undefined, 'large')}
              <span className="rating-text">({getRatingText(parseFloat(getAverageRating()))})</span>
            </div>
            <div className="rating-count">
              {ratings.length} تقييم
            </div>
          </div>
        </div>

        <div className="categories-overview">
          <div className="category-item">
            <span className="category-label">🎭 الأداء</span>
            <div className="category-rating">
              {renderStars('performance-display', parseFloat(getCategoryAverage('performance')), undefined, 'small')}
              <span>{getCategoryAverage('performance')}</span>
            </div>
          </div>
          <div className="category-item">
            <span className="category-label">📋 التنظيم</span>
            <div className="category-rating">
              {renderStars('organization-display', parseFloat(getCategoryAverage('organization')), undefined, 'small')}
              <span>{getCategoryAverage('organization')}</span>
            </div>
          </div>
          <div className="category-item">
            <span className="category-label">🎨 الإبداع</span>
            <div className="category-rating">
              {renderStars('creativity-display', parseFloat(getCategoryAverage('creativity')), undefined, 'small')}
              <span>{getCategoryAverage('creativity')}</span>
            </div>
          </div>
          <div className="category-item">
            <span className="category-label">👥 المشاركة</span>
            <div className="category-rating">
              {renderStars('participation-display', parseFloat(getCategoryAverage('participation')), undefined, 'small')}
              <span>{getCategoryAverage('participation')}</span>
            </div>
          </div>
        </div>

        <div className="rating-actions">
          <button
            className="add-rating-btn"
            onClick={() => setShowSubmitForm(!showSubmitForm)}
          >
            {showSubmitForm ? '🔙 إلغاء' : '➕ إضافة تقييم'}
          </button>
        </div>

        {showSubmitForm && (
          <div className="submit-rating-form">
            <div className="form-group">
              <label>الاسم:</label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="أدخل اسمك"
                maxLength={50}
              />
            </div>

            <div className="form-group">
              <label>التقييم العام:</label>
              {renderStars('overall', currentRating.overall, (value) => 
                setCurrentRating(prev => ({...prev, overall: value}))
              )}
            </div>

            <div className="categories-rating">
              <div className="category-rating-item">
                <label>🎭 الأداء:</label>
                {renderStars('performance', currentRating.performance, (value) => 
                  setCurrentRating(prev => ({...prev, performance: value}))
                )}
              </div>
              <div className="category-rating-item">
                <label>📋 التنظيم:</label>
                {renderStars('organization', currentRating.organization, (value) => 
                  setCurrentRating(prev => ({...prev, organization: value}))
                )}
              </div>
              <div className="category-rating-item">
                <label>🎨 الإبداع:</label>
                {renderStars('creativity', currentRating.creativity, (value) => 
                  setCurrentRating(prev => ({...prev, creativity: value}))
                )}
              </div>
              <div className="category-rating-item">
                <label>👥 المشاركة:</label>
                {renderStars('participation', currentRating.participation, (value) => 
                  setCurrentRating(prev => ({...prev, participation: value}))
                )}
              </div>
            </div>

            <div className="form-group">
              <label>التعليق (اختياري):</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="شاركنا رأيك في النشاط..."
                maxLength={500}
                rows={3}
              />
              <small>{comment.length}/500</small>
            </div>

            <button className="submit-btn" onClick={handleSubmitRating}>
              📝 إرسال التقييم
            </button>
          </div>
        )}

        <div className="ratings-filters">
          <div className="filter-group">
            <label>تصفية:</label>
            <select value={filterBy} onChange={(e) => setFilterBy(e.target.value as any)}>
              <option value="all">جميع التقييمات</option>
              <option value="recent">الأسبوع الماضي</option>
              <option value="highest">تقييم عالي (4+)</option>
              <option value="lowest">تقييم منخفض (2-)</option>
            </select>
          </div>
          <div className="filter-group">
            <label>ترتيب:</label>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)}>
              <option value="newest">الأحدث</option>
              <option value="oldest">الأقدم</option>
              <option value="rating">التقييم</option>
              <option value="helpful">الأكثر فائدة</option>
            </select>
          </div>
        </div>

        <div className="ratings-list">
          {filteredRatings.length === 0 ? (
            <div className="no-ratings">
              <div className="no-ratings-icon">📝</div>
              <p>لا توجد تقييمات بعد</p>
              <small>كن أول من يقيم هذا النشاط!</small>
            </div>
          ) : (
            filteredRatings.map((rating) => (
              <div key={rating.id} className="rating-item">
                <div className="rating-item-header">
                  <div className="user-info">
                    <span className="user-name">👤 {rating.userName}</span>
                    <span className="rating-time">{getTimeAgo(rating.timestamp)}</span>
                  </div>
                  <div className="rating-stars">
                    {renderStars(`rating-${rating.id}`, rating.rating, undefined, 'small')}
                  </div>
                </div>
                
                {rating.comment && (
                  <div className="rating-comment">
                    "{rating.comment}"
                  </div>
                )}

                <div className="rating-categories">
                  <div className="mini-category">
                    <span>🎭</span>
                    {renderStars(`perf-${rating.id}`, rating.categories.performance, undefined, 'small')}
                  </div>
                  <div className="mini-category">
                    <span>📋</span>
                    {renderStars(`org-${rating.id}`, rating.categories.organization, undefined, 'small')}
                  </div>
                  <div className="mini-category">
                    <span>🎨</span>
                    {renderStars(`crea-${rating.id}`, rating.categories.creativity, undefined, 'small')}
                  </div>
                  <div className="mini-category">
                    <span>👥</span>
                    {renderStars(`part-${rating.id}`, rating.categories.participation, undefined, 'small')}
                  </div>
                </div>

                <div className="rating-actions">
                  <button
                    className="helpful-btn"
                    onClick={() => markAsHelpful(rating.id)}
                  >
                    👍 مفيد ({rating.helpful})
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default RatingSystem;
