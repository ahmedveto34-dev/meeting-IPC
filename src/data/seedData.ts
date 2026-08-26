import { CenterSettings, Meeting, RoundReport } from "../types";
import { DEFAULT_WEEKLY_BALANCED_ROUNDS } from "./defaultRounds";

export const DEFAULT_CENTER_SETTINGS: CenterSettings = {
  centerName: "Waheed IPC",
  departmentTitle: "لجنة مكافحة العدوى",
  medicalDirector: "ا.د / احمد مصطفى",
  infectionControlLead: "م/ أحمد وحيد شعبان",
  qualityLead: "د/ سارة ابراهيم",
  nursingSupervisor: "م/عبد الله إبراهيم عمر",
  defaultMembers: [
    { id: "m1", name: "ا.د / احمد مصطفى", role: "المدير الطبى", attended: true, signatureNote: "" },
    { id: "m2", name: "م/عبد الله إبراهيم عمر", role: "مشرف التمريض", attended: true, signatureNote: "" },
    { id: "m3", name: "د/ سارة ابراهيم", role: "مسئول الجودة", attended: true, signatureNote: "" },
    { id: "m4", name: "م/ أحمد وحيد شعبان", role: "مسئول مكافحة العدوى", attended: true, signatureNote: "" },
  ],
  departments: [
    "عيادة",
    "فحوصات",
    "عمليات",
    "افاقة",
    "قسم داخلي",
  ],
};

export const INITIAL_MEETINGS: Meeting[] = [
  {
    id: "meeting-demo-1",
    meetingNumber: "6",
    day: "الاحد",
    date: "2026/6/28",
    time: "11:00 صباحاً",
    location: "قاعة اجتماعات الإدارة الطبية",
    centerName: "Waheed IPC",
    departmentTitle: "لجنة مكافحة العدوى",
    members: [
      { id: "m1", name: "ا.د / احمد مصطفى", role: "المدير الطبى", attended: true, signatureNote: "" },
      { id: "m2", name: "م/عبد الله إبراهيم عمر", role: "مشرف التمريض", attended: true, signatureNote: "" },
      { id: "m3", name: "د/ سارة ابراهيم", role: "مسئول الجودة", attended: true, signatureNote: "" },
      { id: "m4", name: "م/ أحمد وحيد شعبان", role: "مسئول مكافحة العدوى", attended: true, signatureNote: "" },
    ],
    agenda: [
      "ما لم يتم إنجازه من الاجتماع السابق",
      "عدم اعطاء الوقت الكافي في غرف العمليات بعد كل حالة والأخرى",
      "تطهير موضع فحص المريض على الجهاز بعد كل حالة",
      "عدم توفير المناديل علي احواض غسيل الايدي",
      "وجود مستهلكات داخل غرفة العمليات",
      "تحضير وتبكيت (dressing) في وحدة الافاقة",
      "عدم الالتزام بتطهير الفيالات الخاصة بالأدوية متعددة الاستخدام قبل السحب",
      "عدم تثبيت حاوية البيتادين على حوض غسيل الأيدي",
      "عدم تطهير الاجهزة بين كل حالة",
    ],
    previousMeetingDate: "2026/5/24",
    previousMeetingFollowUp: "عدم تفعيل نقطة الفرز",
    kpis: [
      { id: "kpi-1", name: "معدل الالتزام بغسل الايدي", value: "%65", target: "%85" },
      { id: "kpi-2", name: "معدل تطهير الأجهزة بين الحالات", value: "%70", target: "%100" }
    ],
    decisions: [
      {
        id: "dec-1",
        topic: "عدم تفعيل نقطة الفرز",
        decision: "تفعيل نقطة الفرز بالطريقة الصحيحة وهى عدم دخول أى مريض قبل المرور على نقطة الفرز بمدخل العيادة",
        responsible: "مشرف التمريض / تمريض الفرز",
        duration: "3 أيام",
        monitoringMethod: "المرور ودفتر التسجيل فى حالة وجود حالة مشتبه بها",
        status: "in_progress",
        isCarriedOver: true,
        sourceMeetingNumber: "5"
      },
      {
        id: "dec-2",
        topic: "عدم اعطاء الوقت الكافى في غرف العمليات بعد كل حالة واألخرى",
        decision: "اعطاء وقت 15 دقيقة من أجل تنظيف وتطهير وتغيير هواء الغرفة",
        responsible: "مشرف التمريض",
        duration: "يومين",
        monitoringMethod: "المرور",
        status: "in_progress"
      },
      {
        id: "dec-3",
        topic: "عدم تطهير موضع فحص المريض على الجهاز بعد كل حالة",
        decision: "الالتزام بتطهير موضع فحص المريض بعد كل حالة",
        responsible: "مشرف التمريض / تمريض العيادة والفحوصات",
        duration: "يوم واحد",
        monitoringMethod: "المرور",
        status: "in_progress"
      },
      {
        id: "dec-4",
        topic: "عدم توفير المناديل علي احواض غسيل الايدي",
        decision: "توفير المناديل والماسكات الجراحية وتوزيعها على جميع الأقسام بصفة دورية وكميات مناسبة",
        responsible: "مشرف التمريض",
        duration: "3 أيام",
        monitoringMethod: "المرور",
        status: "completed"
      },
      {
        id: "dec-5",
        topic: "وجود مستهلكات داخل غرفة العمليات",
        decision: "ادخال المستهلكات الخاصة بالعملية فقط",
        responsible: "مشرف التمريض / تمريض العمليات",
        duration: "3 أيام",
        monitoringMethod: "المرور",
        status: "in_progress"
      },
      {
        id: "dec-6",
        topic: "تحضير وتبكيت (dressing) في وحدة الافاقة",
        decision: "الالتزام بتحضير (dressing) وتبكيته في وحدة التعقيم",
        responsible: "مشرف التمريض / تمريض التعقيم",
        duration: "أسبوع",
        monitoringMethod: "المرور",
        status: "in_progress"
      },
      {
        id: "dec-7",
        topic: "عدم الالتزام بتطهير الفيالات الخاصة بالأدوية متعددة الاستخدام قبل السحب",
        decision: "الالتزام بتطهير الفيالات الخاصة بالأدوية متعددة الاستخدام قبل السحب",
        responsible: "مشرف التمريض",
        duration: "يوم واحد",
        monitoringMethod: "المرور",
        status: "completed"
      },
      {
        id: "dec-8",
        topic: "عدم تثبيت حاوية البيتادين على حوض غسيل الأيدي",
        decision: "تثبيت حاوية البيتادين على حوض غسيل الأيدي",
        responsible: "مشرف التمريض",
        duration: "أسبوع",
        monitoringMethod: "المرور",
        status: "completed"
      },
      {
        id: "dec-9",
        topic: "عدم تطهير الاجهزة بين كل حالة",
        decision: "تطهير جميع الاجهزة بين كل حالة",
        responsible: "مشرف التمريض / تمريض العمليات",
        duration: "يومين",
        monitoringMethod: "الفحص الظاهري للاجهزة اثناء المرور",
        status: "in_progress"
      }
    ],
    approvals: {
      preparedBy: "م/ عبد الله إبراهيم عمر",
      infectionControlLead: "م/ أحمد وحيد شعبان",
      medicalDirector: "ا.د / احمد مصطفى"
    },
    monthThemeKey: "month-4",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

export const INITIAL_ROUNDS: RoundReport[] = DEFAULT_WEEKLY_BALANCED_ROUNDS;

