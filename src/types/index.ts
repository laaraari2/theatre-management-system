// Types and interfaces for the application

export interface Activity {
  id?: string | number;
  title: string;
  date: string; // يمكن أن يكون بصيغة ISO (2025-01-15) أو عربي (15 يناير 2025)
  time: string;
  location: string;
  description: string;
  participants: string;
  status: 'قيد التحضير' | 'الأنشطة المنجزة' | 'ملغي' | 'مخطط' | 'جاري التنفيذ' | 'مكتمل' | string;
  category?: 'مسرحي' | 'ثقافي' | 'تعليمي' | 'اجتماعي' | string;
  priority?: 'عالية' | 'متوسطة' | 'منخفضة' | string;
  reportId?: number | string;
  createdAt?: Date;
  updatedAt?: Date;
  createdBy?: string;
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
    canCreateReports: boolean;
    canEditReports: boolean;
    canDeleteReports: boolean;
    canAccessArchive: boolean;
    canManageUsers: boolean;
    canExportData: boolean;
    canViewAnalytics: boolean;
  };
  isActive: boolean;
  createdAt?: Date;
  lastLogin?: Date | any;
}

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
  createdAt?: any;
  updatedAt?: any;
  userId: string;
}

export interface TimelineEventFirestore {
  id: string;
  title: string;
  description: string;
  date: string;
  status: 'مخطط' | 'قيد التنفيذ' | 'مكتمل';
  responsible: string;
}

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
