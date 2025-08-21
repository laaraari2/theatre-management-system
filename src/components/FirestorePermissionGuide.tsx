import React, { useState } from 'react';

const FirestorePermissionGuide: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;

  const steps = [
    {
      title: "1️⃣ فتح Firebase Console",
      content: (
        <div>
          <p>اذهب إلى Firebase Console:</p>
          <div style={{
            background: '#1f2937',
            color: '#e5e7eb',
            padding: '1rem',
            borderRadius: '8px',
            fontFamily: 'monospace',
            margin: '1rem 0'
          }}>
            https://console.firebase.google.com
          </div>
          <p>وقم بتسجيل الدخول بحسابك</p>
        </div>
      )
    },
    {
      title: "2️⃣ اختيار المشروع",
      content: (
        <div>
          <p>اختر مشروعك من قائمة المشاريع</p>
          <div style={{
            background: '#fef3c7',
            border: '1px solid #f59e0b',
            padding: '1rem',
            borderRadius: '8px',
            margin: '1rem 0'
          }}>
            <strong>💡 نصيحة:</strong> تأكد من أنك تختار نفس المشروع المستخدم في التطبيق
          </div>
        </div>
      )
    },
    {
      title: "3️⃣ الانتقال إلى Firestore",
      content: (
        <div>
          <p>من القائمة الجانبية، انقر على:</p>
          <div style={{
            background: '#3b82f6',
            color: 'white',
            padding: '0.5rem 1rem',
            borderRadius: '6px',
            display: 'inline-block',
            margin: '1rem 0'
          }}>
            🗄️ Firestore Database
          </div>
          <p>إذا لم تكن قاعدة البيانات موجودة، انقر على "Create database"</p>
        </div>
      )
    },
    {
      title: "4️⃣ تحديث قواعد الأمان",
      content: (
        <div>
          <p>انقر على تبويب <strong>"Rules"</strong> في أعلى الصفحة</p>
          <p>استبدل القواعد الموجودة بهذا الكود:</p>
          <div style={{
            background: '#1f2937',
            color: '#e5e7eb',
            padding: '1rem',
            borderRadius: '8px',
            fontFamily: 'monospace',
            margin: '1rem 0',
            fontSize: '0.9rem',
            overflow: 'auto'
          }}>
{`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // السماح بالقراءة والكتابة للجميع (للتطوير)
    match /{document=**} {
      allow read, write: if true;
    }
  }
}`}
          </div>
          <div style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            padding: '1rem',
            borderRadius: '8px',
            margin: '1rem 0'
          }}>
            <strong>⚠️ تحذير:</strong> هذه القواعد للتطوير فقط. للإنتاج، استخدم قواعد أكثر أماناً.
          </div>
        </div>
      )
    },
    {
      title: "5️⃣ نشر القواعد",
      content: (
        <div>
          <p>انقر على الزر الأزرق:</p>
          <div style={{
            background: '#3b82f6',
            color: 'white',
            padding: '0.5rem 1rem',
            borderRadius: '6px',
            display: 'inline-block',
            margin: '1rem 0'
          }}>
            📤 Publish
          </div>
          <p>انتظر حتى تظهر رسالة النجاح</p>
          <div style={{
            background: '#d1fae5',
            border: '1px solid #10b981',
            padding: '1rem',
            borderRadius: '8px',
            margin: '1rem 0'
          }}>
            <strong>✅ تم!</strong> الآن يمكنك العودة للتطبيق وإعادة المحاولة
          </div>
        </div>
      )
    }
  ];

  return (
    <div style={{
      maxWidth: '700px',
      margin: '2rem auto',
      padding: '2rem',
      background: 'white',
      borderRadius: '16px',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
    }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h2 style={{ color: '#1f2937', marginBottom: '0.5rem' }}>
          🔧 إصلاح صلاحيات Firestore
        </h2>
        <p style={{ color: '#6b7280' }}>
          اتبع هذه الخطوات لحل مشكلة الصلاحيات
        </p>
      </div>

      {/* مؤشر التقدم */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '2rem',
        padding: '0 1rem'
      }}>
        {Array.from({ length: totalSteps }, (_, i) => (
          <div
            key={i}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: i + 1 <= currentStep ? '#3b82f6' : '#e5e7eb',
              color: i + 1 <= currentStep ? 'white' : '#6b7280',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onClick={() => setCurrentStep(i + 1)}
          >
            {i + 1}
          </div>
        ))}
      </div>

      {/* محتوى الخطوة الحالية */}
      <div style={{
        background: '#f9fafb',
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        padding: '2rem',
        marginBottom: '2rem'
      }}>
        <h3 style={{ 
          color: '#1f2937', 
          marginBottom: '1rem',
          fontSize: '1.3rem'
        }}>
          {steps[currentStep - 1].title}
        </h3>
        {steps[currentStep - 1].content}
      </div>

      {/* أزرار التنقل */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <button
          onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
          disabled={currentStep === 1}
          style={{
            padding: '0.75rem 1.5rem',
            background: currentStep === 1 ? '#e5e7eb' : '#6b7280',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: currentStep === 1 ? 'not-allowed' : 'pointer',
            fontWeight: '600'
          }}
        >
          ← السابق
        </button>

        <span style={{ color: '#6b7280', fontWeight: '600' }}>
          {currentStep} من {totalSteps}
        </span>

        <button
          onClick={() => setCurrentStep(Math.min(totalSteps, currentStep + 1))}
          disabled={currentStep === totalSteps}
          style={{
            padding: '0.75rem 1.5rem',
            background: currentStep === totalSteps ? '#e5e7eb' : '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: currentStep === totalSteps ? 'not-allowed' : 'pointer',
            fontWeight: '600'
          }}
        >
          التالي →
        </button>
      </div>

      {/* رابط مباشر */}
      <div style={{
        marginTop: '2rem',
        padding: '1rem',
        background: '#eff6ff',
        border: '1px solid #3b82f6',
        borderRadius: '8px',
        textAlign: 'center'
      }}>
        <p style={{ margin: '0 0 1rem 0', color: '#1e40af' }}>
          <strong>🚀 رابط مباشر:</strong>
        </p>
        <a
          href="https://console.firebase.google.com"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: '#3b82f6',
            textDecoration: 'none',
            fontWeight: '600'
          }}
        >
          فتح Firebase Console في تبويب جديد ↗️
        </a>
      </div>
    </div>
  );
};

export default FirestorePermissionGuide;
