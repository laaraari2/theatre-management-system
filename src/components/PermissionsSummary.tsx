import React from 'react';
import type { User } from '../firebase/services';
import './PermissionsSummary.css';

interface PermissionsSummaryProps {
  user: User;
  compact?: boolean;
}

const PermissionsSummary: React.FC<PermissionsSummaryProps> = ({ user, compact = false }) => {
  const permissionGroups = [
    {
      title: 'المحتوى العام',
      permissions: [
        { key: 'canView', label: 'مشاهدة', icon: '👁️' },
        { key: 'canEdit', label: 'تعديل عام', icon: '✏️' },
        { key: 'canDelete', label: 'حذف عام', icon: '🗑️' },
        { key: 'canExportPDF', label: 'تصدير PDF', icon: '📄' },
      ]
    },
    {
      title: 'التقارير',
      permissions: [
        { key: 'canCreateReports', label: 'إنشاء تقارير', icon: '📝' },
        { key: 'canEditReports', label: 'تعديل تقارير', icon: '📝' },
        { key: 'canDeleteReports', label: 'حذف تقارير', icon: '🗑️' },
      ]
    },
    {
      title: 'الأنشطة',
      permissions: [
        { key: 'canCreateActivities', label: 'إنشاء أنشطة', icon: '🎭' },
        { key: 'canEditActivities', label: 'تعديل أنشطة', icon: '🎭' },
        { key: 'canDeleteActivities', label: 'حذف أنشطة', icon: '🗑️' },
      ]
    },
    {
      title: 'الإدارة',
      permissions: [
        { key: 'canManageUsers', label: 'إدارة مستخدمين', icon: '👥' },
        { key: 'canAccessSettings', label: 'الإعدادات', icon: '⚙️' },
        { key: 'canAccessArchive', label: 'الأرشيف', icon: '📁' },
        { key: 'canModifyProgram', label: 'تعديل البرنامج', icon: '📅' },
        { key: 'canAccessAnalytics', label: 'الإحصائيات', icon: '📊' },
      ]
    }
  ];

  if (compact) {
    const activePermissions = permissionGroups
      .flatMap(group => group.permissions)
      .filter(permission => user.permissions[permission.key as keyof typeof user.permissions]);

    return (
      <div className="permissions-summary compact">
        {activePermissions.length === 0 ? (
          <span className="no-permissions">❌ لا توجد صلاحيات</span>
        ) : (
          activePermissions.slice(0, 3).map(permission => (
            <span key={permission.key} className="permission-badge">
              {permission.icon} {permission.label}
            </span>
          ))
        )}
        {activePermissions.length > 3 && (
          <span className="more-permissions">+{activePermissions.length - 3} أخرى</span>
        )}
      </div>
    );
  }

  return (
    <div className="permissions-summary">
      <h4>الصلاحيات المخولة:</h4>
      {permissionGroups.map(group => {
        const activePermissions = group.permissions.filter(
          permission => user.permissions[permission.key as keyof typeof user.permissions]
        );

        if (activePermissions.length === 0) return null;

        return (
          <div key={group.title} className="permission-group">
            <h5>{group.title}</h5>
            <div className="permissions-list">
              {activePermissions.map(permission => (
                <span key={permission.key} className="permission-badge">
                  {permission.icon} {permission.label}
                </span>
              ))}
            </div>
          </div>
        );
      })}
      
      {permissionGroups.every(group => 
        group.permissions.every(permission => 
          !user.permissions[permission.key as keyof typeof user.permissions]
        )
      ) && (
        <div className="no-permissions-message">
          ❌ لم يتم منح أي صلاحيات لهذا المستخدم
        </div>
      )}
    </div>
  );
};

export default PermissionsSummary;
