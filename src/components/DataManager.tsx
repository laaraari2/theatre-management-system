import React, { useState } from 'react';
import { dataManager } from '../utils/dataManager';
import './DataManager.css';

interface DataManagerProps {
  onClose: () => void;
  onNotification: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

const DataManager: React.FC<DataManagerProps> = ({ onClose, onNotification }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const handleExport = () => {
    try {
      setIsExporting(true);
      dataManager.downloadBackup();
      onNotification('تم تصدير البيانات بنجاح!', 'success');
    } catch (error) {
      onNotification('حدث خطأ أثناء تصدير البيانات', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        const success = dataManager.importData(data);
        
        if (success) {
          onNotification('تم استيراد البيانات بنجاح! سيتم إعادة تحميل الصفحة.', 'success');
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        } else {
          onNotification('حدث خطأ أثناء استيراد البيانات', 'error');
        }
      } catch (error) {
        onNotification('ملف البيانات غير صالح', 'error');
      } finally {
        setIsImporting(false);
      }
    };

    reader.readAsText(file);
  };

  const handleClearData = () => {
    if (window.confirm('هل أنت متأكد من حذف جميع البيانات؟ هذا الإجراء لا يمكن التراجع عنه.')) {
      dataManager.clearAllData();
      onNotification('تم حذف جميع البيانات. سيتم إعادة تحميل الصفحة.', 'info');
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    }
  };

  return (
    <div className="data-manager-overlay">
      <div className="data-manager-container">
        <div className="data-manager-header">
          <h2>إدارة البيانات</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="data-manager-content">
          <div className="data-section">
            <h3>📤 تصدير البيانات</h3>
            <p>احفظ نسخة احتياطية من جميع بياناتك</p>
            <button 
              className="btn-export" 
              onClick={handleExport}
              disabled={isExporting}
            >
              {isExporting ? 'جاري التصدير...' : '📥 تصدير البيانات'}
            </button>
          </div>

          <div className="data-section">
            <h3>📥 استيراد البيانات</h3>
            <p>استعد البيانات من ملف احتياطي</p>
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              disabled={isImporting}
              className="file-input"
              id="import-file"
            />
            <label htmlFor="import-file" className="btn-import">
              {isImporting ? 'جاري الاستيراد...' : '📤 اختيار ملف'}
            </label>
          </div>

          <div className="data-section danger-section">
            <h3>🗑️ حذف جميع البيانات</h3>
            <p>احذف جميع البيانات المحفوظة (لا يمكن التراجع)</p>
            <button 
              className="btn-danger" 
              onClick={handleClearData}
            >
              🗑️ حذف جميع البيانات
            </button>
          </div>

          <div className="data-info">
            <h4>ℹ️ معلومات مهمة:</h4>
            <ul>
              <li>البيانات محفوظة محلياً في متصفحك</li>
              <li>قم بتصدير البيانات بانتظام كنسخة احتياطية</li>
              <li>يمكنك نقل البيانات بين الأجهزة باستخدام التصدير/الاستيراد</li>
              <li>حذف بيانات المتصفح سيؤدي لفقدان البيانات</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataManager;
