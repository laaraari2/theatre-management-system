import React, { useState, useEffect, useRef } from 'react';
import './AdvancedSearch.css';

interface SearchResult {
  id: string;
  title: string;
  content: string;
  type: 'activity' | 'report' | 'program' | 'holiday' | 'national-day';
  category: string;
  date: string;
  tags: string[];
  relevance: number;
  url: string;
}

interface AdvancedSearchProps {
  data: any[];
  onClose: () => void;
  onResultSelect: (result: SearchResult) => void;
}

const AdvancedSearch: React.FC<AdvancedSearchProps> = ({
  data: _data,
  onClose,
  onResultSelect
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [filters, setFilters] = useState({
    type: 'all',
    category: 'all',
    dateRange: 'all',
    sortBy: 'relevance'
  });
  const [isSearching, setIsSearching] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // كلمات مفتاحية للاقتراحات
  const keywords = [
    'مسرح', 'عرض', 'ورشة', 'تدريب', 'مهرجان', 'احتفال',
    'طلاب', 'معلمين', 'أولياء', 'مجتمع', 'إبداع', 'فن',
    'تراث', 'ثقافة', 'تعليم', 'ترفيه', 'موسيقى', 'رقص'
  ];

  // تحميل تاريخ البحث
  useEffect(() => {
    const savedHistory = localStorage.getItem('search_history');
    if (savedHistory) {
      setSearchHistory(JSON.parse(savedHistory));
    }
  }, []);

  // حفظ تاريخ البحث
  const saveSearchHistory = (searchTerm: string) => {
    if (searchTerm.trim() === '') return;
    
    const newHistory = [searchTerm, ...searchHistory.filter(h => h !== searchTerm)].slice(0, 10);
    setSearchHistory(newHistory);
    localStorage.setItem('search_history', JSON.stringify(newHistory));
  };

  // إنشاء الاقتراحات
  const generateSuggestions = (input: string) => {
    if (input.length < 2) {
      setSuggestions([]);
      return;
    }

    const inputLower = input.toLowerCase();
    const keywordSuggestions = keywords
      .filter(keyword => keyword.includes(inputLower))
      .slice(0, 5);
    
    const historySuggestions = searchHistory
      .filter(term => term.toLowerCase().includes(inputLower))
      .slice(0, 3);

    const allSuggestions = [...keywordSuggestions, ...historySuggestions];
    const uniqueSuggestions = allSuggestions.filter((item, index) => allSuggestions.indexOf(item) === index);
    setSuggestions(uniqueSuggestions);
  };

  // البحث الذكي
  const performSearch = (searchTerm: string) => {
    if (searchTerm.trim() === '') {
      setResults([]);
      return;
    }

    setIsSearching(true);
    saveSearchHistory(searchTerm);

    // محاكاة البحث (في التطبيق الحقيقي ستكون API call)
    setTimeout(() => {
      const searchResults = mockSearch(searchTerm);
      setResults(searchResults);
      setIsSearching(false);
    }, 500);
  };

  // محاكاة البحث
  const mockSearch = (term: string): SearchResult[] => {
    const mockData: SearchResult[] = [
      {
        id: '1',
        title: 'ورشة المسرح التفاعلي',
        content: 'ورشة تدريبية متخصصة في تقنيات المسرح التفاعلي للطلاب',
        type: 'activity',
        category: 'ورش',
        date: '2025-01-15',
        tags: ['مسرح', 'تفاعلي', 'ورشة', 'طلاب'],
        relevance: 95,
        url: '/program'
      },
      {
        id: '2',
        title: 'عرض مسرحي: حكايات الخريف',
        content: 'عرض مسرحي موسمي يقدمه طلاب المرحلة الابتدائية',
        type: 'activity',
        category: 'عروض',
        date: '2025-10-25',
        tags: ['عرض', 'مسرحي', 'خريف', 'ابتدائي'],
        relevance: 88,
        url: '/reports'
      },
      {
        id: '3',
        title: 'تقرير مهرجان المسرح المدرسي',
        content: 'تقرير شامل عن فعاليات مهرجان المسرح المدرسي السنوي',
        type: 'report',
        category: 'تقارير',
        date: '2024-12-20',
        tags: ['مهرجان', 'مسرح', 'مدرسي', 'تقرير'],
        relevance: 82,
        url: '/reports'
      },
      {
        id: '4',
        title: 'البرنامج الأسبوعي للأنشطة',
        content: 'جدول الحصص والأنشطة المسرحية الأسبوعية لجميع المراحل',
        type: 'program',
        category: 'برامج',
        date: '2025-01-01',
        tags: ['برنامج', 'أسبوعي', 'حصص', 'مراحل'],
        relevance: 75,
        url: '/weekly'
      }
    ];

    // تصفية النتائج حسب البحث والفلاتر
    return mockData
      .filter(item => {
        const matchesQuery = item.title.toLowerCase().includes(term.toLowerCase()) ||
                           item.content.toLowerCase().includes(term.toLowerCase()) ||
                           item.tags.some(tag => tag.toLowerCase().includes(term.toLowerCase()));
        
        const matchesType = filters.type === 'all' || item.type === filters.type;
        const matchesCategory = filters.category === 'all' || item.category === filters.category;
        
        return matchesQuery && matchesType && matchesCategory;
      })
      .sort((a, b) => {
        switch (filters.sortBy) {
          case 'relevance':
            return b.relevance - a.relevance;
          case 'date':
            return new Date(b.date).getTime() - new Date(a.date).getTime();
          case 'title':
            return a.title.localeCompare(b.title);
          default:
            return 0;
        }
      });
  };

  // التحكم بلوحة المفاتيح
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0) {
          setQuery(suggestions[highlightedIndex]);
          performSearch(suggestions[highlightedIndex]);
          setSuggestions([]);
        } else {
          performSearch(query);
        }
        break;
      case 'Escape':
        setSuggestions([]);
        setHighlightedIndex(-1);
        break;
    }
  };

  // تمييز النص في النتائج
  const highlightText = (text: string, searchTerm: string) => {
    if (!searchTerm) return text;
    
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="highlight">{part}</mark>
      ) : part
    );
  };

  // الحصول على أيقونة النوع
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'activity': return '🎭';
      case 'report': return '📊';
      case 'program': return '📅';
      case 'holiday': return '🏖️';
      case 'national-day': return '🇲🇦';
      default: return '📄';
    }
  };

  // الحصول على لون الصلة
  const getRelevanceColor = (relevance: number) => {
    if (relevance >= 90) return '#4CAF50';
    if (relevance >= 70) return '#FF9800';
    if (relevance >= 50) return '#2196F3';
    return '#9E9E9E';
  };

  useEffect(() => {
    generateSuggestions(query);
  }, [query]);

  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  return (
    <div className="advanced-search-overlay">
      <div className="advanced-search-container">
        {/* Header */}
        <div className="search-header">
          <h3>🔍 البحث المتقدم</h3>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        {/* Search Input */}
        <div className="search-input-container">
          <div className="search-input-wrapper">
            <input
              ref={searchInputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="ابحث في الأنشطة والتقارير والبرامج..."
              className="search-input"
            />
            <button
              className="search-btn"
              onClick={() => performSearch(query)}
              disabled={isSearching}
            >
              {isSearching ? '⏳' : '🔍'}
            </button>
          </div>

          {/* Suggestions */}
          {suggestions.length > 0 && (
            <div className="suggestions-dropdown">
              {suggestions.map((suggestion, index) => (
                <div
                  key={suggestion}
                  className={`suggestion-item ${index === highlightedIndex ? 'highlighted' : ''}`}
                  onClick={() => {
                    setQuery(suggestion);
                    performSearch(suggestion);
                    setSuggestions([]);
                  }}
                >
                  <span className="suggestion-icon">💡</span>
                  {suggestion}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Advanced Filters */}
        <div className="filters-section">
          <button
            className="toggle-advanced"
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            {showAdvanced ? '🔼' : '🔽'} فلاتر متقدمة
          </button>

          {showAdvanced && (
            <div className="advanced-filters">
              <div className="filter-group">
                <label>النوع:</label>
                <select
                  value={filters.type}
                  onChange={(e) => setFilters(prev => ({...prev, type: e.target.value}))}
                >
                  <option value="all">جميع الأنواع</option>
                  <option value="activity">أنشطة</option>
                  <option value="report">تقارير</option>
                  <option value="program">برامج</option>
                  <option value="holiday">عطل</option>
                  <option value="national-day">مناسبات وطنية</option>
                </select>
              </div>

              <div className="filter-group">
                <label>الفئة:</label>
                <select
                  value={filters.category}
                  onChange={(e) => setFilters(prev => ({...prev, category: e.target.value}))}
                >
                  <option value="all">جميع الفئات</option>
                  <option value="ورش">ورش</option>
                  <option value="عروض">عروض</option>
                  <option value="تقارير">تقارير</option>
                  <option value="برامج">برامج</option>
                </select>
              </div>

              <div className="filter-group">
                <label>الترتيب:</label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => setFilters(prev => ({...prev, sortBy: e.target.value}))}
                >
                  <option value="relevance">الصلة</option>
                  <option value="date">التاريخ</option>
                  <option value="title">العنوان</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Search History */}
        {searchHistory.length > 0 && query === '' && (
          <div className="search-history">
            <h4>🕒 عمليات البحث الأخيرة</h4>
            <div className="history-items">
              {searchHistory.slice(0, 5).map((term, index) => (
                <button
                  key={index}
                  className="history-item"
                  onClick={() => {
                    setQuery(term);
                    performSearch(term);
                  }}
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Search Results */}
        <div className="search-results">
          {isSearching ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>جاري البحث...</p>
            </div>
          ) : results.length > 0 ? (
            <>
              <div className="results-header">
                <h4>📋 النتائج ({results.length})</h4>
              </div>
              <div className="results-list">
                {results.map((result) => (
                  <div
                    key={result.id}
                    className="result-item"
                    onClick={() => onResultSelect(result)}
                  >
                    <div className="result-header">
                      <div className="result-type">
                        <span className="type-icon">{getTypeIcon(result.type)}</span>
                        <span className="type-label">{result.category}</span>
                      </div>
                      <div
                        className="relevance-score"
                        style={{ color: getRelevanceColor(result.relevance) }}
                      >
                        {result.relevance}%
                      </div>
                    </div>
                    <h5 className="result-title">
                      {highlightText(result.title, query)}
                    </h5>
                    <p className="result-content">
                      {highlightText(result.content, query)}
                    </p>
                    <div className="result-meta">
                      <span className="result-date">📅 {result.date}</span>
                      <div className="result-tags">
                        {result.tags.slice(0, 3).map(tag => (
                          <span key={tag} className="tag">#{tag}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : query && !isSearching ? (
            <div className="no-results">
              <div className="no-results-icon">🔍</div>
              <h4>لا توجد نتائج</h4>
              <p>جرب استخدام كلمات مفتاحية مختلفة أو تعديل الفلاتر</p>
              <div className="search-tips">
                <h5>💡 نصائح للبحث:</h5>
                <ul>
                  <li>استخدم كلمات مفتاحية بسيطة</li>
                  <li>جرب البحث بالمرادفات</li>
                  <li>استخدم الفلاتر المتقدمة</li>
                  <li>تحقق من الإملاء</li>
                </ul>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default AdvancedSearch;
