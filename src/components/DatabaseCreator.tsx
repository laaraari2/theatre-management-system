import React, { useState } from 'react';
import {
  setupCompleteDatabase,
  deleteCompleteDatabase,
  recreateCompleteDatabase
} from '../scripts/create-database';
import FirestorePermissionGuide from './FirestorePermissionGuide';

const DatabaseCreator: React.FC = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [showPermissionGuide, setShowPermissionGuide] = useState(false);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString('ar-SA')}: ${message}`]);
  };

  const createDatabase = async (includeSample: boolean = false) => {
    setIsCreating(true);
    setLogs([]);
    setIsComplete(false);

    addLog('🚀 بدء إنشاء قاعدة البيانات...');

    try {
      // إعادة توجيه console.log إلى السجلات
      const originalLog = console.log;
      console.log = (message: string) => {
        addLog(message);
        originalLog(message);
      };

      await setupCompleteDatabase(includeSample);

      // استعادة console.log الأصلي
      console.log = originalLog;

      addLog('🎉 تم إنشاء قاعدة البيانات بنجاح!');
      setIsComplete(true);

    } catch (error: any) {
      addLog(`❌ فشل في إنشاء قاعدة البيانات: ${error}`);

      // إذا كان الخطأ متعلق بالصلاحيات، اعرض دليل الإصلاح
      if (error.message && error.message.includes('permission-denied')) {
        addLog('🔧 يرجى إصلاح صلاحيات Firestore أولاً');
        setShowPermissionGuide(true);
      }
    } finally {
      setIsCreating(false);
    }
  };

  const deleteDatabase = async () => {
    setIsCreating(true);
    setLogs([]);
    setIsComplete(false);

    addLog('🗑️ بدء حذف قاعدة البيانات...');

    try {
      const originalLog = console.log;
      console.log = (message: string) => {
        addLog(message);
        originalLog(message);
      };

      await deleteCompleteDatabase();

      console.log = originalLog;

      addLog('🎉 تم حذف قاعدة البيانات بنجاح!');
      addLog('💡 يمكنك الآن إنشاء قاعدة بيانات جديدة');
      setIsComplete(true);

    } catch (error: any) {
      addLog(`❌ فشل في حذف قاعدة البيانات: ${error}`);
    } finally {
      setIsCreating(false);
    }
  };

  const recreateDatabase = async (includeSample: boolean = false) => {
    setIsCreating(true);
    setLogs([]);
    setIsComplete(false);

    addLog('🔄 بدء حذف وإعادة إنشاء قاعدة البيانات...');

    try {
      const originalLog = console.log;
      console.log = (message: string) => {
        addLog(message);
        originalLog(message);
      };

      await recreateCompleteDatabase(includeSample);

      console.log = originalLog;

      addLog('🎉 تم حذف وإعادة إنشاء قاعدة البيانات بنجاح!');
      addLog('💡 يُنصح بإعادة تحميل الصفحة');
      setIsComplete(true);

    } catch (error: any) {
      addLog(`❌ فشل في حذف وإعادة إنشاء قاعدة البيانات: ${error}`);

      if (error.message && error.message.includes('permission-denied')) {
        addLog('🔧 يرجى إصلاح صلاحيات Firestore أولاً');
        setShowPermissionGuide(true);
      }
    } finally {
      setIsCreating(false);
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
      <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>
        🗄️ إنشاء قاعدة البيانات في Firestore
      </h2>

      <div style={{ marginBottom: '2rem' }}>
        <h3>📋 العمليات المتاحة:</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
          <div style={{ padding: '1rem', background: '#f3f4f6', borderRadius: '8px' }}>
            <h4 style={{ margin: '0 0 0.5rem 0', color: '#1f2937' }}>🏗️ إنشاء جديد</h4>
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#6b7280' }}>إنشاء قاعدة بيانات جديدة مع الهيكل الأساسي</p>
          </div>
          <div style={{ padding: '1rem', background: '#fef2f2', borderRadius: '8px' }}>
            <h4 style={{ margin: '0 0 0.5rem 0', color: '#dc2626' }}>🗑️ حذف كامل</h4>
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#6b7280' }}>حذف جميع البيانات نهائياً</p>
          </div>
        </div>
        <div style={{ padding: '1rem', background: '#eff6ff', borderRadius: '8px' }}>
          <h4 style={{ margin: '0 0 0.5rem 0', color: '#1e40af' }}>🔄 حذف وإعادة إنشاء (الأفضل)</h4>
          <p style={{ margin: 0, fontSize: '0.9rem', color: '#6b7280' }}>
            حذف قاعدة البيانات الحالية وإنشاء واحدة جديدة نظيفة - <strong>يحل مشكلة التاريخ الهجري</strong>
          </p>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <button
          onClick={() => recreateDatabase(false)}
          disabled={isCreating}
          style={{
            padding: '1rem',
            background: 'linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '0.9rem',
            fontWeight: '600',
            cursor: isCreating ? 'not-allowed' : 'pointer',
            opacity: isCreating ? 0.6 : 1,
            textAlign: 'center'
          }}
        >
          🔄 حذف وإعادة إنشاء<br/>
          <small style={{ opacity: 0.8 }}>(الأفضل لحل مشكلة التاريخ)</small>
        </button>

        <button
          onClick={() => recreateDatabase(true)}
          disabled={isCreating}
          style={{
            padding: '1rem',
            background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '0.9rem',
            fontWeight: '600',
            cursor: isCreating ? 'not-allowed' : 'pointer',
            opacity: isCreating ? 0.6 : 1,
            textAlign: 'center'
          }}
        >
          🔄 حذف وإعادة إنشاء<br/>
          <small style={{ opacity: 0.8 }}>(مع بيانات تجريبية)</small>
        </button>

        <button
          onClick={() => createDatabase(false)}
          disabled={isCreating}
          style={{
            padding: '1rem',
            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '0.9rem',
            fontWeight: '600',
            cursor: isCreating ? 'not-allowed' : 'pointer',
            opacity: isCreating ? 0.6 : 1,
            textAlign: 'center'
          }}
        >
          🏗️ إنشاء جديد<br/>
          <small style={{ opacity: 0.8 }}>(بدون حذف الموجود)</small>
        </button>

        <button
          onClick={deleteDatabase}
          disabled={isCreating}
          style={{
            padding: '1rem',
            background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '0.9rem',
            fontWeight: '600',
            cursor: isCreating ? 'not-allowed' : 'pointer',
            opacity: isCreating ? 0.6 : 1,
            textAlign: 'center'
          }}
        >
          🗑️ حذف كامل<br/>
          <small style={{ opacity: 0.8 }}>(حذف فقط)</small>
        </button>

        <button
          onClick={() => setShowPermissionGuide(true)}
          style={{
            padding: '1rem',
            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '0.9rem',
            fontWeight: '600',
            cursor: 'pointer',
            textAlign: 'center'
          }}
        >
          🔧 إصلاح الصلاحيات<br/>
          <small style={{ opacity: 0.8 }}>(في حالة الأخطاء)</small>
        </button>
      </div>

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
            انقر على أحد الأزرار لبدء إنشاء قاعدة البيانات
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

        {isCreating && (
          <div style={{ 
            color: '#fbbf24', 
            textAlign: 'center',
            marginTop: '1rem'
          }}>
            ⏳ جاري العمل...
          </div>
        )}

        {isComplete && (
          <div style={{ 
            color: '#10b981', 
            textAlign: 'center',
            marginTop: '1rem',
            fontWeight: 'bold'
          }}>
            ✅ تم الانتهاء بنجاح!
          </div>
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
          <li>تأكد من أن مشروع Firebase متصل بشكل صحيح</li>
          <li>تحقق من صلاحيات Firestore في قواعد الأمان</li>
          <li>هذه العملية ستنشئ البنية الأساسية فقط</li>
          <li>يمكنك إضافة البيانات الحقيقية بعد الانتهاء</li>
        </ul>
      </div>

      {/* دليل إصلاح الصلاحيات */}
      {showPermissionGuide && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div style={{ position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
            <button
              onClick={() => setShowPermissionGuide(false)}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                fontSize: '1.2rem',
                cursor: 'pointer',
                zIndex: 1001
              }}
            >
              ✕
            </button>
            <FirestorePermissionGuide />
          </div>
        </div>
      )}
    </div>
  );
};

export default DatabaseCreator;
