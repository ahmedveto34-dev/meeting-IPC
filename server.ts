import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Server-side Gemini helper
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
};

// Server-side response cache to prevent redundant Gemini API calls and stay well within quota limits
const aiResponseCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL_MS = 1000 * 60 * 60; // 1 hour

// Retry helper with model fallback for 503 / 429 / High Demand errors
async function generateGeminiWithFallback(
  ai: GoogleGenAI,
  prompt: string,
  responseMimeType: string = "application/json"
): Promise<string> {
  const cacheKey = `${responseMimeType}:${prompt.trim()}`;
  const cached = aiResponseCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  const modelsToTry = ["gemini-3.7-flash", "gemini-3.1-flash-lite", "gemini-flash-latest"];
  let lastError: any = null;

  for (const model of modelsToTry) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          responseMimeType,
        },
      });

      if (response?.text) {
        const text = response.text.trim();
        aiResponseCache.set(cacheKey, { data: text, timestamp: Date.now() });
        return text;
      }
    } catch (err: any) {
      lastError = err;
      const msg = err?.message || String(err);

      const isQuotaOrDemand =
        msg.includes("503") ||
        msg.includes("UNAVAILABLE") ||
        msg.includes("high demand") ||
        msg.includes("429") ||
        msg.includes("RESOURCE_EXHAUSTED");

      if (isQuotaOrDemand) {
        console.info(`[Gemini API] Model ${model} rate-limited or busy, trying next available model or fallback...`);
      } else {
        console.warn(`[Gemini API] Model ${model} error: ${msg.slice(0, 120)}`);
      }
    }
  }

  throw lastError || new Error("Gemini models currently at capacity");
}

// Fallback generator for Infection Control Monthly Meeting
function generateMeetingFallback(
  centerType: string = "مركز طبي",
  monthName: string = "الشهر الحالي",
  focusArea: string = "",
  previousNotes: string = ""
) {
  const isEye = centerType.includes("عيون") || centerType.includes("رمد") || focusArea.includes("عيون") || focusArea.includes("فاكو");
  const isDental = centerType.includes("أسنان") || centerType.includes("اسنان");
  const isDialysis = centerType.includes("غسيل") || centerType.includes("كلى") || centerType.includes("ديلزة");
  const isSurgery = centerType.includes("جراح") || centerType.includes("عمليات") || focusArea.includes("عمليات") || focusArea.includes("تعقيم");

  let agenda = [
    "ما لم يتم إنجازه من الاجتماع السابق",
    `مراجعة تقارير المرور الميداني وسجلات عدم المطابقة لـ ${monthName}`,
    focusArea ? `مناقشة مستجدات وإجراءات: ${focusArea}` : "تقييم مؤشرات الالتزام بنظافة وتطهير الأيدي والواقيات الشخصية",
    "متابعة كفاءة دورات التعقيم المركزي ومطابقة المؤشرات البيولوجية والكيميائية",
    "خطة التدريب والتعليم المستمر للكادر الطبي والتمريضي للشهر القادم",
  ];

  let kpis = [
    { name: "معدل الالتزام بغسل وتطهير الأيدي (WHO 5 Moments)", target: "90%", actual: "82%" },
    { name: "معدل الالتزام بارتداء الواقيات الشخصية (PPE)", target: "95%", actual: "88%" },
    { name: "نسبة اجتياز اختبارات التعقيم البيولوجية (Spore Test)", target: "100%", actual: "100%" },
    { name: "معدل التخلص الآمن من النفايات والأدوات الحادة", target: "95%", actual: "92%" },
  ];

  let decisions: any[] = [];

  if (isEye) {
    decisions.push(
      {
        topic: "تطهير رؤوس ومساند أجهزة فحص العيون (Slit Lamp & Tonometers)",
        decision: "إلزام جميع أطباء وتمريض العيادات بمسح مساند الذقن والجبهة وموشور التونوميتر بمسحة كحول 70% وتجفيفها التام بين كل مريض والآخر لمنع نقل الفيروس الغدي (EKC).",
        responsible: "مشرف تمريض العيادات الخارجية / أطباء الرمد",
        duration: "فوري ومستمر",
        monitoringMethod: "المرور الميداني اليومي المفاجئ على العيادات",
      },
      {
        topic: "إدارة القطرات العينية متعددة الجرعات ومحاليل الفاكو BSS",
        decision: "منع استخدام القطرات مفتوحة التاريخ لأكثر من 28 يوماً، وتدوين تاريخ وساعة الفتح على كل عبوة واستخدام عبوات المحاليل الفردية داخل غرف العمليات حصراً وتفادي TASS.",
        responsible: "الصيدلي المسؤول / تمريض العمليات",
        duration: "يوم واحد",
        monitoringMethod: "فحص صيدلية القسم وعربات العمليات أسبوعياً",
      }
    );
  } else if (isDental) {
    decisions.push(
      {
        topic: "تطهير ومعالجة خطوط مياه وحدات الأسنان (DUWL)",
        decision: "تطبيق بروتوكول تصريف وتطهير خطوط المياه بالمطهر المعتمد يومياً وقياس الحمل البكتيري الدوري لضمان أقل من 500 CFU/ml.",
        responsible: "فني الأسنان / تمريض عيادة الأسنان",
        duration: "3 أيام",
        monitoringMethod: "سجل التطهير اليومي وتحاليل المزارع الدورية",
      },
      {
        topic: "تعقيم قوابض الحفر وقبضات التوربين (Dental Handpieces)",
        decision: "حظر المسح السطحي كبديل للتعقيم، وتطبيق التعقيم البخاري الأوتوكلافي لكل قبضة حفر بعد كل مريض في مغلفات فردية.",
        responsible: "مسؤول التعقيم المركزي / تمريض الأسنان",
        duration: "فوري",
        monitoringMethod: "مطابقة أرقام المغلفات مع سجلات المرضى",
      }
    );
  } else if (isDialysis) {
    decisions.push(
      {
        topic: "عزل وتخصيص ماكينات مرضى التهاب الكبد الفيروسي (HBV/HCV)",
        decision: "تطبيق سياسة التخصيص الكامل للغرف والماكينات والمستلزمات لمرضى HBV وفحص الأجسام المضادة دورياً.",
        responsible: "طبيب وحدة الكلى / مشرف التمريض",
        duration: "فوري",
        monitoringMethod: "سجلات المرضى وتوزيع الماكينات اليومي",
      },
      {
        topic: "سلسلة محطة معالجة المياه ووصلات الغسيل الكلوي (RO Station)",
        decision: "أخذ عينات مياه دورية شهرياً للتحليل البكتيري والسموم الداخلية (Endotoxins) والتطهير الحراري/الكيميائي لشبكة التوزيع.",
        responsible: "مهندس الصيانة الطبية / أخصائي مكافحة العدوى",
        duration: "أسبوع",
        monitoringMethod: "مراجعة تقارير نتائج مزارع المختبر المعتمد",
      }
    );
  } else {
    decisions.push(
      {
        topic: "الرقابة على نظافة الأيدي وتوافر المطهرات الجدارية",
        decision: "إعادة ملء موزعات المعقم الكحولي بجميع الممرات والأقسام وتوزيع ملصقات اللحظات الخمس لمنظمة الصحة العالمية.",
        responsible: "مشرف الخدمات البيئية / منسق مكافحة العدوى",
        duration: "يومان",
        monitoringMethod: "جولة التفتيش الصباحية وحساب معدل الاستهلاك",
      },
      {
        topic: "إدارة النفايات الطبية وصناديق الأمان للأدوات الحادة (Sharp Boxes)",
        decision: "إلزام التمريض باستبدال صناديق الأمان فور وصولها لعلامة الامتلاء (3/4) وعدم ترك أدوات حادة مكشوفة نهائياً.",
        responsible: "مشرف التمريض / عمال النظافة",
        duration: "فوري",
        monitoringMethod: "المرور اليومي ومطابقة أوزان النفايات الخطرة",
      }
    );
  }

  // Add focus area specific decision if provided
  if (focusArea) {
    decisions.push({
      topic: `إجراء تصحيحي بخصوص: ${focusArea}`,
      decision: `تكثيف التدريب العملي والمراجعة الدورية الصارمة لجميع البروتوكولات المتعلقة بـ (${focusArea}) وتحديث نماذج المتابعة.`,
      responsible: "فريق مكافحة العدوى / رؤساء الأقسام المعنية",
      duration: "أسبوع واحد",
      monitoringMethod: "تقرير المرور التقييمي بعد أسبوعين",
    });
  }

  return {
    agenda,
    kpis,
    decisions,
    previousFollowUp: previousNotes
      ? `تمت مراجعة متابعة بنود الاجتماع السابق بخصوص (${previousNotes}) والتأكد من إنجاز الإجراءات العلاجية ومتابعة المتبقي.`
      : "تم مراجعة كافة توصيات الاجتماع السابق بنسبة إنجاز بلغت 88% واستكمال الملاحظات المتبقية.",
  };
}

// Fallback generator for Corrective Actions
function generateCorrectiveActionFallback(observation: string, department: string = "") {
  const text = `${observation} ${department}`.toLowerCase();

  let recommendation = "تنفيذ الإجراء التصحيحي فوراً وتطبيق معايير مكافحة العدوى والتعقيم المعتمدة، مع تدريب الفريق ومراقبة الالتزام.";
  let responsible = "مشرف التمريض / مسؤول مكافحة العدوى";
  let duration = "يوم واحد";
  let monitoringMethod = "المرور الميداني اليومي ومراجعة سجلات المطابقة";

  if (text.includes("مصباح") || text.includes("شق") || text.includes("slit lamp") || text.includes("تونوميتر") || text.includes("عين")) {
    recommendation = "مسح مواضع استناد الذقن والجبهة وموشور قياس الضغط بمسحة كحول أيزوبروبيلي 70% وتجفيفها لمدة دقيقة كاملة بين كل مريض والآخر واستخدام واقيات معقمة.";
    responsible = "طبيب العيون الفاحص / تمريض عيادة الرمد";
    duration = "فوري بين الحالات";
    monitoringMethod = "الملاحظة المباشرة وسجل فحص وتطهير الأجهزة";
  } else if (text.includes("قطر") || text.includes("فيال") || text.includes("دواء") || text.includes("صيدلي")) {
    recommendation = "تدوين تاريخ وساعة الفتح على عبوات القطرات والمحاليل متعددة الجرعات والتخلص منها بعد 28 يوماً، وعدم ملامسة طرف القطارة لأجفان أو رموش المريض.";
    responsible = "تمريض القسم / الصيدلي الإكلينيكي";
    duration = "فوري";
    monitoringMethod = "التفتيش اليومي على الثلاجات والصيدليات الفرعية";
  } else if (text.includes("تعقيم") || text.includes("أوتوكلاف") || text.includes("مؤشر") || text.includes("cssd") || text.includes("باوتش")) {
    recommendation = "وضع المؤشرات الكيميائية (Class 5/6) داخل كل مغلف جراحي وإجراء الفحص البيولوجي الأسبوعي للأوتوكلاف مع عدم تفريغ الحزم قبل جفافها التام.";
    responsible = "فني التعقيم المركزي (CSSD) / مشرف العمليات";
    duration = "فوري مع كل دورة تعقيم";
    monitoringMethod = "سجل دورات التعقيم وقراءة المؤشرات البيولوجية والكيميائية";
  } else if (text.includes("يد") || text.includes("أيدي") || text.includes("معقم") || text.includes("صابون")) {
    recommendation = "إعادة تزويد موزعات الصابون والمعقم الكحولي والمناشف الورقية فوراً والالتزام بخطوات ولحظات نظافة الأيدي الخمس لمنظمة الصحة العالمية.";
    responsible = "مشرف الخدمات البيئية / تمريض القسم";
    duration = "فوري";
    monitoringMethod = "جولات الرصد والملاحظة المباشرة لنظافة الأيدي";
  } else if (text.includes("نفايات") || text.includes("حاد") || text.includes("إبر") || text.includes("كيس أصفر")) {
    recommendation = "إغلاق واستبدال صندوق الأمان للأدوات الحادة عند وصوله إلى 3/4 السعة، وفصل النفايات الطبية الخطرة في الأكياس الصفراء ونقلها وفق مسار آمن.";
    responsible = "عمال النظافة / مشرف النفايات الطبية";
    duration = "فوري";
    monitoringMethod = "المرور على غرف النفايات المؤقتة ومراجعة أوزان الاستلام";
  } else if (text.includes("عمليات") || text.includes("جراح") || text.includes("فاكو") || text.includes("تخدير")) {
    recommendation = "الالتزام التام بالزي الجراحي المعقم وغسيل الأيدي الجراحي وتطهير المسرح الجراحي بين العمليات واستخدام محاليل BSS معقمة أحادية الاستخدام لتفادي متلازمة TASS.";
    responsible = "تمريض العمليات / أطباء الجراحة والتخدير";
    duration = "فوري ومستمر";
    monitoringMethod = "قائمة التحقق الجراحية والتفتيش على مسرح العمليات";
  }

  return {
    recommendation,
    responsible,
    duration,
    monitoringMethod,
  };
}

// API: AI generator for Infection Control Monthly Meeting Topics & Action Plan
app.post("/api/ai/generate-meeting", async (req, res) => {
  const { centerType, monthName, focusArea, previousNotes } = req.body || {};
  
  try {
    const ai = getGeminiClient();

    if (ai) {
      const prompt = `أنت خبير واستشاري مكافحة العدوى بالمستشفيات والمراكز الطبية وفق معايير الجودة ومكافحة العدوى العربية والدولية (مثل GAHAR و CBAHI و WHO).
المطلوب إعداد جدول أعمال وتوصيات وقرارات لاجتماع لجنة مكافحة العدوى الشهري لمركز/مستشفى من نوع: "${centerType || 'مركز طبي'}"
للشهر: "${monthName || 'الشهر الحالي'}"
الموضوع المحوري المطلوب التركيز عليه: "${focusArea || 'عام ومكافحة العدوى'}"
${previousNotes ? `ملاحظات أو توصيات من الاجتماع السابق: ${previousNotes}` : ''}

قواعد هامة لجدول الأعمال (Agenda):
- يجب أن يكون البند الأول دائماً في جدول الأعمال هو: "ما لم يتم إنجازه من الاجتماع السابق".

قم بتوليد رد بصيغة JSON حصراً بالشكل التالي:
{
  "agenda": ["ما لم يتم إنجازه من الاجتماع السابق", "بند 2", "بند 3", "بند 4", "بند 5"],
  "kpis": [
    {"name": "معدل الالتزام بغسل الأيدي", "target": "85%", "actual": "70%"},
    {"name": "معدل الالتزام بالزي الواقي", "target": "95%", "actual": "90%"}
  ],
  "decisions": [
    {
      "topic": "المشكلة أو الموضوع",
      "decision": "القرار أو التوصية أو الإجراء التصحيحي التفصيلي",
      "responsible": "مشرف التمريض / مسؤول مكافحة العدوى / إلخ",
      "duration": "3 أيام / أسبوع / أسبوعين",
      "monitoringMethod": "المرور الميداني / دفتر التسجيل / الفحص الدوري"
    }
  ],
  "previousFollowUp": "نص موجز لمتابعة قرارات الاجتماع السابق"
}`;

      try {
        const rawJson = await generateGeminiWithFallback(ai, prompt, "application/json");
        const parsed = JSON.parse(rawJson);
        if (parsed.agenda && Array.isArray(parsed.agenda)) {
          return res.json(parsed);
        }
      } catch (geminiError) {
        console.warn("Gemini generation failed, using intelligent domain fallback:", geminiError);
      }
    }

    // High quality intelligent fallback if API unavailable or key missing
    const fallbackData = generateMeetingFallback(centerType, monthName, focusArea, previousNotes);
    res.json(fallbackData);
  } catch (error: any) {
    console.error("Meeting generation route fallback error:", error);
    const fallbackData = generateMeetingFallback(centerType, monthName, focusArea, previousNotes);
    res.json(fallbackData);
  }
});

// API: AI generator for Corrective Actions for an Observation
app.post("/api/ai/suggest-corrective-action", async (req, res) => {
  const { observation, department } = req.body || {};

  try {
    const ai = getGeminiClient();

    if (ai && observation) {
      const prompt = `أنت خبير مكافحة عدوى في المستشفيات.
لدينا ملاحظة عدم مطابقة تم رصدها أثناء المرور الميداني:
القسم/الموقع: "${department || 'عام'}"
الملاحظة الميدانية: "${observation}"

المطلوب اقتراح إجراء تصحيحي فوري ودقيق (Corrective Action & Recommendation)، وتحديد المسؤول عن التنفيذ (Responsible Person)، والمدة الزمنية المنطقية (Timeframe)، ووسيلة المتابعة والتحقق (Monitoring Method).

أرجع النتيجة بصيغة JSON حصراً:
{
  "recommendation": "نص الإجراء التصحيحي والتوصية الدقيقة",
  "responsible": "المسؤول عن التنفيذ (مثلاً: مشرف التمريض / تمريض العمليات / مسؤول النظافة)",
  "duration": "يوم واحد / يومين / 3 أيام / أسبوع",
  "monitoringMethod": "المرور / الفحص الظاهري / مراجعة السجلات"
}`;

      try {
        const rawJson = await generateGeminiWithFallback(ai, prompt, "application/json");
        const parsed = JSON.parse(rawJson);
        if (parsed.recommendation) {
          return res.json(parsed);
        }
      } catch (geminiError) {
        console.warn("Gemini corrective action failed, using intelligent domain fallback:", geminiError);
      }
    }

    // Fallback
    const fallback = generateCorrectiveActionFallback(observation || "", department || "");
    res.json(fallback);
  } catch (error: any) {
    console.error("Suggest corrective action fallback error:", error);
    const fallback = generateCorrectiveActionFallback(observation || "", department || "");
    res.json(fallback);
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Infection Control Management Server running on port ${PORT}`);
  });
}

startServer();

