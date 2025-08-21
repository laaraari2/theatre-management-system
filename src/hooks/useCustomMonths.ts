import { useState, useEffect } from 'react';

const MOROCCAN_MONTHS = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
];

export interface CustomMonth {
  id: string;
  name: string;
  order: number;
  isActive: boolean;
  createdAt: Date;
}

export const useCustomMonths = () => {
  const [months, setMonths] = useState<CustomMonth[]>([]);
  const [loading, setLoading] = useState(true);

  // تحميل الشهور من localStorage
  const loadMonths = () => {
    try {
      const savedMonths = localStorage.getItem('customMonths');
      if (savedMonths) {
        const parsedMonths = JSON.parse(savedMonths);
        // تحويل التواريخ من string إلى Date
        const monthsWithDates = parsedMonths.map((month: any) => ({
          ...month,
          createdAt: new Date(month.createdAt)
        }));
        setMonths(monthsWithDates);
      } else {
        // إنشاء الشهور الافتراضية المغربية
        const defaultMonths: CustomMonth[] = MOROCCAN_MONTHS.map((name, index) => ({
          id: `month-${index + 1}`,
          name,
          order: index + 1,
          isActive: true,
          createdAt: new Date()
        }));
        setMonths(defaultMonths);
        saveMonths(defaultMonths);
      }
    } catch (error) {
      console.error('خطأ في تحميل الشهور:', error);
      // في حالة الخطأ، استخدم الشهور الافتراضية
      const defaultMonths: CustomMonth[] = MOROCCAN_MONTHS.map((name, index) => ({
        id: `month-${index + 1}`,
        name,
        order: index + 1,
        isActive: true,
        createdAt: new Date()
      }));
      setMonths(defaultMonths);
    } finally {
      setLoading(false);
    }
  };

  // حفظ الشهور في localStorage
  const saveMonths = (monthsToSave: CustomMonth[]) => {
    try {
      localStorage.setItem('customMonths', JSON.stringify(monthsToSave));
    } catch (error) {
      console.error('خطأ في حفظ الشهور:', error);
    }
  };

  // تحديث الشهور
  const updateMonths = (newMonths: CustomMonth[]) => {
    setMonths(newMonths);
    saveMonths(newMonths);
  };

  // الحصول على الشهور المفعلة فقط
  const getActiveMonths = (): CustomMonth[] => {
    return months.filter(month => month.isActive).sort((a, b) => a.order - b.order);
  };

  // الحصول على أسماء الشهور المفعلة فقط
  const getActiveMonthNames = (): string[] => {
    return getActiveMonths().map(month => month.name);
  };

  // الحصول على شهر بالاسم
  const getMonthByName = (name: string): CustomMonth | undefined => {
    return months.find(month => month.name === name && month.isActive);
  };

  // الحصول على شهر بالترتيب
  const getMonthByOrder = (order: number): CustomMonth | undefined => {
    return months.find(month => month.order === order && month.isActive);
  };

  // الحصول على رقم الشهر بالاسم (للاستخدام مع Date)
  const getMonthNumberByName = (name: string): number => {
    const month = getMonthByName(name);
    return month ? month.order : 1;
  };

  // الحصول على اسم الشهر بالرقم
  const getMonthNameByNumber = (number: number): string => {
    const month = getMonthByOrder(number);
    return month ? month.name : 'شهر غير معروف';
  };

  // الحصول على الشهر الحالي
  const getCurrentMonth = (): CustomMonth | undefined => {
    const currentMonthIndex = new Date().getMonth(); // 0-11
    return getMonthByOrder(currentMonthIndex + 1); // 1-12
  };

  // الحصول على اسم الشهر الحالي
  const getCurrentMonthName = (): string => {
    const currentMonth = getCurrentMonth();
    return currentMonth ? currentMonth.name : MOROCCAN_MONTHS[new Date().getMonth()];
  };

  // تحويل رقم الشهر الميلادي إلى اسم الشهر المخصص
  const convertGregorianMonthToCustom = (gregorianMonth: number): string => {
    // gregorianMonth من 0-11 (JavaScript Date)
    const customMonth = getMonthByOrder(gregorianMonth + 1);
    return customMonth ? customMonth.name : MOROCCAN_MONTHS[gregorianMonth] || 'شهر غير معروف';
  };

  // تحويل اسم الشهر المخصص إلى رقم الشهر الميلادي
  const convertCustomMonthToGregorian = (customMonthName: string): number => {
    const month = getMonthByName(customMonthName);
    return month ? month.order - 1 : 0; // إرجاع 0-11 للاستخدام مع JavaScript Date
  };

  // إنشاء قائمة الشهور للسنة الحالية
  const generateMonthsForCurrentYear = (): Array<{ name: string; value: string }> => {
    const currentYear = new Date().getFullYear();
    return getActiveMonths().map(month => ({
      name: `${month.name} ${currentYear}`,
      value: `${month.name} ${currentYear}`
    }));
  };

  // إنشاء قائمة الشهور لسنة معينة
  const generateMonthsForYear = (year: number): Array<{ name: string; value: string }> => {
    return getActiveMonths().map(month => ({
      name: `${month.name} ${year}`,
      value: `${month.name} ${year}`
    }));
  };

  // تحميل الشهور عند بداية الـ hook
  useEffect(() => {
    loadMonths();
  }, []);

  // إعادة تحميل الشهور عند تغيير localStorage من مكان آخر
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'customMonths') {
        loadMonths();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return {
    months,
    loading,
    updateMonths,
    getActiveMonths,
    getActiveMonthNames,
    getMonthByName,
    getMonthByOrder,
    getMonthNumberByName,
    getMonthNameByNumber,
    getCurrentMonth,
    getCurrentMonthName,
    convertGregorianMonthToCustom,
    convertCustomMonthToGregorian,
    generateMonthsForCurrentYear,
    generateMonthsForYear,
    loadMonths,
    saveMonths
  };
};

export default useCustomMonths;
