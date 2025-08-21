// Data Manager for Theatre Activities App
// This handles data persistence and synchronization

export interface Activity {
  id: number;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  participants: string;
  status: 'مؤكد' | 'قيد التحضير' | 'ملغي';
}

export interface Report {
  id: number;
  title: string;
  date: string;
  summary: string;
  image: string;
  activities: string[];
  achievements: string[];
  gallery: string[];
}

// Local Storage Keys
export const STORAGE_KEYS = {
  ACTIVITIES: 'theatre-activities',
  REPORTS: 'theatre-reports',
  SETTINGS: 'theatre-settings'
};

// Default Data
export const DEFAULT_ACTIVITIES: Activity[] = [
  {
    id: 1,
    title: "عرض مسرحي: الأسد والفأر",
    date: "25 يناير 2025",
    time: "10:00 صباحاً",
    location: "قاعة المسرح الرئيسية",
    description: "عرض مسرحي تعليمي للمرحلة الابتدائية",
    participants: "طلاب الرابع ابتدائي",
    status: "مؤكد"
  },
  {
    id: 2,
    title: "ورشة الارتجال المسرحي",
    date: "28 يناير 2025",
    time: "2:00 مساءً",
    location: "قاعة الأنشطة",
    description: "ورشة تدريبية لتطوير مهارات الارتجال",
    participants: "طلاب الأولى إعدادي 1 و الأولى إعدادي 2",
    status: "مؤكد"
  },
  {
    id: 3,
    title: "مهرجان المسرح المدرسي",
    date: "5 فبراير 2025",
    time: "9:00 صباحاً",
    location: "المسرح الخارجي",
    description: "مهرجان سنوي يضم عروض من جميع المراحل",
    participants: "جميع المستويات من ما قبل التمدرس إلى الثالثة إعدادي",
    status: "قيد التحضير"
  }
];

// Data Management Functions
export const dataManager = {
  // Export all data
  exportData: () => {
    const activities = JSON.parse(localStorage.getItem(STORAGE_KEYS.ACTIVITIES) || '[]');
    const reports = JSON.parse(localStorage.getItem(STORAGE_KEYS.REPORTS) || '[]');
    const settings = JSON.parse(localStorage.getItem(STORAGE_KEYS.SETTINGS) || '{}');
    
    return {
      activities,
      reports,
      settings,
      exportDate: new Date().toISOString(),
      version: '1.0'
    };
  },

  // Import data
  importData: (data: any) => {
    try {
      if (data.activities) {
        localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(data.activities));
      }
      if (data.reports) {
        localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(data.reports));
      }
      if (data.settings) {
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(data.settings));
      }
      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  },

  // Clear all data
  clearAllData: () => {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  },

  // Backup data to file
  downloadBackup: () => {
    const data = dataManager.exportData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `theatre-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};

// GitHub Integration (for future use)
export const githubSync = {
  // This would require a backend service or GitHub API
  // For now, we'll use local storage with export/import functionality
  
  saveToGist: async () => {
    // Implementation for saving to GitHub Gist
    // This requires user's GitHub token
    console.log('GitHub sync not implemented yet');
  },

  loadFromGist: async () => {
    // Implementation for loading from GitHub Gist
    console.log('GitHub sync not implemented yet');
  }
};
