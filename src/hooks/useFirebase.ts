import { useState, useEffect } from 'react';
import {
  activityService,
  reportService,
  ratingService,
  voiceRecordingsService
} from '../firebase/services';
import type {
  Activity,
  Report,
  Rating,
  VoiceRecording
} from '../types';



// Hook للأنشطة
export const useActivities = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const data = await activityService.getAllActivities();
        setActivities(data);
        setLoading(false);
      } catch (err) {
        setError('خطأ في جلب الأنشطة');
        console.error(err);
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

  const addActivity = async (activity: Omit<Activity, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setLoading(true);
      await activityService.addActivity(activity);
    } catch (err) {
      setError('خطأ في إضافة النشاط');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateActivity = async (id: string, updates: Partial<Activity>) => {
    try {
      setLoading(true);
      await activityService.updateActivity(id, updates);
    } catch (err) {
      setError('خطأ في تحديث النشاط');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const deleteActivity = async (id: string) => {
    try {
      setLoading(true);
      await activityService.deleteActivity(id);
    } catch (err) {
      setError('خطأ في حذف النشاط');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return {
    activities,
    loading,
    error,
    addActivity,
    updateActivity,
    deleteActivity
  };
};

// Hook للتقارير
export const useReports = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const data = await reportService.getAllReports();
        setReports(data);
      } catch (err) {
        setError('خطأ في جلب التقارير');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  const addReport = async (report: Omit<Report, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setLoading(true);
      const id = await reportService.addReport(report);
      const newReport = { ...report, id };
      setReports(prev => [newReport as Report, ...prev]);
    } catch (err) {
      setError('خطأ في إضافة التقرير');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateReport = async (id: string, updates: Partial<Report>) => {
    try {
      setLoading(true);
      await reportService.updateReport(id, updates);
      setReports(prev => prev.map(report =>
        report.id === id ? { ...report, ...updates } : report
      ));
    } catch (err) {
      setError('خطأ في تحديث التقرير');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const deleteReport = async (id: string) => {
    try {
      setLoading(true);
      await reportService.deleteReport(id);
      setReports(prev => prev.filter(report => report.id !== id));
    } catch (err) {
      setError('خطأ في حذف التقرير');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return {
    reports,
    loading,
    error,
    addReport,
    updateReport,
    deleteReport
  };
};

// Hook للتقييمات
export const useRatings = (activityId?: string) => {
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!activityId) return;

    const fetchRatings = async () => {
      try {
        const data = await ratingService.getActivityRatings(activityId);
        setRatings(data);
      } catch (err) {
        setError('خطأ في جلب التقييمات');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchRatings();
  }, [activityId]);

  const addRating = async (rating: Omit<Rating, 'id' | 'createdAt'>) => {
    try {
      setLoading(true);
      const id = await ratingService.addRating(rating);
      const newRating = { ...rating, id };
      setRatings(prev => [newRating as Rating, ...prev]);
    } catch (err) {
      setError('خطأ في إضافة التقييم');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return {
    ratings,
    loading,
    error,
    addRating
  };
};

// Hook للتسجيلات الصوتية
export const useVoiceRecordings = () => {
  const [recordings, setRecordings] = useState<VoiceRecording[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecordings = async () => {
      try {
        const data = await voiceRecordingsService.getAllVoiceRecordings();
        setRecordings(data);
      } catch (err) {
        setError('خطأ في جلب التسجيلات الصوتية');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecordings();
  }, []);

  const addRecording = async (recording: Omit<VoiceRecording, 'id' | 'createdAt'>) => {
    try {
      setLoading(true);
      const id = await voiceRecordingsService.addVoiceRecording(recording);
      const newRecording = { ...recording, id };
      setRecordings(prev => [newRecording as VoiceRecording, ...prev]);
    } catch (err) {
      setError('خطأ في إضافة التسجيل الصوتي');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const deleteRecording = async (id: string) => {
    try {
      setLoading(true);
      await voiceRecordingsService.deleteVoiceRecording(id);
      setRecordings(prev => prev.filter(recording => recording.id !== id));
    } catch (err) {
      setError('خطأ في حذف التسجيل الصوتي');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return {
    recordings,
    loading,
    error,
    addRecording,
    deleteRecording
  };
};

// Hook للإحصائيات
export const useStatistics = () => {
  const { activities } = useActivities();
  const { reports } = useReports();

  const statistics = {
    totalActivities: activities.length,
    completedActivities: activities.filter(a => a.status === 'الأنشطة المنجزة').length,
    upcomingActivities: activities.filter(a => a.status === 'قيد التحضير').length,
    totalReports: reports.length,
    
    // إحصائيات شهرية
    monthlyActivities: activities.reduce((acc, activity) => {
      const month = new Date(activity.date).getMonth();
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {} as Record<number, number>),

    // إحصائيات حسب الحالة
    statusDistribution: activities.reduce((acc, activity) => {
      acc[activity.status] = (acc[activity.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  };

  return statistics;
};
