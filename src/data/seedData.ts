import { CenterSettings, Meeting, RoundReport } from "../types";

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
    "غرفة العمليات",
    "وحدة الافاقة",
    "العيادات والفحوصات",
    "أحواض غسيل الايدي",
    "التعقيم المركزي",
    "نقطة الفرز والاستقبال",
    "غرفة تحضير الأدوية",
    "النفايات الطبية",
    "الأقسام الداخلية",
    "المغسلة"
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
        status: "completed"
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

export const INITIAL_ROUNDS: RoundReport[] = [
  {
    id: "round-demo-1",
    title: "تقرير المرور الاسبوعي",
    day: "الاحد",
    date: "2026/6/28",
    period: "صباحي",
    inspector: "م/ أحمد وحيد شعبان",
    supervisorRole: "مشرف مكافحة العدوى",
    centerName: "Waheed IPC",
    observations: [
      {
        id: "ro-1",
        location: "العيادات والفحوصات",
        observation: "عدم تطهير موضع فحص المريض ومسند الذقن والجبهة على جهاز مصباح الشق (Slit Lamp) وجهاز التونوميتر بعد كل كشف",
        recommendation: "الالتزام بتطهير مسند الذقن ورأس التونوميتر بمسحات الكحول 70% وتغيير الورق الواقي بعد كل مريض لمنع عدوى EKC",
        responsible: "مشرف التمريض / تمريض العيادة والفحوصات",
        status: "in_progress"
      },
      {
        id: "ro-eye-drops",
        location: "صيدلية عيادة العيون",
        observation: "استخدام زجاجات قطرات عيون متعددة الجرعات دون تدوين تاريخ وساعة الفتح",
        recommendation: "تدوين تاريخ وساعة الفتح على عبوات قطرات العيون والتخلص منها بعد 28 يوماً وتوفير قطرات الجرعة الفردية (Minims)",
        responsible: "تمريض عيادة العيون / الصيدلي الإكلينيكي",
        status: "in_progress"
      },
      {
        id: "ro-eye-phaco",
        location: "غرفة عمليات العيون",
        observation: "تأخر شطف قنوات قبضة الفاكو (Phaco Lumens) بالماء المقطر المعقم فور انتهاء عملية المياه البيضاء",
        recommendation: "الشطف الفوري لقنوات قبضة الفاكو بالماء المقطر المعقم بـ 150 مل لمنع جفاف الإفرازات ومتلازمة TASS",
        responsible: "تمريض عمليات العيون / فني التعقيم",
        status: "in_progress"
      },
      {
        id: "ro-eye-iodine",
        location: "غرفة العمليات الرئيسية",
        observation: "البدء في الجراحة دون الانتظار 3 دقائق كاملة بعد تقطير البوفيدون يودين 5% في كيس الملتحمة",
        recommendation: "الالتزام الصارم ببروتوكول البيتادين العيني 5% والانتظار 3 دقائق كاملة للوقاية من التهاب باطن العين (Endophthalmitis)",
        responsible: "جراح العيون / تمريض العمليات المعقم",
        status: "in_progress"
      },
      {
        id: "ro-2",
        location: "أحواض غسيل الايدي",
        observation: "عدم توفير المناديل علي احواض غسيل الايدي",
        recommendation: "توفير المناديل والماسكات الجراحية وتوزيعها على جميع الأقسام بصفة دورية",
        responsible: "مشرف التمريض",
        status: "completed"
      },
      {
        id: "ro-3",
        location: "غرفة العمليات",
        observation: "عدم اعطاء الوقت الكافي في غرف العمليات بعد كل حالة والأخرى",
        recommendation: "اعطاء وقت 15 دقيقة من أجل تنظيف وتطهير وتغيير هواء الغرفة",
        responsible: "مشرف التمريض",
        status: "in_progress"
      },
      {
        id: "ro-4",
        location: "غرفة العمليات",
        observation: "وجود مستهلكات زائدة داخل غرفة العمليات",
        recommendation: "ادخال المستهلكات الخاصة بالعملية فقط",
        responsible: "مشرف التمريض / تمريض العمليات",
        status: "in_progress"
      },
      {
        id: "ro-5",
        location: "وحدة الافاقة",
        observation: "تحضير وتبكيت (dressing) في وحدة الافاقة",
        recommendation: "الالتزام بتحضير (dressing) وتبكيته في وحدة التعقيم",
        responsible: "مشرف التمريض / تمريض التعقيم",
        status: "in_progress"
      },
      {
        id: "ro-6",
        location: "غرفة الأدوية",
        observation: "عدم الالتزام بتطهير الفيالات الخاصة بالأدوية متعددة الاستخدام قبل السحب",
        recommendation: "الالتزام بتطهير الفيالات الخاصة بالأدوية متعددة الاستخدام قبل السحب بالكحول",
        responsible: "مشرف التمريض",
        status: "completed"
      },
      {
        id: "ro-7",
        location: "حوض غسيل الأيدي",
        observation: "عدم تثبيت حاوية البيتادين على حوض غسيل الأيدي",
        recommendation: "تثبيت حاوية البيتادين على حوض غسيل الأيدي",
        responsible: "مشرف التمريض",
        status: "completed"
      },
      {
        id: "ro-8",
        location: "غرفة العمليات",
        observation: "عدم تطهير الاجهزة بين كل حالة",
        recommendation: "تطهير جميع الاجهزة بين كل حالة",
        responsible: "مشرف التمريض / تمريض العمليات",
        status: "in_progress"
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];
