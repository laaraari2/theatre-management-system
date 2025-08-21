import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  orderBy,
  limit,
  where,
  Timestamp
} from 'firebase/firestore';
import { db } from '../firebase/config';

// واجهة مشروع السنة مع localStorage
export interface YearProjectFirestore {
  id?: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  status: 'قيد التخطيط' | 'قيد التنفيذ' | 'مكتمل' | 'مؤجل';
  director: string;
  cast: string[];
  crew: string[];
  budget: number;
  venue: string;
  targetAudience: string;
  objectives: string[];
  timeline: TimelineEventFirestore[];
  resources: string[];
  challenges: string[];
  achievements: string[];
  images: string[];
  notes: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  userId: string; // معرف المستخدم
}

export interface TimelineEventFirestore {
  id: string;
  title: string;
  description: string;
  date: string;
  status: 'مخطط' | 'قيد التنفيذ' | 'مكتمل';
  responsible: string;
}

class YearProjectService {
  private collectionName = 'yearProjects';

  // إنشاء مشروع جديد
  async createProject(projectData: Omit<YearProjectFirestore, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, this.collectionName), {
        ...projectData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });

      console.log('تم إنشاء مشروع السنة بنجاح:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('خطأ في إنشاء مشروع السنة:', error);
      throw error;
    }
  }

  // تحديث مشروع موجود
  async updateProject(projectId: string, updates: Partial<YearProjectFirestore>): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, projectId);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: Timestamp.now()
      });

      console.log('تم تحديث مشروع السنة بنجاح:', projectId);
    } catch (error) {
      console.error('خطأ في تحديث مشروع السنة:', error);
      throw error;
    }
  }

  // الحصول على مشروع بالمعرف
  async getProject(projectId: string): Promise<YearProjectFirestore | null> {
    try {
      const docRef = doc(db, this.collectionName, projectId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data()
        } as YearProjectFirestore;
      } else {
        console.log('مشروع السنة غير موجود');
        return null;
      }
    } catch (error) {
      console.error('خطأ في جلب مشروع السنة:', error);
      throw error;
    }
  }

  // الحصول على المشروع الحالي للمستخدم (آخر مشروع)
  async getCurrentProject(userId: string): Promise<YearProjectFirestore | null> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(1)
      );

      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        return {
          id: doc.id,
          ...doc.data()
        } as YearProjectFirestore;
      } else {
        return null;
      }
    } catch (error) {
      console.error('خطأ في جلب المشروع الحالي:', error);
      throw error;
    }
  }

  // الحصول على جميع مشاريع المستخدم
  async getUserProjects(userId: string): Promise<YearProjectFirestore[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const projects: YearProjectFirestore[] = [];

      querySnapshot.forEach((doc) => {
        projects.push({
          id: doc.id,
          ...doc.data()
        } as YearProjectFirestore);
      });

      return projects;
    } catch (error) {
      console.error('خطأ في جلب مشاريع المستخدم:', error);
      throw error;
    }
  }

  // حذف مشروع
  async deleteProject(projectId: string): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, projectId);
      await deleteDoc(docRef);

      console.log('تم حذف مشروع السنة بنجاح:', projectId);
    } catch (error) {
      console.error('خطأ في حذف مشروع السنة:', error);
      throw error;
    }
  }

  // تحديث الجدول الزمني
  async updateTimeline(projectId: string, timeline: TimelineEventFirestore[]): Promise<void> {
    try {
      await this.updateProject(projectId, { timeline });
      console.log('تم تحديث الجدول الزمني بنجاح');
    } catch (error) {
      console.error('خطأ في تحديث الجدول الزمني:', error);
      throw error;
    }
  }

  // تحديث قائمة معينة (cast, crew, objectives, etc.)
  async updateList(
    projectId: string,
    listType: 'cast' | 'crew' | 'objectives' | 'achievements' | 'resources' | 'challenges',
    listData: string[]
  ): Promise<void> {
    try {
      await this.updateProject(projectId, { [listType]: listData });
      console.log(`تم تحديث ${listType} بنجاح`);
    } catch (error) {
      console.error(`خطأ في تحديث ${listType}:`, error);
      throw error;
    }
  }

  // تحديث حالة المشروع
  async updateStatus(projectId: string, status: YearProjectFirestore['status']): Promise<void> {
    try {
      await this.updateProject(projectId, { status });
      console.log('تم تحديث حالة المشروع بنجاح');
    } catch (error) {
      console.error('خطأ في تحديث حالة المشروع:', error);
      throw error;
    }
  }

  // إضافة صورة للمعرض
  async addImage(projectId: string, imageUrl: string): Promise<void> {
    try {
      const project = await this.getProject(projectId);
      if (project) {
        const updatedImages = [...project.images, imageUrl];
        await this.updateProject(projectId, { images: updatedImages });
      }
    } catch (error) {
      console.error('خطأ في إضافة الصورة:', error);
      throw error;
    }
  }

  // حذف صورة من المعرض
  async removeImage(projectId: string, imageUrl: string): Promise<void> {
    try {
      const project = await this.getProject(projectId);
      if (project) {
        const updatedImages = project.images.filter(img => img !== imageUrl);
        await this.updateProject(projectId, { images: updatedImages });
      }
    } catch (error) {
      console.error('خطأ في حذف الصورة:', error);
      throw error;
    }
  }

  // البحث في المشاريع
  async searchProjects(userId: string, searchTerm: string): Promise<YearProjectFirestore[]> {
    try {
      const projects = await this.getUserProjects(userId);

      return projects.filter(project =>
        project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    } catch (error) {
      console.error('خطأ في البحث:', error);
      throw error;
    }
  }

  // إحصائيات المشروع
  async getProjectStats(userId: string): Promise<{
    totalProjects: number;
    completedProjects: number;
    inProgressProjects: number;
    plannedProjects: number;
  }> {
    try {
      const projects = await this.getUserProjects(userId);

      return {
        totalProjects: projects.length,
        completedProjects: projects.filter(p => p.status === 'مكتمل').length,
        inProgressProjects: projects.filter(p => p.status === 'قيد التنفيذ').length,
        plannedProjects: projects.filter(p => p.status === 'قيد التخطيط').length
      };
    } catch (error) {
      console.error('خطأ في جلب الإحصائيات:', error);
      throw error;
    }
  }
}

// إنشاء مثيل واحد من الخدمة
export const yearProjectService = new YearProjectService();
