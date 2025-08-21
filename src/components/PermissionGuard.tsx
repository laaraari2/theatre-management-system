import React from 'react';
import { userService } from '../firebase/services';

interface PermissionGuardProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  requirePermission?: keyof import('../firebase/services').User['permissions'];
  fallback?: React.ReactNode;
}

const PermissionGuard: React.FC<PermissionGuardProps> = ({ 
  children, 
  requireAdmin = false,
  requirePermission,
  fallback = null
}) => {
  const currentUser = userService.getCurrentUser();

  // إذا لم يكن هناك مستخدم مسجل دخول
  if (!currentUser) {
    return <>{fallback}</>;
  }

  // إذا كان يتطلب صلاحيات مدير
  if (requireAdmin && !userService.isAdmin()) {
    return <>{fallback}</>;
  }

  // إذا كان يتطلب صلاحية معينة
  if (requirePermission && !userService.hasPermission(requirePermission)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

export default PermissionGuard;
