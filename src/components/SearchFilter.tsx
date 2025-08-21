import React, { useState } from 'react';
import './SearchFilter.css';

interface SearchFilterProps {
  onSearch: (searchTerm: string) => void;
  onFilter: (filterType: string, filterValue: string) => void;
  onClearFilters: () => void;
}

const SearchFilter: React.FC<SearchFilterProps> = ({ onFilter, onClearFilters }) => {
  const [statusFilter, setStatusFilter] = useState('');

  const statuses = ['الأنشطة المنجزة', 'قيد التحضير', 'ملغي'];

  const handleStatusFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setStatusFilter(value);
    onFilter('status', value);
  };

  const handleClearAll = () => {
    setStatusFilter('');
    onClearFilters();
  };

  return (
    <div className="search-filter-container">
      <div className="search-section">
        <h3>🔍 تصفية حسب الحالة</h3>
      </div>

      <div className="filters-section">
        <div className="filter-group">
          <label>حالة النشاط:</label>
          <select value={statusFilter} onChange={handleStatusFilter} className="filter-select">
            <option value="">جميع الحالات</option>
            {statuses.map((status, index) => (
              <option key={index} value={status}>{status}</option>
            ))}
          </select>
        </div>

        {statusFilter && (
          <button className="clear-filters-btn" onClick={handleClearAll}>
            🗑️ مسح التصفية
          </button>
        )}
      </div>
    </div>
  );
};

export default SearchFilter;
