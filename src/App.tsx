import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import './App.css';
import Home from './pages/Home';
import Program from './pages/Program';
import Weekly from './pages/Weekly';
import YearProject from './pages/YearProject';
import Reports from './pages/Reports';
import CreateReport from './pages/CreateReport';
import EditReport from './pages/EditReport';
import Archive from './pages/Archive';
import ActivityReport from './pages/ActivityReport';
import Settings from './pages/Settings';
import UserManagement from './pages/UserManagement';
import Login from './pages/Login';
import Holidays from './pages/Holidays';
import NationalDays from './pages/NationalDays';
import AuthModal from './components/AuthModal';
import UserProfile from './components/UserProfile';
import ErrorBoundary from './components/ErrorBoundary';
import DropdownMenu from './components/DropdownMenu';
import ProtectedRoute from './components/ProtectedRoute';
import DevSettings from './components/DevSettings';
import { authService, type UserProfile as UserProfileType } from './firebase/auth';
import { userService } from './firebase/services';
import { AuthProvider } from './contexts/AuthContext';

function App() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<UserProfileType | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // تحديد الـ basename حسب البيئة والـ URL الحالي
  const getBasename = () => {
    const currentPath = window.location.pathname;
    if (currentPath.startsWith('/theatre-activities')) {
      return '/theatre-activities';
    }
    if (currentPath.startsWith('/theatre')) {
      return '/theatre';
    }
    return process.env.NODE_ENV === 'production' ? '/theatre-activities' : '';
  };

  // مراقبة حالة المصادقة
  useEffect(() => {
    // إنشاء المدير الافتراضي
    userService.initializeDefaultAdmin();

    // التحقق من المستخدم الحالي
    const checkCurrentUser = () => {
      const user = userService.getCurrentUser();
      setCurrentUser(user);
      setAuthLoading(false);

      // إذا لم يكن هناك مستخدم مسجل، لا نقوم بإعادة التوجيه هنا
      // سنتركه لـ React Router يتعامل معه
    };

    checkCurrentUser();

    // مراقبة تغييرات localStorage
    const handleStorageChange = () => {
      checkCurrentUser();
    };

    window.addEventListener('storage', handleStorageChange);

    // مراقبة Firebase Auth (للنظام القديم)
    const unsubscribe = authService.onAuthStateChanged(async (user) => {
      setUser(user);

      if (user) {
        const profile = await authService.getUserProfile(user.uid);
        setUserProfile(profile);
      } else {
        setUserProfile(null);
      }
    });

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      unsubscribe();
    };
  }, []);

  // مراقبة إضافية لحالة المستخدم
  useEffect(() => {
    const interval = setInterval(() => {
      const user = userService.getCurrentUser();
      if (JSON.stringify(user) !== JSON.stringify(currentUser)) {
        setCurrentUser(user);
      }
    }, 500); // فحص كل نصف ثانية

    return () => clearInterval(interval);
  }, [currentUser]);

  const toggleMobileMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
  };

  const handleSignOut = () => {
    // تسجيل خروج من النظام الجديد
    userService.logout();
    setCurrentUser(null);

    // تسجيل خروج من Firebase (للنظام القديم)
    setUser(null);
    setUserProfile(null);

    // إعادة تحميل الصفحة للتأكد من التحديث
    const basePath = getBasename();
    window.location.href = basePath + '/login';
  };





  // Close menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (isMobileMenuOpen && !target.closest('.header')) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isMobileMenuOpen]);



  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router basename={getBasename()}>
          <div className="App">
        {/* زر تسجيل الخروج العلوي */}
        {currentUser && (
          <div className="top-logout-bar">
            <span>مرحباً {currentUser.fullName} ({currentUser.role === 'admin' ? 'مدير' : 'مشاهد'})</span>
            <button onClick={handleSignOut} className="top-logout-btn">
              🚪 تسجيل الخروج
            </button>
          </div>
        )}

        {/* Header */}
        <header className="header">
          <div className="container">
            <div className="header-top-row">
              <h1 className="logo">الأستاذ مصطفى لعرعري</h1>

              <nav className={`nav ${isMobileMenuOpen ? 'nav-open' : ''}`} onClick={(e) => e.stopPropagation()}>
                <Link to="/" className="nav-link" onClick={closeMobileMenu}>الرئيسية</Link>
                <Link to="/holidays" className="nav-link" onClick={closeMobileMenu}>العطل المدرسية</Link>
                <Link to="/national-days" className="nav-link" onClick={closeMobileMenu}>المناسبات الوطنية والعالمية</Link>

                <DropdownMenu
                  title="البرنامج"
                  icon="📅"
                  items={[
                    { to: "/program", label: "البرنامج العام", icon: "📊" },
                    { to: "/weekly", label: "البرنامج الأسبوعي", icon: "📆" },
                    { to: "/year-project", label: "مشروع السنة", icon: "🎭" }
                  ]}
                  onItemClick={closeMobileMenu}
                />

                <Link to="/reports" className="nav-link" onClick={closeMobileMenu}>التقارير</Link>
                <Link to="/archive" className="nav-link" onClick={closeMobileMenu}>الأرشيف</Link>
                {userService.isAdmin() && (
                  <Link to="/settings" className="nav-link" onClick={closeMobileMenu}>⚙️ الإعدادات</Link>
                )}
              </nav>

              {/* Auth Section */}
              <div className="auth-section">
                {authLoading ? (
                  <div className="auth-loading">⏳</div>
                ) : currentUser ? (
                  <div className="user-info">
                    <span className="user-name">مرحباً، {currentUser.fullName}</span>
                    <span className="user-role">
                      {currentUser.role === 'admin' ? '👑 مدير' : '👤 مشاهد'}
                    </span>
                    <button
                      className="logout-btn-text"
                      onClick={handleSignOut}
                      title="تسجيل الخروج"
                    >
                      🚪 خروج
                    </button>
                  </div>
                ) : user ? (
                  <UserProfile
                    user={user}
                    userProfile={userProfile}
                    onSignOut={handleSignOut}
                  />
                ) : (
                  <Link to="/login" className="auth-btn">
                    🔐 تسجيل الدخول
                  </Link>
                )}
              </div>

              <button className="mobile-menu-btn" onClick={toggleMobileMenu}>
                ☰
              </button>
            </div>
            <div className="header-info">
              <p className="supervisor-name">مسؤول عن الأنشطة المسرحية - مجموعة مدارس العمران</p>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="main">
          <Routes>
            <Route path="/" element={
              currentUser ? (
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              ) : (
                <Navigate to="/login" replace />
              )
            } />
            <Route path="/theatre" element={<Navigate to="/" replace />} />
            <Route path="/holidays" element={
              <ProtectedRoute>
                <Holidays />
              </ProtectedRoute>
            } />
            <Route path="/national-days" element={
              <ProtectedRoute>
                <NationalDays />
              </ProtectedRoute>
            } />
            <Route path="/program" element={
              <ProtectedRoute>
                <Program />
              </ProtectedRoute>
            } />
            <Route path="/weekly" element={
              <ProtectedRoute>
                <Weekly />
              </ProtectedRoute>
            } />
            <Route path="/year-project" element={
              <ProtectedRoute>
                <YearProject />
              </ProtectedRoute>
            } />
            <Route path="/reports" element={
              <ProtectedRoute>
                <Reports />
              </ProtectedRoute>
            } />
            <Route path="/create-report" element={
              <ProtectedRoute requirePermission="canCreateReports">
                <CreateReport />
              </ProtectedRoute>
            } />
            <Route path="/edit-report/:id" element={
              <ProtectedRoute requirePermission="canEditReports">
                <EditReport />
              </ProtectedRoute>
            } />
            <Route path="/archive" element={
              <ProtectedRoute requirePermission="canAccessArchive">
                <Archive />
              </ProtectedRoute>
            } />
            <Route path="/activity-report/:activityId" element={
              <ProtectedRoute>
                <ActivityReport />
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute requireAdmin={true}>
                <Settings />
              </ProtectedRoute>
            } />
            <Route path="/user-management" element={
              <ProtectedRoute requireAdmin={true}>
                <UserManagement />
              </ProtectedRoute>
            } />
            <Route path="/login" element={<Login />} />
            {/* صفحة إعدادات المطور المخفية */}
            <Route path="/dev-settings" element={<DevSettings />} />
            {/* إعادة توجيه أي مسار غير معروف لصفحة تسجيل الدخول */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="footer">
          <div className="container">
            <p>&copy; 2025 مصطفى لعرعري - جميع الحقوق محفوظة</p>
          </div>
        </footer>

        {/* Auth Modal */}
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onSuccess={handleAuthSuccess}
        />
          </div>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
