import React from 'react';
import { Navigate } from 'react-router-dom';
import { userService } from '../firebase/services';
import './ProtectedRoute.css';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  requirePermission?: keyof import('../firebase/services').User['permissions'];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAdmin = false,
  requirePermission
}) => {
  const currentUser = userService.getCurrentUser();

  // إذا لم يكن هناك مستخدم مسجل دخول
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // إذا كان الحساب غير مفعل
  if (!currentUser.isActive) {
    return (
      <div className="access-denied" dir="rtl">
        <div className="access-denied-content">
          <h2>🚫 الحساب غير مفعل</h2>
          <p>تم إلغاء تفعيل حسابك. يرجى التواصل مع المدير</p>
          <button onClick={() => {
            userService.logout();
            window.location.href = '/login';
          }}>
            🚪 تسجيل الخروج
          </button>
        </div>
      </div>
    );
  }

  // إذا كان يتطلب صلاحيات مدير
  if (requireAdmin && !userService.isAdmin()) {
    return (
      <div className="access-denied" dir="rtl">
        <div className="access-denied-content">
          <h2>🚫 غير مسموح بالوصول</h2>
          <p>هذه الصفحة مخصصة للمديرين فقط</p>
          <button onClick={() => window.history.back()}>
            ← العودة
          </button>
        </div>
      </div>
    );
  }

  // إذا كان يتطلب صلاحية معينة
  if (requirePermission && !userService.hasPermission(requirePermission)) {
    return (
      <div className="access-denied" dir="rtl">
        <div className="access-denied-content">
          <h2>🚫 غير مسموح بالوصول</h2>
          <p>ليس لديك الصلاحية للوصول لهذه الصفحة</p>
          <button onClick={() => window.history.back()}>
            ← العودة
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
