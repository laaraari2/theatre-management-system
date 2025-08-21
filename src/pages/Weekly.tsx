import React, { useState } from 'react';
import '../pages.css';
// تم إزالة useLocalStorage لاستخدام Firebase فقط
import Notification from '../components/Notification';
import PermissionGuard from '../components/PermissionGuard';

interface Session {
  time: string;
  class: string;
  activity: string;
  room: string;
}

interface DaySchedule {
  day: string;
  sessions: Session[];
}

const Weekly: React.FC = () => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingSession, setEditingSession] = useState<{dayIndex: number, sessionIndex: number} | null>(null);
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
  } | null>(null);

  const defaultSchedule: DaySchedule[] = [
    {
      day: "الأحد",
      sessions: [
        { time: "8:00 - 9:30", class: "ما قبل التمدرس الأول", activity: "ألعاب حركية وتعبيرية", room: "قاعة الأنشطة" },
        { time: "10:00 - 11:30", class: "الأول ابتدائي", activity: "تمارين التعبير الحركي", room: "قاعة الأنشطة" },
        { time: "2:00 - 3:30", class: "الثالثة إعدادي 1", activity: "تدريب على النص المسرحي", room: "المسرح الرئيسي" }
      ]
    },
    {
      day: "الاثنين",
      sessions: [
        { time: "8:30 - 10:00", class: "ما قبل التمدرس الثاني", activity: "قصص تفاعلية", room: "قاعة الأنشطة" },
        { time: "10:30 - 12:00", class: "الثاني ابتدائي", activity: "ألعاب مسرحية تعليمية", room: "قاعة الأنشطة" },
        { time: "2:00 - 3:30", class: "الأولى إعدادي 1", activity: "ورشة الإلقاء", room: "المسرح الرئيسي" }
      ]
    },
    {
      day: "الثلاثاء",
      sessions: [
        { time: "8:00 - 9:30", class: "الثالث ابتدائي", activity: "مسرح العرائس", room: "قاعة الأنشطة" },
        { time: "10:00 - 11:30", class: "الرابع ابتدائي", activity: "التمثيل والحوار", room: "قاعة الأنشطة" },
        { time: "2:00 - 3:30", class: "الثانية إعدادي 1", activity: "تدريب على الحوار", room: "المسرح الرئيسي" }
      ]
    },
    {
      day: "الأربعاء",
      sessions: [
        { time: "8:30 - 10:00", class: "الخامس ابتدائي", activity: "مسرح الظل", room: "قاعة الأنشطة" },
        { time: "10:30 - 12:00", class: "السادس ابتدائي", activity: "التمثيل الصامت", room: "قاعة الأنشطة" },
        { time: "2:00 - 3:30", class: "الأولى إعدادي 2", activity: "إعداد العروض", room: "المسرح الرئيسي" }
      ]
    },
    {
      day: "الخميس",
      sessions: [
        { time: "9:00 - 10:30", class: "الثانية إعدادي 2", activity: "كتابة النصوص", room: "المسرح الرئيسي" },
        { time: "11:00 - 12:30", class: "الثالثة إعدادي 2", activity: "الإخراج المسرحي", room: "المسرح الرئيسي" }
      ]
    }
  ];

  // استخدام Firebase فقط - البيانات ستأتي من Firebase
  const [weeklySchedule, setWeeklySchedule] = useState<DaySchedule[]>(defaultSchedule);

  // تحميل PDF للطباعة في المحلات التجارية
  const downloadForPrinting = () => {
    // إنشاء عنصر مؤقت للمحتوى
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = generatePrintingContent();
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px';
    tempDiv.style.top = '-9999px';
    tempDiv.style.width = '210mm'; // عرض A4
    tempDiv.style.fontFamily = 'Arial, sans-serif';
    tempDiv.style.direction = 'rtl';
    tempDiv.style.fontSize = '12px';

    document.body.appendChild(tempDiv);

    // استخدام html2canvas و jsPDF لتحويل إلى PDF
    import('html2canvas').then(html2canvas => {
      import('jspdf').then(({ jsPDF }) => {
        html2canvas.default(tempDiv, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff'
        }).then(canvas => {
          const imgData = canvas.toDataURL('image/png');
          const pdf = new jsPDF('p', 'mm', 'a4');

          const imgWidth = 210; // عرض A4 بالمم
          const pageHeight = 295; // ارتفاع A4 بالمم
          const imgHeight = (canvas.height * imgWidth) / canvas.width;
          let heightLeft = imgHeight;

          let position = 0;

          // إضافة الصفحة الأولى
          pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;

          // إضافة صفحات إضافية إذا لزم الأمر
          while (heightLeft >= 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
          }

          // تحميل الملف
          const convertArabicToEnglish = (str: string) => {
            const arabicNumbers = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
            const englishNumbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

            let result = str;
            for (let i = 0; i < arabicNumbers.length; i++) {
              result = result.replace(new RegExp(arabicNumbers[i], 'g'), englishNumbers[i]);
            }
            return result;
          };

          const fileDate = convertArabicToEnglish(new Date().toLocaleDateString('ar-EG')).replace(/\//g, '-');
          const fileName = `البرنامج_الأسبوعي_للطباعة_${fileDate}.pdf`;
          pdf.save(fileName);

          // إزالة العنصر المؤقت
          document.body.removeChild(tempDiv);

          showNotification('تم تحميل ملف PDF بنجاح!', 'success');
        }).catch(error => {
          console.error('خطأ في إنشاء PDF:', error);
          document.body.removeChild(tempDiv);
          showNotification('حدث خطأ في تحميل الملف', 'error');
        });
      });
    }).catch(error => {
      console.error('خطأ في تحميل المكتبات:', error);
      document.body.removeChild(tempDiv);
      showNotification('حدث خطأ في تحميل الملف', 'error');
    });
  };

  // إنشاء محتوى للطباعة (HTML بسيط)
  const generatePrintingContent = () => {
    // تحويل الأرقام العربية إلى إنجليزية
    const convertArabicToEnglish = (str: string) => {
      const arabicNumbers = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
      const englishNumbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

      let result = str;
      for (let i = 0; i < arabicNumbers.length; i++) {
        result = result.replace(new RegExp(arabicNumbers[i], 'g'), englishNumbers[i]);
      }
      return result;
    };

    const currentDate = convertArabicToEnglish(new Date().toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }));

    // جمع جميع التوقيتات الفريدة وترتيبها
    const daysWithSessions = weeklySchedule.filter(day => day.sessions.length > 0);
    const allTimes = new Set<string>();
    daysWithSessions.forEach(day => {
      day.sessions.forEach(session => {
        allTimes.add(session.time);
      });
    });
    const sortedTimes = Array.from(allTimes).sort();

    return `
      <div style="font-family: Arial, sans-serif; direction: rtl; padding: 20px; background: white;">
        <div style="text-align: center; margin-bottom: 30px; padding: 20px; border-bottom: 3px solid #1e3a8a;">
          <h1 style="font-size: 24px; color: #1e3a8a; margin-bottom: 10px;">📅 البرنامج الأسبوعي للحصص المسرحية</h1>
          <p style="font-size: 16px; color: #666; margin: 5px 0;"><strong>الأستاذ مصطفى لعرعري</strong> - مسؤول الأنشطة المسرحية</p>
          <p style="font-size: 14px; color: #666; margin: 5px 0;">مجموعة مدارس العمران</p>
          <p style="font-size: 14px; color: #666; margin: 5px 0;">تاريخ الطباعة: ${currentDate}</p>
        </div>

        ${daysWithSessions.length > 0 ? `
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 14px;">
            <thead>
              <tr>
                <th style="border: 2px solid #1e3a8a; padding: 12px; background: #f59e0b; color: white; font-weight: bold; width: 100px;">⏰ التوقيت</th>
                ${daysWithSessions.map(day => `<th style="border: 2px solid #1e3a8a; padding: 12px; background: #1e3a8a; color: white; font-weight: bold; min-width: 120px;">📅 ${day.day}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${sortedTimes.map(time => `
                <tr>
                  <td style="border: 2px solid #1e3a8a; padding: 10px; background: #f8fafc; font-weight: bold; color: #1e3a8a; text-align: center;">${time}</td>
                  ${daysWithSessions.map(day => {
                    const sessionsAtTime = day.sessions.filter(session => session.time === time);
                    return `
                      <td style="border: 2px solid #1e3a8a; padding: 8px; min-height: 60px; vertical-align: top;">
                        ${sessionsAtTime.length > 0 ?
                          sessionsAtTime.map((session, index) => `
                            ${index > 0 ? '<hr style="margin: 5px 0; border: 1px solid #e5e7eb;">' : ''}
                            <div style="margin: 3px 0; padding: 8px; background: #f0f9ff; border-radius: 4px; border: 1px solid #3b82f6; text-align: center;">
                              <div style="font-weight: bold; color: #1e40af; font-size: 14px;">${session.class}</div>
                            </div>
                          `).join('')
                          : '<div style="color: #9ca3af; font-style: italic; text-align: center;">-</div>'
                        }
                      </td>
                    `;
                  }).join('')}
                </tr>
              `).join('')}
            </tbody>
          </table>
        ` : '<p style="text-align: center; color: #666; font-size: 18px;">لا توجد حصص مجدولة في البرنامج الأسبوعي.</p>'}

        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 2px solid #e5e7eb; color: #666; font-size: 12px;">
          <p>🎭 مجموعة مدارس العمران - قسم الأنشطة المسرحية</p>
          <p>تم إنشاء هذا التقرير بواسطة نظام إدارة الأنشطة المسرحية</p>
        </div>
      </div>
    `;
  };





  const showNotification = (message: string, type: 'success' | 'error' | 'warning' | 'info') => {
    setNotification({ message, type });
  };

  const hideNotification = () => {
    setNotification(null);
  };







  const startEditSession = (dayIndex: number, sessionIndex: number) => {
    setEditingSession({ dayIndex, sessionIndex });
  };

  const saveSession = (dayIndex: number, sessionIndex: number, updatedSession: Session) => {
    const newSchedule = [...weeklySchedule];
    newSchedule[dayIndex].sessions[sessionIndex] = updatedSession;
    setWeeklySchedule(newSchedule);
    setEditingSession(null);
    // TODO: حفظ في Firebase بدلاً من localStorage
    showNotification('تم حفظ التعديل محلياً! (سيتم ربطه بـ Firebase لاحقاً)', 'success');
  };

  const addNewSession = (dayIndex: number) => {
    const newSession: Session = {
      time: "00:00 - 00:00",
      class: "مستوى جديد",
      activity: "نشاط جديد",
      room: "قاعة"
    };
    const newSchedule = [...weeklySchedule];
    newSchedule[dayIndex].sessions.push(newSession);
    setWeeklySchedule(newSchedule);
    // TODO: حفظ في Firebase
    showNotification('تم إضافة حصة جديدة محلياً!', 'success');
  };

  const addNewDay = () => {
    const availableDays = ["الجمعة", "السبت"];
    const existingDays = weeklySchedule.map(day => day.day);
    const newDayName = availableDays.find(day => !existingDays.includes(day));

    if (!newDayName) {
      showNotification('جميع أيام الأسبوع موجودة بالفعل!', 'warning');
      return;
    }

    const newDay: DaySchedule = {
      day: newDayName,
      sessions: []
    };

    setWeeklySchedule([...weeklySchedule, newDay]);
    // TODO: حفظ في Firebase
    showNotification(`تم إضافة يوم ${newDayName} محلياً!`, 'success');
  };

  const deleteDay = (dayIndex: number) => {
    const dayName = weeklySchedule[dayIndex].day;
    if (window.confirm(`هل أنت متأكد من حذف يوم ${dayName} وجميع حصصه؟`)) {
      const newSchedule = weeklySchedule.filter((_, index) => index !== dayIndex);
      setWeeklySchedule(newSchedule);
      // TODO: حذف من Firebase
      showNotification(`تم حذف يوم ${dayName} محلياً!`, 'warning');
    }
  };

  const deleteSession = (dayIndex: number, sessionIndex: number) => {
    if (window.confirm('هل أنت متأكد من حذف هذه الحصة؟')) {
      const newSchedule = [...weeklySchedule];
      newSchedule[dayIndex].sessions.splice(sessionIndex, 1);
      setWeeklySchedule(newSchedule);
      // TODO: حذف من Firebase
      showNotification('تم حذف الحصة محلياً!', 'warning');
    }
  };

  const SessionEditForm: React.FC<{
    session: Session;
    onSave: (session: Session) => void;
    onCancel: () => void;
  }> = ({ session, onSave, onCancel }) => {
    const [formData, setFormData] = useState(session);

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSave(formData);
    };

    return (
      <form onSubmit={handleSubmit} className="session-edit-form">
        <div className="form-group">
          <label>الوقت:</label>
          <input
            type="text"
            value={formData.time}
            onChange={(e) => setFormData({...formData, time: e.target.value})}
            placeholder="مثال: 8:00 - 9:30"
            required
          />
        </div>
        <div className="form-group">
          <label>المستوى:</label>
          <input
            type="text"
            value={formData.class}
            onChange={(e) => setFormData({...formData, class: e.target.value})}
            placeholder="مثال: الأول ابتدائي"
            required
          />
        </div>
        <div className="form-group">
          <label>النشاط:</label>
          <input
            type="text"
            value={formData.activity}
            onChange={(e) => setFormData({...formData, activity: e.target.value})}
            placeholder="مثال: تمارين التعبير الحركي"
            required
          />
        </div>
        <div className="form-group">
          <label>القاعة:</label>
          <input
            type="text"
            value={formData.room}
            onChange={(e) => setFormData({...formData, room: e.target.value})}
            placeholder="مثال: قاعة الأنشطة"
            required
          />
        </div>
        <div className="form-actions">
          <button type="submit" className="btn btn-primary">حفظ</button>
          <button type="button" onClick={onCancel} className="btn btn-secondary">إلغاء</button>
        </div>
      </form>
    );
  };

  return (
    <div className="page">
      <div className="page-header">
        <div className="container">
          <h1>📅 البرنامج الأسبوعي للحصص المسرحية</h1>
          <p>جدول الحصص المسرحية الأسبوعية لجميع المراحل الدراسية - الموسم 2025-2026</p>
        </div>
      </div>

      <div className="container">
        {/* رسالة تنبيه Firebase */}
        <div style={{
          background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
          color: 'white',
          padding: '1rem',
          borderRadius: '8px',
          marginBottom: '2rem',
          textAlign: 'center',
          boxShadow: '0 4px 12px rgba(251, 191, 36, 0.3)'
        }}>
          <div style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
            ⚠️ ملاحظة مهمة
          </div>
          <p style={{ margin: 0, fontSize: '1rem' }}>
            البرنامج الأسبوعي يعمل حالياً بالبيانات المحلية. سيتم ربطه بـ Firebase قريباً لحفظ البيانات بشكل دائم.
          </p>
        </div>

        {/* شريط الأدوات */}
        <div className="toolbar">
          <div className="toolbar-section">
            <h3>🛠️ إدارة البرنامج</h3>
            <div className="toolbar-buttons">
              <PermissionGuard requirePermission="canModifyProgram">
                <button
                  onClick={() => setIsEditMode(!isEditMode)}
                  className={`btn ${isEditMode ? 'btn-warning' : 'btn-primary'}`}
                  title={isEditMode ? 'إنهاء التعديل' : 'تفعيل وضع التعديل'}
                >
                  {isEditMode ? '✅ إنهاء التعديل' : '✏️ تعديل البرنامج'}
                </button>
              </PermissionGuard>

              <PermissionGuard requirePermission="canModifyProgram">
                <button
                  onClick={addNewDay}
                  className="btn btn-success"
                  title="إضافة يوم جديد للبرنامج"
                >
                  ➕ إضافة يوم
                </button>
              </PermissionGuard>

              <button
                onClick={downloadForPrinting}
                className="btn btn-info"
                title="تحميل ملف PDF للبرنامج الأسبوعي"
              >
                📄 تحميل PDF
              </button>
            </div>
          </div>
        </div>

        {/* رسالة وضع التعديل */}
        {isEditMode && (
          <div className="edit-mode-notice">
            <div className="notice-content">
              <span className="notice-icon">✏️</span>
              <div className="notice-text">
                <strong>وضع التعديل مفعل</strong>
                <p>يمكنك الآن إضافة وتعديل وحذف الحصص والأيام</p>
              </div>
            </div>
          </div>
        )}

        <div className="weekly-schedule">
          {weeklySchedule
            .filter(day => day.sessions.length > 0 || isEditMode)
            .map((day) => {
              const originalDayIndex = weeklySchedule.findIndex(d => d.day === day.day);
              return (
                <div key={originalDayIndex} className="day-schedule">
                  <div className="day-header">
                    <h2 className="day-title">{day.day}</h2>
                    {isEditMode && (
                      <div className="day-actions">
                        <button
                          onClick={() => addNewSession(originalDayIndex)}
                          className="btn btn-small btn-success"
                          title="إضافة حصة جديدة"
                        >
                          ➕ إضافة حصة
                        </button>
                        <button
                          onClick={() => deleteDay(originalDayIndex)}
                          className="btn btn-small btn-danger"
                          title="حذف اليوم"
                        >
                          🗑️ حذف اليوم
                        </button>
                      </div>
                    )}
                  </div>
                  {day.sessions.length === 0 && isEditMode ? (
                    <div className="empty-day-message">
                      <p>لا توجد حصص في هذا اليوم</p>
                      <p className="text-muted">اضغط "إضافة حصة" لإضافة حصة جديدة</p>
                    </div>
                  ) : (
                    <div className="sessions-grid">
                      {day.sessions.map((session, sessionIndex) => (
                        <div key={sessionIndex} className="session-card">
                          {editingSession?.dayIndex === originalDayIndex && editingSession?.sessionIndex === sessionIndex ? (
                            <SessionEditForm
                              session={session}
                              onSave={(updatedSession) => saveSession(originalDayIndex, sessionIndex, updatedSession)}
                              onCancel={() => setEditingSession(null)}
                            />
                          ) : (
                            <>
                              <div className="session-time">{session.time}</div>
                              <div className="session-details">
                                <h4>{session.class}</h4>
                                <p className="activity-name">{session.activity}</p>
                                <p className="room-info">📍 {session.room}</p>
                              </div>
                              {isEditMode && (
                                <div className="session-actions">
                                  <button
                                    onClick={() => startEditSession(originalDayIndex, sessionIndex)}
                                    className="btn btn-small btn-primary"
                                    title="تعديل"
                                  >
                                    ✏️
                                  </button>
                                  <button
                                    onClick={() => deleteSession(originalDayIndex, sessionIndex)}
                                    className="btn btn-small btn-danger"
                                    title="حذف"
                                  >
                                    🗑️
                                  </button>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      </div>

      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={hideNotification}
        />
      )}
    </div>
  );
};

export default Weekly;
