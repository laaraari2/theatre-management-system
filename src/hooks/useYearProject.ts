import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { yearProjectService } from '../services/yearProjectService';
import type { YearProjectFirestore, TimelineEventFirestore } from '../types';

export const useYearProject = () => {
  const { user, loginAnonymously } = useAuth();
  const [currentProject, setCurrentProject] = useState<YearProjectFirestore | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // تحميل المشروع الحالي
  const loadCurrentProject = async () => {
    // إذا لم يكن هناك مستخدم، جرب تسجيل دخول مجهول
    if (!user) {
      try {
        await loginAnonymously();
        return; // سيتم استدعاء loadCurrentProject مرة أخرى عند تغيير user
      } catch (error) {
        console.error('فشل في تسجيل الدخول المجهول:', error);
        setCurrentProject(null);
        setLoading(false);
        return;
      }
    }

    try {
      setLoading(true);
      setError(null);
      console.log('محاولة تحميل المشروع للمستخدم:', user.uid);
      const project = await yearProjectService.getCurrentProject(user.uid);
      console.log('تم تحميل المشروع:', project);
      setCurrentProject(project);
    } catch (err) {
      console.error('خطأ في تحميل المشروع:', err);
      console.error('تفاصيل الخطأ:', err instanceof Error ? err.message : 'خطأ غير معروف');
      setError('فشل في تحميل المشروع');
      setCurrentProject(null);
    } finally {
      setLoading(false);
    }
  };

  // إنشاء مشروع جديد
  const createProject = async (projectData: Omit<YearProjectFirestore, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => {
    if (!user) throw new Error('المستخدم غير مسجل الدخول');

    try {
      setLoading(true);
      setError(null);
      
      const projectId = await yearProjectService.createProject({
        ...projectData,
        userId: user.uid
      });

      // تحميل المشروع الجديد
      const newProject = await yearProjectService.getProject(projectId);
      setCurrentProject(newProject);
      
      return projectId;
    } catch (err) {
      console.error('خطأ في إنشاء المشروع:', err);
      setError('فشل في إنشاء المشروع');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // تحديث المشروع
  const updateProject = async (updates: Partial<YearProjectFirestore>) => {
    if (!currentProject) throw new Error('لا يوجد مشروع حالي');

    try {
      setLoading(true);
      setError(null);
      
      await yearProjectService.updateProject(currentProject.id!, updates);
      
      // تحديث الحالة المحلية
      setCurrentProject(prev => prev ? { ...prev, ...updates } : null);
    } catch (err) {
      console.error('خطأ في تحديث المشروع:', err);
      setError('فشل في تحديث المشروع');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // حذف المشروع
  const deleteProject = async () => {
    if (!currentProject) throw new Error('لا يوجد مشروع حالي');

    try {
      setLoading(true);
      setError(null);
      
      await yearProjectService.deleteProject(currentProject.id!);
      setCurrentProject(null);
    } catch (err) {
      console.error('خطأ في حذف المشروع:', err);
      setError('فشل في حذف المشروع');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // تحديث الجدول الزمني
  const updateTimeline = async (timeline: TimelineEventFirestore[]) => {
    if (!currentProject) throw new Error('لا يوجد مشروع حالي');

    try {
      await yearProjectService.updateTimeline(currentProject.id!, timeline);
      
      // تحديث الحالة المحلية
      setCurrentProject(prev => prev ? { ...prev, timeline } : null);
    } catch (err) {
      console.error('خطأ في تحديث الجدول الزمني:', err);
      setError('فشل في تحديث الجدول الزمني');
      throw err;
    }
  };

  // تحديث قائمة معينة
  const updateList = async (
    listType: 'cast' | 'crew' | 'objectives' | 'achievements' | 'resources' | 'challenges',
    listData: string[]
  ) => {
    if (!currentProject) throw new Error('لا يوجد مشروع حالي');

    try {
      await yearProjectService.updateList(currentProject.id!, listType, listData);
      
      // تحديث الحالة المحلية
      setCurrentProject(prev => prev ? { ...prev, [listType]: listData } : null);
    } catch (err) {
      console.error(`خطأ في تحديث ${listType}:`, err);
      setError(`فشل في تحديث ${listType}`);
      throw err;
    }
  };

  // تحديث حالة المشروع
  const updateStatus = async (status: YearProjectFirestore['status']) => {
    if (!currentProject) throw new Error('لا يوجد مشروع حالي');

    try {
      await yearProjectService.updateStatus(currentProject.id!, status);
      
      // تحديث الحالة المحلية
      setCurrentProject(prev => prev ? { ...prev, status } : null);
    } catch (err) {
      console.error('خطأ في تحديث حالة المشروع:', err);
      setError('فشل في تحديث حالة المشروع');
      throw err;
    }
  };

  // إضافة صورة
  const addImage = async (imageUrl: string) => {
    if (!currentProject) throw new Error('لا يوجد مشروع حالي');

    try {
      await yearProjectService.addImage(currentProject.id!, imageUrl);
      
      // تحديث الحالة المحلية
      setCurrentProject(prev => 
        prev ? { ...prev, images: [...prev.images, imageUrl] } : null
      );
    } catch (err) {
      console.error('خطأ في إضافة الصورة:', err);
      setError('فشل في إضافة الصورة');
      throw err;
    }
  };

  // حذف صورة
  const removeImage = async (imageUrl: string) => {
    if (!currentProject) throw new Error('لا يوجد مشروع حالي');

    try {
      await yearProjectService.removeImage(currentProject.id!, imageUrl);
      
      // تحديث الحالة المحلية
      setCurrentProject(prev => 
        prev ? { ...prev, images: prev.images.filter(img => img !== imageUrl) } : null
      );
    } catch (err) {
      console.error('خطأ في حذف الصورة:', err);
      setError('فشل في حذف الصورة');
      throw err;
    }
  };

  // تحميل المشروع عند تغيير المستخدم
  useEffect(() => {
    loadCurrentProject();
  }, [user]);

  return {
    currentProject,
    loading,
    error,
    createProject,
    updateProject,
    deleteProject,
    updateTimeline,
    updateList,
    updateStatus,
    addImage,
    removeImage,
    refreshProject: loadCurrentProject
  };
};
