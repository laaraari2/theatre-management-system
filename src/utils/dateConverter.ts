// محول التواريخ - الشهور الميلادية المغربية بالأرقام الفرنسية

/**
 * تحويل التاريخ الحالي إلى صيغة مغربية
 * مثال: "15 غشت 2025" (بدلاً من "صفر 1447 هـ")
 */

import { convertArabicToFrenchNumbers } from './numberUtils';

// الشهور الميلادية المغربية (ترتيب عادي)
export const MOROCCAN_MONTHS = [
  'يناير',    // January
  'فبراير',   // February
  'مارس',     // March
  'أبريل',    // April
  'ماي',      // May
  'يونيو',    // June
  'يوليوز',   // July
  'غشت',      // August
  'شتنبر',    // September
  'أكتوبر',   // October
  'نونبر',    // November
  'دجنبر'     // December
];

// الشهور حسب الموسم الدراسي المغربي (من شتنبر إلى يوليوز)
export const MOROCCAN_ACADEMIC_MONTHS = [
  'شتنبر',    // September - بداية الموسم الدراسي
  'أكتوبر',   // October
  'نونبر',    // November
  'دجنبر',    // December
  'يناير',    // January
  'فبراير',   // February
  'مارس',     // March
  'أبريل',    // April
  'ماي',      // May
  'يونيو',    // June
  'يوليوز',   // July - نهاية الموسم الدراسي
  'غشت'       // August - العطلة الصيفية
];

// أيام الأسبوع بالعربية
export const ARABIC_DAYS = [
  'الأحد',     // Sunday
  'الاثنين',   // Monday
  'الثلاثاء',  // Tuesday
  'الأربعاء',  // Wednesday
  'الخميس',   // Thursday
  'الجمعة',   // Friday
  'السبت'     // Saturday
];

/**
 * تحويل التاريخ الحالي إلى صيغة مغربية مع أرقام فرنسية
 * @returns مثال: "الأحد 15 غشت 2025"
 */
export const getCurrentDateInMoroccanFormat = (): string => {
  const now = new Date();
  const day = now.getDate();
  const month = MOROCCAN_MONTHS[now.getMonth()];
  const year = now.getFullYear();
  const dayName = ARABIC_DAYS[now.getDay()];
  
  return `${dayName} ${day} ${month} ${year}`;
};

/**
 * تحويل تاريخ معين إلى صيغة مغربية
 * @param date كائن التاريخ
 * @returns مثال: "الجمعة 25 دجنبر 2025"
 */
export const formatDateInMoroccanStyle = (date: Date): string => {
  const day = date.getDate();
  const month = MOROCCAN_MONTHS[date.getMonth()];
  const year = date.getFullYear();
  const dayName = ARABIC_DAYS[date.getDay()];
  
  return `${dayName} ${day} ${month} ${year}`;
};

/**
 * تحويل تاريخ ISO إلى صيغة مغربية
 * @param isoDate تاريخ بصيغة YYYY-MM-DD
 * @returns مثال: "السبت 1 يناير 2025"
 */
export const convertISOToMoroccanDate = (isoDate: string): string => {
  try {
    const date = new Date(isoDate);
    return formatDateInMoroccanStyle(date);
  } catch (error) {
    console.warn('خطأ في تحويل التاريخ:', isoDate, error);
    return 'تاريخ غير صحيح';
  }
};

/**
 * الحصول على الشهور المخصصة من localStorage
 */
export const getCustomMonths = (): string[] => {
  try {
    const savedMonths = localStorage.getItem('customMonths');
    if (savedMonths) {
      const months = JSON.parse(savedMonths);
      return months
        .filter((month: any) => month.isActive)
        .sort((a: any, b: any) => a.order - b.order)
        .map((month: any) => month.name);
    }
  } catch (error) {
    console.warn('خطأ في تحميل الشهور المخصصة:', error);
  }
  return MOROCCAN_ACADEMIC_MONTHS;
};

/**
 * الحصول على الشهر الحالي بالاسم المغربي (من الشهور المخصصة أو الافتراضية)
 * @returns مثال: "غشت"
 */
export const getCurrentMonthName = (): string => {
  const now = new Date();
  const customMonths = getCustomMonths();
  return customMonths[now.getMonth()] || MOROCCAN_MONTHS[now.getMonth()];
};

/**
 * الحصول على السنة الحالية
 * @returns مثال: 2025
 */
export const getCurrentYear = (): number => {
  return new Date().getFullYear();
};

/**
 * تحويل رقم الشهر إلى اسم مغربي (من الشهور المخصصة أو الافتراضية)
 * @param monthNumber رقم الشهر (1-12)
 * @returns اسم الشهر المغربي
 */
export const getMonthNameByNumber = (monthNumber: number): string => {
  if (monthNumber < 1 || monthNumber > 12) {
    return 'شهر غير صحيح';
  }
  const customMonths = getCustomMonths();
  return customMonths[monthNumber - 1] || MOROCCAN_MONTHS[monthNumber - 1];
};

/**
 * تحويل اسم الشهر المغربي إلى رقم (من الشهور المخصصة أو الافتراضية)
 * @param monthName اسم الشهر المغربي
 * @returns رقم الشهر (1-12) أو 0 إذا لم يوجد
 */
export const getMonthNumberByName = (monthName: string): number => {
  const customMonths = getCustomMonths();
  const index = customMonths.indexOf(monthName);
  if (index !== -1) {
    return index + 1;
  }
  // إذا لم يوجد في الشهور المخصصة، ابحث في الافتراضية
  const defaultIndex = MOROCCAN_MONTHS.indexOf(monthName);
  return defaultIndex !== -1 ? defaultIndex + 1 : 0;
};

/**
 * إنشاء قائمة بالشهور للسنة الحالية (من الشهور المخصصة أو الافتراضية)
 * @returns مثال: ["يناير 2025", "فبراير 2025", ...]
 */
export const generateMonthsForCurrentYear = (): string[] => {
  const currentYear = getCurrentYear();
  const customMonths = getCustomMonths();
  return customMonths.map(month => `${month} ${currentYear}`);
};

/**
 * إنشاء قائمة بالشهور لسنة معينة (من الشهور المخصصة أو الافتراضية)
 * @param year السنة
 * @returns مثال: ["يناير 2025", "فبراير 2025", ...]
 */
export const generateMonthsForYear = (year: number): string[] => {
  const customMonths = getCustomMonths();
  return customMonths.map(month => `${month} ${year}`);
};

/**
 * تحويل التاريخ من صيغة عربية إلى ISO
 * @param arabicDate مثال: "15 غشت 2025"
 * @returns مثال: "2025-08-15"
 */
export const convertMoroccanDateToISO = (arabicDate: string): string => {
  try {
    // تحويل الأرقام العربية إلى فرنسية أولاً
    const dateWithFrenchNumbers = convertArabicToFrenchNumbers(arabicDate);
    const parts = dateWithFrenchNumbers.split(' ');
    
    if (parts.length >= 3) {
      const day = parseInt(parts[0]);
      const monthName = parts[1];
      const year = parseInt(parts[2]);
      
      const monthNumber = getMonthNumberByName(monthName);
      
      if (!isNaN(day) && monthNumber > 0 && !isNaN(year)) {
        const date = new Date(year, monthNumber - 1, day);
        return date.toISOString().split('T')[0];
      }
    }
  } catch (error) {
    console.warn('خطأ في تحويل التاريخ المغربي:', arabicDate, error);
  }
  
  return new Date().toISOString().split('T')[0]; // إرجاع التاريخ الحالي كافتراضي
};

/**
 * مثال على التحويل من "صفر 1447 هـ" إلى التاريخ الميلادي المغربي
 * صفر 1447 هـ يقابل تقريباً غشت 2025 م
 */
export const convertSafar1447Example = (): string => {
  // صفر 1447 هـ يبدأ تقريباً في 9 غشت 2025
  const exampleDate = new Date(2025, 7, 9); // الشهر 7 = غشت (أغسطس)
  return formatDateInMoroccanStyle(exampleDate);
};

// تصدير جميع الدوال والثوابت
export default {
  MOROCCAN_MONTHS,
  ARABIC_DAYS,
  getCurrentDateInMoroccanFormat,
  formatDateInMoroccanStyle,
  convertISOToMoroccanDate,
  getCurrentMonthName,
  getCurrentYear,
  getMonthNameByNumber,
  getMonthNumberByName,
  generateMonthsForCurrentYear,
  generateMonthsForYear,
  convertMoroccanDateToISO,
  convertSafar1447Example
};
