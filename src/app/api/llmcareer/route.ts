import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import clientPromise from "@/src/lib/mongodb";
import { ObjectId } from "mongodb";

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_GEMINI_API_KEY || "",
});

const DB_NAME = 'aspire_db';
const COLLECTION_NAME = 'transcripts';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fileData, fileName, transcriptId, forceRegenerate } = body;

    if (!fileData) {
      return NextResponse.json(
        { success: false, message: "File data is required" },
        { status: 400 }
      );
    }

    // ============================================
    // 1. CEK CACHE DATABASE
    // ============================================
    if (transcriptId && !forceRegenerate) {
      const client = await clientPromise;
      const db = client.db(DB_NAME);
      const collection = db.collection(COLLECTION_NAME);

      const existingTranscript = await collection.findOne({ _id: new ObjectId(transcriptId) });

      if (existingTranscript?.recommendations) {
        console.log("✅ Using cached recommendations from database");
        return NextResponse.json({ 
          success: true, 
          data: existingTranscript.recommendations,
          cached: true 
        }, { status: 200 });
      }
    }

    // Tentukan MIME type
    let mimeType = "application/pdf";
    if (fileName?.endsWith(".png")) mimeType = "image/png";
    if (fileName?.endsWith(".jpg") || fileName?.endsWith(".jpeg")) mimeType = "image/jpeg";

    // ============================================
    // 2. LANGKAH 1: EKSTRAKSI TEKS (OCR)
    // ============================================
    console.log("📄 Extracting transcript text...");
    
    // Kita panggil AI khusus untuk membaca teks saja
    const extractionResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            { text: "Extract all text content from this academic transcript. Return ONLY the raw text with subject names and grades, no formatting or explanation." },
            {
              inlineData: {
                mimeType: mimeType,
                data: fileData, 
              },
            },
          ],
        },
      ],
    });

    const transcriptText = extractionResponse.text || "";
    console.log("✅ Transcript extracted (preview):", transcriptText.substring(0, 100) + "...");

    // ============================================
    // 3. LANGKAH 2: ANALISIS KARIR (PROMPT UTAMA)
    // ============================================
    // Kita masukkan text yang sudah diextract ke dalam prompt
    
    const prompt = `
You are an expert Career Counselor and Data Analyst.

STUDENT TRANSCRIPT DATA:
${transcriptText}

TASK: Analyze the transcript text above and provide ALL suitable career path recommendations.

ANALYSIS INSTRUCTIONS:
1. **Transcript Analysis**: Use the extracted text to identify strengths (e.g., specific high grades in Math/Science -> STEM).
2. **Internal Knowledge**: Use your internal training data to generate ACCURATE, REALISTIC market data (Salary, Growth, Tools) for 2024-2025.
3. **Matching**: Suggest 4-8 careers. Specialized profile = fewer, focused careers. Generalist = broader options.

OUTPUT REQUIREMENTS (STRICT):
Return ONLY a valid JSON array. NO markdown.
Each recommendation object MUST follow this EXACT structure:

[
  {
    "id": "1",
    "name": "Career Title",
    "percentage": 30,
    "color": "#FFD93D",
    "description": "Personalized description based on the transcript.",
    "details": ["Skill 1", "Skill 2", "Skill 3", "Skill 4"],
    "tags": ["Tag 1", "Tag 2"],
    "salary": "$XX,XXX - $XXX,XXX", 
    "tools": ["Tool 1", "Tool 2", "Tool 3"],
    "stats": { "logic": 85, "creativity": 60, "social": 45 },
    "careerPath": [
      { "level": "Entry", "years": "0-2y" },
      { "level": "Mid", "years": "2-5y" },
      { "level": "Senior", "years": "5-8y" },
      { "level": "Lead", "years": "8y+" }
    ],
    "dayInLife": [
      { "activity": "Main Task", "percentage": 40 },
      { "activity": "Side Task", "percentage": 30 },
      { "activity": "Collab", "percentage": 20 },
      { "activity": "Study", "percentage": 10 }
    ],
    "growthMetrics": {
      "demand": 90, 
      "growth": "+22% yearly", 
      "trend": "rising" 
    },
    "industries": ["Ind A", "Ind B"],
    "learningResources": [
      { "platform": "Coursera", "type": "Course" },
      { "platform": "Udemy", "type": "Bootcamp" }
    ],
    "similarCareers": ["Alt 1", "Alt 2"]
  }
]

CRITICAL RULES:
1. **Percentages**: The "percentage" field represents match strength. **ALL percentages across all recommendations MUST sum to EXACTLY 100%**.
2. **Colors**: Use: #FFD93D, #FF90E8, #4DE1C1, #FFA07A, #A78BFA, #FB923C, #34D399, #60A5FA.
3. **Salary**: Must be in USD format "$XX,XXX - $XXX,XXX".
4. **DayInLife**: Percentages inside this array must sum to 100%.
`;

    console.log("🚀 Generating recommendations...");
    
    // Panggil AI lagi untuk analisis, kali ini cukup kirim prompt teks karena data transkrip sudah ada di dalam prompt
    const analysisResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
    });

    const textResponse = analysisResponse.text;

    if (!textResponse) {
        throw new Error("No response text received from AI");
    }
    
    // Bersihkan format markdown
    const cleanedText = textResponse.replace(/```json/g, "").replace(/```/g, "").trim();
    
    let recommendations;
    try {
        recommendations = JSON.parse(cleanedText);
    } catch (parseError) {
        console.error("JSON Parse Error:", parseError);
        console.error("Raw Text:", cleanedText);
        throw new Error("Failed to parse AI response as JSON");
    }

    // ============================================
    // 4. SIMPAN KE DATABASE
    // ============================================
    if (transcriptId && recommendations) {
      const client = await clientPromise;
      const db = client.db(DB_NAME);
      
      await db.collection(COLLECTION_NAME).updateOne(
        { _id: new ObjectId(transcriptId) },
        { 
          $set: { 
            recommendations: recommendations,
            updatedAt: new Date()
          } 
        }
      );
      console.log("💾 Saved to DB");
    }

    return NextResponse.json({ 
      success: true, 
      data: recommendations,
      cached: false 
    }, { status: 200 });

  } catch (error: any) {
    console.error("LLM Error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to generate recommendations" },
      { status: 500 }
    );
  }
}