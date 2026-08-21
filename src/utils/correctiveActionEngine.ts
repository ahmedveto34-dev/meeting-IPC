import { STANDARD_OBSERVATIONS_LIBRARY, StandardObservationItem } from "../data/standardObservations";
import { getCustomObservations } from "./customObservationsManager";

export interface CorrectiveActionResult {
  recommendation: string;
  responsible: string;
  duration: string;
  monitoringMethod: string;
  suggestedLocation?: string;
  confidence: "high" | "medium" | "smart_rule" | "ai";
}

/**
 * Intelligent client-side heuristic engine that parses Arabic healthcare observation text
 * and instantly matches or synthesizes a formal infection control corrective action.
 */
export function findSmartCorrectiveAction(
  observationText: string,
  currentLocation: string = ""
): CorrectiveActionResult | null {
  const text = (observationText || "").trim().toLowerCase();
  if (text.length < 3) return null;

  // Clean and tokenize query words (ignoring common Arabic stopwords)
  const stopWords = new Set(["في", "من", "على", "إلى", "عن", "مع", "أو", "ثم", "هذا", "هذه", "عدم", "وجود", "تم", "هو", "هي"]);
  const tokens = text
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()؟?]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !stopWords.has(w));

  // 1. Search Custom Observations first, then Standard Library
  const customItems = getCustomObservations();
  const searchPool = [...customItems, ...STANDARD_OBSERVATIONS_LIBRARY];

  let bestItem: StandardObservationItem | null = null;
  let bestScore = 0;

  for (const item of searchPool) {
    let score = 0;
    const itemObs = item.observation.toLowerCase();
    const itemLoc = item.location.toLowerCase();
    const itemCat = item.category.toLowerCase();
    const itemRec = item.recommendation.toLowerCase();

    // Priority bonus if this is a user's own custom saved observation
    if (item.isCustom) {
      score += 15;
    }

    // Direct substring checks
    if (itemObs === text) {
      score += 100;
    } else if (itemObs.includes(text) || text.includes(itemObs.slice(0, 30))) {
      score += 50;
    }

    tokens.forEach((token) => {
      if (itemObs.includes(token)) score += 8;
      if (itemLoc.includes(token)) score += 6;
      if (itemRec.includes(token)) score += 4;
      if (itemCat.includes(token)) score += 3;
    });

    if (currentLocation && (itemLoc.includes(currentLocation.toLowerCase()) || itemCat.includes(currentLocation.toLowerCase()))) {
      score += 5;
    }

    if (score > bestScore) {
      bestScore = score;
      bestItem = item;
    }
  }

  if (bestItem && bestScore >= 12) {
    return {
      recommendation: bestItem.recommendation,
      responsible: bestItem.responsible || "مشرف القسم / مسؤول مكافحة العدوى",
      duration: bestItem.duration || "فوري",
      monitoringMethod: bestItem.monitoringMethod || "المرور الميداني الدوري والملاحظة المباشرة",
      suggestedLocation: bestItem.location,
      confidence: bestScore >= 30 ? "high" : "medium",
    };
  }

  // 2. Comprehensive Domain Rule-Based Synthesis for clinical scenarios
  if (text.includes("مصباح") || text.includes("شق") || text.includes("slit lamp") || text.includes("فحص العين")) {
    return {
      recommendation: "مسح مساند الذقن والجبهة ومقابض مصباح الشق بمسحة كحول أيزوبروبيلي 70% وتركها لتجف، وتغيير الورقة الواقية بين كل مريض والآخر لمنع نقل الفيروس الغدي (EKC).",
      responsible: "طبيب العيون الفاحص / تمريض عيادة الرمد",
      duration: "فوري بين الحالات",
      monitoringMethod: "الملاحظة المباشرة وسجل فحص وتطهير الأجهزة",
      suggestedLocation: "عيادة",
      confidence: "smart_rule",
    };
  }

  if (text.includes("تونوميتر") || text.includes("ضغط العين") || text.includes("tonometer") || text.includes("تونوبين") || text.includes("موشور")) {
    return {
      recommendation: "تطهير موشور ورأس التونوميتر بمسحة كحول 70% والتجفيف التام لدقيقة كاملة قبل فحص المريض التالي، أو استخدام أغطية/رؤوس قياس ضغط العين المعقمة أحادية الاستخدام.",
      responsible: "طبيب العيون / أخصائي البصريات",
      duration: "فوري",
      monitoringMethod: "التفتيش الميداني وسجل التطهير اليومي",
      suggestedLocation: "فحوصات",
      confidence: "smart_rule",
    };
  }

  if (text.includes("قطر") || text.includes("محلول") || text.includes("فيال") || text.includes("تاريخ الفتح") || text.includes("توسيع")) {
    return {
      recommendation: "تدوين تاريخ وساعة الفتح على عبوات القطرات والمحاليل متعددة الجرعات والتخلص منها بعد 28 يوماً، ومنع ملامسة طرف القطارة لأجفان أو رموش المريض.",
      responsible: "تمريض القسم / الصيدلي الإكلينيكي",
      duration: "فوري",
      monitoringMethod: "التفتيش اليومي على ثلاجات وصيدليات الأقسام",
      suggestedLocation: "عيادة",
      confidence: "smart_rule",
    };
  }

  if (text.includes("تعقيم") || text.includes("أوتوكلاف") || text.includes("مؤشر") || text.includes("cssd") || text.includes("باوتش") || text.includes("مغلف")) {
    return {
      recommendation: "إلزام قسم التعقيم بوضع مؤشرات التعقيم الكيميائية (Class 5/6) داخل المغلفات، وتسجيل دورات التعقيم، وإجراء الاختبار البيولوجي الأسبوعي، مع فحص سلامة التغليف والجفاف قبل الفتح.",
      responsible: "فني التعقيم المركزي (CSSD) / مشرف العمليات",
      duration: "فوري مع كل دورة",
      monitoringMethod: "مراجعة سجلات التعقيم وقراءات المؤشرات البيولوجية والكيميائية",
      suggestedLocation: "عمليات",
      confidence: "smart_rule",
    };
  }

  if (text.includes("يد") || text.includes("أيدي") || text.includes("معقم") || text.includes("كحول") || text.includes("صابون") || text.includes("مغسلة")) {
    return {
      recommendation: "إعادة تزويد موزعات الصابون والمعقم الكحولي والمناشف الورقية فوراً، والتأكيد على الكادر الطبي والتمريضي بالالتزام بلحظات غسل وتطهير الأيدي الخمس لمنظمة الصحة العالمية.",
      responsible: "مشرف التمريض / مشرف الخدمات البيئية",
      duration: "فوري",
      monitoringMethod: "جولات الرصد والملاحظة المباشرة لنظافة الأيدي",
      suggestedLocation: "قسم داخلي",
      confidence: "smart_rule",
    };
  }

  if (text.includes("نفايات") || text.includes("حاد") || text.includes("إبر") || text.includes("صندوق أمان") || text.includes("كيس أصفر") || text.includes("sharp")) {
    return {
      recommendation: "استبدال صناديق الأمان فور وصولها لعلامة 3/4 السعة، وتطبيق الفصل الصارم للنفايات الطبية الخطرة في الأكياس الصفراء ونقلها عبر المسار المحدد بأوعية مغلقة.",
      responsible: "مشرف النفايات الطبية / عمال النظافة",
      duration: "فوري",
      monitoringMethod: "المرور اليومي على حاويات النفايات ومطابقة أوزان التجميع",
      suggestedLocation: "قسم داخلي",
      confidence: "smart_rule",
    };
  }

  if (text.includes("واقي") || text.includes("ماسك") || text.includes("كمام") || text.includes("قفاز") || text.includes("جوانتي") || text.includes("ppe") || text.includes("مريول")) {
    return {
      recommendation: "إلزام جميع الكوادر بارتداء الواقيات الشخصية المناسبة لطبيعة الإجراء الطبي والتخلص منها بعد كل مريض، وتجنب لمس الأسطح أو الانتقال بين الغرف بالقفازات المستخدمة.",
      responsible: "مشرف التمريض / مسؤول مكافحة العدوى",
      duration: "فوري ومستمر",
      monitoringMethod: "الملاحظة الميدانية المباشرة وقوائم تدقيق PPE",
      suggestedLocation: "عيادة",
      confidence: "smart_rule",
    };
  }

  if (text.includes("عمليات") || text.includes("جراح") || text.includes("فاكو") || text.includes("تخدير") || text.includes("مسرح")) {
    return {
      recommendation: "تطبيق قواعد التعقيم الصارمة لغرف العمليات، وتطهير الأسطح والأجهزة بين الحالات مع إعطاء وقت كافٍ لتغيير الهواء (15 دقيقة)، واستخدام محاليل BSS معقمة أحادية الاستخدام لتفادي TASS.",
      responsible: "مشرف تمريض العمليات / استشاري التخدير والجراحة",
      duration: "فوري بين الحالات",
      monitoringMethod: "قائمة التحقق الجراحية والمرور على مسرح العمليات",
      suggestedLocation: "عمليات",
      confidence: "smart_rule",
    };
  }

  if (text.includes("إفاقة") || text.includes("افاقة") || text.includes("تنويم") || text.includes("سرير") || text.includes("ملايات") || text.includes("مفرش")) {
    return {
      recommendation: "تغيير مفارش وأغطية الأسرة بعد خروج كل مريض، وتطهير هيكل السرير وحوامل المحاليل وأجهزة مراقبة العلامات الحيوية بمطهر الأسطح المعتمد وتجفيفها.",
      responsible: "تمريض الإفاقة / عمال الخدمات البيئية",
      duration: "فوري مع كل مريض",
      monitoringMethod: "سجل تطهير أسرّة الإفاقة والتفتيش الصباحي والمسائي",
      suggestedLocation: "إفاقة",
      confidence: "smart_rule",
    };
  }

  if (text.includes("كرتون") || text.includes("كراتين") || text.includes("تخزين") || text.includes("مستودع") || text.includes("أرضية") || text.includes("رف")) {
    return {
      recommendation: "منع إدخال أو تخزين الصناديق الكرتونية الخارجية داخل المناطق النظيفة والمعقمة، ونقل المستلزمات إلى أرفف مرتفعة عن الأرض 20 سم على الأقل في حاويات بلاستيكية ملساء سهلة التطهير.",
      responsible: "مسؤول المستودع الطبي / مشرف القسم",
      duration: "يوم واحد",
      monitoringMethod: "التفتيش الميداني على غرف التخزين النظيفة",
      suggestedLocation: "قسم داخلي",
      confidence: "smart_rule",
    };
  }

  if (text.includes("نظافة") || text.includes("أرضيات") || text.includes("غبار") || text.includes("اتربة") || text.includes("ممسحة") || text.includes("دلو")) {
    return {
      recommendation: "إعادة تنظيف وتطهير المنطقة باستخدام نظام الممسحة مزدوجة الدلو مع المطهر المعتمد بالتركيز الصحيح، وتغيير رأس الممسحة بين الأقسام لمنع التلوث التبادلي.",
      responsible: "مشرف الخدمات البيئية وعمال النظافة",
      duration: "فوري",
      monitoringMethod: "قائمة تدقيق النظافة البيئية والتفتيش الظاهري",
      suggestedLocation: "قسم داخلي",
      confidence: "smart_rule",
    };
  }

  if (text.includes("طعام") || text.includes("أكل") || text.includes("مشروب") || text.includes("ثلاجة") || text.includes("شاي") || text.includes("قهوة")) {
    return {
      recommendation: "منع تناول الأطعمة والمشروبات أو تخزينها داخل محطات التمريض وغرف تحضير الأدوية والعيادات وغرف العمليات نهائياً، وتخصيص استراحة الموظفين لذلك.",
      responsible: "مشرف التمريض / رئيس القسم",
      duration: "فوري",
      monitoringMethod: "المرور التفتيشي المفاجئ على محطات التمريض",
      suggestedLocation: "عيادة",
      confidence: "smart_rule",
    };
  }

  // Generic intelligent professional infection control recommendation fallback
  return {
    recommendation: `اتخاذ الإجراء التصحيحي الفوري لمعالجة (${text})، وإلزام الطاقم المعني بالمعايير القياسية للوقاية ومكافحة العدوى، مع إعادة التدريب وتكثيف المتابعة الميدانية.`,
    responsible: "مشرف التمريض / مسؤول مكافحة العدوى",
    duration: "فوري إلى يومين",
    monitoringMethod: "المرور الميداني اليومي ومراجعة سجلات المطابقة",
    confidence: "smart_rule",
  };
}

const clientActionCache = new Map<string, CorrectiveActionResult>();

/**
 * Async helper to fetch Gemini AI generated recommendation if network and API are available,
 * falling back safely and immediately to the local smart engine.
 */
export async function fetchAiCorrectiveAction(
  observationText: string,
  department: string = "",
  forceNetwork: boolean = false
): Promise<CorrectiveActionResult> {
  const localResult = findSmartCorrectiveAction(observationText, department);
  const cacheKey = `${department}:${observationText.trim().toLowerCase()}`;

  if (!forceNetwork && clientActionCache.has(cacheKey)) {
    return clientActionCache.get(cacheKey)!;
  }

  // Fast-path: if we already have a high-confidence match or clinical rule, use it immediately
  if (!forceNetwork && localResult && (localResult.confidence === "high" || localResult.confidence === "smart_rule")) {
    clientActionCache.set(cacheKey, localResult);
    return localResult;
  }

  try {
    const res = await fetch("/api/ai/suggest-corrective-action", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        observation: observationText,
        department,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.recommendation && data.recommendation.trim().length > 5) {
        const result: CorrectiveActionResult = {
          recommendation: data.recommendation,
          responsible: data.responsible || localResult?.responsible || "مشرف القسم / مسؤول مكافحة العدوى",
          duration: data.duration || localResult?.duration || "فوري",
          monitoringMethod: data.monitoringMethod || localResult?.monitoringMethod || "المرور الميداني",
          suggestedLocation: localResult?.suggestedLocation || department,
          confidence: "ai",
        };
        clientActionCache.set(cacheKey, result);
        return result;
      }
    }
  } catch (err) {
    // Graceful fallback to smart local rule without spamming console
  }

  const finalResult = localResult || {
    recommendation: "تطبيق الإجراء التصحيحي فوراً وتدريب الفريق المعني والتحقق من الالتزام بمعايير مكافحة العدوى.",
    responsible: "مشرف التمريض / مسؤول مكافحة العدوى",
    duration: "فوري",
    monitoringMethod: "المرور الميداني المباشر",
    confidence: "smart_rule" as const,
  };

  clientActionCache.set(cacheKey, finalResult);
  return finalResult;
}
