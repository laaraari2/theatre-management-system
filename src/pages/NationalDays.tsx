import React, { useState } from 'react';
import '../pages.css';
import PrintExport from '../components/PrintExport';

interface NationalDay {
  date: string;
  name: string;
  type: 'وطني' | 'ديني' | 'عالمي';
  description: string;
  category: string;
}

const NationalDays: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType] = useState<string>('الكل');
  const [selectedCategory] = useState<string>('الكل');

  const nationalDays: NationalDay[] = [
    // الأعياد الوطنية الرسمية
    { 
      date: '1 يناير', 
      name: 'رأس السنة الميلادية', 
      type: 'وطني', 
      description: 'بداية السنة الميلادية الجديدة - عطلة رسمية',
      category: 'الأعياد الوطنية'
    },
    { 
      date: '11 يناير', 
      name: 'ذكرى تقديم وثيقة الاستقلال', 
      type: 'وطني', 
      description: 'تقديم وثيقة المطالبة بالاستقلال 1944 - عطلة رسمية',
      category: 'الأعياد الوطنية'
    },
    { 
      date: '1 ماي',
      name: 'عيد الشغل', 
      type: 'عالمي', 
      description: 'اليوم العالمي للعمال - عطلة رسمية',
      category: 'الأعياد الوطنية'
    },
    { 
      date: '30 يوليوز',
      name: 'عيد العرش المجيد', 
      type: 'وطني', 
      description: 'ذكرى تولي جلالة الملك محمد السادس العرش - عطلة رسمية',
      category: 'الأعياد الوطنية'
    },
    { 
      date: '14 غشت',
      name: 'ذكرى وادي المخازن', 
      type: 'وطني', 
      description: 'انتصار المغاربة في معركة وادي المخازن 1578 - عطلة رسمية',
      category: 'الأعياد الوطنية'
    },
    { 
      date: '20 غشت',
      name: 'ذكرى ثورة الملك والشعب', 
      type: 'وطني', 
      description: 'ذكرى نفي الملك محمد الخامس ومقاومة الشعب المغربي - عطلة رسمية',
      category: 'الأعياد الوطنية'
    },
    { 
      date: '21 غشت',
      name: 'عيد الشباب', 
      type: 'وطني', 
      description: 'عيد ميلاد جلالة الملك محمد السادس - عطلة رسمية',
      category: 'الأعياد الوطنية'
    },
    { 
      date: '6 نوفمبر', 
      name: 'ذكرى المسيرة الخضراء', 
      type: 'وطني', 
      description: 'المسيرة السلمية لاسترداد الصحراء المغربية 1975 - عطلة رسمية',
      category: 'الأعياد الوطنية'
    },
    {
      date: '18 نوفمبر',
      name: 'عيد الاستقلال',
      type: 'وطني',
      description: 'ذكرى استقلال المغرب 1956 - عطلة رسمية',
      category: 'الأعياد الوطنية'
    },

    // مناسبات مغربية مهمة إضافية
    {
      date: '13 يناير',
      name: 'رأس السنة الأمازيغية',
      type: 'وطني',
      description: 'رأس السنة الأمازيغية (يناير) - عطلة رسمية منذ 2024',
      category: 'الأعياد الوطنية'
    },
    {
      date: '8 مارس',
      name: 'اليوم العالمي للمرأة',
      type: 'عالمي',
      description: 'تكريم المرأة المغربية وإنجازاتها في جميع المجالات',
      category: 'القيم الاجتماعية'
    },
    {
      date: '2 مارس',
      name: 'عيد العرش للملك الحسن الثاني',
      type: 'وطني',
      description: 'ذكرى تولي الملك الحسن الثاني العرش 1961',
      category: 'التاريخ المغربي'
    },
    {
      date: '23 مايو',
      name: 'ذكرى عودة الملك محمد الخامس',
      type: 'وطني',
      description: 'عودة الملك محمد الخامس من المنفى 1955',
      category: 'التاريخ المغربي'
    },
    
    // الأعياد الدينية الإسلامية
    { 
      date: 'متغير', 
      name: 'رأس السنة الهجرية', 
      type: 'ديني', 
      description: 'بداية السنة الهجرية الجديدة - عطلة رسمية',
      category: 'الأعياد الدينية'
    },
    { 
      date: 'متغير', 
      name: 'عاشوراء', 
      type: 'ديني', 
      description: 'اليوم العاشر من شهر محرم - عطلة رسمية',
      category: 'الأعياد الدينية'
    },
    { 
      date: 'متغير', 
      name: 'المولد النبوي الشريف', 
      type: 'ديني', 
      description: 'ذكرى مولد الرسول صلى الله عليه وسلم - عطلة رسمية',
      category: 'الأعياد الدينية'
    },
    { 
      date: 'متغير', 
      name: 'ليلة الإسراء والمعراج', 
      type: 'ديني', 
      description: 'ذكرى رحلة الإسراء والمعراج - مناسبة دينية',
      category: 'الأعياد الدينية'
    },
    { 
      date: 'متغير', 
      name: 'عيد الفطر المبارك', 
      type: 'ديني', 
      description: 'عيد انتهاء شهر رمضان المبارك - عطلة رسمية',
      category: 'الأعياد الدينية'
    },
    { 
      date: 'متغير', 
      name: 'عيد الأضحى المبارك', 
      type: 'ديني', 
      description: 'عيد الحج الأكبر - عطلة رسمية',
      category: 'الأعياد الدينية'
    },
    
    // الأيام العالمية المحتفى بها في المؤسسات التعليمية
    { 
      date: '4 فبراير', 
      name: 'اليوم الوطني للسلامة الطرقية', 
      type: 'وطني', 
      description: 'التوعية بأهمية السلامة الطرقية والوقاية من حوادث السير',
      category: 'أيام التوعية'
    },
    { 
      date: '21 فبراير', 
      name: 'اليوم العالمي للغة الأم', 
      type: 'عالمي', 
      description: 'تعزيز التنوع اللغوي والثقافي والحفاظ على اللغات الأم',
      category: 'التربية والثقافة'
    },
    { 
      date: '8 مارس', 
      name: 'اليوم العالمي للمرأة', 
      type: 'عالمي', 
      description: 'الاحتفاء بإنجازات المرأة وتعزيز المساواة بين الجنسين',
      category: 'حقوق الإنسان'
    },
    { 
      date: '21 مارس', 
      name: 'اليوم العالمي للشعر', 
      type: 'عالمي', 
      description: 'تعزيز الشعر كفن أدبي وتشجيع الإبداع الشعري',
      category: 'التربية والثقافة'
    },
    { 
      date: '22 مارس', 
      name: 'اليوم العالمي للماء', 
      type: 'عالمي', 
      description: 'التوعية بأهمية المياه والحفاظ على الموارد المائية',
      category: 'البيئة والتنمية المستدامة'
    },
    { 
      date: '2 أبريل', 
      name: 'اليوم العالمي لكتاب الطفل', 
      type: 'عالمي', 
      description: 'تشجيع القراءة لدى الأطفال وتعزيز أدب الطفل',
      category: 'التربية والثقافة'
    },
    { 
      date: '7 أبريل', 
      name: 'اليوم العالمي للصحة', 
      type: 'عالمي', 
      description: 'التوعية الصحية وتعزيز الصحة العامة',
      category: 'الصحة والسلامة'
    },
    { 
      date: '23 أبريل', 
      name: 'اليوم العالمي للكتاب وحقوق المؤلف', 
      type: 'عالمي', 
      description: 'تعزيز القراءة والكتابة وحماية حقوق المؤلفين',
      category: 'التربية والثقافة'
    },
    { 
      date: '15 مايو', 
      name: 'اليوم العالمي للأسرة', 
      type: 'عالمي', 
      description: 'تعزيز قيم الأسرة وأهميتها في المجتمع',
      category: 'القيم الاجتماعية'
    },
    { 
      date: '31 مايو', 
      name: 'اليوم العالمي بدون تدخين', 
      type: 'عالمي', 
      description: 'التوعية بأضرار التدخين وتشجيع الإقلاع عنه',
      category: 'الصحة والسلامة'
    },
    { 
      date: '5 يونيو', 
      name: 'اليوم العالمي للبيئة', 
      type: 'عالمي', 
      description: 'حماية البيئة والتنمية المستدامة والوعي البيئي',
      category: 'البيئة والتنمية المستدامة'
    },
    { 
      date: '26 يونيو', 
      name: 'اليوم العالمي لمكافحة المخدرات', 
      type: 'عالمي', 
      description: 'التوعية بأخطار المخدرات والوقاية من الإدمان',
      category: 'أيام التوعية'
    },
    {
      date: '8 شتنبر',
      name: 'اليوم العالمي لمحو الأمية',
      type: 'عالمي',
      description: 'تعزيز التعليم ومحو الأمية وتطوير المهارات',
      category: 'التربية والثقافة'
    },
    {
      date: '5 أكتوبر',
      name: 'اليوم العالمي للمدرس',
      type: 'عالمي',
      description: 'تقدير دور المعلمين والمدرسين في التربية والتعليم وبناء مستقبل الأجيال',
      category: 'التربية والثقافة'
    },
    { 
      date: '16 أكتوبر', 
      name: 'اليوم العالمي للغذاء', 
      type: 'عالمي', 
      description: 'مكافحة الجوع وسوء التغذية وتعزيز الأمن الغذائي',
      category: 'الصحة والسلامة'
    },
    { 
      date: '24 أكتوبر', 
      name: 'يوم الأمم المتحدة', 
      type: 'عالمي', 
      description: 'ذكرى تأسيس الأمم المتحدة وتعزيز السلام العالمي',
      category: 'حقوق الإنسان'
    },
    { 
      date: '20 نوفمبر', 
      name: 'اليوم العالمي لحقوق الطفل', 
      type: 'عالمي', 
      description: 'حماية حقوق الأطفال وتعزيز رفاهيتهم',
      category: 'حقوق الإنسان'
    },
    { 
      date: '25 نوفمبر', 
      name: 'اليوم العالمي للقضاء على العنف ضد المرأة', 
      type: 'عالمي', 
      description: 'مناهضة العنف ضد المرأة وتعزيز حقوقها',
      category: 'حقوق الإنسان'
    },
    { 
      date: '1 دجنبر',
      name: 'اليوم العالمي لمكافحة الإيدز', 
      type: 'عالمي', 
      description: 'التوعية بمرض الإيدز والوقاية منه',
      category: 'الصحة والسلامة'
    },
    { 
      date: '3 دجنبر',
      name: 'اليوم العالمي للأشخاص ذوي الإعاقة', 
      type: 'عالمي', 
      description: 'تعزيز حقوق ذوي الإعاقة ودمجهم في المجتمع',
      category: 'حقوق الإنسان'
    },
    { 
      date: '10 دجنبر',
      name: 'اليوم العالمي لحقوق الإنسان', 
      type: 'عالمي', 
      description: 'تعزيز حقوق الإنسان والكرامة الإنسانية',
      category: 'حقوق الإنسان'
    },
    {
      date: '18 دجنبر',
      name: 'اليوم العالمي للغة العربية',
      type: 'عالمي',
      description: 'الاحتفاء باللغة العربية وتعزيز مكانتها العالمية',
      category: 'التربية والثقافة'
    },

    // مناسبات تعليمية وثقافية إضافية
    {
      date: '24 يناير',
      name: 'اليوم العالمي للتعليم',
      type: 'عالمي',
      description: 'تعزيز التعليم الجيد والشامل للجميع',
      category: 'التربية والثقافة'
    },
    {
      date: '21 فبراير',
      name: 'اليوم العالمي للغة الأم',
      type: 'عالمي',
      description: 'تعزيز التنوع اللغوي والثقافي',
      category: 'التربية والثقافة'
    },
    {
      date: '20 مارس',
      name: 'اليوم العالمي للسعادة',
      type: 'عالمي',
      description: 'تعزيز السعادة والرفاهية النفسية',
      category: 'القيم الاجتماعية'
    },
    {
      date: '21 مارس',
      name: 'اليوم العالمي للقضاء على التمييز العنصري',
      type: 'عالمي',
      description: 'مكافحة العنصرية وتعزيز التسامح',
      category: 'حقوق الإنسان'
    },
    {
      date: '12 أغسطس',
      name: 'اليوم العالمي للشباب',
      type: 'عالمي',
      description: 'تمكين الشباب ودورهم في التنمية',
      category: 'القيم الاجتماعية'
    },
    {
      date: '21 سبتمبر',
      name: 'اليوم العالمي للسلام',
      type: 'عالمي',
      description: 'تعزيز السلام والأمن في العالم',
      category: 'القيم الاجتماعية'
    },
    {
      date: '16 نوفمبر',
      name: 'اليوم العالمي للتسامح',
      type: 'عالمي',
      description: 'تعزيز قيم التسامح والتعايش',
      category: 'القيم الاجتماعية'
    }
  ];

  const filteredDays = nationalDays.filter(day => {
    const matchesSearch = day.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         day.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'الكل' || day.type === selectedType;
    const matchesCategory = selectedCategory === 'الكل' || day.category === selectedCategory;
    return matchesSearch && matchesType && matchesCategory;
  });





  // تجميع المناسبات حسب الشهر
  const groupByMonth = () => {
    const months = [
      'شتنبر', 'أكتوبر', 'نوفمبر', 'دجنبر', 'يناير', 'فبراير',
      'مارس', 'أبريل', 'ماي', 'يونيو', 'يوليوز', 'غشت'
    ];

    const grouped: { [key: string]: NationalDay[] } = {};

    months.forEach(month => {
      grouped[month] = filteredDays.filter(day =>
        day.date.includes(month) || (month === 'متغير' && day.date === 'متغير')
      );
    });

    // إضافة المناسبات المتغيرة (الدينية)
    grouped['المناسبات الدينية'] = filteredDays.filter(day => day.date === 'متغير');

    return grouped;
  };

  const monthlyData = groupByMonth();

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'وطني': return 'linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%)';
      case 'ديني': return 'linear-gradient(135deg, #059669 0%, #047857 100%)';
      case 'عالمي': return 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)';
      default: return 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)';
    }
  };



  return (
    <div className="page">
      <div className="page-header">
        <div className="container">
          <h1>🇲🇦 الأيام الوطنية والدينية والعالمية</h1>
          <p>المناسبات المحتفى بها في المؤسسات التعليمية المغربية</p>
        </div>
      </div>

      <div className="container">
        <div className="national-days-container">
          
          {/* أدوات البحث والتصفية */}
          <div className="filters-section">
            <div className="search-filter">
              <input
                type="text"
                placeholder="🔍 ابحث عن يوم أو مناسبة..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            

          </div>





          {/* عرض الشهور بشكل واضح ومنظم */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
            gap: '2rem',
            marginBottom: '2rem'
          }}>
            {Object.entries(monthlyData).map(([month, days]) => (
              <div key={month} style={{
                background: 'white',
                borderRadius: '12px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                overflow: 'hidden',
                border: '1px solid #e5e7eb'
              }}>
                {/* عنوان الشهر */}
                <div style={{
                  background: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)',
                  color: 'white',
                  padding: '1.5rem',
                  textAlign: 'center'
                }}>
                  <h2 style={{
                    margin: 0,
                    fontSize: '1.5rem',
                    fontWeight: 'bold'
                  }}>
                    📅 {month}
                  </h2>
                  <p style={{
                    margin: '0.5rem 0 0 0',
                    opacity: 0.9,
                    fontSize: '0.9rem'
                  }}>
                    {days.length} مناسبة
                  </p>
                </div>

                {/* محتوى الشهر */}
                <div style={{ padding: '1.5rem' }}>
                  {days.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {days.map((day, index) => (
                        <div key={index} style={{
                          padding: '1rem',
                          background: '#f8fafc',
                          borderRadius: '8px',
                          border: '1px solid #e2e8f0',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.background = '#f1f5f9';
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.background = '#f8fafc';
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = 'none';
                        }}>
                          {/* تاريخ المناسبة */}
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            marginBottom: '0.5rem'
                          }}>
                            <span style={{
                              background: getTypeColor(day.type),
                              color: 'white',
                              padding: '0.25rem 0.75rem',
                              borderRadius: '20px',
                              fontSize: '0.8rem',
                              fontWeight: '600',
                              marginLeft: '0.5rem'
                            }}>
                              {day.type}
                            </span>
                            <span style={{
                              background: '#e5e7eb',
                              color: '#374151',
                              padding: '0.25rem 0.75rem',
                              borderRadius: '20px',
                              fontSize: '0.8rem',
                              fontWeight: '500'
                            }}>
                              {day.date}
                            </span>
                          </div>

                          {/* اسم المناسبة */}
                          <h3 style={{
                            margin: '0 0 0.5rem 0',
                            fontSize: '1.1rem',
                            fontWeight: 'bold',
                            color: '#1f2937'
                          }}>
                            {day.name}
                          </h3>

                          {/* وصف المناسبة */}
                          <p style={{
                            margin: '0 0 0.5rem 0',
                            fontSize: '0.9rem',
                            color: '#6b7280',
                            lineHeight: '1.5'
                          }}>
                            {day.description}
                          </p>

                          {/* فئة المناسبة */}
                          <div style={{
                            fontSize: '0.8rem',
                            color: '#9ca3af',
                            fontStyle: 'italic'
                          }}>
                            📂 {day.category}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{
                      textAlign: 'center',
                      padding: '2rem',
                      color: '#9ca3af'
                    }}>
                      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
                      <p style={{ margin: 0, fontSize: '1rem' }}>
                        لا توجد مناسبات في هذا الشهر
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {filteredDays.length === 0 && (
            <div className="no-results">
              <h3>لا توجد نتائج</h3>
              <p>لم يتم العثور على أيام تطابق البحث أو التصفية المحددة</p>
            </div>
          )}

          {/* أزرار الإجراءات */}
          <div style={{
            display: 'flex',
            gap: '1rem',
            justifyContent: 'center',
            marginTop: '2rem',
            flexWrap: 'wrap'
          }}>
            {/* زر إضافة مناسبة جديدة */}
            <button
              onClick={() => alert('ميزة إضافة مناسبة جديدة ستكون متاحة قريباً!')}
              style={{
                padding: '0.75rem 1.5rem',
                background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'transform 0.2s ease',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              ➕ إضافة مناسبة جديدة
            </button>

            {/* زر تصدير للتقويم */}
            <button
              onClick={() => alert('ميزة تصدير التقويم ستكون متاحة قريباً!')}
              style={{
                padding: '0.75rem 1.5rem',
                background: 'linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'transform 0.2s ease',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              📅 تصدير للتقويم
            </button>
          </div>

          {/* زر الطباعة */}
          <div className="print-section" style={{ marginTop: '1rem' }}>
            <PrintExport
              data={filteredDays}
              title="الأيام الوطنية والدينية والعالمية"
              type="activities"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default NationalDays;
