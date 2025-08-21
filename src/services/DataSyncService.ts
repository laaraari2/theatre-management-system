// خدمة مزامنة البيانات بين localStorage و Firestore
import {
  activityService,
  activityReportService
} from '../firebase/services';
import { ArchiveService } from './ArchiveService';

export interface SyncStatus {
  isOnline: boolean;
  lastSync: Date | null;
  pendingUploads: number;
  pendingDownloads: number;
  errors: string[];
}

export class DataSyncService {
  private static syncStatus: SyncStatus = {
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    lastSync: null,
    pendingUploads: 0,
    pendingDownloads: 0,
    errors: []
  };

  private static listeners: ((status: SyncStatus) => void)[] = [];

  // إضافة مستمع لحالة المزامنة
  static addSyncStatusListener(listener: (status: SyncStatus) => void) {
    this.listeners.push(listener);
  }

  // إزالة مستمع
  static removeSyncStatusListener(listener: (status: SyncStatus) => void) {
    this.listeners = this.listeners.filter(l => l !== listener);
  }

  // إشعار المستمعين بتغيير الحالة
  private static notifyListeners() {
    this.listeners.forEach(listener => listener(this.syncStatus));
  }

  // تحديث حالة الاتصال
  static updateOnlineStatus(isOnline: boolean) {
    this.syncStatus.isOnline = isOnline;
    this.notifyListeners();
    
    if (isOnline) {
      // عند العودة للاتصال، قم بالمزامنة التلقائية
      this.syncAll();
    }
  }

  // الحصول على حالة المزامنة
  static getSyncStatus(): SyncStatus {
    return { ...this.syncStatus };
  }

  // حفظ البيانات محلياً مع وضع علامة للمزامنة
  static async saveLocallyWithSync<T>(
    key: string, 
    data: T, 
    syncAction: () => Promise<string>
  ): Promise<string> {
    try {
      // حفظ محلياً أولاً
      const localData = JSON.parse(localStorage.getItem(key) || '[]');
      const tempId = `temp_${Date.now()}`;
      const dataWithTempId = { ...data, id: tempId, _needsSync: true };
      
      localData.push(dataWithTempId);
      localStorage.setItem(key, JSON.stringify(localData));

      // إذا كان متصلاً، حاول المزامنة فوراً
      if (this.syncStatus.isOnline) {
        try {
          const realId = await syncAction();
          
          // تحديث البيانات المحلية بالـ ID الحقيقي
          const updatedData = JSON.parse(localStorage.getItem(key) || '[]');
          const index = updatedData.findIndex((item: any) => item.id === tempId);
          if (index !== -1) {
            updatedData[index] = { ...updatedData[index], id: realId, _needsSync: false };
            localStorage.setItem(key, JSON.stringify(updatedData));
          }
          
          return realId;
        } catch (error) {
          console.error('فشل في المزامنة الفورية:', error);
          this.syncStatus.pendingUploads++;
          this.syncStatus.errors.push(`فشل في رفع البيانات: ${error}`);
          this.notifyListeners();
          return tempId;
        }
      } else {
        this.syncStatus.pendingUploads++;
        this.notifyListeners();
        return tempId;
      }
    } catch (error) {
      console.error('خطأ في الحفظ المحلي:', error);
      throw error;
    }
  }

  // مزامنة الأنشطة
  static async syncActivities(): Promise<void> {
    if (!this.syncStatus.isOnline) return;

    try {
      // رفع الأنشطة المحلية التي تحتاج مزامنة
      const localActivities = JSON.parse(localStorage.getItem('activities') || '[]');
      const activitiesToSync = localActivities.filter((activity: any) => activity._needsSync);

      for (const activity of activitiesToSync) {
        try {
          const { _needsSync, ...activityData } = activity;
          const realId = await activityService.addActivity(activityData);
          
          // تحديث البيانات المحلية
          const index = localActivities.findIndex((a: any) => a.id === activity.id);
          if (index !== -1) {
            localActivities[index] = { ...activityData, id: realId, _needsSync: false };
          }
        } catch (error) {
          console.error('فشل في رفع النشاط:', activity.id, error);
          this.syncStatus.errors.push(`فشل في رفع النشاط: ${activity.title}`);
        }
      }

      localStorage.setItem('activities', JSON.stringify(localActivities));

      // تنزيل الأنشطة من Firestore
      const firestoreActivities = await activityService.getAllActivities();
      
      // دمج البيانات (إعطاء الأولوية لـ Firestore)
      const mergedActivities = this.mergeData(localActivities, firestoreActivities, 'id');
      localStorage.setItem('activities', JSON.stringify(mergedActivities));

      this.syncStatus.pendingUploads = Math.max(0, this.syncStatus.pendingUploads - activitiesToSync.length);
    } catch (error) {
      console.error('خطأ في مزامنة الأنشطة:', error);
      this.syncStatus.errors.push(`خطأ في مزامنة الأنشطة: ${error}`);
    }
  }

  // مزامنة تقارير الأنشطة
  static async syncActivityReports(): Promise<void> {
    if (!this.syncStatus.isOnline) return;

    try {
      // رفع التقارير المحلية التي تحتاج مزامنة
      const localReports = JSON.parse(localStorage.getItem('activity-reports') || '[]');
      const reportsToSync = localReports.filter((report: any) => report._needsSync);

      for (const report of reportsToSync) {
        try {
          const { _needsSync, ...reportData } = report;
          const realId = await activityReportService.addActivityReport(reportData);
          
          // تحديث البيانات المحلية
          const index = localReports.findIndex((r: any) => r.id === report.id);
          if (index !== -1) {
            localReports[index] = { ...reportData, id: realId, _needsSync: false };
          }
        } catch (error) {
          console.error('فشل في رفع التقرير:', report.id, error);
          this.syncStatus.errors.push(`فشل في رفع التقرير: ${report.title}`);
        }
      }

      localStorage.setItem('activity-reports', JSON.stringify(localReports));

      // تنزيل التقارير من Firestore
      const firestoreReports = await activityReportService.getAllActivityReports();
      
      // دمج البيانات
      const mergedReports = this.mergeData(localReports, firestoreReports, 'id');
      localStorage.setItem('activity-reports', JSON.stringify(mergedReports));

      this.syncStatus.pendingUploads = Math.max(0, this.syncStatus.pendingUploads - reportsToSync.length);
    } catch (error) {
      console.error('خطأ في مزامنة التقارير:', error);
      this.syncStatus.errors.push(`خطأ في مزامنة التقارير: ${error}`);
    }
  }

  // مزامنة الأرشيف
  static async syncArchives(): Promise<void> {
    if (!this.syncStatus.isOnline) return;

    try {
      // رفع الأرشيفات المحلية
      const localArchives = ArchiveService.getAllArchives();
      
      for (const archive of localArchives) {
        try {
          await ArchiveService.saveArchiveToFirestore(archive);
        } catch (error) {
          console.error('فشل في رفع الأرشيف:', archive.id, error);
          this.syncStatus.errors.push(`فشل في رفع الأرشيف: ${archive.seasonName}`);
        }
      }

      // تنزيل الأرشيفات من Firestore
      const firestoreArchives = await ArchiveService.getAllArchivesFromFirestore();
      
      // حفظ في localStorage
      localStorage.setItem('season-archives', JSON.stringify(firestoreArchives));
    } catch (error) {
      console.error('خطأ في مزامنة الأرشيف:', error);
      this.syncStatus.errors.push(`خطأ في مزامنة الأرشيف: ${error}`);
    }
  }

  // مزامنة جميع البيانات
  static async syncAll(): Promise<void> {
    if (!this.syncStatus.isOnline) {
      console.log('غير متصل بالإنترنت - تم تأجيل المزامنة');
      return;
    }

    console.log('بدء المزامنة الشاملة...');
    this.syncStatus.errors = [];

    try {
      await Promise.all([
        this.syncActivities(),
        this.syncActivityReports(),
        this.syncArchives()
      ]);

      this.syncStatus.lastSync = new Date();
      console.log('تمت المزامنة بنجاح');
    } catch (error) {
      console.error('خطأ في المزامنة الشاملة:', error);
      this.syncStatus.errors.push(`خطأ في المزامنة الشاملة: ${error}`);
    }

    this.notifyListeners();
  }

  // دمج البيانات المحلية مع بيانات Firestore
  private static mergeData<T extends { id?: any }>(
    localData: T[], 
    firestoreData: T[], 
    idField: keyof T
  ): T[] {
    const merged = [...firestoreData];
    
    // إضافة البيانات المحلية التي لا توجد في Firestore
    localData.forEach(localItem => {
      const existsInFirestore = firestoreData.some(
        firestoreItem => firestoreItem[idField] === localItem[idField]
      );
      
      if (!existsInFirestore && !String(localItem[idField]).startsWith('temp_')) {
        merged.push(localItem);
      }
    });

    return merged;
  }

  // تنظيف الأخطاء
  static clearErrors(): void {
    this.syncStatus.errors = [];
    this.notifyListeners();
  }

  // إعداد مراقبة حالة الاتصال
  static setupNetworkMonitoring(): void {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        console.log('تم الاتصال بالإنترنت');
        this.updateOnlineStatus(true);
      });

      window.addEventListener('offline', () => {
        console.log('تم قطع الاتصال بالإنترنت');
        this.updateOnlineStatus(false);
      });

      // مزامنة دورية كل 5 دقائق
      setInterval(() => {
        if (this.syncStatus.isOnline) {
          this.syncAll();
        }
      }, 5 * 60 * 1000);
    }
  }
}

// تصدير الخدمة
export default DataSyncService;
