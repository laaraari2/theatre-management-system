import React, { useState } from 'react';
import { authService, type UserProfile as UserProfileType } from '../firebase/auth';
import './UserProfile.css';

interface UserProfileProps {
  user: any;
  userProfile: UserProfileType | null;
  onSignOut: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ user, userProfile, onSignOut }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  const handleSignOut = async () => {
    try {
      await authService.signOut();
      onSignOut();
    } catch (error) {
      console.error('خطأ في تسجيل الخروج:', error);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return '👑';
      case 'teacher': return '👨‍🏫';
      case 'student': return '🎓';
      default: return '👤';
    }
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case 'admin': return 'مدير';
      case 'teacher': return 'مدرس';
      case 'student': return 'طالب';
      default: return 'مستخدم';
    }
  };

  return (
    <div className="user-profile-container">
      <div 
        className="user-profile-trigger"
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
      >
        <div className="user-avatar">
          {user.photoURL ? (
            <img src={user.photoURL} alt="صورة المستخدم" />
          ) : (
            <span className="avatar-placeholder">
              {userProfile?.displayName?.charAt(0) || user.email?.charAt(0) || '👤'}
            </span>
          )}
        </div>
        <div className="user-info">
          <span className="user-name">
            {userProfile?.displayName || user.displayName || 'مستخدم'}
          </span>
          <span className="user-role">
            {userProfile?.role && (
              <>
                {getRoleIcon(userProfile.role)} {getRoleText(userProfile.role)}
              </>
            )}
          </span>
        </div>
        <span className="dropdown-arrow">▼</span>
      </div>

      {isDropdownOpen && (
        <div className="user-dropdown">
          <div className="dropdown-header">
            <div className="user-email">{user.email}</div>
            <div className="user-status">🟢 متصل</div>
          </div>
          
          <div className="dropdown-menu">
            <button 
              className="dropdown-item"
              onClick={() => {
                setShowProfileModal(true);
                setIsDropdownOpen(false);
              }}
            >
              ⚙️ إعدادات الحساب
            </button>
            
            <button 
              className="dropdown-item"
              onClick={() => setIsDropdownOpen(false)}
            >
              📊 الإحصائيات الشخصية
            </button>
            
            <div className="dropdown-divider"></div>
            
            <button 
              className="dropdown-item signout-item"
              onClick={handleSignOut}
            >
              🚪 تسجيل الخروج
            </button>
          </div>
        </div>
      )}

      {/* Profile Modal */}
      {showProfileModal && (
        <div className="profile-modal-overlay" onClick={() => setShowProfileModal(false)}>
          <div className="profile-modal" onClick={(e) => e.stopPropagation()}>
            <div className="profile-modal-header">
              <h3>⚙️ إعدادات الحساب</h3>
              <button 
                className="close-btn"
                onClick={() => setShowProfileModal(false)}
              >
                ×
              </button>
            </div>
            
            <div className="profile-modal-body">
              <div className="profile-info">
                <div className="profile-avatar-large">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="صورة المستخدم" />
                  ) : (
                    <span className="avatar-placeholder-large">
                      {userProfile?.displayName?.charAt(0) || user.email?.charAt(0) || '👤'}
                    </span>
                  )}
                </div>
                
                <div className="profile-details">
                  <div className="detail-item">
                    <label>الاسم:</label>
                    <span>{userProfile?.displayName || user.displayName || 'غير محدد'}</span>
                  </div>
                  
                  <div className="detail-item">
                    <label>البريد الإلكتروني:</label>
                    <span>{user.email}</span>
                  </div>
                  
                  <div className="detail-item">
                    <label>الدور:</label>
                    <span>
                      {userProfile?.role && (
                        <>
                          {getRoleIcon(userProfile.role)} {getRoleText(userProfile.role)}
                        </>
                      )}
                    </span>
                  </div>
                  
                  <div className="detail-item">
                    <label>تاريخ الانضمام:</label>
                    <span>
                      {userProfile?.createdAt ? 
                        new Date(userProfile.createdAt).toLocaleDateString('ar-SA') : 
                        'غير محدد'
                      }
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="profile-actions">
                <button className="profile-btn primary">
                  ✏️ تعديل الملف الشخصي
                </button>
                <button className="profile-btn secondary">
                  🔒 تغيير كلمة المرور
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
