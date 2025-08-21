import React, { useState, useEffect } from 'react';
import { DataSyncService, type SyncStatus as SyncStatusType } from '../services/DataSyncService';
import './SyncStatus.css';

interface SyncStatusProps {
  compact?: boolean;
}

const SyncStatus: React.FC<SyncStatusProps> = ({ compact = false }) => {
  const [syncStatus, setSyncStatus] = useState<SyncStatusType>(DataSyncService.getSyncStatus());
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // إعداد مراقبة حالة الاتصال
    DataSyncService.setupNetworkMonitoring();

    // إضافة مستمع لتحديثات حالة المزامنة
    const handleSyncStatusUpdate = (status: SyncStatusType) => {
      setSyncStatus(status);
    };

    DataSyncService.addSyncStatusListener(handleSyncStatusUpdate);

    // تنظيف عند إلغاء التحميل
    return () => {
      DataSyncService.removeSyncStatusListener(handleSyncStatusUpdate);
    };
  }, []);

  const handleManualSync = async () => {
    if (syncStatus.isOnline) {
      await DataSyncService.syncAll();
    }
  };

  const handleClearErrors = () => {
    DataSyncService.clearErrors();
  };

  const getStatusIcon = () => {
    if (!syncStatus.isOnline) return '🔴';
    if (syncStatus.pendingUploads > 0) return '🟡';
    if (syncStatus.errors.length > 0) return '🟠';
    return '🟢';
  };

  const getStatusText = () => {
    if (!syncStatus.isOnline) return 'غير متصل';
    if (syncStatus.pendingUploads > 0) return `${syncStatus.pendingUploads} في الانتظار`;
    if (syncStatus.errors.length > 0) return `${syncStatus.errors.length} أخطاء`;
    return 'متزامن';
  };

  if (compact) {
    return (
      <div 
        className="sync-status-compact"
        onClick={() => setShowDetails(!showDetails)}
        title={getStatusText()}
      >
        <span className="status-icon">{getStatusIcon()}</span>
        <span className="status-text">{getStatusText()}</span>
        
        {showDetails && (
          <div className="sync-details-popup">
            <div className="sync-detail-item">
              <span>الحالة:</span>
              <span>{syncStatus.isOnline ? 'متصل' : 'غير متصل'}</span>
            </div>
            
            {syncStatus.lastSync && (
              <div className="sync-detail-item">
                <span>آخر مزامنة:</span>
                <span>{syncStatus.lastSync.toLocaleTimeString('ar-SA')}</span>
              </div>
            )}
            
            {syncStatus.pendingUploads > 0 && (
              <div className="sync-detail-item">
                <span>في الانتظار:</span>
                <span>{syncStatus.pendingUploads}</span>
              </div>
            )}
            
            {syncStatus.errors.length > 0 && (
              <div className="sync-detail-item error">
                <span>أخطاء:</span>
                <span>{syncStatus.errors.length}</span>
              </div>
            )}
            
            <div className="sync-actions">
              {syncStatus.isOnline && (
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleManualSync();
                  }}
                  className="sync-button"
                >
                  مزامنة الآن
                </button>
              )}
              
              {syncStatus.errors.length > 0 && (
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClearErrors();
                  }}
                  className="clear-errors-button"
                >
                  مسح الأخطاء
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="sync-status-full">
      <div className="sync-status-header">
        <h3>
          <span className="status-icon">{getStatusIcon()}</span>
          حالة المزامنة
        </h3>
        <span className="status-text">{getStatusText()}</span>
      </div>

      <div className="sync-status-details">
        <div className="status-grid">
          <div className="status-item">
            <label>حالة الاتصال:</label>
            <span className={`connection-status ${syncStatus.isOnline ? 'online' : 'offline'}`}>
              {syncStatus.isOnline ? '🟢 متصل' : '🔴 غير متصل'}
            </span>
          </div>

          {syncStatus.lastSync && (
            <div className="status-item">
              <label>آخر مزامنة:</label>
              <span>{syncStatus.lastSync.toLocaleString('ar-SA')}</span>
            </div>
          )}

          {syncStatus.pendingUploads > 0 && (
            <div className="status-item">
              <label>عناصر في الانتظار:</label>
              <span className="pending-count">{syncStatus.pendingUploads}</span>
            </div>
          )}

          {syncStatus.errors.length > 0 && (
            <div className="status-item">
              <label>الأخطاء:</label>
              <span className="error-count">{syncStatus.errors.length}</span>
            </div>
          )}
        </div>

        {syncStatus.errors.length > 0 && (
          <div className="error-list">
            <h4>تفاصيل الأخطاء:</h4>
            <ul>
              {syncStatus.errors.map((error, index) => (
                <li key={index} className="error-item">
                  {error}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="sync-actions">
          {syncStatus.isOnline && (
            <button 
              onClick={handleManualSync}
              className="sync-button primary"
            >
              🔄 مزامنة الآن
            </button>
          )}
          
          {syncStatus.errors.length > 0 && (
            <button 
              onClick={handleClearErrors}
              className="clear-errors-button"
            >
              🗑️ مسح الأخطاء
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SyncStatus;
