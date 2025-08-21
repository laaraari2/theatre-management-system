import {
  doc,
  setDoc,
  serverTimestamp,
  collection,
  addDoc,
  deleteDoc,
  getDocs,
  query,
  where
} from "firebase/firestore";
import { db } from "../firebase/config";

export async function addAntigoneProject() {
  try {
    await setDoc(doc(db, "yearProjects", "antigone-2025"), {
      title: "مشروع أنتيغون 2025",
      description: "مشروع مسرحي تجريبي لطلاب المرحلة الثانوية يهدف إلى تطوير المهارات التمثيلية والإبداعية",
      userId: "demo-user",
      status: "قيد التخطيط",
      director: "المخرج التجريبي",
      startDate: "2025-01-01",
      endDate: "2025-06-30",
      budget: 50000,
      venue: "المسرح المدرسي",
      targetAudience: "طلاب المرحلة الثانوية",
      notes: "مشروع تجريبي للاختبار - يمكن تعديله أو حذفه لاحقاً",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      cast: ["طالب 1", "طالب 2", "طالب 3"],
      crew: ["فني الإضاءة", "فني الصوت", "مصمم الديكور"],
      objectives: [
        "تطوير المهارات التمثيلية",
        "بناء الثقة بالنفس",
        "تعزيز العمل الجماعي",
        "فهم النصوص الكلاسيكية"
      ],
      timeline: [],
      resources: ["أزياء", "ديكور", "إضاءة", "نظام صوتي"],
      challenges: [],
      achievements: [],
      images: []
    });

    console.log("✅ تمت إضافة مشروع أنتيغون 2025 بنجاح");
    return true;
  } catch (e) {
    console.error("❌ خطأ أثناء إضافة المشروع:", e);
    return false;
  }
}

// دالة لإضافة عدة مشاريع تجريبية
export async function seedYearProjects() {
  try {
    // مشروع أنتيغون
    await addAntigoneProject();

    // مشروع ثاني
    await setDoc(doc(db, "yearProjects", "shakespeare-festival"), {
      title: "مهرجان شكسبير المدرسي",
      description: "مهرجان سنوي لعرض مقاطع من أعمال شكسبير",
      userId: "demo-user",
      status: "قيد التخطيط",
      director: "مدرس اللغة الإنجليزية",
      startDate: "2025-03-01",
      endDate: "2025-05-15",
      budget: 30000,
      venue: "قاعة المدرسة الكبرى",
      targetAudience: "جميع طلاب المدرسة والأهالي",
      notes: "مشروع سنوي تقليدي",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      cast: ["فريق الصف العاشر", "فريق الصف الحادي عشر"],
      crew: ["طلاب النادي التقني"],
      objectives: [
        "تعريف الطلاب بالأدب الإنجليزي",
        "تحسين مهارات اللغة الإنجليزية",
        "تنظيم فعالية مدرسية كبرى"
      ],
      timeline: [],
      resources: ["مسرح متنقل", "أزياء تاريخية", "موسيقى كلاسيكية"],
      challenges: [],
      achievements: [],
      images: []
    });

    console.log("✅ تمت إضافة جميع المشاريع التجريبية بنجاح");
    return true;
  } catch (e) {
    console.error("❌ خطأ أثناء إضافة المشاريع:", e);
    return false;
  }
}

// إضافة أنشطة تجريبية
export async function seedActivities() {
  try {
    const activities = [
      {
        title: "ورشة التمثيل الأساسي",
        date: "2025-02-15",
        time: "14:00",
        location: "قاعة المسرح",
        description: "ورشة تدريبية لتعلم أساسيات التمثيل والإلقاء",
        participants: "طلاب المرحلة الثانوية",
        status: "قيد التحضير",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      },
      {
        title: "عرض مسرحية الملك لير",
        date: "2025-03-20",
        time: "19:00",
        location: "المسرح الرئيسي",
        description: "عرض مسرحي لمسرحية الملك لير لشكسبير",
        participants: "فرقة المسرح المدرسي",
        status: "مؤكد",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      },
      {
        title: "مهرجان المسرح الطلابي",
        date: "2025-04-10",
        time: "16:00",
        location: "الساحة الخارجية",
        description: "مهرجان سنوي لعرض إبداعات الطلاب المسرحية",
        participants: "جميع طلاب المدرسة",
        status: "قيد التحضير",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }
    ];

    for (const activity of activities) {
      await addDoc(collection(db, "activities"), activity);
    }

    console.log("✅ تمت إضافة الأنشطة التجريبية بنجاح");
    return true;
  } catch (e) {
    console.error("❌ خطأ أثناء إضافة الأنشطة:", e);
    return false;
  }
}

// إضافة تقارير تجريبية
export async function seedReports() {
  try {
    const reports = [
      {
        title: "تقرير شهر فبراير 2025",
        date: "2025-02-28",
        content: "تقرير شامل عن أنشطة شهر فبراير المسرحية",
        images: [],
        activities: ["ورشة التمثيل الأساسي"],
        isArchived: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      },
      {
        title: "تقرير مهرجان المسرح",
        date: "2025-04-15",
        content: "تقرير مفصل عن مهرجان المسرح الطلابي السنوي",
        images: [],
        activities: ["مهرجان المسرح الطلابي"],
        isArchived: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }
    ];

    for (const report of reports) {
      await addDoc(collection(db, "reports"), report);
    }

    console.log("✅ تمت إضافة التقارير التجريبية بنجاح");
    return true;
  } catch (e) {
    console.error("❌ خطأ أثناء إضافة التقارير:", e);
    return false;
  }
}

// إضافة مستخدمين تجريبيين
export async function seedUsers() {
  try {
    const users = [
      {
        username: "teacher1",
        password: "teacher123",
        fullName: "الأستاذ أحمد المسرحي",
        email: "teacher1@school.com",
        role: "teacher",
        isActive: true,
        createdAt: serverTimestamp(),
        permissions: {
          canView: true,
          canEdit: true,
          canDelete: false,
          canExportPDF: true,
          canAccessSettings: false,
          canCreateReports: true,
          canEditReports: true,
          canDeleteReports: false,
          canCreateActivities: true,
          canEditActivities: true,
          canDeleteActivities: false,
          canManageUsers: false,
          canViewUserList: false,
          canEditUserPermissions: false,
          canDeactivateUsers: false,
          canAccessArchive: true,
          canModifyProgram: true,
          canAccessAnalytics: false
        }
      },
      {
        username: "student1",
        password: "student123",
        fullName: "الطالب محمد الممثل",
        email: "student1@school.com",
        role: "student",
        isActive: true,
        createdAt: serverTimestamp(),
        permissions: {
          canView: true,
          canEdit: false,
          canDelete: false,
          canExportPDF: false,
          canAccessSettings: false,
          canCreateReports: false,
          canEditReports: false,
          canDeleteReports: false,
          canCreateActivities: false,
          canEditActivities: false,
          canDeleteActivities: false,
          canManageUsers: false,
          canViewUserList: false,
          canEditUserPermissions: false,
          canDeactivateUsers: false,
          canAccessArchive: false,
          canModifyProgram: false,
          canAccessAnalytics: false
        }
      }
    ];

    for (const user of users) {
      await addDoc(collection(db, "users"), user);
    }

    console.log("✅ تمت إضافة المستخدمين التجريبيين بنجاح");
    return true;
  } catch (e) {
    console.error("❌ خطأ أثناء إضافة المستخدمين:", e);
    return false;
  }
}

// دالة شاملة لإضافة جميع البيانات التجريبية
export async function seedAllData() {
  try {
    console.log("🚀 بدء إضافة جميع البيانات التجريبية...");

    await seedYearProjects();
    await seedActivities();
    await seedReports();
    await seedUsers();

    console.log("🎉 تمت إضافة جميع البيانات التجريبية بنجاح!");
    return true;
  } catch (e) {
    console.error("❌ خطأ أثناء إضافة البيانات:", e);
    return false;
  }
}

// دالة لحذف البيانات التجريبية
export async function clearSeedData() {
  try {
    console.log("🗑️ بدء حذف البيانات التجريبية...");

    // حذف المشاريع السنوية التجريبية
    const yearProjectsQuery = query(
      collection(db, "yearProjects"),
      where("userId", "==", "demo-user")
    );
    const yearProjectsSnapshot = await getDocs(yearProjectsQuery);
    for (const doc of yearProjectsSnapshot.docs) {
      await deleteDoc(doc.ref);
    }

    // حذف الأنشطة التجريبية (يمكن تحديد معايير أخرى)
    const activitiesSnapshot = await getDocs(collection(db, "activities"));
    for (const doc of activitiesSnapshot.docs) {
      const data = doc.data();
      if (data.title?.includes("ورشة") || data.title?.includes("عرض") || data.title?.includes("مهرجان")) {
        await deleteDoc(doc.ref);
      }
    }

    // حذف التقارير التجريبية
    const reportsSnapshot = await getDocs(collection(db, "reports"));
    for (const doc of reportsSnapshot.docs) {
      const data = doc.data();
      if (data.title?.includes("تقرير")) {
        await deleteDoc(doc.ref);
      }
    }

    // حذف المستخدمين التجريبيين
    const usersQuery = query(
      collection(db, "users"),
      where("username", "in", ["teacher1", "student1"])
    );
    const usersSnapshot = await getDocs(usersQuery);
    for (const doc of usersSnapshot.docs) {
      await deleteDoc(doc.ref);
    }

    console.log("✅ تم حذف البيانات التجريبية بنجاح");
    return true;
  } catch (e) {
    console.error("❌ خطأ أثناء حذف البيانات:", e);
    return false;
  }
}
