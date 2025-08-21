import React, { useState, useEffect } from 'react';
import './SmartNotifications.css';

interface Activity {
  id: string;
  title: string;
  date: string;
  time: string;
  type: 'workshop' | 'performance' | 'meeting' | 'rehearsal';
  priority: 'high' | 'medium' | 'low';
  participants?: string[];
  location?: string;
}

interface SmartNotificationsProps {
  activities: Activity[];
  onClose: () => void;
  onNotificationAction: (action: string, activityId: string) => void;
}

const SmartNotifications: React.FC<SmartNotificationsProps> = ({
  activities,
  onClose,
  onNotificationAction
}) => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [autoReminders, setAutoReminders] = useState(true);

  // تحديد الأنشطة القادمة
  const getUpcomingActivities = () => {
    const now = new Date();
    const upcoming = activities.filter(activity => {
      const activityDate = new Date(activity.date + ' ' + activity.time);
      const timeDiff = activityDate.getTime() - now.getTime();
      const hoursDiff = timeDiff / (1000 * 3600);
      
      return hoursDiff > 0 && hoursDiff <= 24; // الأنشطة في الـ 24 ساعة القادمة
    });

    return upcoming.sort((a, b) => {
      const dateA = new Date(a.date + ' ' + a.time);
      const dateB = new Date(b.date + ' ' + b.time);
      return dateA.getTime() - dateB.getTime();
    });
  };

  // إنشاء إشعارات ذكية
  const createSmartNotifications = () => {
    const upcoming = getUpcomingActivities();
    const newNotifications = upcoming.map(activity => {
      const activityDate = new Date(activity.date + ' ' + activity.time);
      const now = new Date();
      const timeDiff = activityDate.getTime() - now.getTime();
      const hoursDiff = Math.floor(timeDiff / (1000 * 3600));
      const minutesDiff = Math.floor((timeDiff % (1000 * 3600)) / (1000 * 60));

      let urgencyLevel = 'info';
      let message = '';
      
      if (hoursDiff < 1) {
        urgencyLevel = 'urgent';
        message = `🚨 النشاط "${activity.title}" سيبدأ خلال ${minutesDiff} دقيقة!`;
      } else if (hoursDiff < 3) {
        urgencyLevel = 'warning';
        message = `⏰ النشاط "${activity.title}" سيبدأ خلال ${hoursDiff} ساعة`;
      } else {
        urgencyLevel = 'info';
        message = `📅 لديك نشاط "${activity.title}" اليوم في ${activity.time}`;
      }

      return {
        id: activity.id,
        message,
        urgencyLevel,
        activity,
        timestamp: new Date(),
        actions: ['تذكير لاحقاً', 'تم الاطلاع', 'عرض التفاصيل']
      };
    });

    setNotifications(newNotifications);
  };

  // تشغيل صوت الإشعار
  const playNotificationSound = (urgencyLevel: string) => {
    if (!soundEnabled) return;

    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // أصوات مختلفة حسب الأولوية
    switch (urgencyLevel) {
      case 'urgent':
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.2);
        break;
      case 'warning':
        oscillator.frequency.setValueAtTime(500, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(400, audioContext.currentTime + 0.15);
        break;
      default:
        oscillator.frequency.setValueAtTime(300, audioContext.currentTime);
    }

    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
  };

  // التحقق من الإشعارات كل دقيقة
  useEffect(() => {
    if (autoReminders) {
      createSmartNotifications();
      const interval = setInterval(createSmartNotifications, 60000); // كل دقيقة
      return () => clearInterval(interval);
    }
  }, [activities, autoReminders]);

  // تشغيل الصوت عند ظهور إشعار جديد
  useEffect(() => {
    if (notifications.length > 0) {
      const latestNotification = notifications[notifications.length - 1];
      playNotificationSound(latestNotification.urgencyLevel);
    }
  }, [notifications.length, soundEnabled]);

  const handleNotificationAction = (action: string, notificationId: string) => {
    const notification = notifications.find(n => n.id === notificationId);
    if (notification) {
      onNotificationAction(action, notification.activity.id);
      
      if (action === 'تم الاطلاع') {
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
      }
    }
  };

  const getNotificationIcon = (urgencyLevel: string) => {
    switch (urgencyLevel) {
      case 'urgent': return '🚨';
      case 'warning': return '⏰';
      default: return '📅';
    }
  };

  const getTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'الآن';
    if (minutes < 60) return `منذ ${minutes} دقيقة`;
    const hours = Math.floor(minutes / 60);
    return `منذ ${hours} ساعة`;
  };

  return (
    <div className="smart-notifications-overlay">
      <div className="smart-notifications-panel">
        <div className="notifications-header">
          <h3>🔔 الإشعارات الذكية</h3>
          <div className="notifications-controls">
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={soundEnabled}
                onChange={(e) => setSoundEnabled(e.target.checked)}
              />
              <span className="toggle-slider"></span>
              🔊 الصوت
            </label>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={autoReminders}
                onChange={(e) => setAutoReminders(e.target.checked)}
              />
              <span className="toggle-slider"></span>
              📱 تذكير تلقائي
            </label>
            <button className="close-btn" onClick={onClose}>✕</button>
          </div>
        </div>

        <div className="notifications-list">
          {notifications.length === 0 ? (
            <div className="no-notifications">
              <div className="no-notifications-icon">🎭</div>
              <p>لا توجد إشعارات جديدة</p>
              <small>سيتم إشعارك بالأنشطة القادمة تلقائياً</small>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`notification-item ${notification.urgencyLevel}`}
              >
                <div className="notification-icon">
                  {getNotificationIcon(notification.urgencyLevel)}
                </div>
                <div className="notification-content">
                  <div className="notification-message">
                    {notification.message}
                  </div>
                  <div className="notification-details">
                    <span className="notification-time">
                      {getTimeAgo(notification.timestamp)}
                    </span>
                    {notification.activity.location && (
                      <span className="notification-location">
                        📍 {notification.activity.location}
                      </span>
                    )}
                  </div>
                  <div className="notification-actions">
                    {notification.actions.map((action: string) => (
                      <button
                        key={action}
                        className={`action-btn ${action === 'تم الاطلاع' ? 'primary' : ''}`}
                        onClick={() => handleNotificationAction(action, notification.id)}
                      >
                        {action}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="notifications-footer">
          <div className="quick-stats">
            <span>📊 {notifications.length} إشعار نشط</span>
            <span>🎯 {getUpcomingActivities().length} نشاط قادم</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmartNotifications;
