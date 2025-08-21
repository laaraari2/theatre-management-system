import React, { useState } from 'react';
import { updateAllData, scanForHijriDates } from '../utils/dataUpdater';

const DataUpdater: React.FC = () => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [scanResults, setScanResults] = useState<any>(null);
  const [updateResults, setUpdateResults] = useState<any>(null);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString('ar-SA')}: ${message}`]);
  };

  const clearLogs = () => {
    setLogs([]);
    setScanResults(null);
    setUpdateResults(null);
  };

  const handleScan = async () => {
    setIsScanning(true);
    addLog('🔍 بدء فحص البيانات للعثور على التواريخ الهجرية...');

    try {
      const results = await scanForHijriDates();
      setScanResults(results);
      
      const total = results.firestoreActivities.length + 
                   results.firestoreReports.length + 
                   results.localStorage.length;
      
      if (total > 0) {
        addLog(`📊 تم العثور على ${total} عنصر يحتاج تحديث`);
        addLog(`   - أنشطة Firestore: ${results.firestoreActivities.length}`);
        addLog(`   - تقارير Firestore: ${results.firestoreReports.length}`);
        addLog(`   - بيانات محلية: ${results.localStorage.length}`);
      } else {
        addLog('✅ جميع البيانات محدثة بالفعل');
      }
    } catch (error) {
      addLog(`❌ خطأ في الفحص: ${error}`);
    } finally {
      setIsScanning(false);
    }
  };

  const handleUpdate = async () => {
    setIsUpdating(true);
    addLog('🚀 بدء تحديث البيانات...');

    try {
      // إعادة توجيه console.log إلى السجلات
      const originalLog = console.log;
      console.log = (message: string) => {
        addLog(message);
        originalLog(message);
      };

      const results = await updateAllData();
      setUpdateResults(results);

      // استعادة console.log الأصلي
      console.log = originalLog;

      if (results.total > 0) {
        addLog('🎉 تم تحديث البيانات بنجاح!');
        addLog('💡 يُنصح بإعادة تحميل الصفحة لرؤية التغييرات');
      } else {
        addLog('ℹ️ لا توجد بيانات تحتاج تحديث');
      }
    } catch (error) {
      addLog(`❌ فشل في التحديث: ${error}`);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div style={{
      maxWidth: '800px',
      margin: '2rem auto',
      padding: '2rem',
      background: 'white',
      borderRadius: '16px',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
    }}>
      <h2 style={{ textAlign: 'center', marginBottom: '2rem', color: '#1f2937' }}>
        🔄 تحديث البيانات - تحويل التواريخ الهجرية إلى ميلادية
      </h2>

      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ color: '#374151', marginBottom: '1rem' }}>📋 ما سيتم تحديثه:</h3>
        <ul style={{ lineHeight: '1.8', color: '#6b7280' }}>
          <li>تحويل "صفر ١٤٤٧ هـ" إلى "9 غشت 2025"</li>
          <li>تحويل الأرقام العربية (١٢٣) إلى فرنسية (123)</li>
          <li>تحديث جميع الأنشطة والتقارير في Firestore</li>
          <li>تحديث البيانات المحلية في المتصفح</li>
        </ul>
      </div>

      <div style={{ 
        display: 'flex', 
        gap: '1rem', 
        marginBottom: '2rem',
        justifyContent: 'center'
      }}>
        <button
          onClick={handleScan}
          disabled={isScanning || isUpdating}
          style={{
            padding: '1rem 2rem',
            background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: (isScanning || isUpdating) ? 'not-allowed' : 'pointer',
            opacity: (isScanning || isUpdating) ? 0.6 : 1
          }}
        >
          {isScanning ? '🔍 جاري الفحص...' : '🔍 فحص البيانات'}
        </button>

        <button
          onClick={handleUpdate}
          disabled={isUpdating || isScanning}
          style={{
            padding: '1rem 2rem',
            background: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: (isUpdating || isScanning) ? 'not-allowed' : 'pointer',
            opacity: (isUpdating || isScanning) ? 0.6 : 1
          }}
        >
          {isUpdating ? '🔄 جاري التحديث...' : '🔄 تحديث البيانات'}
        </button>

        <button
          onClick={clearLogs}
          disabled={logs.length === 0}
          style={{
            padding: '1rem 2rem',
            background: '#6b7280',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: logs.length === 0 ? 'not-allowed' : 'pointer',
            opacity: logs.length === 0 ? 0.6 : 1
          }}
        >
          🧹 مسح السجل
        </button>

        {updateResults && updateResults.total > 0 && (
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '1rem 2rem',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            🔄 إعادة تحميل الصفحة
          </button>
        )}
      </div>

      {/* نتائج الفحص */}
      {scanResults && (
        <div style={{
          marginBottom: '2rem',
          padding: '1rem',
          background: '#f3f4f6',
          borderRadius: '8px',
          border: '1px solid #d1d5db'
        }}>
          <h4 style={{ margin: '0 0 1rem 0', color: '#374151' }}>📊 نتائج الفحص:</h4>
          
          {scanResults.firestoreActivities.length > 0 && (
            <div style={{ marginBottom: '1rem' }}>
              <strong>🔥 أنشطة Firestore ({scanResults.firestoreActivities.length}):</strong>
              <ul style={{ margin: '0.5rem 0', paddingRight: '1.5rem' }}>
                {scanResults.firestoreActivities.slice(0, 5).map((item: string, index: number) => (
                  <li key={index} style={{ fontSize: '0.9rem', color: '#6b7280' }}>{item}</li>
                ))}
                {scanResults.firestoreActivities.length > 5 && (
                  <li style={{ fontSize: '0.9rem', color: '#6b7280', fontStyle: 'italic' }}>
                    ... و {scanResults.firestoreActivities.length - 5} أخرى
                  </li>
                )}
              </ul>
            </div>
          )}

          {scanResults.localStorage.length > 0 && (
            <div>
              <strong>💾 بيانات محلية ({scanResults.localStorage.length}):</strong>
              <ul style={{ margin: '0.5rem 0', paddingRight: '1.5rem' }}>
                {scanResults.localStorage.slice(0, 5).map((item: string, index: number) => (
                  <li key={index} style={{ fontSize: '0.9rem', color: '#6b7280' }}>{item}</li>
                ))}
                {scanResults.localStorage.length > 5 && (
                  <li style={{ fontSize: '0.9rem', color: '#6b7280', fontStyle: 'italic' }}>
                    ... و {scanResults.localStorage.length - 5} أخرى
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* نتائج التحديث */}
      {updateResults && (
        <div style={{
          marginBottom: '2rem',
          padding: '1rem',
          background: '#d1fae5',
          borderRadius: '8px',
          border: '1px solid #10b981'
        }}>
          <h4 style={{ margin: '0 0 1rem 0', color: '#065f46' }}>✅ نتائج التحديث:</h4>
          <ul style={{ margin: 0, paddingRight: '1.5rem', color: '#065f46' }}>
            <li>جميع مجموعات Firestore: {updateResults.firestoreTotal}</li>
            <li>بيانات محلية: {updateResults.localStorage}</li>
            <li><strong>المجموع الكلي: {updateResults.total}</strong></li>
          </ul>
          {updateResults.total > 0 && (
            <div style={{
              marginTop: '1rem',
              padding: '0.5rem',
              background: '#fef3c7',
              borderRadius: '4px',
              color: '#92400e'
            }}>
              💡 <strong>مهم:</strong> أعد تحميل الصفحة لرؤية التغييرات
            </div>
          )}
        </div>
      )}

      {/* سجل العمليات */}
      <div style={{
        background: '#1f2937',
        borderRadius: '8px',
        padding: '1rem',
        minHeight: '200px',
        maxHeight: '400px',
        overflowY: 'auto',
        fontFamily: 'monospace'
      }}>
        <h4 style={{ color: '#e5e7eb', margin: '0 0 1rem 0' }}>📋 سجل العمليات:</h4>
        
        {logs.length === 0 ? (
          <p style={{ color: '#9ca3af', fontStyle: 'italic' }}>
            انقر على "فحص البيانات" أو "تحديث البيانات" لبدء العملية
          </p>
        ) : (
          logs.map((log, index) => (
            <div 
              key={index} 
              style={{ 
                color: '#e5e7eb', 
                fontSize: '0.9rem',
                marginBottom: '0.5rem',
                padding: '0.25rem 0',
                borderBottom: '1px solid #374151'
              }}
            >
              {log}
            </div>
          ))
        )}
      </div>

      {/* معلومات مهمة */}
      <div style={{
        marginTop: '2rem',
        padding: '1rem',
        background: '#fef3c7',
        border: '1px solid #f59e0b',
        borderRadius: '8px'
      }}>
        <h4 style={{ color: '#92400e', margin: '0 0 1rem 0' }}>
          ⚠️ معلومات مهمة:
        </h4>
        <ul style={{ color: '#92400e', margin: 0, lineHeight: '1.6' }}>
          <li>افحص البيانات أولاً قبل التحديث</li>
          <li>التحديث لا يمكن التراجع عنه</li>
          <li>أعد تحميل الصفحة بعد التحديث</li>
          <li>تأكد من اتصال الإنترنت لتحديث Firestore</li>
        </ul>
      </div>
    </div>
  );
};

export default DataUpdater;
