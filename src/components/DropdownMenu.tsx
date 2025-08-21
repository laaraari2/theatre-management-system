import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './DropdownMenu.css';

interface DropdownItem {
  to: string;
  label: string;
  icon?: string;
}

interface DropdownMenuProps {
  title: string;
  icon?: string;
  items: DropdownItem[];
  onItemClick?: () => void;
}

const DropdownMenu: React.FC<DropdownMenuProps> = ({ title, icon, items, onItemClick }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // إغلاق القائمة عند النقر خارجها
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };



  const handleItemClick = () => {
    setIsOpen(false);
    if (onItemClick) {
      onItemClick();
    }
  };

  return (
    <div
      className="dropdown-menu-container"
      ref={dropdownRef}
      style={{ position: 'relative', display: 'inline-block' }}
      id="dropdown-container"
    >
      <button
        className={`dropdown-trigger ${isOpen ? 'active' : ''}`}
        onClick={handleToggle}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {icon && <span className="dropdown-icon">{icon}</span>}
        <span className="dropdown-title">{title}</span>
        <span className={`dropdown-arrow ${isOpen ? 'open' : ''}`}>▼</span>
      </button>



      {isOpen && (
        <div className="dropdown-menu">
          <div className="dropdown-menu-content">
            {items.map((item, index) => (
              <Link
                key={index}
                to={item.to}
                onClick={handleItemClick}
                className="dropdown-item"
              >
                {item.icon && <span className="dropdown-item-icon">{item.icon}</span>}
                <span className="dropdown-item-label">{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DropdownMenu;
