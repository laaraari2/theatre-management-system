// خدمات Firebase باستخدام v9+ Modular SDK
import { db, storage } from './config';

// Firebase Firestore functions
import {
  collection,
  doc,
  addDoc,
  getDocs,
  getDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';

// Firebase Storage functions
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from 'firebase/storage';

// أنواع البيانات
export interface Activity {
  id?: string | number;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  participants: string;
  status: string;
  reportId?: number | string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Report {
  id?: string;
  title: string;
  date: string;
  content: string;
  images: string[];
  activities: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Rating {
  id?: string;
  activityId: string;
  userId: string;
  userName: string;
  rating: number;
  comment?: string;
  createdAt?: Date;
}

export interface VoiceRecording {
  id?: string;
  title: string;
  audioUrl: string;
  duration: number;
  createdAt?: Date;
}

export interface User {
  id?: string;
  username: string;
  password: string;
  fullName: string;
  email?: string;
  role: 'admin' | 'viewer';
  permissions: {
    canView: boolean;
    canEdit: boolean;
    canDelete: boolean;
    canExportPDF: boolean;
    canAccessSettings: boolean;
    canCreateReports: boolean;
    canEditReports: boolean;
    canDeleteReports: boolean;
    canCreateActivities: boolean;
    canEditActivities: boolean;
    canDeleteActivities: boolean;
    canManageUsers: boolean;
    canViewUserList: boolean;
    canEditUserPermissions: boolean;
    canDeactivateUsers: boolean;
    canAccessArchive: boolean;
    canModifyProgram: boolean;
    canAccessAnalytics: boolean;
  };
  isActive: boolean;
  createdAt?: Date;
  lastLogin?: Date | any;
}

// خدمات الأنشطة باستخدام Firebase v9+ Modular SDK
export const activityService = {
  // إضافة نشاط جديد
  async addActivity(activity: Omit<Activity, 'id' | 'createdAt' | 'updatedAt'>) {
    try {
      const docRef = await addDoc(collection(db, 'activities'), {
        ...activity,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      console.log('تم إضافة النشاط بنجاح:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('خطأ في إضافة النشاط:', error);
      throw error;
    }
  },

  // الحصول على جميع الأنشطة
  async getAllActivities(): Promise<Activity[]> {
    try {
      const q = query(collection(db, 'activities'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);

      const activities: Activity[] = [];
      querySnapshot.forEach((doc: any) => {
        activities.push({
          id: doc.id,
          ...doc.data()
        } as Activity);
      });

      console.log('تم جلب الأنشطة بنجاح:', activities.length);
      return activities;
    } catch (error) {
      console.error('خطأ في الحصول على الأنشطة:', error);
      return [];
    }
  },

  // الحصول على نشاط بالمعرف
  async getActivityById(id: string): Promise<Activity | null> {
    try {
      const docRef = doc(db, 'activities', id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data()
        } as Activity;
      } else {
        console.log('النشاط غير موجود:', id);
        return null;
      }
    } catch (error) {
      console.error('خطأ في الحصول على النشاط:', error);
      return null;
    }
  },

  // تحديث نشاط
  async updateActivity(id: string, updates: Partial<Activity>) {
    try {
      const docRef = doc(db, 'activities', id);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
      console.log('تم تحديث النشاط بنجاح:', id);
      return true;
    } catch (error) {
      console.error('خطأ في تحديث النشاط:', error);
      throw error;
    }
  },

  // ربط تقرير بنشاط
  async linkReportToActivity(activityId: string, reportId: string) {
    try {
      const docRef = doc(db, 'activities', activityId);
      await updateDoc(docRef, {
        reportId: reportId,
        status: 'الأنشطة المنجزة',
        updatedAt: serverTimestamp()
      });
      console.log('تم ربط التقرير بالنشاط بنجاح:', activityId, reportId);
      return true;
    } catch (error) {
      console.error('خطأ في ربط التقرير بالنشاط:', error);
      throw error;
    }
  },

  // حذف نشاط
  async deleteActivity(id: string) {
    try {
      const docRef = doc(db, 'activities', id);
      await deleteDoc(docRef);
      console.log('تم حذف النشاط بنجاح:', id);
      return true;
    } catch (error) {
      console.error('خطأ في حذف النشاط:', error);
      throw error;
    }
  }
};

// خدمات التقارير باستخدام Firestore
export const reportService = {
  // إضافة تقرير جديد
  async addReport(report: Omit<Report, 'id' | 'createdAt' | 'updatedAt'>) {
    try {
      const docRef = await addDoc(collection(db, 'reports'), {
        ...report,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      console.log('تم إضافة التقرير بنجاح:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('خطأ في إضافة التقرير:', error);
      throw error;
    }
  },

  // الحصول على جميع التقارير
  async getAllReports(): Promise<Report[]> {
    try {
      const q = query(collection(db, 'reports'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);

      const reports: Report[] = [];
      querySnapshot.forEach((doc: any) => {
        const data = doc.data();
        reports.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        } as Report);
      });

      console.log('تم جلب التقارير بنجاح:', reports.length);
      return reports;
    } catch (error) {
      console.error('خطأ في الحصول على التقارير:', error);
      return [];
    }
  },

  // تحديث تقرير
  async updateReport(id: string, updates: Partial<Report>) {
    try {
      const docRef = doc(db, 'reports', id);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
      console.log('تم تحديث التقرير بنجاح');
    } catch (error) {
      console.error('خطأ في تحديث التقرير:', error);
      throw error;
    }
  },

  // حذف تقرير
  async deleteReport(id: string) {
    try {
      await deleteDoc(doc(db, 'reports', id));
      console.log('تم حذف التقرير بنجاح');
    } catch (error) {
      console.error('خطأ في حذف التقرير:', error);
      throw error;
    }
  }
};

// خدمات تقارير الأنشطة باستخدام Firestore
export const activityReportService = {
  // إضافة تقرير نشاط جديد
  async addActivityReport(report: Omit<import('../types').ActivityReport, 'id' | 'createdAt'>) {
    try {
      const docRef = await addDoc(collection(db, 'activity-reports'), {
        ...report,
        createdAt: serverTimestamp()
      });
      console.log('تم إضافة تقرير النشاط بنجاح:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('خطأ في إضافة تقرير النشاط:', error);
      throw error;
    }
  },

  // الحصول على جميع تقارير الأنشطة
  async getAllActivityReports(): Promise<import('../types').ActivityReport[]> {
    try {
      const q = query(collection(db, 'activity-reports'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);

      const reports: import('../types').ActivityReport[] = [];
      querySnapshot.forEach((doc: any) => {
        const data = doc.data();
        reports.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date()
        } as import('../types').ActivityReport);
      });

      console.log('تم جلب تقارير الأنشطة بنجاح:', reports.length);
      return reports;
    } catch (error) {
      console.error('خطأ في الحصول على تقارير الأنشطة:', error);
      return [];
    }
  },

  // الحصول على تقرير نشاط بالمعرف
  async getActivityReportById(id: string): Promise<import('../types').ActivityReport | null> {
    try {
      const docRef = doc(db, 'activity-reports', id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date()
        } as import('../types').ActivityReport;
      } else {
        console.log('تقرير النشاط غير موجود:', id);
        return null;
      }
    } catch (error) {
      console.error('خطأ في الحصول على تقرير النشاط:', error);
      return null;
    }
  }
};

// خدمات الصور باستخدام Firebase Storage
export const imageService = {
  // رفع صورة
  async uploadImage(file: File, path: string): Promise<string> {
    try {
      const storageRef = ref(storage, `images/${path}/${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);

      console.log('تم رفع الصورة بنجاح:', downloadURL);
      return downloadURL;
    } catch (error) {
      console.error('خطأ في رفع الصورة:', error);
      throw error;
    }
  },

  // حذف صورة
  async deleteImage(url: string) {
    try {
      const storageRef = ref(storage, url);
      await deleteObject(storageRef);

      console.log('تم حذف الصورة بنجاح:', url);
      return true;
    } catch (error) {
      console.error('خطأ في حذف الصورة:', error);
      throw error;
    }
  },

  // رفع عدة صور
  async uploadMultipleImages(files: File[], path: string): Promise<string[]> {
    try {
      const uploadPromises = files.map(file => this.uploadImage(file, path));
      const urls = await Promise.all(uploadPromises);

      console.log('تم رفع جميع الصور بنجاح:', urls.length);
      return urls;
    } catch (error) {
      console.error('خطأ في رفع الصور:', error);
      throw error;
    }
  }
};

// خدمات التقييم
export const ratingService = {
  // إضافة تقييم
  async addRating(rating: Omit<Rating, 'id' | 'createdAt'>) {
    try {
      const docRef = await addDoc(collection(db, 'ratings'), {
        ...rating,
        createdAt: serverTimestamp()
      });
      console.log('تم إضافة التقييم بنجاح:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('خطأ في إضافة التقييم:', error);
      throw error;
    }
  },

  // الحصول على تقييمات نشاط
  async getActivityRatings(activityId: string): Promise<Rating[]> {
    try {
      const q = query(
        collection(db, 'ratings'),
        where('activityId', '==', activityId),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);

      const ratings: Rating[] = [];
      querySnapshot.forEach((doc: any) => {
        const data = doc.data();
        ratings.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date()
        } as Rating);
      });

      console.log('تم جلب التقييمات بنجاح:', ratings.length);
      return ratings;
    } catch (error) {
      console.error('خطأ في الحصول على التقييمات:', error);
      return [];
    }
  }
};

// خدمات التسجيلات الصوتية
export const voiceRecordingsService = {
  // إضافة تسجيل صوتي
  async addVoiceRecording(recording: Omit<VoiceRecording, 'id' | 'createdAt'>) {
    try {
      const docRef = await addDoc(collection(db, 'voice-recordings'), {
        ...recording,
        createdAt: serverTimestamp()
      });
      console.log('تم إضافة التسجيل الصوتي بنجاح:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('خطأ في إضافة التسجيل الصوتي:', error);
      throw error;
    }
  },

  // الحصول على جميع التسجيلات الصوتية
  async getAllVoiceRecordings(): Promise<VoiceRecording[]> {
    try {
      const q = query(collection(db, 'voice-recordings'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);

      const recordings: VoiceRecording[] = [];
      querySnapshot.forEach((doc: any) => {
        const data = doc.data();
        recordings.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date()
        } as VoiceRecording);
      });

      console.log('تم جلب التسجيلات الصوتية بنجاح:', recordings.length);
      return recordings;
    } catch (error) {
      console.error('خطأ في الحصول على التسجيلات الصوتية:', error);
      return [];
    }
  },

  // الحصول على تسجيل صوتي بالمعرف
  async getVoiceRecordingById(id: string): Promise<VoiceRecording | null> {
    try {
      const docRef = doc(db, 'voice-recordings', id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date()
        } as VoiceRecording;
      } else {
        console.log('التسجيل الصوتي غير موجود:', id);
        return null;
      }
    } catch (error) {
      console.error('خطأ في الحصول على التسجيل الصوتي:', error);
      return null;
    }
  },

  // حذف تسجيل صوتي
  async deleteVoiceRecording(id: string) {
    try {
      await deleteDoc(doc(db, 'voice-recordings', id));
      console.log('تم حذف التسجيل الصوتي بنجاح');
    } catch (error) {
      console.error('خطأ في حذف التسجيل الصوتي:', error);
      throw error;
    }
  }
};

// خدمات إدارة المستخدمين
export const userService = {
  // إضافة مستخدم جديد
  async addUser(user: Omit<User, 'id' | 'createdAt'>) {
    try {
      const users = this.getAllUsers();
      const existingUser = users.find(u => u.username === user.username);
      if (existingUser) {
        throw new Error('اسم المستخدم موجود بالفعل');
      }

      const newUser = {
        ...user,
        id: 'user-' + Date.now(),
        createdAt: new Date()
      };

      const updatedUsers = [...users, newUser];
      localStorage.setItem('users', JSON.stringify(updatedUsers));
      console.log('تم إضافة المستخدم:', newUser);
      return newUser.id;
    } catch (error) {
      console.error('خطأ في إضافة المستخدم:', error);
      throw error;
    }
  },

  // الحصول على جميع المستخدمين
  getAllUsers(): User[] {
    try {
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      return users;
    } catch (error) {
      console.error('خطأ في جلب المستخدمين:', error);
      return [];
    }
  },

  // الحصول على المستخدم الحالي
  getCurrentUser(): User | null {
    try {
      const user = localStorage.getItem('currentUser');
      return user ? JSON.parse(user) : null;
    } catch (error) {
      console.error('خطأ في جلب المستخدم الحالي:', error);
      return null;
    }
  },

  // الحصول على مستخدم باسم المستخدم
  getUserByUsername(username: string): User | null {
    try {
      const users = this.getAllUsers();
      return users.find(user => user.username === username) || null;
    } catch (error) {
      console.error('خطأ في الحصول على المستخدم:', error);
      return null;
    }
  },

  // تحديث مستخدم
  async updateUser(id: string, updates: Partial<User>) {
    try {
      const users = this.getAllUsers();
      const userIndex = users.findIndex(user => user.id === id);

      if (userIndex === -1) {
        throw new Error('المستخدم غير موجود');
      }

      users[userIndex] = { ...users[userIndex], ...updates };
      localStorage.setItem('users', JSON.stringify(users));
      console.log('تم تحديث المستخدم:', id);
      return true;
    } catch (error) {
      console.error('خطأ في تحديث المستخدم:', error);
      throw error;
    }
  },

  // تسجيل الدخول
  async login(username: string, password: string): Promise<User | null> {
    try {
      const user = this.getUserByUsername(username);
      if (!user) {
        throw new Error('اسم المستخدم غير صحيح');
      }

      if (user.password !== password) {
        throw new Error('كلمة المرور غير صحيحة');
      }

      if (!user.isActive) {
        throw new Error('الحساب غير مفعل');
      }

      // تحديث آخر تسجيل دخول
      await this.updateUser(user.id!, {
        lastLogin: new Date()
      });

      // حفظ بيانات المستخدم الحالي
      localStorage.setItem('currentUser', JSON.stringify(user));
      console.log('تم تسجيل الدخول بنجاح:', username);
      return user;
    } catch (error) {
      console.error('خطأ في تسجيل الدخول:', error);
      throw error;
    }
  },

  // التحقق من كون المستخدم مدير
  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user ? user.role === 'admin' : false;
  },

  // تسجيل الخروج
  logout() {
    localStorage.removeItem('currentUser');
    console.log('تم تسجيل الخروج');
  },

  // إعادة تحميل بيانات المستخدم الحالي من قاعدة البيانات
  refreshCurrentUser(): User | null {
    try {
      const currentUser = this.getCurrentUser();
      if (!currentUser) return null;

      const users = this.getAllUsers();
      const updatedUser = users.find(user => user.id === currentUser.id);

      if (updatedUser) {
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        return updatedUser;
      }

      return currentUser;
    } catch (error) {
      console.error('خطأ في إعادة تحميل بيانات المستخدم:', error);
      return null;
    }
  },

  // التحقق من الصلاحيات
  hasPermission(permission: keyof User['permissions']): boolean {
    const user = this.getCurrentUser();
    return user ? user.permissions[permission] : false;
  },

  // حذف مستخدم
  async deleteUser(id: string) {
    try {
      const users = this.getAllUsers();
      const filteredUsers = users.filter(user => user.id !== id);
      localStorage.setItem('users', JSON.stringify(filteredUsers));
      console.log('تم حذف المستخدم:', id);
      return true;
    } catch (error) {
      console.error('خطأ في حذف المستخدم:', error);
      throw error;
    }
  },

  // الحصول على مستخدم بالمعرف
  getUserById(id: string): User | null {
    try {
      const users = this.getAllUsers();
      return users.find(user => user.id === id) || null;
    } catch (error) {
      console.error('خطأ في الحصول على المستخدم:', error);
      return null;
    }
  },

  // إنشاء المدير الافتراضي
  async initializeDefaultAdmin() {
    const users = this.getAllUsers();

    // إنشاء المدير الافتراضي
    const adminExists = users.some(user => user.role === 'admin');
    if (!adminExists) {
      const defaultAdmin: Omit<User, 'id' | 'createdAt'> = {
        username: 'admin',
        password: 'admin123',
        fullName: 'الأستاذ مصطفى لعرعري',
        email: 'admin@theatre.com',
        role: 'admin',
        permissions: {
          canView: true,
          canEdit: true,
          canDelete: true,
          canExportPDF: true,
          canAccessSettings: true,
          canCreateReports: true,
          canEditReports: true,
          canDeleteReports: true,
          canCreateActivities: true,
          canEditActivities: true,
          canDeleteActivities: true,
          canManageUsers: true,
          canViewUserList: true,
          canEditUserPermissions: true,
          canDeactivateUsers: true,
          canAccessArchive: true,
          canModifyProgram: true,
          canAccessAnalytics: true,
        },
        isActive: true
      };

      await this.addUser(defaultAdmin);
      console.log('تم إنشاء حساب المدير الافتراضي');
      console.log('اسم المستخدم: admin');
      console.log('كلمة المرور: admin123');
    }

    console.log('المدير الافتراضي جاهز. يمكنك الآن إنشاء المستخدمين من صفحة الإعدادات.');
  }
};
