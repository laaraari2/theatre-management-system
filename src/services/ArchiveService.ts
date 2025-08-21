// @ts-ignore
import html2pdf from 'html2pdf.js';
import type { Activity } from '../types';
import {
  collection,
  doc,
  addDoc,
  getDocs,
  getDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase/config';

export interface ActivityReport {
  id: string;
  activityId: string;
  title: string;
  date: string;
  content: string;
  images?: string[];
  achievements?: string[];
  participants?: number;
  feedback?: string;
  createdAt: Date;
  createdBy?: string;
}

export interface SeasonArchive {
  id: string;
  seasonName: string;
  startDate: string;
  endDate: string;
  activities: Activity[];
  reports: ActivityReport[];
  statistics: {
    totalActivities: number;
    completedActivities: number;
    totalReports: number;
    totalParticipants: number;
  };
  createdAt: Date;
}

export class ArchiveService {


  
  // إنشاء أرشيف للموسم الحالي
  static createSeasonArchive(
    seasonName: string,
    activities: any[],
    reports: any[]
  ): SeasonArchive {
    const now = new Date();
    const startDate = `${now.getFullYear()}-09-01`; // بداية السنة الدراسية
    const endDate = `${now.getFullYear() + 1}-06-30`; // نهاية السنة الدراسية
    
    const statistics = {
      totalActivities: activities.length,
      completedActivities: activities.filter(a => a.status === 'الأنشطة المنجزة').length,
      totalReports: reports.length,
      totalParticipants: this.calculateTotalParticipants(activities)
    };

    return {
      id: `season-${now.getFullYear()}-${now.getFullYear() + 1}`,
      seasonName,
      startDate,
      endDate,
      activities: [...activities],
      reports: [...reports],
      statistics,
      createdAt: now
    };
  }

  // حساب إجمالي المشاركين
  private static calculateTotalParticipants(activities: any[]): number {
    // منطق حساب المشاركين (يمكن تحسينه حسب البيانات)
    return activities.reduce((total, activity) => {
      // تقدير عدد المشاركين من النص
      const participantText = activity.participants || '';
      if (participantText.includes('جميع المستويات')) return total + 200;
      if (participantText.includes('المرحلة')) return total + 100;
      return total + 50; // تقدير افتراضي
    }, 0);
  }

  // إنشاء PDF شامل للموسم باستعمال HTML
  static async generateSeasonPDF(archive: SeasonArchive): Promise<Blob> {
    const htmlContent = this.generateHTMLContent(archive);

    const options = {
      margin: 1,
      filename: `${archive.seasonName}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    return new Promise((resolve, reject) => {
      html2pdf()
        .set(options)
        .from(htmlContent)
        .outputPdf('blob')
        .then((pdfBlob: Blob) => {
          resolve(pdfBlob);
        })
        .catch((error: any) => {
          reject(error);
        });
    });
  }

  // إنشاء محتوى HTML للـ PDF
  private static generateHTMLContent(archive: SeasonArchive): string {
    const currentDate = new Date().toLocaleDateString('ar-SA');

    return `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <style>
        body {
          font-family: 'Arial', sans-serif;
          direction: rtl;
          text-align: right;
          margin: 20px;
          line-height: 1.6;
          color: #333;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
          border-bottom: 3px solid #1e3a8a;
          padding-bottom: 20px;
        }
        .header h1 {
          color: #1e3a8a;
          font-size: 28px;
          margin: 10px 0;
        }
        .header h2 {
          color: #3b82f6;
          font-size: 20px;
          margin: 5px 0;
        }
        .header p {
          color: #6b7280;
          font-size: 14px;
          margin: 5px 0;
        }
        .stats-section {
          background: #f8fafc;
          padding: 20px;
          border-radius: 10px;
          margin: 20px 0;
          border: 1px solid #e2e8f0;
        }
        .stats-title {
          color: #1e40af;
          font-size: 18px;
          font-weight: bold;
          margin-bottom: 15px;
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 15px;
        }
        .stat-item {
          background: white;
          padding: 15px;
          border-radius: 8px;
          border: 1px solid #d1d5db;
          text-align: center;
        }
        .stat-number {
          font-size: 24px;
          font-weight: bold;
          color: #1e40af;
          display: block;
        }
        .stat-label {
          font-size: 14px;
          color: #6b7280;
          margin-top: 5px;
        }
        .activities-section {
          margin: 30px 0;
        }
        .section-title {
          color: #1e40af;
          font-size: 20px;
          font-weight: bold;
          margin-bottom: 20px;
          border-bottom: 2px solid #3b82f6;
          padding-bottom: 10px;
        }
        .activities-table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
          background: white;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .activities-table th {
          background: #1e3a8a;
          color: white;
          padding: 15px 10px;
          text-align: center;
          font-weight: bold;
        }
        .activities-table td {
          padding: 12px 10px;
          border-bottom: 1px solid #e5e7eb;
          text-align: center;
        }
        .activities-table tr:nth-child(even) {
          background: #f8fafc;
        }
        .status-confirmed {
          background: #10b981;
          color: white;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
        }
        .status-pending {
          background: #f59e0b;
          color: white;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
        }
        .status-cancelled {
          background: #ef4444;
          color: white;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
        }
        .reports-section {
          margin: 30px 0;
        }
        .report-item {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 20px;
          margin: 15px 0;
        }
        .report-title {
          color: #1e40af;
          font-size: 16px;
          font-weight: bold;
          margin-bottom: 10px;
        }
        .report-date {
          color: #6b7280;
          font-size: 14px;
          margin-bottom: 10px;
        }
        .report-content {
          line-height: 1.8;
          color: #374151;
        }
        .footer {
          text-align: center;
          margin-top: 40px;
          padding-top: 20px;
          border-top: 2px solid #e5e7eb;
          color: #6b7280;
          font-size: 12px;
        }
        @media print {
          body { margin: 0; }
          .header { page-break-after: avoid; }
          .activities-table { page-break-inside: avoid; }
          .report-item { page-break-inside: avoid; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>🎭 أرشيف الموسم المسرحي</h1>
        <h2>${archive.seasonName}</h2>
        <p>الأستاذ مصطفى لعرعري - مسؤول الأنشطة المسرحية</p>
        <p>مجموعة مدارس العمران</p>
        <p>تاريخ الإنشاء: ${currentDate}</p>
      </div>

      <!-- الإحصائيات -->
      <div class="stats-section">
        <div class="stats-title">📊 إحصائيات الموسم</div>
        <div class="stats-grid">
          <div class="stat-item">
            <span class="stat-number">${archive.statistics.totalActivities}</span>
            <div class="stat-label">إجمالي الأنشطة</div>
          </div>
          <div class="stat-item">
            <span class="stat-number">${archive.statistics.completedActivities}</span>
            <div class="stat-label">الأنشطة المكتملة</div>
          </div>
          <div class="stat-item">
            <span class="stat-number">${archive.statistics.totalReports}</span>
            <div class="stat-label">إجمالي التقارير</div>
          </div>
          <div class="stat-item">
            <span class="stat-number">${archive.statistics.totalParticipants}</span>
            <div class="stat-label">تقدير المشاركين</div>
          </div>
        </div>
      </div>

      <!-- جدول الأنشطة -->
      ${archive.activities.length > 0 ? `
      <div class="activities-section">
        <div class="section-title">📅 برنامج الأنشطة</div>
        <table class="activities-table">
          <thead>
            <tr>
              <th>العنوان</th>
              <th>التاريخ</th>
              <th>الوقت</th>
              <th>المكان</th>
              <th>الحالة</th>
            </tr>
          </thead>
          <tbody>
            ${archive.activities.map(activity => `
              <tr>
                <td>${activity.title || ''}</td>
                <td>${activity.date || ''}</td>
                <td>${activity.time || ''}</td>
                <td>${activity.location || ''}</td>
                <td>
                  <span class="status-${activity.status === 'الأنشطة المنجزة' ? 'confirmed' : activity.status === 'قيد التحضير' ? 'pending' : 'cancelled'}">
                    ${activity.status || ''}
                  </span>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      ` : ''}

      <!-- التقارير -->
      ${archive.reports.length > 0 ? `
      <div class="reports-section">
        <div class="section-title">📋 التقارير</div>
        ${archive.reports.map((report, index) => `
          <div class="report-item">
            <div class="report-title">${index + 1}. ${report.title || 'تقرير'}</div>
            <div class="report-date">التاريخ: ${report.date || 'غير محدد'}</div>
            ${report.content ? `<div class="report-content">${report.content}</div>` : ''}
          </div>
        `).join('')}
      </div>
      ` : ''}

      <div class="footer">
        <p>© 2025 الأستاذ مصطفى لعرعري - جميع الحقوق محفوظة</p>
        <p>مجموعة مدارس العمران - الأنشطة المسرحية</p>
        <p>تم إنشاء هذا التقرير في: ${currentDate}</p>
      </div>
    </body>
    </html>
    `;
  }

  // إضافة نشاط مع تقرير للموسم الحالي
  static addActivityToCurrentSeason(activity: Activity, report: ActivityReport): void {
    const currentSeason = this.getCurrentSeasonArchive();

    // إضافة النشاط والتقرير
    currentSeason.activities.push(activity);
    currentSeason.reports.push(report);

    // تحديث الإحصائيات
    currentSeason.statistics.totalActivities = currentSeason.activities.length;
    currentSeason.statistics.completedActivities = currentSeason.activities.filter(
      act => act.status === 'الأنشطة المنجزة'
    ).length;
    currentSeason.statistics.totalReports = currentSeason.reports.length;
    currentSeason.statistics.totalParticipants = currentSeason.reports.reduce(
      (total, rep) => total + (rep.participants || 0), 0
    );

    // حفظ الموسم المحدث
    localStorage.setItem('current-season-archive', JSON.stringify(currentSeason));
  }

  // الحصول على أرشيف الموسم الحالي أو إنشاء واحد جديد
  static getCurrentSeasonArchive(): SeasonArchive {
    const stored = localStorage.getItem('current-season-archive');
    if (stored) {
      return JSON.parse(stored);
    }

    // إنشاء موسم جديد
    const currentYear = new Date().getFullYear();
    const newSeason: SeasonArchive = {
      id: `season_${currentYear}`,
      seasonName: `الموسم المسرحي ${currentYear}-${currentYear + 1}`,
      startDate: `${currentYear}-09-01`,
      endDate: `${currentYear + 1}-06-30`,
      activities: [],
      reports: [],
      statistics: {
        totalActivities: 0,
        completedActivities: 0,
        totalReports: 0,
        totalParticipants: 0
      },
      createdAt: new Date()
    };

    localStorage.setItem('current-season-archive', JSON.stringify(newSeason));
    return newSeason;
  }

  // حفظ الأرشيف في localStorage
  static saveArchive(archive: SeasonArchive): void {
    const archives = this.getAllArchives();
    archives.push(archive);
    localStorage.setItem('season-archives', JSON.stringify(archives));
  }

  // جلب جميع الأرشيفات
  static getAllArchives(): SeasonArchive[] {
    const stored = localStorage.getItem('season-archives');
    return stored ? JSON.parse(stored) : [];
  }

  // جلب أرشيف معين
  static getArchiveById(id: string): SeasonArchive | null {
    const archives = this.getAllArchives();
    return archives.find(archive => archive.id === id) || null;
  }

  // حذف أرشيف
  static deleteArchive(id: string): void {
    const archives = this.getAllArchives().filter(archive => archive.id !== id);
    localStorage.setItem('season-archives', JSON.stringify(archives));
  }

  // تصدير جميع البيانات
  static exportAllData(): string {
    const archives = this.getAllArchives();
    return JSON.stringify(archives, null, 2);
  }

  // استيراد البيانات
  static importData(jsonData: string): boolean {
    try {
      const archives = JSON.parse(jsonData);
      localStorage.setItem('season-archives', JSON.stringify(archives));
      return true;
    } catch (error) {
      console.error('خطأ في استيراد البيانات:', error);
      return false;
    }
  }

  // ===== دوال Firestore للأرشيف =====

  // حفظ أرشيف في Firestore
  static async saveArchiveToFirestore(archive: SeasonArchive): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'season-archives'), {
        ...archive,
        createdAt: serverTimestamp()
      });
      console.log('تم حفظ الأرشيف في Firestore بنجاح:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('خطأ في حفظ الأرشيف في Firestore:', error);
      throw error;
    }
  }

  // جلب جميع الأرشيفات من Firestore
  static async getAllArchivesFromFirestore(): Promise<SeasonArchive[]> {
    try {
      const q = query(collection(db, 'season-archives'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);

      const archives: SeasonArchive[] = [];
      querySnapshot.forEach((doc: any) => {
        const data = doc.data();
        archives.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date()
        } as SeasonArchive);
      });

      console.log('تم جلب الأرشيفات من Firestore بنجاح:', archives.length);
      return archives;
    } catch (error) {
      console.error('خطأ في جلب الأرشيفات من Firestore:', error);
      return [];
    }
  }

  // جلب أرشيف معين من Firestore
  static async getArchiveFromFirestore(id: string): Promise<SeasonArchive | null> {
    try {
      const docRef = doc(db, 'season-archives', id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date()
        } as SeasonArchive;
      } else {
        console.log('الأرشيف غير موجود:', id);
        return null;
      }
    } catch (error) {
      console.error('خطأ في جلب الأرشيف من Firestore:', error);
      return null;
    }
  }

  // تحديث أرشيف في Firestore
  static async updateArchiveInFirestore(id: string, updates: Partial<SeasonArchive>): Promise<boolean> {
    try {
      const docRef = doc(db, 'season-archives', id);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
      console.log('تم تحديث الأرشيف في Firestore بنجاح:', id);
      return true;
    } catch (error) {
      console.error('خطأ في تحديث الأرشيف في Firestore:', error);
      throw error;
    }
  }

  // حذف أرشيف من Firestore
  static async deleteArchiveFromFirestore(id: string): Promise<boolean> {
    try {
      const docRef = doc(db, 'season-archives', id);
      await deleteDoc(docRef);
      console.log('تم حذف الأرشيف من Firestore بنجاح:', id);
      return true;
    } catch (error) {
      console.error('خطأ في حذف الأرشيف من Firestore:', error);
      throw error;
    }
  }

  // الحصول على أرشيف الموسم الحالي من Firestore أو إنشاء واحد جديد
  static async getCurrentSeasonArchiveFromFirestore(): Promise<SeasonArchive> {
    try {
      const currentYear = new Date().getFullYear();
      const seasonId = `season_${currentYear}`;

      // محاولة جلب الموسم الحالي
      const existingArchive = await this.getArchiveFromFirestore(seasonId);

      if (existingArchive) {
        return existingArchive;
      }

      // إنشاء موسم جديد
      const newSeason: SeasonArchive = {
        id: seasonId,
        seasonName: `الموسم المسرحي ${currentYear}-${currentYear + 1}`,
        startDate: `${currentYear}-09-01`,
        endDate: `${currentYear + 1}-06-30`,
        activities: [],
        reports: [],
        statistics: {
          totalActivities: 0,
          completedActivities: 0,
          totalReports: 0,
          totalParticipants: 0
        },
        createdAt: new Date()
      };

      await this.saveArchiveToFirestore(newSeason);
      return newSeason;
    } catch (error) {
      console.error('خطأ في الحصول على أرشيف الموسم الحالي:', error);
      throw error;
    }
  }
}
