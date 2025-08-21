import React, { useState } from 'react';
import { authService } from '../firebase/auth';
import './AuthModal.css';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    displayName: '',
    role: 'teacher' as 'admin' | 'teacher' | 'student'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        await authService.signInWithEmail(formData.email, formData.password);
      } else {
        await authService.createAccount(
          formData.email, 
          formData.password, 
          formData.displayName, 
          formData.role
        );
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      setError(getErrorMessage(error.code));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');

    try {
      await authService.signInWithGoogle();
      onSuccess();
      onClose();
    } catch (error: any) {
      setError(getErrorMessage(error.code));
    } finally {
      setLoading(false);
    }
  };

  const getErrorMessage = (errorCode: string) => {
    switch (errorCode) {
      case 'auth/user-not-found':
        return 'المستخدم غير موجود';
      case 'auth/wrong-password':
        return 'كلمة المرور خاطئة';
      case 'auth/email-already-in-use':
        return 'البريد الإلكتروني مستخدم بالفعل';
      case 'auth/weak-password':
        return 'كلمة المرور ضعيفة';
      case 'auth/invalid-email':
        return 'البريد الإلكتروني غير صحيح';
      default:
        return 'حدث خطأ غير متوقع';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="auth-modal-overlay" onClick={onClose}>
      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
        <div className="auth-modal-header">
          <h2>{isLogin ? '🔐 تسجيل الدخول' : '📝 إنشاء حساب جديد'}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="auth-modal-body">
          {error && (
            <div className="error-message">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            {!isLogin && (
              <div className="form-group">
                <label>الاسم الكامل:</label>
                <input
                  type="text"
                  value={formData.displayName}
                  onChange={(e) => setFormData({...formData, displayName: e.target.value})}
                  placeholder="أدخل اسمك الكامل"
                  required={!isLogin}
                />
              </div>
            )}

            <div className="form-group">
              <label>البريد الإلكتروني:</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder="example@email.com"
                required
              />
            </div>

            <div className="form-group">
              <label>كلمة المرور:</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                placeholder="أدخل كلمة المرور"
                required
              />
            </div>

            {!isLogin && (
              <div className="form-group">
                <label>الدور:</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value as any})}
                >
                  <option value="teacher">مدرس</option>
                  <option value="student">طالب</option>
                  <option value="admin">مدير</option>
                </select>
              </div>
            )}

            <button 
              type="submit" 
              className="auth-submit-btn"
              disabled={loading}
            >
              {loading ? '⏳ جاري المعالجة...' : (isLogin ? '🔓 دخول' : '✅ إنشاء حساب')}
            </button>
          </form>

          <div className="auth-divider">
            <span>أو</span>
          </div>

          <button 
            className="google-signin-btn"
            onClick={handleGoogleSignIn}
            disabled={loading}
          >
            🌐 تسجيل الدخول بـ Google
          </button>

          <div className="auth-switch">
            {isLogin ? (
              <p>
                ليس لديك حساب؟ 
                <button 
                  type="button" 
                  className="switch-btn"
                  onClick={() => setIsLogin(false)}
                >
                  إنشاء حساب جديد
                </button>
              </p>
            ) : (
              <p>
                لديك حساب بالفعل؟ 
                <button 
                  type="button" 
                  className="switch-btn"
                  onClick={() => setIsLogin(true)}
                >
                  تسجيل الدخول
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
