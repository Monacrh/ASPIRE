import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import clientPromise from "@/src/lib/mongodb";
import { ObjectId } from "mongodb";

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_GEMINI_API_KEY || "",
});

const DB_NAME = "aspire_db";
const COLLECTION_NAME = "transcripts";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { transcriptId, forceRegenerate } = body;
    let { fileData, fileName } = body;

    if (!fileData && !transcriptId) {
      return NextResponse.json({ success: false, message: "File required" }, { status: 400 });
    }

    // --- 2. AMBIL DARI DB ---
    let existingTranscript: any = null;

    if (transcriptId) {
      const client = await clientPromise;
      const db = client.db(DB_NAME);
      const collection = db.collection(COLLECTION_NAME);
      try {
        existingTranscript = await collection.findOne({ _id: new ObjectId(transcriptId) });
      } catch (e) {
        console.error("Invalid ID", e);
      }

      // Cek Cache
      if (existingTranscript?.recommendations && !forceRegenerate) {
        const isArray = Array.isArray(existingTranscript.recommendations);
        const hasEvidence = existingTranscript.recommendations[0]?.evidence;
        
        if (isArray && hasEvidence) {
          console.log("✅ Using cached Course Competency data");
          return NextResponse.json({ success: true, data: existingTranscript.recommendations, cached: true }, { status: 200 });
        }
      }

      if (!fileData && existingTranscript?.fileData) {
        fileData = existingTranscript.fileData;
        fileName = existingTranscript.fileName;
      }
    }

    if (!fileData) {
      return NextResponse.json({ success: false, message: "No file content" }, { status: 404 });
    }

    // --- 3. OCR ---
    let mimeType = "application/pdf";
    if (fileName?.endsWith(".png")) mimeType = "image/png";
    if (fileName?.endsWith(".jpg") || fileName?.endsWith(".jpeg")) mimeType = "image/jpeg";

    const extractionResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{
          role: "user",
          parts: [
            { text: "Extract raw text from this transcript." },
            { inlineData: { mimeType: mimeType, data: fileData } },
          ],
      }],
    });
    const transcriptText = extractionResponse.text || "";

    // --- 4. ANALISIS COURSE COMPETENCY (STRICT 3 STATS & CLEAN EVIDENCE) ---
    const prompt = `
You are an Academic Strategist.

TRANSCRIPT:
${transcriptText}

TASK: Analyze the student's grades and visualize their "Academic Competency Spectrum".
Group their subjects into **2 to 4 Core Competency Domains**.

**CRITICAL INSTRUCTIONS:**

1. **DESCRIPTION:** Keep it HIGH-LEVEL and STRATEGIC. Do not list grades here.
2. **EVIDENCE:** Only list subjects that have **VALID GRADES** (A, AB, B, BC, C, D, E). **IGNORE** subjects with empty grades, "-", "T", or "TL".
3. **ACADEMIC STATS:** You MUST provide exactly these **3 Metrics**:
   - **Consistency**: How stable are their grades?
   - **Theoretical Depth**: Performance in theory/concept exams.
   - **Practical Application**: Performance in labs/projects/practicum.

**LANGUAGE:** English (Professional).

OUTPUT JSON Structure (Strict Array):
[
  {
    "id": "1",
    "name": "Data Science & Analytics", 
    "percentage": 40,
    "color": "#FFD93D",
    "tagline": "Natural talent for uncovering patterns in numbers.",
    "description": "Your profile demonstrates a strong analytical mindset...",
    
    "evidence": [
      { "subject": "STATISTIKA", "grade": "AB" }, // Only Valid Grades!
      { "subject": "ANALISIS JEJARING SOSIAL", "grade": "A" }
    ],

    "hardSkills": ["Python", "SQL", "Regression Analysis"],
    "projectIdeas": ["Predictive Analysis Project", "Big Data Optimization"],

    "keyStrength": "Statistical Interpretation",
    "areaToImprove": "Database Management",
    
    // MUST HAVE EXACTLY THESE 3:
    "academicStats": [
      { "label": "Consistency", "score": 85, "reason": "Stable performance in math subjects." },
      { "label": "Theoretical Depth", "score": 90, "reason": "High scores in complex theory exams." },
      { "label": "Practical Application", "score": 75, "reason": "Lab scores are good but lower than theory." }
    ],

    "learningPlatforms": ["DataCamp", "Kaggle"],
    "relatedRoles": ["Data Analyst", "Data Scientist"],
    "actionPlan": "Deepen your understanding of SQL."
  }
]

IMPORTANT:
1. Percentages MUST sum to 100%.
2. Colors from: #FFD93D, #FF90E8, #4DE1C1, #FFA07A, #A78BFA, #60A5FA.
3. OUTPUT ONLY JSON.
`;

    console.log("📊 Analyzing Strict Stats Competency...");
    const analysisResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    // --- CLEAN JSON LOGIC ---
    const rawText = analysisResponse.text || "";
    let cleanJson = "";
    const firstBracket = rawText.indexOf('[');
    const lastBracket = rawText.lastIndexOf(']');
    
    if (firstBracket !== -1 && lastBracket !== -1) {
        cleanJson = rawText.substring(firstBracket, lastBracket + 1);
    } else {
        const firstCurly = rawText.indexOf('{');
        const lastCurly = rawText.lastIndexOf('}');
        if (firstCurly !== -1 && lastCurly !== -1) {
             cleanJson = `[${rawText.substring(firstCurly, lastCurly + 1)}]`;
        } else {
             throw new Error("AI did not return valid JSON structure");
        }
    }

    let result;
    try {
        result = JSON.parse(cleanJson);
    } catch (parseError) {
        console.error("JSON Error:", parseError);
        throw new Error("Failed to parse AI response");
    }

    // --- 5. SIMPAN ---
    if (transcriptId) {
      const client = await clientPromise;
      const db = client.db(DB_NAME);
      await db.collection(COLLECTION_NAME).updateOne(
        { _id: new ObjectId(transcriptId) },
        { 
          $set: { 
            recommendations: result, 
            recommendationType: 'course', 
            updatedAt: new Date()
          } 
        }
      );
    }

    return NextResponse.json({ success: true, data: result }, { status: 200 });

  } catch (error) {
    console.error("Analysis Error:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ success: false, message: msg }, { status: 500 });
  }
}