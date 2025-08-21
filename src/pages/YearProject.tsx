import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../pages.css';
import Notification from '../components/Notification';
import { useYearProject } from '../hooks/useYearProject';
import type { YearProjectFirestore, TimelineEventFirestore } from '../types';

// استخدام الواجهات من الخدمة
type YearProject = YearProjectFirestore;
type TimelineEvent = TimelineEventFirestore;

const YearProject: React.FC = () => {
  const navigate = useNavigate();
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
  } | null>(null);

  // استخدام hook مشروع السنة
  const {
    currentProject: projectData,
    loading,
    createProject,
    updateProject,
    deleteProject
  } = useYearProject();

  const [isEditing, setIsEditing] = useState(false);

  const [editingTimelineItem, setEditingTimelineItem] = useState<TimelineEvent | null>(null);
  const [showTimelineForm, setShowTimelineForm] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'timeline' | 'teams' | 'objectives' | 'resources' | 'gallery'>('overview');

  // حالة المشروع المحرر
  const [editedProject, setEditedProject] = useState<YearProject | null>(null);

  // بيانات نموذجية لمشروع السنة (للمشروع الجديد)
  const getDefaultProject = (): Omit<YearProject, 'id' | 'createdAt' | 'updatedAt' | 'userId'> => ({
    title: "مشروع أنتيغون 2025-2026: رحلة عبر الزمن والثقافات",
    description: "مشروع مسرحي تربوي طموح يهدف إلى تنمية الحس الفني واللغوي لدى المتعلمين من خلال الاشتغال على نص أنتيغون الكلاسيكي بنسختيه: نسخة سوفوكل الإغريقية (مترجمة للعربية) مع طلاب الأولى إعدادي، ونسخة جون أنوي الحديثة (بالفرنسية) مع طلاب الثانية إعدادي، مما يتيح مقارنة ثقافية وأدبية ثرية بين العصور والحضارات",
    startDate: "2025-10-01",
    endDate: "2026-06-30",
    status: "قيد التنفيذ",
    director: "الأستاذ مصطفى لعرعري والأستاذة سلمى بيروش",
    cast: [
      "تلاميذ الأولى إعدادي - أنتيغون سوفوكل (النسخة العربية الكلاسيكية)",
      "تلاميذ الثانية إعدادي - Antigone جون أنوي (النسخة الفرنسية الحديثة)",
      "تلاميذ الثالثة إعدادي - الكورس والأدوار المساعدة في كلا النسختين",
      "فريق الرواة - لربط النسختين وتقديم السياق التاريخي والثقافي"
    ],
    crew: [
      "الأستاذ صفوان بيروش - مناقشة النص المسرحي بالفرنسية",
      "الأستاذة سلمى بيروش - الإشراف التقني والإلقاء وضبط مخارج الحروف",
      "فريق الإضاءة والصوت",
      "فريق الديكور والأزياء",
      "فريق التصوير والتوثيق",
      "فريق التنظيم والإدارة"
    ],
    budget: 15000,
    venue: "قاعة المؤسسة الكبرى",
    targetAudience: "أولياء الأمور، الطلاب، الأساتذة، المجتمع المحلي",
    objectives: [
      "استكشاف عمق نص أنتيغون عبر نسختيه الكلاسيكية والحديثة",
      "تنمية المهارات اللغوية من خلال نصين بلغتين مختلفتين",
      "فهم التطور الأدبي للنص عبر العصور (من سوفوكل إلى أنوي)",
      "تطوير القدرة على التعبير المسرحي باللغتين العربية والفرنسية",
      "إثراء الثقافة الكلاسيكية والمعاصرة لدى الطلاب",
      "تعميق فهم القيم الإنسانية الخالدة (العدالة، الشجاعة، المقاومة)",
      "تطوير الحس النقدي من خلال مقارنة النسختين",
      "إكساب تقنيات الأداء المسرحي الكلاسيكي والحديث",
      "تعزيز الثقة في استخدام اللغة الفرنسية في السياق الأدبي"
    ],
    timeline: [
      {
        id: "1",
        title: "اختيار نصي أنتيغون",
        description: "اختيار نص أنتيغون سوفوكل (بالعربية) للأولى إعدادي ونص Antigone جون أنوي (بالفرنسية) للثانية إعدادي",
        date: "2025-10-15",
        status: "مخطط",
        responsible: "الأستاذ مصطفى لعرعري والأستاذة سلمى بيروش"
      },
      {
        id: "2",
        title: "دراسة مقارنة للنصين",
        description: "دراسة معمقة ومقارنة بين نسخة سوفوكل الكلاسيكية ونسخة أنوي الحديثة، وتحليل الاختلافات والتشابهات",
        date: "2025-11-01",
        status: "مخطط",
        responsible: "الأستاذ مصطفى لعرعري والأستاذة سلمى بيروش والتلاميذ"
      },
      {
        id: "3",
        title: "مناقشة النص المسرحي بالفرنسية",
        description: "جلسات مناقشة معمقة لنص Antigone جون أنوي بالفرنسية مع تلاميذ الثانية إعدادي",
        date: "2025-11-15",
        status: "مخطط",
        responsible: "الأستاذ صفوان بيروش"
      },
      {
        id: "4",
        title: "ورش الإلقاء والإشراف التقني",
        description: "ورش متخصصة لإتقان الإلقاء وضبط مخارج الحروف مع الإشراف التقني للعرض",
        date: "2025-12-01",
        status: "مخطط",
        responsible: "الأستاذة سلمى بيروش والأستاذ مصطفى لعرعري"
      },
      {
        id: "5",
        title: "توزيع الأدوار حسب النصين",
        description: "اختيار التلاميذ لأدوار أنتيغون، كريون، إسمين وباقي الشخصيات في كلا النسختين",
        date: "2025-12-15",
        status: "مخطط",
        responsible: "الأستاذ مصطفى لعرعري والأستاذة سلمى بيروش"
      },
      {
        id: "6",
        title: "التدريبات المنفصلة لكل نص",
        description: "تدريبات منفصلة: الأولى إعدادي على نص سوفوكل والثانية إعدادي على نص أنوي",
        date: "2026-01-15",
        status: "مخطط",
        responsible: "الأستاذ مصطفى لعرعري والأستاذة سلمى بيروش والتلاميذ"
      },
      {
        id: "7",
        title: "التدريبات المشتركة والمقارنة",
        description: "جلسات مشتركة بين المجموعتين لمقارنة الأداء وتبادل الخبرات بين النسختين",
        date: "2026-03-01",
        status: "مخطط",
        responsible: "الأستاذ مصطفى لعرعري والأستاذة سلمى بيروش وجميع التلاميذ"
      },
      {
        id: "8",
        title: "إعداد الديكور والإشراف التقني",
        description: "تصميم ديكور يعكس الطابع الإغريقي الكلاسيكي والحداثة الأوروبية مع الإشراف التقني الشامل",
        date: "2026-04-01",
        status: "مخطط",
        responsible: "الأستاذة سلمى بيروش والأستاذ مصطفى لعرعري وفريق الديكور"
      },
      {
        id: "9",
        title: "البروفات العامة مع الإشراف التقني",
        description: "بروفات نهائية للعرض مع الإشراف التقني الكامل وضبط الإلقاء ومخارج الحروف",
        date: "2026-05-15",
        status: "مخطط",
        responsible: "الأستاذة سلمى بيروش والأستاذ مصطفى لعرعري وجميع الفرق"
      },
      {
        id: "10",
        title: "العرض النهائي: أنتيغون عبر الزمن",
        description: "تقديم العرض النهائي الذي يجمع بين نسخة سوفوكل ونسخة أنوي في رحلة عبر الزمن والثقافات",
        date: "2026-06-15",
        status: "مخطط",
        responsible: "جميع المشاركين"
      }
    ],
    resources: [
      "نص أنتيغون سوفوكل مترجم للعربية (طبعة محققة)",
      "نص Antigone جون أنوي بالفرنسية (النسخة الأصلية)",
      "مراجع تاريخية حول المسرح الإغريقي والمسرح الفرنسي الحديث",
      "قاعة عروض بإضاءة متدرجة لتمييز العصرين",
      "أزياء إغريقية كلاسيكية وأزياء أوروبية حديثة",
      "ديكور مزدوج: أعمدة إغريقية وعناصر حداثية",
      "معدات صوتية لتسجيل الأداء باللغتين",
      "قواميس فرنسية-عربية متخصصة في المسرح",
      "مواد بصرية عن الحضارة الإغريقية والثقافة الفرنسية"
    ],
    challenges: [
      "فهم عمق الفلسفة الإغريقية في نص سوفوكل وتبسيطها لتلاميذ الأولى إعدادي",
      "إتقان النطق الفرنسي الصحيح لنص أنوي مع تلاميذ الثانية إعدادي",
      "تنسيق العمل بين الأساتذة الثلاثة لضمان التكامل في التدريب",
      "الموازنة بين روح النص الأصلي الإغريقي والتفسير الحديث لأنوي",
      "ضبط مخارج الحروف للنصين العربي والفرنسي بدقة عالية",
      "إدارة المناقشات بالفرنسية مع مراعاة مستويات التلاميذ المختلفة",
      "إيجاد الانسجام الفني بين الأسلوب الكلاسيكي والحديث في العرض الواحد",
      "ضمان فهم التلاميذ للسياق التاريخي والثقافي لكلا النسختين"
    ],
    achievements: [
      "إتقان تلاميذ الأولى إعدادي للنطق الكلاسيكي العربي لنص سوفوكل",
      "تحسن كبير في مستوى اللغة الفرنسية لدى تلاميذ الثانية إعدادي",
      "نجاح المناقشات بالفرنسية حول نص أنوي مع الأستاذ صفوان بيروش",
      "تطوير مهارات الإلقاء وضبط مخارج الحروف مع الأستاذة سلمى بيروش",
      "إشراف تقني متميز من الأستاذة سلمى بيروش على جميع جوانب العرض",
      "فهم عميق لشخصية أنتيغون عبر تفسيرين مختلفين",
      "اكتشاف الفروق الثقافية بين المسرح الإغريقي والفرنسي الحديث",
      "تطوير القدرة على المقارنة الأدبية والنقد البناء",
      "إنتاج عرض مسرحي فريد يجمع بين عصرين وثقافتين",
      "تعزيز الثقة في الأداء المسرحي باللغتين",
      "إثراء المعرفة بالأدب الكلاسيكي والحديث",
      "توثيق تجربة تعليمية مبتكرة في تدريس الأدب المقارن"
    ],
    images: [
      "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjI1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjOGI1Y2Y2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj7Zhdiz2LHYrdmK2Kkg2KfZhNiz2YbYqTwvdGV4dD48L3N2Zz4=",
      "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjI1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZWY0NDQ0Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyMCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj7YqtmF2KfYsdmK2YYg2KfZhNiq2YXYq9mK2YQ8L3RleHQ+PC9zdmc+",
      "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjI1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMTBiOTgxIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyMCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj7YqtmF2KfYsdmK2YYg2KfZhNiv2YrZg9mI2LE8L3RleHQ+PC9zdmc+"
    ],
    notes: "مشروع تربوي مبتكر بإشراف مشترك من الأستاذ مصطفى لعرعري والأستاذة سلمى بيروش، يجمع بين نسختين من أنتيغون: الكلاسيكية الإغريقية لسوفوكل (بالعربية) والحديثة الفرنسية لجون أنوي، مما يتيح للتلاميذ رحلة ثقافية ولغوية ثرية عبر الزمن والحضارات، ويطور لديهم الحس النقدي والمقارن في الأدب العالمي"
  });

  const showNotification = (message: string, type: 'success' | 'error' | 'warning' | 'info') => {
    setNotification({ message, type });
  };

  const hideNotification = () => {
    setNotification(null);
  };

  // دوال إدارة المشروع
  const handleEditProject = () => {
    if (projectData) {
      setEditedProject(projectData);
      setIsEditing(true);
      showNotification('تم تفعيل وضع التعديل', 'info');
    }
  };

  const handleSaveProject = async () => {
    if (!editedProject) return;

    try {
      if (projectData) {
        // تحديث مشروع موجود
        await updateProject(editedProject);
      } else {
        // إنشاء مشروع جديد
        await createProject(editedProject);
      }
      setIsEditing(false);
      showNotification('تم حفظ التعديلات بنجاح!', 'success');
    } catch (error) {
      showNotification('فشل في حفظ التعديلات', 'error');
    }
  };

  const handleCancelEdit = () => {
    setEditedProject(projectData);
    setIsEditing(false);
    showNotification('تم إلغاء التعديل', 'warning');
  };

  const handleDeleteProject = async () => {
    if (window.confirm('هل أنت متأكد من حذف المشروع؟ هذا الإجراء لا يمكن التراجع عنه.')) {
      try {
        await deleteProject();
        showNotification('تم حذف المشروع', 'warning');
      } catch (error) {
        showNotification('فشل في حذف المشروع', 'error');
      }
    }
  };

  const handleCreateNewProject = async () => {
    try {
      const newProjectData = getDefaultProject();
      await createProject(newProjectData);
      setEditedProject(projectData);
      setIsEditing(true);
      showNotification('تم إنشاء مشروع جديد', 'success');
    } catch (error) {
      showNotification('فشل في إنشاء المشروع', 'error');
    }
  };

  // دوال إدارة الجدول الزمني
  const handleAddTimelineItem = () => {
    setEditingTimelineItem({
      id: Date.now().toString(),
      title: '',
      description: '',
      date: '',
      status: 'مخطط',
      responsible: ''
    });
    setShowTimelineForm(true);
  };

  const handleEditTimelineItem = (item: TimelineEvent) => {
    setEditingTimelineItem(item);
    setShowTimelineForm(true);
  };

  const handleDeleteTimelineItem = (id: string) => {
    if (!editedProject) return;

    if (window.confirm('هل أنت متأكد من حذف هذا العنصر من الجدول الزمني؟')) {
      const updatedTimeline = editedProject.timeline.filter(item => item.id !== id);
      const updatedProject = { ...editedProject, timeline: updatedTimeline };
      setEditedProject(updatedProject);
      showNotification('تم حذف العنصر من الجدول الزمني', 'warning');
    }
  };

  const handleSaveTimelineItem = async (item: TimelineEvent) => {
    if (!editedProject) return;

    let updatedTimeline;
    if (editedProject.timeline.find(t => t.id === item.id)) {
      // تعديل عنصر موجود
      updatedTimeline = editedProject.timeline.map(t => t.id === item.id ? item : t);
    } else {
      // إضافة عنصر جديد
      updatedTimeline = [...editedProject.timeline, item];
    }

    const updatedProject = { ...editedProject, timeline: updatedTimeline };
    setEditedProject(updatedProject);
    setShowTimelineForm(false);
    setEditingTimelineItem(null);
    showNotification('تم حفظ العنصر في الجدول الزمني', 'success');
  };

  // دوال إدارة القوائم
  const handleAddListItem = (listType: 'cast' | 'crew' | 'objectives' | 'achievements' | 'resources' | 'challenges') => {
    if (!editedProject) return;

    const newItem = prompt(`أدخل ${getListTypeLabel(listType)} جديد:`);
    if (newItem && newItem.trim()) {
      const updatedProject = {
        ...editedProject,
        [listType]: [...editedProject[listType], newItem.trim()]
      };
      setEditedProject(updatedProject);
      showNotification(`تم إضافة ${getListTypeLabel(listType)} جديد`, 'success');
    }
  };

  const handleEditListItem = (listType: 'cast' | 'crew' | 'objectives' | 'achievements' | 'resources' | 'challenges', index: number) => {
    if (!editedProject) return;

    const currentItem = editedProject[listType][index];
    const newItem = prompt(`تعديل ${getListTypeLabel(listType)}:`, currentItem);
    if (newItem !== null && newItem.trim()) {
      const updatedList = [...editedProject[listType]];
      updatedList[index] = newItem.trim();
      const updatedProject = {
        ...editedProject,
        [listType]: updatedList
      };
      setEditedProject(updatedProject);
      showNotification(`تم تعديل ${getListTypeLabel(listType)}`, 'success');
    }
  };

  const handleDeleteListItem = (listType: 'cast' | 'crew' | 'objectives' | 'achievements' | 'resources' | 'challenges', index: number) => {
    if (!editedProject) return;

    if (window.confirm(`هل أنت متأكد من حذف هذا ${getListTypeLabel(listType)}؟`)) {
      const updatedList = editedProject[listType].filter((_, i) => i !== index);
      const updatedProject = {
        ...editedProject,
        [listType]: updatedList
      };
      setEditedProject(updatedProject);
      showNotification(`تم حذف ${getListTypeLabel(listType)}`, 'warning');
    }
  };

  const getListTypeLabel = (listType: string) => {
    const labels = {
      'cast': 'عضو فريق التمثيل',
      'crew': 'عضو الفريق التقني',
      'objectives': 'الهدف',
      'achievements': 'الإنجاز',
      'resources': 'المورد',
      'challenges': 'التحدي'
    };
    return labels[listType as keyof typeof labels] || 'العنصر';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'مكتمل': return '#10b981';
      case 'قيد التنفيذ': return '#f59e0b';
      case 'مخطط': return '#3b82f6';
      case 'مؤجل': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'مكتمل': return '✅';
      case 'قيد التنفيذ': return '🔄';
      case 'مخطط': return '📋';
      case 'مؤجل': return '⏸️';
      default: return '❓';
    }
  };

  // عرض حالة التحميل
  if (loading) {
    return (
      <div className="page">
        <div className="page-header">
          <div className="container">
            <h1>🎭 مشروع السنة</h1>
            <p>المشروع المسرحي الكبير للسنة الدراسية</p>
          </div>
        </div>
        <div className="container" style={{ textAlign: 'center', padding: '4rem 0' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
          <h2>جاري تحميل المشروع...</h2>
        </div>
      </div>
    );
  }

  // عرض حالة عدم وجود مشروع
  if (!projectData && !isEditing) {
    return (
      <div className="page">
        <div className="page-header">
          <div className="container">
            <h1>🎭 مشروع السنة</h1>
            <p>المشروع المسرحي الكبير للسنة الدراسية</p>
          </div>
        </div>
        <div className="container" style={{ textAlign: 'center', padding: '4rem 0' }}>
          <div style={{ fontSize: '4rem', marginBottom: '2rem' }}>🎭</div>
          <h2 style={{ marginBottom: '1rem', color: '#4b5563' }}>لا يوجد مشروع حالياً</h2>
          <p style={{ marginBottom: '2rem', color: '#6b7280', fontSize: '1.1rem' }}>
            ابدأ بإنشاء مشروع السنة المسرحي الخاص بك
          </p>
          <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column', alignItems: 'center' }}>
            <button
              onClick={handleCreateNewProject}
              style={{
                background: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)',
                color: 'white',
                border: 'none',
                padding: '1rem 2rem',
                borderRadius: '12px',
                fontSize: '1.1rem',
                fontWeight: '600',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(59, 130, 246, 0.4)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
              }}
            >
              🎭 إنشاء مشروع جديد
            </button>

            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
              <p style={{ color: '#6b7280', marginBottom: '0.5rem' }}>أو جرب البيانات التجريبية:</p>
              <button
                onClick={() => navigate('/dev-settings')}
                style={{
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                  transition: 'all 0.3s ease'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(16, 185, 129, 0.4)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)';
                }}
              >
                📊 إضافة بيانات تجريبية
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const displayProject = isEditing ? editedProject : projectData;
  if (!displayProject) return null;

  return (
    <div className="page">
      <div className="page-header">
        <div className="container">
          <h1>🎭 مشروع السنة</h1>
          <p>المشروع المسرحي الكبير للسنة الدراسية</p>
        </div>
      </div>

      <div className="container">
        {/* أزرار الإدارة */}
        <div className="project-actions" style={{
          display: 'flex',
          gap: '1rem',
          marginBottom: '2rem',
          flexWrap: 'wrap',
          justifyContent: 'center'
        }}>
          {!isEditing ? (
            <>
              <button
                onClick={handleEditProject}
                className="btn btn-primary"
                style={{
                  background: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
                }}
              >
                ✏️ تعديل المشروع
              </button>
              <button
                onClick={handleDeleteProject}
                className="btn btn-danger"
                style={{
                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
                }}
              >
                🗑️ حذف المشروع
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleSaveProject}
                className="btn btn-success"
                style={{
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                }}
              >
                💾 حفظ التعديلات
              </button>
              <button
                onClick={handleCancelEdit}
                className="btn btn-secondary"
                style={{
                  background: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 12px rgba(107, 114, 128, 0.3)'
                }}
              >
                ❌ إلغاء
              </button>
            </>
          )}
        </div>

        {/* شريط التبويب */}
        <div className="project-tabs" style={{
          display: 'flex',
          gap: '0.5rem',
          marginBottom: '2rem',
          borderBottom: '2px solid #e5e7eb',
          overflowX: 'auto',
          paddingBottom: '1rem'
        }}>
          {[
            { key: 'overview', label: '📋 نظرة عامة', icon: '📋' },
            { key: 'timeline', label: '📅 الجدول الزمني', icon: '📅' },
            { key: 'teams', label: '👥 الفرق', icon: '👥' },
            { key: 'objectives', label: '🎯 الأهداف والإنجازات', icon: '🎯' },
            { key: 'resources', label: '📦 الموارد والتحديات', icon: '📦' },
            { key: 'gallery', label: '📸 المعرض', icon: '📸' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`tab-btn ${activeTab === tab.key ? 'active' : ''}`}
              style={{
                background: activeTab === tab.key
                  ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
                  : 'transparent',
                color: activeTab === tab.key ? 'white' : '#4b5563',
                border: activeTab === tab.key ? 'none' : '2px solid #e5e7eb',
                padding: '12px 20px',
                borderRadius: '8px',
                fontSize: '0.9rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                whiteSpace: 'nowrap',
                minWidth: 'fit-content'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* محتوى التبويب */}
        {activeTab === 'overview' && (
          <div className="project-overview">
          <div className="project-card">
            <div className="project-header">
              {isEditing ? (
                <input
                  type="text"
                  value={editedProject?.title || ''}
                  onChange={(e) => editedProject && setEditedProject({...editedProject, title: e.target.value})}
                  style={{
                    fontSize: '1.8rem',
                    fontWeight: 'bold',
                    border: '2px solid #3b82f6',
                    borderRadius: '8px',
                    padding: '0.5rem',
                    width: '100%',
                    marginBottom: '1rem'
                  }}
                />
              ) : (
                <h2>{displayProject.title}</h2>
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                {isEditing ? (
                  <select
                    value={editedProject?.status}
                    onChange={(e) => setEditedProject(prev => prev ? {...prev, status: e.target.value as any} : null)}
                    style={{
                      background: getStatusColor(editedProject?.status || 'قيد التخطيط'),
                      color: 'white',
                      border: 'none',
                      padding: '0.5rem 1rem',
                      borderRadius: '20px',
                      fontSize: '0.9rem',
                      fontWeight: '600'
                    }}
                  >
                    <option value="قيد التخطيط">قيد التخطيط</option>
                    <option value="قيد التنفيذ">قيد التنفيذ</option>
                    <option value="مكتمل">مكتمل</option>
                    <option value="مؤجل">مؤجل</option>
                  </select>
                ) : (
                  <div className="project-status" style={{
                    background: getStatusColor(displayProject.status),
                    color: 'white',
                    padding: '0.5rem 1rem',
                    borderRadius: '20px',
                    fontSize: '0.9rem',
                    fontWeight: '600'
                  }}>
                    {getStatusIcon(displayProject.status)} {displayProject.status}
                  </div>
                )}
              </div>
            </div>

            <div className="project-info">
              {isEditing ? (
                <textarea
                  value={editedProject?.description || ''}
                  onChange={(e) => setEditedProject(prev => prev ? {...prev, description: e.target.value} : null)}
                  style={{
                    width: '100%',
                    minHeight: '120px',
                    padding: '1rem',
                    border: '2px solid #3b82f6',
                    borderRadius: '8px',
                    fontSize: '1.1rem',
                    lineHeight: '1.6',
                    marginBottom: '1.5rem',
                    resize: 'vertical'
                  }}
                />
              ) : (
                <p className="project-description">{displayProject.description}</p>
              )}

              <div className="project-details">
                <div className="detail-item">
                  <strong>📅 فترة المشروع:</strong>
                  {isEditing ? (
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '0.5rem' }}>
                      <input
                        type="date"
                        value={editedProject?.startDate || ''}
                        onChange={(e) => setEditedProject(prev => prev ? {...prev, startDate: e.target.value} : null)}
                        style={{ padding: '0.5rem', border: '2px solid #e5e7eb', borderRadius: '4px' }}
                      />
                      <span>إلى</span>
                      <input
                        type="date"
                        value={editedProject?.endDate || ''}
                        onChange={(e) => setEditedProject(prev => prev ? {...prev, endDate: e.target.value} : null)}
                        style={{ padding: '0.5rem', border: '2px solid #e5e7eb', borderRadius: '4px' }}
                      />
                    </div>
                  ) : (
                    <span>{displayProject.startDate} إلى {displayProject.endDate}</span>
                  )}
                </div>

                <div className="detail-item">
                  <strong>🎬 المخرج:</strong>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedProject?.director || ''}
                      onChange={(e) => setEditedProject(prev => prev ? {...prev, director: e.target.value} : null)}
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        border: '2px solid #e5e7eb',
                        borderRadius: '4px',
                        marginTop: '0.5rem'
                      }}
                    />
                  ) : (
                    <span>{displayProject.director}</span>
                  )}
                </div>

                <div className="detail-item">
                  <strong>🏛️ مكان العرض:</strong>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedProject?.venue || ''}
                      onChange={(e) => setEditedProject(prev => prev ? {...prev, venue: e.target.value} : null)}
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        border: '2px solid #e5e7eb',
                        borderRadius: '4px',
                        marginTop: '0.5rem'
                      }}
                    />
                  ) : (
                    <span>{displayProject.venue}</span>
                  )}
                </div>

                <div className="detail-item">
                  <strong>💰 الميزانية:</strong>
                  {isEditing ? (
                    <input
                      type="number"
                      value={editedProject?.budget || 0}
                      onChange={(e) => setEditedProject(prev => prev ? {...prev, budget: parseInt(e.target.value) || 0} : null)}
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        border: '2px solid #e5e7eb',
                        borderRadius: '4px',
                        marginTop: '0.5rem'
                      }}
                    />
                  ) : (
                    <span>{displayProject.budget.toLocaleString()} درهم</span>
                  )}
                </div>

                <div className="detail-item">
                  <strong>👥 الجمهور المستهدف:</strong>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedProject?.targetAudience || ''}
                      onChange={(e) => setEditedProject(prev => prev ? {...prev, targetAudience: e.target.value} : null)}
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        border: '2px solid #e5e7eb',
                        borderRadius: '4px',
                        marginTop: '0.5rem'
                      }}
                    />
                  ) : (
                    <span>{displayProject.targetAudience}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        )}

        {activeTab === 'timeline' && (
        <div className="timeline-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3>📅 الجدول الزمني للمشروع</h3>
            {isEditing && (
              <button
                onClick={handleAddTimelineItem}
                style={{
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                ➕ إضافة مرحلة جديدة
              </button>
            )}
          </div>
          <div className="timeline">
            {displayProject.timeline.map((event) => (
              <div key={event.id} className="timeline-item">
                <div className="timeline-marker" style={{
                  background: getStatusColor(event.status)
                }}>
                  {getStatusIcon(event.status)}
                </div>
                <div className="timeline-content">
                  <div className="timeline-header">
                    <h4>{event.title}</h4>
                    <span className="timeline-date">{event.date}</span>
                  </div>
                  <p>{event.description}</p>
                  <div className="timeline-responsible">
                    <strong>المسؤول:</strong> {event.responsible}
                  </div>
                  {isEditing && (
                    <div className="timeline-actions" style={{
                      marginTop: '1rem',
                      display: 'flex',
                      gap: '0.5rem',
                      justifyContent: 'flex-end'
                    }}>
                      <button
                        onClick={() => handleEditTimelineItem(event)}
                        style={{
                          background: '#3b82f6',
                          color: 'white',
                          border: 'none',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '0.8rem',
                          cursor: 'pointer'
                        }}
                      >
                        ✏️ تعديل
                      </button>
                      <button
                        onClick={() => handleDeleteTimelineItem(event.id)}
                        style={{
                          background: '#ef4444',
                          color: 'white',
                          border: 'none',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '0.8rem',
                          cursor: 'pointer'
                        }}
                      >
                        🗑️ حذف
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        )}

        {activeTab === 'teams' && (
        <div className="teams-section">
          <div className="teams-grid">
            <div className="team-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3>🎭 فريق التمثيل</h3>
                {isEditing && (
                  <button
                    onClick={() => handleAddListItem('cast')}
                    style={{
                      background: '#10b981',
                      color: 'white',
                      border: 'none',
                      padding: '6px 12px',
                      borderRadius: '4px',
                      fontSize: '0.8rem',
                      cursor: 'pointer'
                    }}
                  >
                    ➕ إضافة
                  </button>
                )}
              </div>
              <ul>
                {displayProject.cast.map((member, index) => (
                  <li key={index} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.5rem 0'
                  }}>
                    <span>{member}</span>
                    {isEditing && (
                      <div style={{ display: 'flex', gap: '0.25rem' }}>
                        <button
                          onClick={() => handleEditListItem('cast', index)}
                          style={{
                            background: '#3b82f6',
                            color: 'white',
                            border: 'none',
                            padding: '2px 6px',
                            borderRadius: '3px',
                            fontSize: '0.7rem',
                            cursor: 'pointer'
                          }}
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDeleteListItem('cast', index)}
                          style={{
                            background: '#ef4444',
                            color: 'white',
                            border: 'none',
                            padding: '2px 6px',
                            borderRadius: '3px',
                            fontSize: '0.7rem',
                            cursor: 'pointer'
                          }}
                        >
                          🗑️
                        </button>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            <div className="team-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3>🎬 الفريق التقني</h3>
                {isEditing && (
                  <button
                    onClick={() => handleAddListItem('crew')}
                    style={{
                      background: '#10b981',
                      color: 'white',
                      border: 'none',
                      padding: '6px 12px',
                      borderRadius: '4px',
                      fontSize: '0.8rem',
                      cursor: 'pointer'
                    }}
                  >
                    ➕ إضافة
                  </button>
                )}
              </div>
              <ul>
                {displayProject.crew.map((member, index) => (
                  <li key={index} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.5rem 0'
                  }}>
                    <span>{member}</span>
                    {isEditing && (
                      <div style={{ display: 'flex', gap: '0.25rem' }}>
                        <button
                          onClick={() => handleEditListItem('crew', index)}
                          style={{
                            background: '#3b82f6',
                            color: 'white',
                            border: 'none',
                            padding: '2px 6px',
                            borderRadius: '3px',
                            fontSize: '0.7rem',
                            cursor: 'pointer'
                          }}
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDeleteListItem('crew', index)}
                          style={{
                            background: '#ef4444',
                            color: 'white',
                            border: 'none',
                            padding: '2px 6px',
                            borderRadius: '3px',
                            fontSize: '0.7rem',
                            cursor: 'pointer'
                          }}
                        >
                          🗑️
                        </button>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        )}

        {activeTab === 'objectives' && (
        <div className="objectives-achievements">
          <div className="objectives-grid">
            <div className="objectives-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3>🎯 أهداف المشروع</h3>
                {isEditing && (
                  <button
                    onClick={() => handleAddListItem('objectives')}
                    style={{
                      background: '#10b981',
                      color: 'white',
                      border: 'none',
                      padding: '6px 12px',
                      borderRadius: '4px',
                      fontSize: '0.8rem',
                      cursor: 'pointer'
                    }}
                  >
                    ➕ إضافة
                  </button>
                )}
              </div>
              <ul>
                {displayProject.objectives.map((objective, index) => (
                  <li key={index} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    padding: '0.75rem 0',
                    paddingLeft: '1.5rem'
                  }}>
                    <span style={{ flex: 1 }}>{objective}</span>
                    {isEditing && (
                      <div style={{ display: 'flex', gap: '0.25rem', marginLeft: '0.5rem' }}>
                        <button
                          onClick={() => handleEditListItem('objectives', index)}
                          style={{
                            background: '#3b82f6',
                            color: 'white',
                            border: 'none',
                            padding: '2px 6px',
                            borderRadius: '3px',
                            fontSize: '0.7rem',
                            cursor: 'pointer'
                          }}
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDeleteListItem('objectives', index)}
                          style={{
                            background: '#ef4444',
                            color: 'white',
                            border: 'none',
                            padding: '2px 6px',
                            borderRadius: '3px',
                            fontSize: '0.7rem',
                            cursor: 'pointer'
                          }}
                        >
                          🗑️
                        </button>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            <div className="achievements-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3>🏆 الإنجازات المحققة</h3>
                {isEditing && (
                  <button
                    onClick={() => handleAddListItem('achievements')}
                    style={{
                      background: '#10b981',
                      color: 'white',
                      border: 'none',
                      padding: '6px 12px',
                      borderRadius: '4px',
                      fontSize: '0.8rem',
                      cursor: 'pointer'
                    }}
                  >
                    ➕ إضافة
                  </button>
                )}
              </div>
              <ul>
                {displayProject.achievements.map((achievement, index) => (
                  <li key={index} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    padding: '0.75rem 0',
                    paddingLeft: '1.5rem'
                  }}>
                    <span style={{ flex: 1 }}>{achievement}</span>
                    {isEditing && (
                      <div style={{ display: 'flex', gap: '0.25rem', marginLeft: '0.5rem' }}>
                        <button
                          onClick={() => handleEditListItem('achievements', index)}
                          style={{
                            background: '#3b82f6',
                            color: 'white',
                            border: 'none',
                            padding: '2px 6px',
                            borderRadius: '3px',
                            fontSize: '0.7rem',
                            cursor: 'pointer'
                          }}
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDeleteListItem('achievements', index)}
                          style={{
                            background: '#ef4444',
                            color: 'white',
                            border: 'none',
                            padding: '2px 6px',
                            borderRadius: '3px',
                            fontSize: '0.7rem',
                            cursor: 'pointer'
                          }}
                        >
                          🗑️
                        </button>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        )}

        {activeTab === 'resources' && (
        <div className="resources-challenges">
          <div className="resources-grid">
            <div className="resources-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3>📦 الموارد المطلوبة</h3>
                {isEditing && (
                  <button
                    onClick={() => handleAddListItem('resources')}
                    style={{
                      background: '#10b981',
                      color: 'white',
                      border: 'none',
                      padding: '6px 12px',
                      borderRadius: '4px',
                      fontSize: '0.8rem',
                      cursor: 'pointer'
                    }}
                  >
                    ➕ إضافة
                  </button>
                )}
              </div>
              <ul>
                {displayProject.resources.map((resource, index) => (
                  <li key={index} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    padding: '0.75rem 0',
                    paddingLeft: '1.5rem'
                  }}>
                    <span style={{ flex: 1 }}>{resource}</span>
                    {isEditing && (
                      <div style={{ display: 'flex', gap: '0.25rem', marginLeft: '0.5rem' }}>
                        <button
                          onClick={() => handleEditListItem('resources', index)}
                          style={{
                            background: '#3b82f6',
                            color: 'white',
                            border: 'none',
                            padding: '2px 6px',
                            borderRadius: '3px',
                            fontSize: '0.7rem',
                            cursor: 'pointer'
                          }}
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDeleteListItem('resources', index)}
                          style={{
                            background: '#ef4444',
                            color: 'white',
                            border: 'none',
                            padding: '2px 6px',
                            borderRadius: '3px',
                            fontSize: '0.7rem',
                            cursor: 'pointer'
                          }}
                        >
                          🗑️
                        </button>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            <div className="challenges-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3>⚠️ التحديات</h3>
                {isEditing && (
                  <button
                    onClick={() => handleAddListItem('challenges')}
                    style={{
                      background: '#10b981',
                      color: 'white',
                      border: 'none',
                      padding: '6px 12px',
                      borderRadius: '4px',
                      fontSize: '0.8rem',
                      cursor: 'pointer'
                    }}
                  >
                    ➕ إضافة
                  </button>
                )}
              </div>
              <ul>
                {displayProject.challenges.map((challenge, index) => (
                  <li key={index} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    padding: '0.75rem 0',
                    paddingLeft: '1.5rem'
                  }}>
                    <span style={{ flex: 1 }}>{challenge}</span>
                    {isEditing && (
                      <div style={{ display: 'flex', gap: '0.25rem', marginLeft: '0.5rem' }}>
                        <button
                          onClick={() => handleEditListItem('challenges', index)}
                          style={{
                            background: '#3b82f6',
                            color: 'white',
                            border: 'none',
                            padding: '2px 6px',
                            borderRadius: '3px',
                            fontSize: '0.7rem',
                            cursor: 'pointer'
                          }}
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDeleteListItem('challenges', index)}
                          style={{
                            background: '#ef4444',
                            color: 'white',
                            border: 'none',
                            padding: '2px 6px',
                            borderRadius: '3px',
                            fontSize: '0.7rem',
                            cursor: 'pointer'
                          }}
                        >
                          🗑️
                        </button>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        )}

        {activeTab === 'gallery' && (
        <>
          {displayProject.images && displayProject.images.length > 0 && (
            <div className="project-gallery">
              <h3>📸 معرض صور المشروع</h3>
              <div className="gallery-grid">
                {displayProject.images.map((image, index) => (
                  <div key={index} className="gallery-item">
                    <img src={image} alt={`صورة المشروع ${index + 1}`} />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="project-notes">
            <h3>📝 ملاحظات</h3>
            <div className="notes-content">
              {isEditing ? (
                <textarea
                  value={editedProject?.notes || ''}
                  onChange={(e) => editedProject && setEditedProject({...editedProject, notes: e.target.value})}
                  style={{
                    width: '100%',
                    minHeight: '100px',
                    padding: '1rem',
                    border: '2px solid #3b82f6',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    lineHeight: '1.6',
                    resize: 'vertical'
                  }}
                  placeholder="أضف ملاحظات حول المشروع..."
                />
              ) : (
                <p>{displayProject.notes}</p>
              )}
            </div>
          </div>
        </>
        )}

        {/* نموذج تعديل الجدول الزمني */}
        {showTimelineForm && editingTimelineItem && (
          <div className="timeline-modal-overlay" style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div className="timeline-modal" style={{
              background: 'white',
              borderRadius: '12px',
              padding: '2rem',
              width: '90%',
              maxWidth: '500px',
              maxHeight: '80vh',
              overflow: 'auto'
            }}>
              <h3>✏️ تعديل مرحلة الجدول الزمني</h3>
              <form onSubmit={(e) => {
                e.preventDefault();
                handleSaveTimelineItem(editingTimelineItem);
              }}>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                    العنوان:
                  </label>
                  <input
                    type="text"
                    value={editingTimelineItem.title}
                    onChange={(e) => setEditingTimelineItem({
                      ...editingTimelineItem,
                      title: e.target.value
                    })}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '2px solid #e5e7eb',
                      borderRadius: '6px',
                      fontSize: '1rem'
                    }}
                    required
                  />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                    الوصف:
                  </label>
                  <textarea
                    value={editingTimelineItem.description}
                    onChange={(e) => setEditingTimelineItem({
                      ...editingTimelineItem,
                      description: e.target.value
                    })}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '2px solid #e5e7eb',
                      borderRadius: '6px',
                      fontSize: '1rem',
                      minHeight: '100px',
                      resize: 'vertical'
                    }}
                    required
                  />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                    التاريخ:
                  </label>
                  <input
                    type="date"
                    value={editingTimelineItem.date}
                    onChange={(e) => setEditingTimelineItem({
                      ...editingTimelineItem,
                      date: e.target.value
                    })}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '2px solid #e5e7eb',
                      borderRadius: '6px',
                      fontSize: '1rem'
                    }}
                    required
                  />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                    الحالة:
                  </label>
                  <select
                    value={editingTimelineItem.status}
                    onChange={(e) => setEditingTimelineItem({
                      ...editingTimelineItem,
                      status: e.target.value as 'مخطط' | 'قيد التنفيذ' | 'مكتمل'
                    })}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '2px solid #e5e7eb',
                      borderRadius: '6px',
                      fontSize: '1rem'
                    }}
                  >
                    <option value="مخطط">مخطط</option>
                    <option value="قيد التنفيذ">قيد التنفيذ</option>
                    <option value="مكتمل">مكتمل</option>
                  </select>
                </div>

                <div style={{ marginBottom: '2rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                    المسؤول:
                  </label>
                  <input
                    type="text"
                    value={editingTimelineItem.responsible}
                    onChange={(e) => setEditingTimelineItem({
                      ...editingTimelineItem,
                      responsible: e.target.value
                    })}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '2px solid #e5e7eb',
                      borderRadius: '6px',
                      fontSize: '1rem'
                    }}
                    required
                  />
                </div>

                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setShowTimelineForm(false);
                      setEditingTimelineItem(null);
                    }}
                    style={{
                      background: '#6b7280',
                      color: 'white',
                      border: 'none',
                      padding: '0.75rem 1.5rem',
                      borderRadius: '6px',
                      fontSize: '1rem',
                      cursor: 'pointer'
                    }}
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    style={{
                      background: '#10b981',
                      color: 'white',
                      border: 'none',
                      padding: '0.75rem 1.5rem',
                      borderRadius: '6px',
                      fontSize: '1rem',
                      cursor: 'pointer'
                    }}
                  >
                    حفظ
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {notification && (
          <Notification
            message={notification.message}
            type={notification.type}
            onClose={hideNotification}
          />
        )}
      </div>
    </div>
  );
};

export default YearProject;
