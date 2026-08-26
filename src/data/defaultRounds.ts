import { RoundReport, RoundObservation, STANDARD_ROUND_DEPARTMENTS } from "../types";

/**
 * بنك الملاحظات الافتراضية المرتبة حسب الأقسام (عيادة، فحوصات، عمليات، إفاقة، قسم داخلي / تعقيم)
 * مستخلصة بدقة من الملاحظات الميدانية والملخصة لمكافحة العدوى
 */
export interface DepartmentSummaryObservation {
  id: string;
  departmentKey: "عيادة" | "فحوصات" | "عمليات" | "إفاقة" | "قسم داخلي";
  location: string;
  observation: string;
  recommendation: string;
  responsible: string;
  status: "in_progress" | "completed" | "pending";
}

export const SUMMARY_DEPARTMENT_OBSERVATIONS: DepartmentSummaryObservation[] = [
  // --- 1. قسم العيادات الخارجية (عيادة) ---
  {
    id: "obs-sum-clinic-1",
    departmentKey: "عيادة",
    location: "العيادات الخارجية - مصباح الشق (Slit Lamp)",
    observation: "عدم تطهير مواضع استناد الذقن والجبهة ومقابض جهاز مصباح الشق بمسحات الكحول 70% وتغيير الورقة الواقية بين الحالات.",
    recommendation: "مسح مسند الذقن والجبهة بمسحة كحول أيزوبروبيلي 70% وتغيير الورقة الواقية لكل مريض لمنع عدوى الملتحمة الوبائية (EKC).",
    responsible: "مشرف التمريض / تمريض العيادة",
    status: "in_progress",
  },
  {
    id: "obs-sum-clinic-2",
    departmentKey: "عيادة",
    location: "صيدلية العيادات وغرفة قطرات العيون",
    observation: "استخدام زجاجات قطرات العيون متعددة الجرعات دون تدوين تاريخ وساعة الفتح على العبوة.",
    recommendation: "تدوين تاريخ وساعة الفتح على عبوات القطرات والتخلص منها بعد 28 يوماً مع توفير قطرات الجرعة الفردية (Minims).",
    responsible: "تمريض العيادات / الصيدلي الإكلينيكي",
    status: "in_progress",
  },
  {
    id: "obs-sum-clinic-3",
    departmentKey: "عيادة",
    location: "العيادات الخارجية - أحواض غسيل الأيدي",
    observation: "عدم توفير المناديل الورقية والصابون السائل والمطهر الكحولي على أحواض غسيل الأيدي بالعيادات الخارجية.",
    recommendation: "توفير المناديل الورقية والمطهرات وتعبئة الموزعات بصفة دورية لمنع استخدام المناشف القماشية وتفعيل غسل الأيدي.",
    responsible: "مشرف التمريض / الخدمات المساندة",
    status: "completed",
  },
  {
    id: "obs-sum-clinic-4",
    departmentKey: "عيادة",
    location: "مدخل العيادات الخارجية - نقطة الفرز",
    observation: "عدم تفعيل نقطة الفرز البصري والحراري بمدخل العيادة للمرضى المترددين والمرافقين.",
    recommendation: "تفعيل نقطة الفرز ومنع دخول أي مريض يعاني من أعراض تنفسية أو إفرازات عينية معدية دون ارتداء ماسك وتقييمه.",
    responsible: "تمريض الفرز / مشرف العيادات",
    status: "in_progress",
  },

  // --- 2. قسم الفحوصات والتشخيص (فحوصات) ---
  {
    id: "obs-sum-diag-1",
    departmentKey: "فحوصات",
    location: "غرفة الفحوصات - جهاز قياس ضغط العين (Goldmann Tonometer)",
    observation: "عدم تطهير رأس قياس ضغط العين (Tonometer Prism) بمسحة كحول 70% وتركه يجف تماماً قبل فحص المريض التالي.",
    recommendation: "تطهير موشور التونوميتر بمسحة كحول 70% ومسحه جيداً وتركه يجف لمدة دقيقة أو استخدام رؤوس معقمة أحادية الاستخدام.",
    responsible: "طبيب الفحوصات / أخصائي البصريات",
    status: "in_progress",
  },
  {
    id: "obs-sum-diag-2",
    departmentKey: "فحوصات",
    location: "غرفة الفحوصات - التونوميتر المحمول (Tono-Pen / Icare)",
    observation: "عدم تغيير الغطاء المطاطي المعقم (Tip Cover) لمجس جهاز قياس الضغط المحمول بين المرضى.",
    recommendation: "الالتزام بتغيير طرف المجس المعقم أحادي الاستخدام لكل مريض والتأكد من عدم لمس الرأس الحساس بالأصابع المجردة.",
    responsible: "أخصائي الفحوصات / تمريض العيادة",
    status: "in_progress",
  },
  {
    id: "obs-sum-diag-3",
    departmentKey: "فحوصات",
    location: "غرفة فحص قاع العين وزاوية القرنية (Gonioscopy)",
    observation: "عدم إجراء التطهير عالي المستوى (HLD) لعدسات فحص قاع العين الملامسة للقرنية وشطفها بالماء المعقم بعد الاستخدام.",
    recommendation: "غمر العدسات في مطهر عالي المستوى معتمد وشطفها بماء معقم وتجفيفها بقطن طبي نظيف وحفظها في حافظة معقمة وجافة.",
    responsible: "طبيب العيون / تمريض الفحوصات",
    status: "pending",
  },
  {
    id: "obs-sum-diag-4",
    departmentKey: "فحوصات",
    location: "غرفة الفحوصات التشخيصية (OCT ومجال الإبصار)",
    observation: "عدم تطهير مساند الرأس ومقابض أجهزة الأشعة المقطعية للعين (OCT) وشاشات اللمس بين كل حالة والأخرى.",
    recommendation: "تطهير مساند الرأس والذقن بمسحات كحولية بعد كل مريض وتوفير ورق واقٍ نظيف لكل فحص.",
    responsible: "فني الأشعة والفحوصات / التمريض",
    status: "in_progress",
  },

  // --- 3. قسم العمليات الجراحية (عمليات) ---
  {
    id: "obs-sum-or-1",
    departmentKey: "عمليات",
    location: "غرفة عمليات العيون - جراحة الفاكو",
    observation: "تأخر شطف قنوات قبضة الفاكو (Phaco Lumens) فور انتهاء العملية بالماء المقطر المعقم، وعدم إعطاء وقت كافٍ لتغيير هواء الغرفة.",
    recommendation: "الشطف الفوري لقنوات قبضة الفاكو بـ 150 مل ماء مقطر معقم فور انتهاء الحالة لمنع جفاف الإفرازات ومتلازمة TASS، وإعطاء 15 دقيقة لتطهير وتغيير هواء الغرفة.",
    responsible: "مشرف تمريض العمليات / فني التعقيم",
    status: "in_progress",
  },
  {
    id: "obs-sum-or-2",
    departmentKey: "عمليات",
    location: "غرفة العمليات الرئيسية",
    observation: "البدء في الشق الجراحي دون الانتظار 3 دقائق كاملة بعد تقطير البوفيدون يودين 5% في كيس الملتحمة.",
    recommendation: "الالتزام الصارم ببروتوكول البيتادين العيني 5% والانتظار 3 دقائق كاملة للوقاية من التهاب باطن العين (Endophthalmitis).",
    responsible: "الجراح المعالج / تمريض العمليات المعقم",
    status: "in_progress",
  },
  {
    id: "obs-sum-or-3",
    departmentKey: "عمليات",
    location: "جناح العمليات وأحواض الفرك الجراحي",
    observation: "دخول مستهلكات وكراتين زائدة داخل غرفة العمليات، وعدم تثبيت حاوية البيتادين على حوض الفرك الجراحي.",
    recommendation: "تفريغ المستلزمات من الكراتين خارج منطقة العمليات وإدخال احتياج الحالة فقط، وتثبيت موزعات البيتادين على الحوض.",
    responsible: "مشرف العمليات / تمريض العمليات",
    status: "completed",
  },
  {
    id: "obs-sum-or-4",
    departmentKey: "عمليات",
    location: "غرفة العمليات الجراحية",
    observation: "عدم تطهير الأجهزة الطبية وطاولة الجراحة وكابلات الميكروسكوب بين كل حالة والأخرى بمطهر سطوح معتمد.",
    recommendation: "مسح وتطهير أسطح الأجهزة وكابلات التوصيل بمطهر كواترنري أو كحولي معتمد بين كل مريض والآخر.",
    responsible: "تمريض العمليات / عامل الخدمات المدرب",
    status: "in_progress",
  },
  {
    id: "obs-sum-or-5",
    departmentKey: "عمليات",
    location: "مخارج وبوابات جناح العمليات",
    observation: "خروج بعض الكوادر الطبية والتمريضية بالزي الجراحي (Scrubs) والواقيات الشخصية خارج جناح العمليات والعودة بها مجدداً.",
    recommendation: "خلع الواقيات الشخصية وتغيير الزي الجراحي قبل مغادرة منطقة العمليات وإلزام الجميع بارتداء المعاطف الواقية عند الخروج.",
    responsible: "أطباء وتمريض العمليات / مشرف مكافحة العدوى",
    status: "in_progress",
  },

  // --- 4. قسم الإفاقة والرعاية النهارية (إفاقة) ---
  {
    id: "obs-sum-pacu-1",
    departmentKey: "إفاقة",
    location: "وحدة الإفاقة والرعاية النهارية (PACU)",
    observation: "تحضير وتبكيت الغيارات المعقمة (Dressing Packs) داخل وحدة الإفاقة بدلاً من قسم التعقيم المركزي.",
    recommendation: "حظر تحضير أو فتح الغيارات المعقمة في الإفاقة وقصر إعداد الباكتات المعقمة على وحدة التعقيم المركزي (CSSD).",
    responsible: "مشرف التمريض / تمريض الإفاقة والتعقيم",
    status: "in_progress",
  },
  {
    id: "obs-sum-pacu-2",
    departmentKey: "إفاقة",
    location: "غرفة علاج وأدوية وحدة الإفاقة",
    observation: "عدم الالتزام بتطهير السدادات المطاطية لفيالات الأدوية متعددة الجرعات بالكحول 70% قبل سحب الجرعات.",
    recommendation: "فرك السدادة المطاطية للفيال بمسحة كحول 70% بحركة دائرية لمدة 15 ثانية وتركها لتجف قبل إدخال الإبرة المعقمة.",
    responsible: "تمريض وحدة الإفاقة",
    status: "completed",
  },
  {
    id: "obs-sum-pacu-3",
    departmentKey: "إفاقة",
    location: "أسرّة وحدة الإفاقة والرعاية النهارية",
    observation: "عدم تغيير أغطية الوسائد والشراشف ومسح هيكل سرير الإفاقة بمطهر سطوح معتمد بين كل مريض والآخر.",
    recommendation: "تغيير الملاءات فور خروج المريض ومسح هيكل السرير ومرتبة الجلد بمطهر سطوح معتمد قبل استقبال الحالة التالية.",
    responsible: "تمريض الإفاقة / الخدمات الفندقية",
    status: "in_progress",
  },

  // --- 5. القسم الداخلي والتعقيم المركزي (قسم داخلي / تعقيم) ---
  {
    id: "obs-sum-cssd-1",
    departmentKey: "قسم داخلي",
    location: "التعقيم المركزي (CSSD) وأحواض العمليات",
    observation: "استخدام أحواض الفرك الجراحي لغسيل الآلات الجراحية الملوثة بدلاً من منطقة إزالة التلوث بالتعقيم المركزي.",
    recommendation: "حظر غسيل الآلات في أحواض الأيدي نهائياً ونقل الآلات الملوثة في حاويات مغلقة للتعقيم المركزي لإزالة التلوث.",
    responsible: "فنيو التعقيم المركزي / مشرف مكافحة العدوى",
    status: "in_progress",
  },
  {
    id: "obs-sum-cssd-2",
    departmentKey: "قسم داخلي",
    location: "القسم الداخلي وغرف الإقامة وغرف الغيار",
    observation: "خلط النفايات الطبية الخطرة مع النفايات العادية أو عدم إغلاق حاويات الأدوات الحادة (Safety Box) عند امتلاء 3/4 الحاوية.",
    recommendation: "الالتزام بفصل النفايات في الأكياس الحمراء/الصفراء وإغلاق صندوق الأمان عند علامة الحد الأقصى وإرساله للمحرقة.",
    responsible: "تمريض القسم الداخلي / عمال النظافة",
    status: "completed",
  },
  {
    id: "obs-sum-cssd-3",
    departmentKey: "قسم داخلي",
    location: "القسم الداخلي - غرف المرضى",
    observation: "عدم توفر مطهر كحولي بجوار سرير المريض بالقسم الداخلي أو عدم كتابة تاريخ فتح عبوات محاليل التطهير.",
    recommendation: "توفير عبوات المطهر الكحولي عند نقطة تقديم الرعاية (Point of Care) وتدوين تاريخ الفتح والصلاحية على كافة المحاليل.",
    responsible: "مشرف التمريض / الصيدلي الإكلينيكي",
    status: "in_progress",
  },
];

/**
 * توليد قائمة ملاحظات متوازنة تحتوي على 4 إلى 5 ملاحظات بحيث تشمل ملاحظة أو اثنتين من كل قسم
 */
export function generateBalancedRoundObservations(
  options?: {
    count?: 4 | 5;
    weekIndex?: number; // 0, 1, 2, 3
  }
): RoundObservation[] {
  const count = options?.count ?? 5;
  const weekIdx = options?.weekIndex ?? 0;

  // Key department keys
  const deptKeys: ("عيادة" | "فحوصات" | "عمليات" | "إفاقة" | "قسم داخلي")[] = [
    "عيادة",
    "فحوصات",
    "عمليات",
    "إفاقة",
    "قسم داخلي",
  ];

  const selectedObservations: RoundObservation[] = [];

  // Pick 1 observation from each department
  deptKeys.forEach((dKey, idx) => {
    if (count === 4 && dKey === "قسم داخلي" && weekIdx % 2 === 0) {
      return; // If count is 4, skip one department alternately
    }
    if (count === 4 && dKey === "إفاقة" && weekIdx % 2 === 1) {
      return;
    }

    const itemsInDept = SUMMARY_DEPARTMENT_OBSERVATIONS.filter(
      (item) => item.departmentKey === dKey
    );
    if (itemsInDept.length > 0) {
      const chosenItem = itemsInDept[weekIdx % itemsInDept.length];
      selectedObservations.push({
        id: `ro-gen-${chosenItem.id}-${Date.now()}-${idx}`,
        location: chosenItem.location,
        observation: chosenItem.observation,
        recommendation: chosenItem.recommendation,
        responsible: chosenItem.responsible,
        status: chosenItem.status,
      });
    }
  });

  // If count is 5 and we have 4 items or need 5th, ensure we have 5 items (max 2 per department)
  if (selectedObservations.length < count) {
    const extraClinic = SUMMARY_DEPARTMENT_OBSERVATIONS.filter(
      (i) => i.departmentKey === "عيادة"
    )[(weekIdx + 1) % 2];
    if (extraClinic) {
      selectedObservations.push({
        id: `ro-gen-${extraClinic.id}-${Date.now()}-extra`,
        location: extraClinic.location,
        observation: extraClinic.observation,
        recommendation: extraClinic.recommendation,
        responsible: extraClinic.responsible,
        status: extraClinic.status,
      });
    }
  }

  return selectedObservations.slice(0, count);
}

/**
 * 4 تقارير مرور افتراضية أسبوعية متكاملة (الأسبوع 1 إلى 4)
 * كل تقرير يحتوي على 4 أو 5 ملاحظات ملخصة وموزعة بملاحظة أو اثنتين لكل قسم
 */
export const DEFAULT_WEEKLY_BALANCED_ROUNDS: RoundReport[] = [
  // --- التقرير الأول: الأسبوع الأول (5 ملاحظات موزعة على الأقسام) ---
  {
    id: "round-default-week-1",
    title: "تقرير المرور الاسبوعي - الأسبوع الأول",
    department: "عام (كافة الأقسام)",
    day: "الأحد",
    date: "2026/06/07",
    period: "صباحي",
    inspector: "م/ أحمد وحيد شعبان",
    supervisorRole: "مشرف مكافحة العدوى",
    centerName: "Waheed IPC",
    generalRecommendation: "التأكيد على الالتزام الصارم بتطهير أجهزة الفحص بين المرضى وتفعيل زمن تغيير هواء العمليات.",
    observations: [
      {
        id: "ro-w1-1",
        location: "العيادات الخارجية - مصباح الشق (Slit Lamp)",
        observation: "عدم تطهير مواضع استناد الذقن والجبهة ومقابض جهاز مصباح الشق بمسحات الكحول 70% وتغيير الورقة الواقية بين الحالات.",
        recommendation: "مسح مسند الذقن والجبهة بمسحة كحول أيزوبروبيلي 70% وتغيير الورقة الواقية لكل مريض لمنع عدوى الملتحمة الوبائية (EKC).",
        responsible: "مشرف التمريض / تمريض العيادة",
        status: "in_progress",
      },
      {
        id: "ro-w1-2",
        location: "صيدلية العيادات وغرفة قطرات العيون",
        observation: "استخدام زجاجات قطرات العيون متعددة الجرعات دون تدوين تاريخ وساعة الفتح على العبوة.",
        recommendation: "تدوين تاريخ وساعة الفتح على عبوات القطرات والتخلص منها بعد 28 يوماً مع توفير قطرات الجرعة الفردية (Minims).",
        responsible: "تمريض العيادات / الصيدلي الإكلينيكي",
        status: "in_progress",
      },
      {
        id: "ro-w1-3",
        location: "غرفة الفحوصات - جهاز قياس ضغط العين (Goldmann Tonometer)",
        observation: "عدم تطهير رأس قياس ضغط العين (Tonometer Prism) بمسحة كحول 70% وتركه يجف تماماً قبل فحص المريض التالي.",
        recommendation: "تطهير موشور التونوميتر بمسحة كحول 70% ومسحه جيداً وتركه يجف لمدة دقيقة أو استخدام رؤوس معقمة أحادية الاستخدام.",
        responsible: "طبيب الفحوصات / أخصائي البصريات",
        status: "in_progress",
      },
      {
        id: "ro-w1-4",
        location: "غرفة عمليات العيون - جراحة الفاكو",
        observation: "تأخر شطف قنوات قبضة الفاكو (Phaco Lumens) بالماء المقطر المعقم فور انتهاء العملية، وعدم إعطاء وقت كافٍ لتغيير هواء الغرفة.",
        recommendation: "الشطف الفوري لقنوات قبضة الفاكو بـ 150 مل ماء مقطر معقم لمنع جفاف الإفرازات ومتلازمة TASS، وإعطاء 15 دقيقة لتطهير الغرفة.",
        responsible: "مشرف تمريض العمليات / فني التعقيم",
        status: "in_progress",
      },
      {
        id: "ro-w1-5",
        location: "وحدة الإفاقة والرعاية النهارية (PACU)",
        observation: "تحضير وتبكيت الغيارات المعقمة (Dressing Packs) داخل وحدة الإفاقة بدلاً من قسم التعقيم المركزي.",
        recommendation: "حظر تحضير أو فتح الغيارات المعقمة في الإفاقة وقصر إعداد الباكتات المعقمة على وحدة التعقيم المركزي (CSSD).",
        responsible: "مشرف التمريض / تمريض الإفاقة والتعقيم",
        status: "in_progress",
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  // --- التقرير الثاني: الأسبوع الثاني (5 ملاحظات موزعة على الأقسام) ---
  {
    id: "round-default-week-2",
    title: "تقرير المرور الاسبوعي - الأسبوع الثاني",
    department: "عام (كافة الأقسام)",
    day: "الأحد",
    date: "2026/06/14",
    period: "صباحي",
    inspector: "م/ أحمد وحيد شعبان",
    supervisorRole: "مشرف مكافحة العدوى",
    centerName: "Waheed IPC",
    generalRecommendation: "تفعيل نقطة الفرز الطبي بدقة والالتزام ببروتوكول الحقن والتطهير الدوائي.",
    observations: [
      {
        id: "ro-w2-1",
        location: "مدخل العيادات الخارجية - نقطة الفرز",
        observation: "عدم تفعيل نقطة الفرز البصري والحراري بمدخل العيادة للمرضى المترددين والمرافقين.",
        recommendation: "تفعيل نقطة الفرز ومنع دخول أي مريض يعاني من أعراض تنفسية أو إفرازات عينية معدية دون ارتداء ماسك وتقييمه.",
        responsible: "تمريض الفرز / مشرف العيادات",
        status: "in_progress",
      },
      {
        id: "ro-w2-2",
        location: "غرفة الفحوصات - التونوميتر المحمول (Tono-Pen)",
        observation: "عدم تغيير الغطاء المطاطي المعقم (Tip Cover) لمجس جهاز قياس الضغط المحمول بين المرضى.",
        recommendation: "الالتزام بتغيير طرف المجس المعقم أحادي الاستخدام لكل مريض والتأكد من عدم لمس الرأس الحساس بالأصابع المجردة.",
        responsible: "أخصائي الفحوصات / تمريض العيادة",
        status: "in_progress",
      },
      {
        id: "ro-w2-3",
        location: "جناح العمليات وأحواض الفرك الجراحي",
        observation: "دخول مستهلكات وكراتين زائدة داخل غرفة العمليات، وعدم تثبيت حاوية البيتادين على حوض الفرك الجراحي.",
        recommendation: "تفريغ المستلزمات من الكراتين خارج منطقة العمليات وإدخال احتياج الحالة فقط، وتثبيت موزعات البيتادين على الحوض.",
        responsible: "مشرف العمليات / تمريض العمليات",
        status: "completed",
      },
      {
        id: "ro-w2-4",
        location: "غرفة العمليات الجراحية",
        observation: "عدم تطهير الأجهزة الطبية وطاولة الجراحة وكابلات الميكروسكوب بين كل حالة والأخرى بمطهر سطوح معتمد.",
        recommendation: "مسح وتطهير أسطح الأجهزة وكابلات التوصيل بمطهر كواترنري أو كحولي معتمد بين كل مريض والآخر.",
        responsible: "تمريض العمليات / عامل الخدمات المدرب",
        status: "in_progress",
      },
      {
        id: "ro-w2-5",
        location: "غرفة علاج وأدوية وحدة الإفاقة",
        observation: "عدم الالتزام بتطهير السدادات المطاطية لفيالات الأدوية متعددة الجرعات بالكحول 70% قبل سحب الجرعات.",
        recommendation: "فرك السدادة المطاطية للفيال بمسحة كحول 70% بحركة دائرية لمدة 15 ثانية وتركها لتجف قبل إدخال الإبرة المعقمة.",
        responsible: "تمريض وحدة الإفاقة",
        status: "completed",
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  // --- التقرير الثالث: الأسبوع الثالث (4 ملاحظات موزعة على الأقسام) ---
  {
    id: "round-default-week-3",
    title: "تقرير المرور الاسبوعي - الأسبوع الثالث",
    department: "عام (كافة الأقسام)",
    day: "الأحد",
    date: "2026/06/21",
    period: "صباحي",
    inspector: "م/ أحمد وحيد شعبان",
    supervisorRole: "مشرف مكافحة العدوى",
    centerName: "Waheed IPC",
    generalRecommendation: "توفير مستلزمات نظافة الأيدي وتطبيق الاشتراطات البيئية بالعمليات والتعقيم.",
    observations: [
      {
        id: "ro-w3-1",
        location: "العيادات الخارجية - أحواض غسيل الأيدي",
        observation: "عدم توفير المناديل الورقية والصابون السائل والمطهر الكحولي على أحواض غسيل الأيدي بالعيادات الخارجية.",
        recommendation: "توفير المناديل الورقية والمطهرات وتعبئة الموزعات بصفة دورية لمنع استخدام المناشف القماشية وتفعيل غسل الأيدي.",
        responsible: "مشرف التمريض / الخدمات المساندة",
        status: "completed",
      },
      {
        id: "ro-w3-2",
        location: "غرفة فحص قاع العين وزاوية القرنية (Gonioscopy)",
        observation: "عدم إجراء التطهير عالي المستوى (HLD) لعدسات فحص قاع العين الملامسة للقرنية وشطفها بالماء المعقم بعد الاستخدام.",
        recommendation: "غمر العدسات في مطهر عالي المستوى معتمد وشطفها بماء معقم وتجفيفها بقطن طبي نظيف وحفظها في حافظة معقمة وجافة.",
        responsible: "طبيب العيون / تمريض الفحوصات",
        status: "in_progress",
      },
      {
        id: "ro-w3-3",
        location: "مخارج وبوابات جناح العمليات",
        observation: "خروج بعض الكوادر الطبية والتمريضية بالزي الجراحي (Scrubs) والواقيات الشخصية خارج جناح العمليات والعودة بها مجدداً.",
        recommendation: "خلع الواقيات الشخصية وتغيير الزي الجراحي قبل مغادرة منطقة العمليات وإلزام الجميع بارتداء المعاطف الواقية عند الخروج.",
        responsible: "أطباء وتمريض العمليات / مشرف مكافحة العدوى",
        status: "in_progress",
      },
      {
        id: "ro-w3-4",
        location: "التعقيم المركزي (CSSD) وأحواض العمليات",
        observation: "استخدام أحواض الفرك الجراحي لغسيل الآلات الجراحية الملوثة بدلاً من منطقة إزالة التلوث بالتعقيم المركزي.",
        recommendation: "حظر غسيل الآلات في أحواض الأيدي نهائياً ونقل الآلات الملوثة في حاويات مغلقة للتعقيم المركزي لإزالة التلوث.",
        responsible: "فنيو التعقيم المركزي / مشرف مكافحة العدوى",
        status: "in_progress",
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  // --- التقرير الرابع: الأسبوع الرابع (4 ملاحظات موزعة على الأقسام) ---
  {
    id: "round-default-week-4",
    title: "تقرير المرور الاسبوعي - الأسبوع الرابع",
    department: "عام (كافة الأقسام)",
    day: "الأحد",
    date: "2026/06/28",
    period: "صباحي",
    inspector: "م/ أحمد وحيد شعبان",
    supervisorRole: "مشرف مكافحة العدوى",
    centerName: "Waheed IPC",
    generalRecommendation: "متابعة إدارة النفايات الطبية وفصل المفارش وتطبيق بروتوكول البيتادين العيني بالعمليات.",
    observations: [
      {
        id: "ro-w4-1",
        location: "القسم الداخلي وغرف الإقامة وغرف الغيار",
        observation: "خلط النفايات الطبية الخطرة مع النفايات العادية أو عدم إغلاق حاويات الأدوات الحادة (Safety Box) عند امتلاء 3/4 الحاوية.",
        recommendation: "الالتزام بفصل النفايات في الأكياس الحمراء/الصفراء وإغلاق صندوق الأمان عند علامة الحد الأقصى وإرساله للمحرقة.",
        responsible: "تمريض القسم الداخلي / عمال النظافة",
        status: "completed",
      },
      {
        id: "ro-w4-2",
        location: "غرفة الفحوصات التشخيصية (OCT ومجال الإبصار)",
        observation: "عدم تطهير مساند الرأس ومقابض أجهزة الأشعة المقطعية للعين (OCT) وشاشات اللمس بين كل حالة والأخرى.",
        recommendation: "تطهير مساند الرأس والذقن بمسحات كحولية بعد كل مريض وتوفير ورق واقٍ نظيف لكل فحص.",
        responsible: "فني الأشعة والفحوصات / التمريض",
        status: "in_progress",
      },
      {
        id: "ro-w4-3",
        location: "غرفة العمليات الرئيسية",
        observation: "البدء في الشق الجراحي دون الانتظار 3 دقائق كاملة بعد تقطير البوفيدون يودين 5% في كيس الملتحمة.",
        recommendation: "الالتزام الصارم ببروتوكول البيتادين العيني 5% والانتظار 3 دقائق كاملة للوقاية من التهاب باطن العين (Endophthalmitis).",
        responsible: "الجراح المعالج / تمريض العمليات المعقم",
        status: "in_progress",
      },
      {
        id: "ro-w4-4",
        location: "أسرّة وحدة الإفاقة والرعاية النهارية",
        observation: "عدم تغيير أغطية الوسائد والشراشف ومسح هيكل سرير الإفاقة بمطهر سطوح معتمد بين كل مريض والآخر.",
        recommendation: "تغيير الملاءات فور خروج المريض ومسح هيكل السرير ومرتبة الجلد بمطهر سطوح معتمد قبل استقبال الحالة التالية.",
        responsible: "تمريض الإفاقة / الخدمات الفندقية",
        status: "in_progress",
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];
