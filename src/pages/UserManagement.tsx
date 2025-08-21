import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userService, type User } from '../firebase/services';
import PermissionsSummary from '../components/PermissionsSummary';
import '../components/UserManagement.css';

const UserManagement: React.FC = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | 'info'>('info');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    fullName: '',
    email: '',
    role: 'viewer' as 'admin' | 'viewer',
    permissions: {
      canView: true,
      canEdit: false,
      canDelete: false,
      canExportPDF: false,
      canAccessSettings: false,
      canCreateReports: false,
      canEditReports: false,
      canDeleteReports: false,
      canCreateActivities: false,
      canEditActivities: false,
      canDeleteActivities: false,
      canManageUsers: false,
      canViewUserList: false,
      canEditUserPermissions: false,
      canDeactivateUsers: false,
      canAccessArchive: false,
      canModifyProgram: false,
      canAccessAnalytics: false,
    },
    isActive: true
  });

  useEffect(() => {
    // التحقق من صلاحيات المدير
    if (!userService.isAdmin()) {
      navigate('/');
      return;
    }
    loadUsers();
  }, [navigate]);

  const loadUsers = () => {
    const allUsers = userService.getAllUsers();
    setUsers(allUsers);
  };

  const showMessage = (text: string, type: 'success' | 'error' | 'info') => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => setMessage(''), 5000);
  };

  const resetForm = () => {
    setFormData({
      username: '',
      password: '',
      fullName: '',
      email: '',
      role: 'viewer',
      permissions: {
        canView: true,
        canEdit: false,
        canDelete: false,
        canExportPDF: false,
        canAccessSettings: false,
        canCreateReports: false,
        canEditReports: false,
        canDeleteReports: false,
        canCreateActivities: false,
        canEditActivities: false,
        canDeleteActivities: false,
        canManageUsers: false,
        canViewUserList: false,
        canEditUserPermissions: false,
        canDeactivateUsers: false,
        canAccessArchive: false,
        canModifyProgram: false,
        canAccessAnalytics: false,
      },
      isActive: true
    });
    setEditingUser(null);
    setShowAddForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingUser) {
        // تحديث مستخدم موجود
        await userService.updateUser(editingUser.id!, formData);
        showMessage('تم تحديث المستخدم بنجاح', 'success');
      } else {
        // إضافة مستخدم جديد
        await userService.addUser(formData);
        showMessage('تم إضافة المستخدم بنجاح', 'success');
      }
      
      loadUsers();
      resetForm();
    } catch (error: any) {
      showMessage(error.message || 'حدث خطأ في العملية', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      password: user.password,
      fullName: user.fullName,
      email: user.email || '',
      role: user.role,
      permissions: user.permissions,
      isActive: user.isActive
    });
    setShowAddForm(true);
  };

  const handleDelete = async (userId: string) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا المستخدم؟')) {
      return;
    }

    try {
      await userService.deleteUser(userId);
      showMessage('تم حذف المستخدم بنجاح', 'success');
      loadUsers();
    } catch (error: any) {
      showMessage(error.message || 'حدث خطأ في حذف المستخدم', 'error');
    }
  };

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      await userService.updateUser(userId, { isActive: !currentStatus });
      showMessage(`تم ${!currentStatus ? 'تفعيل' : 'إلغاء تفعيل'} المستخدم`, 'success');
      loadUsers();
    } catch (error: any) {
      showMessage(error.message || 'حدث خطأ في تغيير حالة المستخدم', 'error');
    }
  };

  const handlePermissionChange = (permission: keyof User['permissions'], value: boolean) => {
    setFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [permission]: value
      }
    }));
  };

  return (
    <div className="user-management-container" dir="rtl">
      {/* زر العودة */}
      <button
        onClick={() => navigate('/settings')}
        className="back-button"
        title="العودة للإعدادات"
      >
        ←
      </button>

      {/* العنوان الرئيسي */}
      <div className="page-header">
        <h1 className="page-title">👥 إدارة المستخدمين</h1>
        <p className="page-subtitle">إضافة وإدارة حسابات المستخدمين وصلاحياتهم</p>
        <div className="admin-notice" style={{
          background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
          color: 'white',
          padding: '1rem',
          borderRadius: '8px',
          marginTop: '1rem',
          textAlign: 'center',
          fontWeight: '600'
        }}>
          🔐 أنت المدير الوحيد الذي يمكنه إنشاء المستخدمين وتحديد صلاحياتهم
        </div>
        
        {message && (
          <div className={`status-message ${messageType}`}>
            {message}
          </div>
        )}
      </div>

      {/* أزرار الإجراءات */}
      <div className="actions-bar">
        <button
          onClick={() => setShowAddForm(true)}
          className="action-btn primary"
        >
          ➕ إضافة مستخدم جديد
        </button>
        
        <div className="stats">
          <span className="stat-item">
            👥 إجمالي المستخدمين: <strong>{users.length}</strong>
          </span>
          <span className="stat-item">
            ✅ المفعلين: <strong>{users.filter(u => u.isActive).length}</strong>
          </span>
          <span className="stat-item">
            👑 المديرين: <strong>{users.filter(u => u.role === 'admin').length}</strong>
          </span>
        </div>
      </div>

      {/* قائمة المستخدمين */}
      <div className="users-grid">
        {users.map(user => (
          <div key={user.id} className={`user-card ${!user.isActive ? 'inactive' : ''}`}>
            <div className="user-header">
              <div className="user-info">
                <h3 className="user-name">{user.fullName}</h3>
                <p className="user-username">@{user.username}</p>
                {user.email && <p className="user-email">{user.email}</p>}
              </div>
              <div className="user-badges">
                <span className={`role-badge ${user.role}`}>
                  {user.role === 'admin' ? '👑 مدير' : '👤 مشاهد'}
                </span>
                <span className={`status-badge ${user.isActive ? 'active' : 'inactive'}`}>
                  {user.isActive ? '✅ مفعل' : '❌ معطل'}
                </span>
              </div>
            </div>

            <PermissionsSummary user={user} compact={true} />

            <div className="user-actions">
              <button
                onClick={() => handleEdit(user)}
                className="action-btn secondary small"
              >
                ✏️ تعديل
              </button>
              <button
                onClick={() => toggleUserStatus(user.id!, user.isActive)}
                className={`action-btn ${user.isActive ? 'warning' : 'success'} small`}
              >
                {user.isActive ? '❌ إلغاء تفعيل' : '✅ تفعيل'}
              </button>
              <button
                onClick={() => handleDelete(user.id!)}
                className="action-btn danger small"
              >
                🗑️ حذف
              </button>
            </div>

            {user.lastLogin && (
              <div className="user-meta">
                آخر دخول: {
                  // تحقق إذا كان lastLogin من نوع Timestamp
                  'toDate' in user.lastLogin
                    ? user.lastLogin.toDate().toLocaleString('ar-SA')
                    : 'غير معروف' // حالة FieldValue أو undefined
                }
              </div>
            )}
          </div>
        ))}

        {users.length === 0 && (
          <div className="empty-state">
            <h3>لا توجد مستخدمين</h3>
            <p>ابدأ بإضافة مستخدم جديد</p>
          </div>
        )}
      </div>

      {/* نموذج إضافة/تعديل المستخدم */}
      {showAddForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingUser ? 'تعديل المستخدم' : 'إضافة مستخدم جديد'}</h2>
              <button
                onClick={resetForm}
                className="close-btn"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="user-form">
              <div className="form-row">
                <div className="form-group">
                  <label>اسم المستخدم *</label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                    required
                    disabled={!!editingUser}
                  />
                </div>
                <div className="form-group">
                  <label>كلمة المرور *</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>الاسم الكامل *</label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>البريد الإلكتروني</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>نوع الحساب *</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value as 'admin' | 'viewer' }))}
                  >
                    <option value="viewer">مشاهد</option>
                    <option value="admin">مدير</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>حالة الحساب</label>
                  <div className="checkbox-group">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={formData.isActive}
                      onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                    />
                    <label htmlFor="isActive">حساب مفعل</label>
                  </div>
                </div>
              </div>

              <div className="permissions-section">
                <h3>الصلاحيات</h3>
                <div className="permissions-grid">
                  <div className="permission-item">
                    <input
                      type="checkbox"
                      id="canView"
                      checked={formData.permissions.canView}
                      onChange={(e) => handlePermissionChange('canView', e.target.checked)}
                    />
                    <label htmlFor="canView">👁️ مشاهدة المحتوى</label>
                  </div>
                  <div className="permission-item">
                    <input
                      type="checkbox"
                      id="canEdit"
                      checked={formData.permissions.canEdit}
                      onChange={(e) => handlePermissionChange('canEdit', e.target.checked)}
                    />
                    <label htmlFor="canEdit">✏️ تعديل المحتوى</label>
                  </div>
                  <div className="permission-item">
                    <input
                      type="checkbox"
                      id="canDelete"
                      checked={formData.permissions.canDelete}
                      onChange={(e) => handlePermissionChange('canDelete', e.target.checked)}
                    />
                    <label htmlFor="canDelete">🗑️ حذف المحتوى</label>
                  </div>
                  <div className="permission-item">
                    <input
                      type="checkbox"
                      id="canExportPDF"
                      checked={formData.permissions.canExportPDF}
                      onChange={(e) => handlePermissionChange('canExportPDF', e.target.checked)}
                    />
                    <label htmlFor="canExportPDF">📄 تصدير PDF</label>
                  </div>
                  <div className="permission-item">
                    <input
                      type="checkbox"
                      id="canAccessSettings"
                      checked={formData.permissions.canAccessSettings}
                      onChange={(e) => handlePermissionChange('canAccessSettings', e.target.checked)}
                    />
                    <label htmlFor="canAccessSettings">⚙️ الوصول للإعدادات</label>
                  </div>

                  <div className="permission-item">
                    <input
                      type="checkbox"
                      id="canCreateReports"
                      checked={formData.permissions.canCreateReports}
                      onChange={(e) => handlePermissionChange('canCreateReports', e.target.checked)}
                    />
                    <label htmlFor="canCreateReports">📝 إنشاء التقارير</label>
                  </div>

                  <div className="permission-item">
                    <input
                      type="checkbox"
                      id="canEditReports"
                      checked={formData.permissions.canEditReports}
                      onChange={(e) => handlePermissionChange('canEditReports', e.target.checked)}
                    />
                    <label htmlFor="canEditReports">📝 تعديل التقارير</label>
                  </div>

                  <div className="permission-item">
                    <input
                      type="checkbox"
                      id="canDeleteReports"
                      checked={formData.permissions.canDeleteReports}
                      onChange={(e) => handlePermissionChange('canDeleteReports', e.target.checked)}
                    />
                    <label htmlFor="canDeleteReports">🗑️ حذف التقارير</label>
                  </div>

                  <div className="permission-item">
                    <input
                      type="checkbox"
                      id="canCreateActivities"
                      checked={formData.permissions.canCreateActivities}
                      onChange={(e) => handlePermissionChange('canCreateActivities', e.target.checked)}
                    />
                    <label htmlFor="canCreateActivities">🎭 إنشاء الأنشطة</label>
                  </div>

                  <div className="permission-item">
                    <input
                      type="checkbox"
                      id="canEditActivities"
                      checked={formData.permissions.canEditActivities}
                      onChange={(e) => handlePermissionChange('canEditActivities', e.target.checked)}
                    />
                    <label htmlFor="canEditActivities">🎭 تعديل الأنشطة</label>
                  </div>

                  <div className="permission-item">
                    <input
                      type="checkbox"
                      id="canDeleteActivities"
                      checked={formData.permissions.canDeleteActivities}
                      onChange={(e) => handlePermissionChange('canDeleteActivities', e.target.checked)}
                    />
                    <label htmlFor="canDeleteActivities">🗑️ حذف الأنشطة</label>
                  </div>

                  <div className="permission-item">
                    <input
                      type="checkbox"
                      id="canManageUsers"
                      checked={formData.permissions.canManageUsers}
                      onChange={(e) => handlePermissionChange('canManageUsers', e.target.checked)}
                    />
                    <label htmlFor="canManageUsers">👥 إدارة المستخدمين</label>
                  </div>

                  <div className="permission-item">
                    <input
                      type="checkbox"
                      id="canAccessArchive"
                      checked={formData.permissions.canAccessArchive}
                      onChange={(e) => handlePermissionChange('canAccessArchive', e.target.checked)}
                    />
                    <label htmlFor="canAccessArchive">📁 الوصول للأرشيف</label>
                  </div>

                  <div className="permission-item">
                    <input
                      type="checkbox"
                      id="canModifyProgram"
                      checked={formData.permissions.canModifyProgram}
                      onChange={(e) => handlePermissionChange('canModifyProgram', e.target.checked)}
                    />
                    <label htmlFor="canModifyProgram">📅 تعديل البرنامج</label>
                  </div>

                  <div className="permission-item">
                    <input
                      type="checkbox"
                      id="canAccessAnalytics"
                      checked={formData.permissions.canAccessAnalytics}
                      onChange={(e) => handlePermissionChange('canAccessAnalytics', e.target.checked)}
                    />
                    <label htmlFor="canAccessAnalytics">📊 الوصول للإحصائيات</label>
                  </div>
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="submit"
                  disabled={loading}
                  className="action-btn primary"
                >
                  {loading ? '⏳ جاري الحفظ...' : (editingUser ? '💾 تحديث' : '➕ إضافة')}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="action-btn secondary"
                >
                  ❌ إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
