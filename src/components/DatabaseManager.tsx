import React, { useState } from 'react';
import DatabaseSetupService from '../firebase/database-setup';
import './DatabaseManager.css';

interface DatabaseManagerProps {
  onClose?: () => void;
}

const DatabaseManager: React.FC<DatabaseManagerProps> = ({ onClose }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [actionType, setActionType] = useState<'clear' | 'setup' | 'setupWithSample'>('clear');

  // إضافة سجل جديد
  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString('ar-SA')}: ${message}`]);
  };

  // مسح السجلات
  const clearLogs = () => {
    setLogs([]);
  };

  // حذف البيانات التجريبية فقط
  const handleClearTestData = async () => {
    setIsLoading(true);
    addLog('🗑️ بدء حذف البيانات التجريبية...');
    
    try {
      await DatabaseSetupService.clearAllTestData();
      addLog('✅ تم حذف البيانات التجريبية بنجاح');
    } catch (error) {
      addLog(`❌ خطأ في حذف البيانات: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  // إعداد قاعدة البيانات الكاملة
  const handleSetupDatabase = async (includeSample: boolean = false) => {
    setIsLoading(true);
    addLog('🚀 بدء إعداد قاعدة البيانات...');
    
    try {
      await DatabaseSetupService.setupCompleteDatabase(includeSample);
      addLog('🎉 تم إعداد قاعدة البيانات بنجاح!');
      addLog('📋 يمكنك الآن البدء في إضافة البيانات الحقيقية');
    } catch (error) {
      addLog(`💥 فشل في إعداد قاعدة البيانات: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  // فحص حالة قاعدة البيانات
  const handleCheckStatus = async () => {
    setIsLoading(true);
    addLog('🔍 فحص حالة قاعدة البيانات...');
    
    try {
      await DatabaseSetupService.checkDatabaseStatus();
      addLog('✅ تم فحص قاعدة البيانات بنجاح');
    } catch (error) {
      addLog(`❌ خطأ في فحص قاعدة البيانات: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  // تأكيد العملية
  const confirmAction = () => {
    setShowConfirmDialog(false);
    
    switch (actionType) {
      case 'clear':
        handleClearTestData();
        break;
      case 'setup':
        handleSetupDatabase(false);
        break;
      case 'setupWithSample':
        handleSetupDatabase(true);
        break;
    }
  };

  // إظهار حوار التأكيد
  const showConfirm = (type: 'clear' | 'setup' | 'setupWithSample') => {
    setActionType(type);
    setShowConfirmDialog(true);
  };

  return (
    <div className="database-manager">
      <div className="database-manager-header">
        <h2>🗄️ إدارة قاعدة البيانات</h2>
        {onClose && (
          <button className="close-button" onClick={onClose}>
            ✕
          </button>
        )}
      </div>

      <div className="database-manager-content">
        {/* قسم العمليات */}
        <div className="operations-section">
          <h3>العمليات المتاحة</h3>
          
          <div className="operation-card">
            <div className="operation-info">
              <h4>🗑️ حذف البيانات التجريبية</h4>
              <p>حذف جميع البيانات التجريبية من Firestore و localStorage</p>
            </div>
            <button 
              className="operation-button danger"
              onClick={() => showConfirm('clear')}
              disabled={isLoading}
            >
              حذف البيانات التجريبية
            </button>
          </div>

          <div className="operation-card">
            <div className="operation-info">
              <h4>🏗️ إعداد قاعدة البيانات</h4>
              <p>حذف البيانات التجريبية وإنشاء الهيكل الأساسي الجديد</p>
            </div>
            <button 
              className="operation-button primary"
              onClick={() => showConfirm('setup')}
              disabled={isLoading}
            >
              إعداد قاعدة البيانات
            </button>
          </div>

          <div className="operation-card">
            <div className="operation-info">
              <h4>🎭 إعداد مع بيانات تجريبية</h4>
              <p>إعداد قاعدة البيانات مع إضافة نشاط تجريبي واحد</p>
            </div>
            <button 
              className="operation-button secondary"
              onClick={() => showConfirm('setupWithSample')}
              disabled={isLoading}
            >
              إعداد مع بيانات تجريبية
            </button>
          </div>

          <div className="operation-card">
            <div className="operation-info">
              <h4>🔍 فحص حالة قاعدة البيانات</h4>
              <p>عرض إحصائيات حول البيانات الموجودة في قاعدة البيانات</p>
            </div>
            <button 
              className="operation-button info"
              onClick={handleCheckStatus}
              disabled={isLoading}
            >
              فحص الحالة
            </button>
          </div>
        </div>

        {/* قسم السجلات */}
        <div className="logs-section">
          <div className="logs-header">
            <h3>📋 سجل العمليات</h3>
            <button 
              className="clear-logs-button"
              onClick={clearLogs}
              disabled={logs.length === 0}
            >
              مسح السجل
            </button>
          </div>
          
          <div className="logs-container">
            {logs.length === 0 ? (
              <p className="no-logs">لا توجد عمليات مسجلة</p>
            ) : (
              logs.map((log, index) => (
                <div key={index} className="log-entry">
                  {log}
                </div>
              ))
            )}
          </div>
        </div>

        {/* مؤشر التحميل */}
        {isLoading && (
          <div className="loading-overlay">
            <div className="loading-spinner"></div>
            <p>جاري تنفيذ العملية...</p>
          </div>
        )}

        {/* حوار التأكيد */}
        {showConfirmDialog && (
          <div className="confirm-dialog-overlay">
            <div className="confirm-dialog">
              <h3>⚠️ تأكيد العملية</h3>
              <p>
                {actionType === 'clear' && 'هل أنت متأكد من حذف جميع البيانات التجريبية؟'}
                {actionType === 'setup' && 'هل أنت متأكد من إعادة إعداد قاعدة البيانات؟ سيتم حذف جميع البيانات الموجودة.'}
                {actionType === 'setupWithSample' && 'هل أنت متأكد من إعادة إعداد قاعدة البيانات مع بيانات تجريبية؟'}
              </p>
              <div className="confirm-dialog-actions">
                <button 
                  className="confirm-button danger"
                  onClick={confirmAction}
                >
                  نعم، متأكد
                </button>
                <button 
                  className="cancel-button"
                  onClick={() => setShowConfirmDialog(false)}
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* معلومات مهمة */}
      <div className="important-info">
        <h4>⚠️ معلومات مهمة:</h4>
        <ul>
          <li>تأكد من عمل نسخة احتياطية قبل حذف البيانات</li>
          <li>عملية الحذف لا يمكن التراجع عنها</li>
          <li>سيتم إنشاء الموسم الحالي والأسبوع الحالي تلقائياً</li>
          <li>يمكنك مراقبة العمليات من خلال سجل العمليات</li>
        </ul>
      </div>
    </div>
  );
};

export default DatabaseManager;
