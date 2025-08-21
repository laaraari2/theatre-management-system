// دوال مساعدة للتعامل مع الأرقام والتواريخ

/**
 * تحويل الأرقام العربية إلى أرقام فرنسية (لاتينية)
 * @param text النص المحتوي على أرقام عربية
 * @returns النص مع الأرقام الفرنسية
 */
export const convertArabicToFrenchNumbers = (text: string | undefined | null): string => {
  // التحقق من وجود النص
  if (!text || typeof text !== 'string') {
    return '';
  }

  const arabicToFrench: { [key: string]: string } = {
    '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4',
    '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9'
  };

  return text.replace(/[٠-٩]/g, (match) => arabicToFrench[match] || match);
};

/**
 * تحويل الأرقام الفرنسية إلى أرقام عربية
 * @param text النص المحتوي على أرقام فرنسية
 * @returns النص مع الأرقام العربية
 */
export const convertFrenchToArabicNumbers = (text: string | undefined | null): string => {
  // التحقق من وجود النص
  if (!text || typeof text !== 'string') {
    return '';
  }

  const frenchToArabic: { [key: string]: string } = {
    '0': '٠', '1': '١', '2': '٢', '3': '٣', '4': '٤',
    '5': '٥', '6': '٦', '7': '٧', '8': '٨', '9': '٩'
  };

  return text.replace(/[0-9]/g, (match) => frenchToArabic[match] || match);
};

/**
 * تنسيق التاريخ بالأرقام الفرنسية
 * @param date كائن التاريخ
 * @param format صيغة التنسيق ('DD/MM/YYYY' أو 'DD-MM-YYYY' أو 'YYYY-MM-DD')
 * @returns التاريخ منسق بالأرقام الفرنسية
 */
export const formatDateWithFrenchNumbers = (date: Date, format: 'DD/MM/YYYY' | 'DD-MM-YYYY' | 'YYYY-MM-DD' = 'DD/MM/YYYY'): string => {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear().toString();
  
  switch (format) {
    case 'DD/MM/YYYY':
      return `${day}/${month}/${year}`;
    case 'DD-MM-YYYY':
      return `${day}-${month}-${year}`;
    case 'YYYY-MM-DD':
      return `${year}-${month}-${day}`;
    default:
      return `${day}/${month}/${year}`;
  }
};

/**
 * تحويل تاريخ ISO إلى تنسيق عربي مع أرقام فرنسية
 * @param isoDate تاريخ بصيغة ISO (YYYY-MM-DD)
 * @returns تاريخ بالعربية مع أرقام فرنسية
 */
export const convertISOToArabicDateWithFrenchNumbers = (isoDate: string | undefined | null): string => {
  if (!isoDate || typeof isoDate !== 'string') {
    return 'تاريخ غير محدد';
  }

  // الشهور الميلادية المغربية (بدلاً من الهجرية)
  const months = [
    'يناير', 'فبراير', 'مارس', 'أبريل', 'ماي', 'يونيو',
    'يوليوز', 'غشت', 'شتنبر', 'أكتوبر', 'نونبر', 'دجنبر'
  ];

  try {
    const date = new Date(isoDate);
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();

    // إرجاع التاريخ الميلادي المغربي بالأرقام الفرنسية
    return `${day} ${month} ${year}`;
  } catch (error) {
    console.warn('خطأ في تحويل التاريخ:', isoDate, error);
    return isoDate;
  }
};

/**
 * تحويل تاريخ عربي إلى صيغة ISO
 * @param arabicDate تاريخ بالعربية (مثل: "15 يناير 2025")
 * @returns تاريخ بصيغة ISO (YYYY-MM-DD)
 */
export const convertArabicDateToISO = (arabicDate: string | undefined | null): string => {
  if (!arabicDate || typeof arabicDate !== 'string') {
    return new Date().toISOString().split('T')[0]; // إرجاع التاريخ الحالي كافتراضي
  }
  const months: { [key: string]: number } = {
    'يناير': 0, 'فبراير': 1, 'مارس': 2, 'أبريل': 3, 'مايو': 4, 'يونيو': 5,
    'يوليو': 6, 'أغسطس': 7, 'سبتمبر': 8, 'أكتوبر': 9, 'نوفمبر': 10, 'ديسمبر': 11,
    // أشكال بديلة
    'ماي': 4, 'يوليوز': 6, 'غشت': 7, 'شتنبر': 8, 'نونبر': 10, 'دجنبر': 11
  };
  
  try {
    // تحويل الأرقام العربية إلى فرنسية أولاً
    const dateWithFrenchNumbers = convertArabicToFrenchNumbers(arabicDate);
    const parts = dateWithFrenchNumbers.split(' ');
    
    if (parts.length >= 3) {
      const day = parseInt(parts[0]);
      const monthName = parts[1];
      const year = parseInt(parts[2]);
      
      const month = months[monthName];
      
      if (!isNaN(day) && month !== undefined && !isNaN(year)) {
        const date = new Date(year, month, day);
        return formatDateWithFrenchNumbers(date, 'YYYY-MM-DD');
      }
    }
  } catch (error) {
    console.warn('خطأ في تحويل التاريخ العربي:', arabicDate, error);
  }
  
  return arabicDate;
};

/**
 * تنسيق الوقت بالأرقام الفرنسية
 * @param time الوقت (مثل: "14:30" أو "٢:٣٠ مساءً")
 * @returns الوقت بالأرقام الفرنسية
 */
export const formatTimeWithFrenchNumbers = (time: string | undefined | null): string => {
  if (!time) {
    return '--:--';
  }
  return convertArabicToFrenchNumbers(time);
};

/**
 * تنسيق رقم بالأرقام الفرنسية مع فواصل الآلاف
 * @param number الرقم
 * @returns الرقم منسق بالأرقام الفرنسية
 */
export const formatNumberWithFrenchDigits = (number: number): string => {
  return number.toLocaleString('en-US'); // استخدام التنسيق الإنجليزي للأرقام الفرنسية
};

/**
 * التحقق من وجود أرقام عربية في النص
 * @param text النص للفحص
 * @returns true إذا كان يحتوي على أرقام عربية
 */
export const hasArabicNumbers = (text: string | undefined | null): boolean => {
  if (!text || typeof text !== 'string') {
    return false;
  }
  return /[٠-٩]/.test(text);
};

/**
 * التحقق من وجود أرقام فرنسية في النص
 * @param text النص للفحص
 * @returns true إذا كان يحتوي على أرقام فرنسية
 */
export const hasFrenchNumbers = (text: string | undefined | null): boolean => {
  if (!text || typeof text !== 'string') {
    return false;
  }
  return /[0-9]/.test(text);
};

/**
 * تحويل التاريخ الهجري إلى ميلادي (تقريبي)
 * @param hijriDate التاريخ الهجري (مثل: "صفر ١٤٤٧ هـ")
 * @returns التاريخ الميلادي بالأرقام الفرنسية
 */
export const convertHijriToGregorian = (hijriDate: string | undefined | null): string => {
  if (!hijriDate || typeof hijriDate !== 'string') {
    return 'تاريخ غير محدد';
  }

  // الشهور الهجرية
  const hijriMonths: { [key: string]: number } = {
    'محرم': 1, 'صفر': 2, 'ربيع الأول': 3, 'ربيع الآخر': 4, 'ربيع الثاني': 4,
    'جمادى الأولى': 5, 'جمادى الآخرة': 6, 'جمادى الثانية': 6,
    'رجب': 7, 'شعبان': 8, 'رمضان': 9, 'شوال': 10,
    'ذو القعدة': 11, 'ذو الحجة': 12
  };

  // الشهور الميلادية المغربية
  const gregorianMonths = [
    'يناير', 'فبراير', 'مارس', 'أبريل', 'ماي', 'يونيو',
    'يوليوز', 'غشت', 'شتنبر', 'أكتوبر', 'نونبر', 'دجنبر'
  ];

  try {
    // تحويل الأرقام العربية إلى فرنسية
    const dateWithFrenchNumbers = convertArabicToFrenchNumbers(hijriDate);

    // استخراج أجزاء التاريخ
    const parts = dateWithFrenchNumbers.replace(/هـ/g, '').trim().split(' ');

    if (parts.length >= 2) {
      const monthName = parts[0];
      const hijriYear = parseInt(parts[1]);

      if (hijriMonths[monthName] && !isNaN(hijriYear)) {
        // تحويل تقريبي من هجري إلى ميلادي
        // السنة الهجرية = 354.37 يوم تقريباً
        // السنة الميلادية = 365.25 يوم تقريباً
        const gregorianYear = Math.round(hijriYear * 0.970229 + 621.5643);

        // تحديد الشهر الميلادي المقابل (تقريبي)
        const hijriMonth = hijriMonths[monthName];
        let gregorianMonth = hijriMonth;

        // تعديل بسيط للشهر حسب الفرق بين التقويمين
        if (gregorianMonth > 12) gregorianMonth -= 12;
        if (gregorianMonth < 1) gregorianMonth += 12;

        const monthNameGregorian = gregorianMonths[gregorianMonth - 1];

        return `${monthNameGregorian} ${gregorianYear}`;
      }
    }

    return dateWithFrenchNumbers;
  } catch (error) {
    console.warn('خطأ في تحويل التاريخ الهجري:', hijriDate, error);
    return hijriDate;
  }
};

/**
 * تحويل التاريخ الميلادي إلى هجري (تقريبي)
 * @param gregorianDate التاريخ الميلادي (مثل: "أغسطس 2025")
 * @returns التاريخ الهجري بالأرقام الفرنسية
 */
export const convertGregorianToHijri = (gregorianDate: string | undefined | null): string => {
  if (!gregorianDate || typeof gregorianDate !== 'string') {
    return 'تاريخ غير محدد';
  }

  // الشهور الميلادية المغربية
  const gregorianMonths: { [key: string]: number } = {
    'يناير': 1, 'فبراير': 2, 'مارس': 3, 'أبريل': 4, 'ماي': 5, 'يونيو': 6,
    'يوليوز': 7, 'غشت': 8, 'شتنبر': 9, 'أكتوبر': 10, 'نونبر': 11, 'دجنبر': 12
  };

  // الشهور الهجرية
  const hijriMonths = [
    'محرم', 'صفر', 'ربيع الأول', 'ربيع الآخر', 'جمادى الأولى', 'جمادى الآخرة',
    'رجب', 'شعبان', 'رمضان', 'شوال', 'ذو القعدة', 'ذو الحجة'
  ];

  try {
    const parts = gregorianDate.split(' ');

    if (parts.length >= 2) {
      const monthName = parts[0];
      const gregorianYear = parseInt(parts[1]);

      if (gregorianMonths[monthName] && !isNaN(gregorianYear)) {
        // تحويل تقريبي من ميلادي إلى هجري
        const hijriYear = Math.round((gregorianYear - 621.5643) / 0.970229);

        // تحديد الشهر الهجري المقابل (تقريبي)
        const gregorianMonth = gregorianMonths[monthName];
        let hijriMonth = gregorianMonth;

        // تعديل بسيط للشهر
        if (hijriMonth > 12) hijriMonth -= 12;
        if (hijriMonth < 1) hijriMonth += 12;

        const monthNameHijri = hijriMonths[hijriMonth - 1];

        return `${monthNameHijri} ${hijriYear} هـ`;
      }
    }

    return gregorianDate;
  } catch (error) {
    console.warn('خطأ في تحويل التاريخ الميلادي:', gregorianDate, error);
    return gregorianDate;
  }
};

/**
 * تحويل "صفر ١٤٤٧ هـ" إلى التاريخ الميلادي المقابل
 */
export const convertSafar1447ToGregorian = (): string => {
  // صفر ١٤٤٧ هـ يقابل تقريباً أغسطس-سبتمبر ٢٠٢٥ م
  return convertHijriToGregorian("صفر ١٤٤٧ هـ");
};

// تصدير جميع الدوال
export default {
  convertArabicToFrenchNumbers,
  convertFrenchToArabicNumbers,
  formatDateWithFrenchNumbers,
  convertISOToArabicDateWithFrenchNumbers,
  convertArabicDateToISO,
  formatTimeWithFrenchNumbers,
  formatNumberWithFrenchDigits,
  hasArabicNumbers,
  hasFrenchNumbers,
  convertHijriToGregorian,
  convertGregorianToHijri,
  convertSafar1447ToGregorian
};
