import React from 'react';
import './PrintExport.css';

interface PrintExportProps {
  title: string;
  data: any[];
  type: 'activities' | 'schedule' | 'reports';
  showEditButton?: boolean;
  isEditMode?: boolean;
  onToggleEdit?: () => void;
  showCreateButton?: boolean;
  onCreateClick?: () => void;
}

const PrintExport: React.FC<PrintExportProps> = ({
  title,
  data,
  type,
  showEditButton = false,
  isEditMode = false,
  onToggleEdit,
  showCreateButton = false,
  onCreateClick
}) => {
  
  // تحويل الأرقام العربية إلى إنجليزية
  const convertArabicToEnglish = (str: string) => {
    const arabicNumbers = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    const englishNumbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

    let result = str;
    for (let i = 0; i < arabicNumbers.length; i++) {
      result = result.replace(new RegExp(arabicNumbers[i], 'g'), englishNumbers[i]);
    }
    return result;
  };

  // تحويل الأشهر إلى المغربية
  const convertToMoroccanMonths = (dateStr: string) => {
    const moroccanMonths: { [key: string]: string } = {
      // الأشهر العربية الفصحى
      'يناير': 'يناير',
      'فبراير': 'فبراير',
      'مارس': 'مارس',
      'أبريل': 'أبريل',
      'مايو': 'ماي',
      'يونيو': 'يونيو',
      'يوليو': 'يوليوز',
      'أغسطس': 'غشت',
      'سبتمبر': 'شتنبر',
      'أكتوبر': 'أكتوبر',
      'نوفمبر': 'نونبر',
      'ديسمبر': 'دجنبر',
      // تنويعات أخرى
      'كانون الثاني': 'يناير',
      'شباط': 'فبراير',
      'آذار': 'مارس',
      'نيسان': 'أبريل',
      'أيار': 'ماي',
      'حزيران': 'يونيو',
      'تموز': 'يوليوز',
      'آب': 'غشت',
      'أيلول': 'شتنبر',
      'تشرين الأول': 'أكتوبر',
      'تشرين الثاني': 'نونبر',
      'كانون الأول': 'دجنبر',
      // الأشهر الإنجليزية
      'January': 'يناير',
      'February': 'فبراير',
      'March': 'مارس',
      'April': 'أبريل',
      'May': 'ماي',
      'June': 'يونيو',
      'July': 'يوليوز',
      'August': 'غشت',
      'September': 'شتنبر',
      'October': 'أكتوبر',
      'November': 'نونبر',
      'December': 'دجنبر'
    };

    let result = dateStr;
    Object.keys(moroccanMonths).forEach(month => {
      result = result.replace(new RegExp(month, 'g'), moroccanMonths[month]);
    });
    return result;
  };

  // الحصول على التاريخ لاسم الملف
  const getCurrentDateForFilename = () => {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    return `${day}-${month}-${year}`;
  };



  const handlePrint = () => {
    // إنشاء عنصر مؤقت للمحتوى مع البيانات الحقيقية
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = generateActivitiesTablePDF();
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px';
    tempDiv.style.top = '-9999px';
    tempDiv.style.width = '297mm'; // عرض A4 في الوضع الأفقي
    tempDiv.style.fontFamily = 'Arial, sans-serif';
    tempDiv.style.direction = 'rtl';
    tempDiv.style.fontSize = '12px';

    document.body.appendChild(tempDiv);

    // استخدام html2canvas و jsPDF
    import('html2canvas').then(html2canvas => {
      import('jspdf').then(({ jsPDF }) => {
        html2canvas.default(tempDiv, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff'
        }).then(canvas => {
          const imgData = canvas.toDataURL('image/png');
          const pdf = new jsPDF('l', 'mm', 'a4'); // 'l' للوضع الأفقي (landscape)

          const imgWidth = 297; // عرض A4 في الوضع الأفقي
          const pageHeight = 210; // ارتفاع A4 في الوضع الأفقي
          const imgHeight = (canvas.height * imgWidth) / canvas.width;
          let heightLeft = imgHeight;
          let position = 0;

          pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;

          while (heightLeft >= 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
          }

          const dateStr = getCurrentDateForFilename();
          pdf.save(`البرنامج_العام_للأنشطة_المسرحية_${dateStr}.pdf`);
          document.body.removeChild(tempDiv);
        }).catch(() => {
          document.body.removeChild(tempDiv);
          fallbackPrint();
        });
      });
    }).catch(() => {
      document.body.removeChild(tempDiv);
      fallbackPrint();
    });
  };

  const fallbackPrint = () => {
    const printContent = generatePrintContent();
    const printWindow = window.open('', '_blank');

    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html dir="rtl" lang="ar">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${title}</title>
          <style>
            body {
              font-family: 'Arial', sans-serif;
              direction: rtl;
              text-align: right;
              margin: 0;
              padding: 30px;
              line-height: 1.8;
              background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
              color: #2d3748;
            }
            .header {
              text-align: center;
              margin-bottom: 50px;
              padding: 40px;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              border-radius: 20px;
              box-shadow: 0 15px 40px rgba(102, 126, 234, 0.4);
              position: relative;
              overflow: hidden;
            }
            .header::before {
              content: '';
              position: absolute;
              top: -50%;
              right: -50%;
              width: 200%;
              height: 200%;
              background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
              animation: shimmer 3s ease-in-out infinite;
            }
            .header h1 {
              color: white;
              margin: 0 0 20px 0;
              font-size: 36px;
              font-weight: bold;
              text-shadow: 0 3px 6px rgba(0,0,0,0.2);
              position: relative;
              z-index: 1;
            }
            .header p {
              color: rgba(255,255,255,0.95);
              margin: 10px 0;
              font-size: 18px;
              font-weight: 500;
              position: relative;
              z-index: 1;
            }
            @keyframes shimmer {
              0%, 100% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
              50% { transform: translateX(100%) translateY(100%) rotate(45deg); }
            }
            .content {
              margin-bottom: 30px;
            }
            .activity-item, .schedule-item, .report-item {
              background: linear-gradient(145deg, #ffffff 0%, #f8fafc 100%);
              border: 2px solid transparent;
              border-radius: 20px;
              padding: 30px;
              margin-bottom: 30px;
              box-shadow: 0 12px 35px rgba(0,0,0,0.12);
              page-break-inside: avoid;
              position: relative;
              overflow: hidden;
              transition: all 0.3s ease;
            }
            .activity-item::before, .schedule-item::before, .report-item::before {
              content: '';
              position: absolute;
              top: 0;
              right: 0;
              width: 8px;
              height: 100%;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              border-radius: 0 20px 20px 0;
            }
            .activity-item::after, .schedule-item::after, .report-item::after {
              content: '';
              position: absolute;
              top: 20px;
              right: 20px;
              width: 60px;
              height: 60px;
              background: radial-gradient(circle, rgba(102, 126, 234, 0.1) 0%, transparent 70%);
              border-radius: 50%;
            }
            .activity-title, .schedule-title, .report-title {
              color: #1e3a8a;
              font-size: 24px;
              font-weight: bold;
              margin-bottom: 25px;
              padding-bottom: 20px;
              border-bottom: 3px solid transparent;
              background: linear-gradient(white, white) padding-box,
                         linear-gradient(135deg, #667eea 0%, #764ba2 100%) border-box;
              display: flex;
              justify-content: space-between;
              align-items: center;
              position: relative;
              z-index: 2;
            }
            .activity-details, .schedule-details, .report-details {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
              gap: 20px;
              margin-bottom: 25px;
              padding: 25px;
              background: linear-gradient(135deg, rgba(102, 126, 234, 0.08) 0%, rgba(118, 75, 162, 0.05) 100%);
              border-radius: 15px;
              border: 2px solid rgba(102, 126, 234, 0.15);
              position: relative;
              overflow: hidden;
            }
            .activity-details::before, .schedule-details::before, .report-details::before {
              content: '';
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              height: 3px;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            }
            .detail-item {
              color: #4b5563;
              padding: 12px 15px;
              display: flex;
              align-items: center;
              font-size: 15px;
              background: rgba(255, 255, 255, 0.7);
              border-radius: 10px;
              box-shadow: 0 2px 8px rgba(0,0,0,0.05);
              transition: all 0.2s ease;
            }
            .detail-item:hover {
              transform: translateY(-2px);
              box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            }
            .detail-label {
              color: #1e3a8a;
              font-weight: bold;
              margin-left: 12px;
              min-width: 100px;
              font-size: 15px;
            }
            .description {
              color: #4a5568;
              margin-top: 25px;
              padding: 25px;
              background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
              border-radius: 15px;
              border-right: 6px solid #667eea;
              font-style: italic;
              line-height: 1.8;
              position: relative;
              box-shadow: inset 0 2px 8px rgba(0,0,0,0.05);
            }
            .description::before {
              content: '"';
              position: absolute;
              top: 10px;
              right: 15px;
              font-size: 40px;
              color: rgba(102, 126, 234, 0.3);
              font-family: serif;
            }
            .description::after {
              content: '"';
              position: absolute;
              bottom: 10px;
              left: 15px;
              font-size: 40px;
              color: rgba(102, 126, 234, 0.3);
              font-family: serif;
            }
            .footer {
              text-align: center;
              margin-top: 50px;
              padding: 30px;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              border-radius: 20px;
              color: white;
              font-size: 15px;
              box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
              position: relative;
              overflow: hidden;
            }
            .footer::before {
              content: '';
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              height: 2px;
              background: linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent);
            }
            .footer p {
              margin: 10px 0;
              font-weight: 500;
              position: relative;
              z-index: 1;
            }
            .footer p:first-child {
              font-size: 18px;
              font-weight: bold;
              margin-bottom: 15px;
            }

            /* تصميم الجدول الجديد - مثل البرنامج الأسبوعي */
            .activities-table {
              width: 100%;
              border-collapse: collapse;
              margin: 20px 0;
              font-size: 12px;
              background: white;
              border-radius: 8px;
              overflow: hidden;
              box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            }
            .activities-table thead {
              background: #1e3a8a;
              color: white;
            }
            .activities-table th {
              padding: 15px 10px;
              text-align: center;
              font-weight: bold;
              font-size: 14px;
              border: 2px solid #1e3a8a;
            }
            .activities-table th.time-header {
              background: #f59e0b !important;
              color: white;
            }
            .activities-table td {
              border: 2px solid #1e3a8a;
              padding: 10px;
              text-align: center;
              vertical-align: top;
              min-height: 60px;
            }
            .activity-row:nth-child(even) {
              background: #f8fafc;
            }
            .activity-row:nth-child(odd) {
              background: white;
            }
            .month-col { width: 10%; }
            .date-col { width: 18%; }
            .activity-col { width: 25%; }
            .location-col { width: 15%; }
            .description-col { width: 22%; }
            .status-col { width: 10%; }

            .month-cell {
              background: #f8fafc;
              font-weight: bold;
              color: #1e3a8a;
              font-size: 12px;
            }
            .date-cell {
              background: #f8fafc;
              font-weight: bold;
              color: #1e3a8a;
              font-size: 11px;
            }
            .session-info {
              margin: 3px 0;
              padding: 8px;
              background: #f0f9ff;
              border-radius: 4px;
              border: 1px solid #3b82f6;
              text-align: center;
            }
            .session-class {
              font-weight: bold;
              color: #1e40af;
              font-size: 12px;
              margin-bottom: 2px;
            }
            .session-activity {
              color: #059669;
              font-size: 10px;
              margin: 1px 0;
            }
            .session-room {
              color: #dc2626;
              font-size: 10px;
            }
            .session-time {
              background: #f59e0b;
              color: white;
              padding: 2px 6px;
              border-radius: 8px;
              font-size: 9px;
              font-weight: bold;
              display: inline-block;
              margin-top: 3px;
            }
            .empty-session {
              color: #9ca3af;
              font-style: italic;
            }
            .status {
              padding: 10px 20px;
              border-radius: 25px;
              font-size: 14px;
              font-weight: bold;
              text-transform: uppercase;
              letter-spacing: 1px;
              box-shadow: 0 4px 15px rgba(0,0,0,0.15);
              position: relative;
              overflow: hidden;
              z-index: 1;
            }
            .status::before {
              content: '';
              position: absolute;
              top: 0;
              left: -100%;
              width: 100%;
              height: 100%;
              background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
              transition: left 0.5s ease;
              z-index: -1;
            }
            .status:hover::before {
              left: 100%;
            }
            .status.confirmed {
              background: linear-gradient(135deg, #10b981 0%, #059669 100%);
              color: white;
              box-shadow: 0 4px 15px rgba(16, 185, 129, 0.4);
            }
            .status.pending {
              background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
              color: white;
              box-shadow: 0 4px 15px rgba(245, 158, 11, 0.4);
            }
            .status.cancelled {
              background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
              color: white;
              box-shadow: 0 4px 15px rgba(239, 68, 68, 0.4);
            }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          ${printContent}
        </body>
        </html>
      `);
      
      printWindow.document.close();
      printWindow.focus();
      
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 250);
    }
  };

  const generateActivitiesTablePDF = () => {
    // تحويل التاريخ مع الأرقام الفرنسية والأشهر المغربية
    const rawDate = new Date().toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    const dateWithEnglishNumbers = convertArabicToEnglish(rawDate);
    const currentDate = convertToMoroccanMonths(dateWithEnglishNumbers);

    return `
      <div style="font-family: Arial, sans-serif; direction: rtl; padding: 20px; background: white;">
        <div style="text-align: center; margin-bottom: 30px; padding: 20px; border-bottom: 3px solid #1e3a8a;">
          <h1 style="font-size: 24px; color: #1e3a8a; margin-bottom: 10px;">📅 البرنامج العام للأنشطة المسرحية</h1>
          <p style="font-size: 16px; color: #666; margin: 5px 0;"><strong>الأستاذ مصطفى لعرعري</strong> - مسؤول الأنشطة المسرحية</p>
          <p style="font-size: 14px; color: #666; margin: 5px 0;">مجموعة مدارس العمران</p>
          <p style="font-size: 14px; color: #666; margin: 5px 0;">تاريخ الطباعة: ${currentDate}</p>
        </div>

        <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 12px;">
          <thead>
            <tr>
              <th style="border: 2px solid #1e3a8a; padding: 10px; background: #f59e0b; color: white; font-weight: bold; width: 12%;">📅 الشهر</th>
              <th style="border: 2px solid #1e3a8a; padding: 10px; background: #1e3a8a; color: white; font-weight: bold; width: 14%;">📆 التاريخ</th>
              <th style="border: 2px solid #1e3a8a; padding: 10px; background: #1e3a8a; color: white; font-weight: bold; width: 12%;">⏰ التوقيت</th>
              <th style="border: 2px solid #1e3a8a; padding: 10px; background: #1e3a8a; color: white; font-weight: bold; width: 18%;">🎭 النشاط</th>
              <th style="border: 2px solid #1e3a8a; padding: 10px; background: #1e3a8a; color: white; font-weight: bold; width: 20%;">📝 الوصف</th>
              <th style="border: 2px solid #1e3a8a; padding: 10px; background: #1e3a8a; color: white; font-weight: bold; width: 14%;">👥 المستهدفة</th>
              <th style="border: 2px solid #1e3a8a; padding: 10px; background: #1e3a8a; color: white; font-weight: bold; width: 10%;">📍 المكان</th>
              <th style="border: 2px solid #1e3a8a; padding: 10px; background: #1e3a8a; color: white; font-weight: bold; width: 8%;">🏷️ الحالة</th>
            </tr>
          </thead>
          <tbody>
            ${data.map((activity, index) => {
              // استخراج الشهر من التاريخ بطريقة مباشرة
              let activityDate, dayName, convertedDate, convertedMonth;

              try {
                // تحليل التاريخ من النص
                if (activity.date && activity.date !== '') {
                  // إذا كان التاريخ يحتوي على اسم شهر مباشرة
                  if (activity.date.includes('يناير')) {
                    convertedMonth = 'يناير';
                  } else if (activity.date.includes('فبراير')) {
                    convertedMonth = 'فبراير';
                  } else if (activity.date.includes('مارس')) {
                    convertedMonth = 'مارس';
                  } else if (activity.date.includes('أبريل')) {
                    convertedMonth = 'أبريل';
                  } else if (activity.date.includes('ماي') || activity.date.includes('مايو')) {
                    convertedMonth = 'ماي';
                  } else if (activity.date.includes('يونيو')) {
                    convertedMonth = 'يونيو';
                  } else if (activity.date.includes('يوليوز') || activity.date.includes('يوليو')) {
                    convertedMonth = 'يوليوز';
                  } else if (activity.date.includes('غشت') || activity.date.includes('أغسطس')) {
                    convertedMonth = 'غشت';
                  } else if (activity.date.includes('شتنبر') || activity.date.includes('سبتمبر')) {
                    convertedMonth = 'شتنبر';
                  } else if (activity.date.includes('أكتوبر')) {
                    convertedMonth = 'أكتوبر';
                  } else if (activity.date.includes('نونبر') || activity.date.includes('نوفمبر')) {
                    convertedMonth = 'نونبر';
                  } else if (activity.date.includes('دجنبر') || activity.date.includes('ديسمبر')) {
                    convertedMonth = 'دجنبر';
                  }
                  else {
                    // محاولة تحويل التاريخ كرقم
                    activityDate = new Date(activity.date);
                    if (!isNaN(activityDate.getTime())) {
                      const monthIndex = activityDate.getMonth();
                      const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'ماي', 'يونيو', 'يوليوز', 'غشت', 'شتنبر', 'أكتوبر', 'نونبر', 'دجنبر'];
                      convertedMonth = months[monthIndex];
                    } else {
                      convertedMonth = 'غير محدد';
                    }
                  }

                  // استخراج اليوم - تحويل التاريخ المغربي إلى تاريخ قابل للقراءة
                  let dateForParsing = activity.date;

                  // استبدال الأشهر المغربية بالإنجليزية للتحويل
                  dateForParsing = dateForParsing.replace('شتنبر', 'September');
                  dateForParsing = dateForParsing.replace('غشت', 'August');
                  dateForParsing = dateForParsing.replace('يوليوز', 'July');
                  dateForParsing = dateForParsing.replace('يونيو', 'June');
                  dateForParsing = dateForParsing.replace('ماي', 'May');
                  dateForParsing = dateForParsing.replace('أبريل', 'April');
                  dateForParsing = dateForParsing.replace('مارس', 'March');
                  dateForParsing = dateForParsing.replace('فبراير', 'February');
                  dateForParsing = dateForParsing.replace('يناير', 'January');
                  dateForParsing = dateForParsing.replace('أكتوبر', 'October');
                  dateForParsing = dateForParsing.replace('نونبر', 'November');
                  dateForParsing = dateForParsing.replace('دجنبر', 'December');

                  activityDate = new Date(dateForParsing);

                  if (!isNaN(activityDate.getTime())) {
                    dayName = activityDate.toLocaleDateString('ar-EG', { weekday: 'long' });
                  } else {
                    dayName = 'غير محدد';
                  }

                  convertedDate = activity.date;
                } else {
                  convertedMonth = 'غير محدد';
                  convertedDate = 'غير محدد';
                  dayName = 'غير محدد';
                }
              } catch (error) {
                convertedDate = activity.date || 'غير محدد';
                convertedMonth = 'غير محدد';
                dayName = 'غير محدد';
              }

              // تحديد لون الحالة
              const statusColor = activity.status === 'الأنشطة المنجزة' ? '#10b981' :
                                 activity.status === 'قيد التحضير' ? '#f59e0b' : '#ef4444';

              return `
                <tr>
                  <td style="border: 2px solid #1e3a8a; padding: 10px; vertical-align: top; background: ${index % 2 === 0 ? '#f8fafc' : 'white'}; text-align: center; font-weight: bold; color: #1e3a8a; font-size: 12px;">${convertedMonth || 'غير محدد'}</td>
                  <td style="border: 2px solid #1e3a8a; padding: 10px; vertical-align: top; background: ${index % 2 === 0 ? '#f8fafc' : 'white'}; text-align: center;">
                    <div style="font-weight: bold; color: #1e40af; font-size: 12px;">${dayName || 'غير محدد'}</div>
                    <div style="font-size: 11px; color: #666; margin-top: 2px;">${convertedDate || 'غير محدد'}</div>
                  </td>
                  <td style="border: 2px solid #1e3a8a; padding: 10px; vertical-align: top; background: ${index % 2 === 0 ? '#f8fafc' : 'white'}; text-align: center;">
                    <div style="font-weight: bold; color: #f59e0b; font-size: 12px;">${activity.time || 'غير محدد'}</div>
                  </td>
                  <td style="border: 2px solid #1e3a8a; padding: 10px; vertical-align: top; background: ${index % 2 === 0 ? '#f8fafc' : 'white'};">
                    <div style="font-weight: bold; color: #1e40af; font-size: 12px; line-height: 1.3;">${activity.title || 'غير محدد'}</div>
                  </td>
                  <td style="border: 2px solid #1e3a8a; padding: 10px; vertical-align: top; background: ${index % 2 === 0 ? '#f8fafc' : 'white'};">
                    <div style="font-size: 11px; color: #374151; line-height: 1.3;">${activity.description || 'غير محدد'}</div>
                  </td>
                  <td style="border: 2px solid #1e3a8a; padding: 10px; vertical-align: top; background: ${index % 2 === 0 ? '#f8fafc' : 'white'};">
                    <div style="font-size: 11px; color: #666; line-height: 1.3;">${activity.participants || 'غير محدد'}</div>
                  </td>
                  <td style="border: 2px solid #1e3a8a; padding: 10px; vertical-align: top; background: ${index % 2 === 0 ? '#f8fafc' : 'white'}; text-align: center;">
                    <div style="color: #1e40af; font-weight: bold; font-size: 11px;">${activity.location || 'غير محدد'}</div>
                  </td>
                  <td style="border: 2px solid #1e3a8a; padding: 10px; vertical-align: top; background: ${index % 2 === 0 ? '#f8fafc' : 'white'}; text-align: center;">
                    <span style="background: ${statusColor}; color: white; padding: 3px 6px; border-radius: 4px; font-size: 10px; font-weight: bold; display: inline-block;">${activity.status || 'غير محدد'}</span>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>

        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 30px; padding-top: 20px; border-top: 2px solid #e5e7eb; color: #666; font-size: 12px;">
          <div style="text-align: right;">
            <p>🎭 مجموعة مدارس العمران - قسم الأنشطة المسرحية</p>
            <p>تم إنشاء هذا التقرير بواسطة نظام إدارة الأنشطة المسرحية</p>
          </div>
          <div style="text-align: left; font-weight: bold; color: #1e3a8a;">
            <p>Page: 1</p>
          </div>
        </div>
      </div>
    `;
  };



  const generatePrintContent = () => {
    // تحويل التاريخ مع الأرقام الفرنسية والأشهر المغربية
    const rawDate = new Date().toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    const dateWithEnglishNumbers = convertArabicToEnglish(rawDate);
    const currentDate = convertToMoroccanMonths(dateWithEnglishNumbers);

    let content = `
      <div class="header">
        <h1>${title}</h1>
        <p>الأستاذ مصطفى لعرعري - مسؤول الأنشطة المسرحية</p>
        <p>مجموعة مدارس العمران</p>
        <p>تاريخ الطباعة: ${currentDate}</p>
      </div>
      <div class="content">
    `;

    if (type === 'activities') {
      // إنشاء جدول الأنشطة
      content += `
        <table class="activities-table">
          <thead>
            <tr>
              <th class="month-col">📅 الشهر</th>
              <th class="date-col time-header">📆 التاريخ</th>
              <th class="activity-col">🎭 النشاط</th>
              <th class="location-col">📍 المكان</th>
              <th class="description-col">📝 الوصف</th>
              <th class="status-col">🏷️ الحالة</th>
            </tr>
          </thead>
          <tbody>
      `;

      data.forEach((activity) => {
        const statusClass = activity.status === 'الأنشطة المنجزة' ? 'confirmed' :
                           activity.status === 'قيد التحضير' ? 'pending' : 'cancelled';

        // استخراج الشهر من التاريخ
        const activityDate = new Date(activity.date);
        const monthName = activityDate.toLocaleDateString('ar-EG', { month: 'long' });
        const dayName = activityDate.toLocaleDateString('ar-EG', { weekday: 'long' });

        // تحويل التاريخ والشهر
        const convertedDate = convertToMoroccanMonths(convertArabicToEnglish(activity.date));
        const convertedMonth = convertToMoroccanMonths(convertArabicToEnglish(monthName));

        content += `
          <tr class="activity-row">
            <td class="month-cell">${convertedMonth}</td>
            <td class="date-cell">${convertedDate}<br>${dayName}</td>
            <td class="session-cell">
              <div class="session-info">
                <div class="session-class">${activity.title}</div>
                <div class="session-activity">${activity.participants}</div>
                <div class="session-time">${activity.time}</div>
              </div>
            </td>
            <td class="session-cell">
              <div class="session-info">
                <div class="session-room">${activity.location}</div>
              </div>
            </td>
            <td class="session-cell">
              <div class="session-info">
                <div class="session-activity">${activity.description}</div>
              </div>
            </td>
            <td class="session-cell">
              <span class="status ${statusClass}">${activity.status}</span>
            </td>
          </tr>
        `;
      });

      content += `
          </tbody>
        </table>
      `;
    } else if (type === 'schedule') {
      data.forEach(day => {
        content += `
          <div class="schedule-item">
            <div class="schedule-title">${day.day}</div>
        `;
        
        day.sessions.forEach((session: any) => {
          content += `
            <div class="schedule-details">
              <div class="detail-item">
                <span class="detail-label">الوقت:</span> ${session.time}
              </div>
              <div class="detail-item">
                <span class="detail-label">الصف:</span> ${session.class}
              </div>
              <div class="detail-item">
                <span class="detail-label">النشاط:</span> ${session.activity}
              </div>
              <div class="detail-item">
                <span class="detail-label">القاعة:</span> ${session.room}
              </div>
            </div>
          `;
        });
        
        content += `</div>`;
      });
    } else if (type === 'reports') {
      data.forEach(report => {
        content += `
          <div class="report-item">
            <div class="report-title">${report.title}</div>
            <div class="report-details">
              <div class="detail-item">
                <span class="detail-label">التاريخ:</span> ${report.date}
              </div>
            </div>
            <div class="description">
              <span class="detail-label">الملخص:</span> ${report.summary}
            </div>
            <div class="description">
              <span class="detail-label">الأنشطة المنفذة:</span>
              <ul>
                ${report.activities.map((activity: string) => `<li>${activity}</li>`).join('')}
              </ul>
            </div>
            <div class="description">
              <span class="detail-label">الإنجازات المحققة:</span>
              <ul>
                ${report.achievements.map((achievement: string) => `<li>${achievement}</li>`).join('')}
              </ul>
            </div>
          </div>
        `;
      });
    }

    content += `
      </div>
      <div class="footer">
        <p>© 2025 مصطفى لعرعري - جميع الحقوق محفوظة</p>
        <p>مجموعة مدارس العمران - الأنشطة المسرحية</p>
      </div>
    `;

    return content;
  };



  return (
    <div className="print-export-container">
      {showCreateButton && onCreateClick && (
        <button
          className="create-btn"
          onClick={onCreateClick}
        >
          📝 إنشاء تقرير جديد
        </button>
      )}
      {showEditButton && onToggleEdit && (
        <button
          className={`edit-btn ${isEditMode ? 'edit-active' : ''}`}
          onClick={onToggleEdit}
        >
          {isEditMode ? '🔒 إنهاء التعديل' : '✏️ تعديل'}
        </button>
      )}
      <button className="print-btn" onClick={handlePrint}>
        📄 تحميل PDF
      </button>
    </div>
  );
};

export default PrintExport;
