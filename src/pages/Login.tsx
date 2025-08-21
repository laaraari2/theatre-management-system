import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userService } from '../firebase/services';
import '../components/Login.css';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // إنشاء المدير الافتراضي إذا لم يكن موجود
    userService.initializeDefaultAdmin();

    // إذا كان المستخدم مسجل دخول بالفعل، توجيهه للصفحة الرئيسية
    const currentUser = userService.getCurrentUser();
    if (currentUser) {
      // إعادة تحميل بيانات المستخدم للتأكد من أحدث الصلاحيات
      userService.refreshCurrentUser();
      navigate('/');
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const user = await userService.login(formData.username, formData.password);
      if (user) {
        // إعادة تحميل بيانات المستخدم للتأكد من أحدث الصلاحيات
        userService.refreshCurrentUser();
        navigate('/');
      }
    } catch (error: any) {
      setError(error.message || 'حدث خطأ في تسجيل الدخول');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="login-container" dir="rtl">
      <div className="login-card">
        <div className="login-header">
          <div className="logo">
            <h1>🎭</h1>
            <h2>منصة الأنشطة المسرحية</h2>
            <p>مجموعة مدارس العمران</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <h3>تسجيل الدخول</h3>
          
          {error && (
            <div className="error-message">
              ❌ {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="username">اسم المستخدم</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              required
              placeholder="أدخل اسم المستخدم"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">كلمة المرور</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              placeholder="أدخل كلمة المرور"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="login-btn"
          >
            {loading ? (
              <>
                <div className="loading-spinner"></div>
                جاري تسجيل الدخول...
              </>
            ) : (
              <>
                🔑 تسجيل الدخول
              </>
            )}
          </button>
        </form>

        <div className="login-footer">
          <div className="default-credentials">
            <h4>🔑 الحسابات المتاحة:</h4>

            <div className="credentials-section">
              <h5>👑 المدير:</h5>
              <p><strong>المستخدم:</strong> admin | <strong>كلمة المرور:</strong> admin123</p>
            </div>

            <div className="credentials-section">
              <h5>👥 الإدارة (مشاهدة + PDF فقط):</h5>
              <p><strong>المستخدم:</strong> manager1 | <strong>كلمة المرور:</strong> 123456</p>
              <p><strong>المستخدم:</strong> manager2 | <strong>كلمة المرور:</strong> 123456</p>
              <p><strong>المستخدم:</strong> supervisor | <strong>كلمة المرور:</strong> 123456</p>
            </div>
          </div>
        </div>

        <div className="supervisor-info">
          <p>تحت إشراف: <strong>الأستاذ مصطفى لعرعري</strong></p>
          <p>© 2025 جميع الحقوق محفوظة</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
