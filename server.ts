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

// API: AI generator for Infection Control Monthly Meeting Topics & Action Plan
app.post("/api/ai/generate-meeting", async (req, res) => {
  try {
    const { centerType, monthName, focusArea, previousNotes } = req.body;
    const ai = getGeminiClient();
    
    if (!ai) {
      return res.status(503).json({ error: "Gemini API key is not configured" });
    }

    const prompt = `أنت خبير واستشاري مكافحة العدوى بالمستشفيات والمراكز الطبية وفق معايير الجودة ومكافحة العدوى العربية والدولية (مثل GAHAR و CBAHI و WHO).
المطلوب إعداد جدول أعمال وتوصيات وقرارات لاجتماع لجنة مكافحة العدوى الشهري لمركز/مستشفى من نوع: "${centerType || 'مركز طبي'}"
للشهر: "${monthName || 'الشهر الحالي'}"
الموضوع المحوري المطلوب التركيز عليه: "${focusArea || 'عام ومكافحة العدوى'}"
${previousNotes ? `ملاحظات أو توصيات من الاجتماع السابق: ${previousNotes}` : ''}

قم بتوليد رد بصيغة JSON حصراً بالشكل التالي:
{
  "agenda": ["بند 1", "بند 2", "بند 3", "بند 4", "بند 5"],
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

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text?.trim() || "{}";
    const data = JSON.parse(text);
    res.json(data);
  } catch (error: any) {
    console.error("Gemini meeting generation error:", error);
    res.status(500).json({ error: error.message || "Failed to generate meeting content" });
  }
});

// API: AI generator for Corrective Actions for an Observation
app.post("/api/ai/suggest-corrective-action", async (req, res) => {
  try {
    const { observation, department } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.status(503).json({ error: "Gemini API key is not configured" });
    }

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

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text?.trim() || "{}";
    const data = JSON.parse(text);
    res.json(data);
  } catch (error: any) {
    console.error("Gemini corrective action error:", error);
    res.status(500).json({ error: error.message || "Failed to suggest corrective action" });
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
