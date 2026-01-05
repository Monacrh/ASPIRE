import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import clientPromise from "@/src/lib/mongodb";
import { ObjectId } from "mongodb";
import { Transcript } from "@/src/types/transcript";
import { v2 as cloudinary } from 'cloudinary';

// ============================================
// KONFIGURASI CLOUDINARY
// ============================================
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_GEMINI_API_KEY || "",
});

const DB_NAME = 'aspire_db';
const COLLECTION_NAME = 'transcripts';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { transcriptId, forceRegenerate } = body;

    if (!transcriptId) {
      return NextResponse.json(
        { success: false, message: "Transcript ID is required" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const collection = db.collection<Transcript>(COLLECTION_NAME);

    // ============================================
    // 1. AMBIL DATA DARI DB
    // ============================================
    const existingTranscript = await collection.findOne({ _id: new ObjectId(transcriptId) });

    if (!existingTranscript) {
      return NextResponse.json({ success: false, message: "Transcript not found" }, { status: 404 });
    }

    // Cek Cache
    if (existingTranscript.recommendations && !forceRegenerate) {
      console.log("✅ Using cached career recommendations");
      return NextResponse.json({ 
        success: true, 
        data: existingTranscript.recommendations,
        cached: true 
      }, { status: 200 });
    }

    // ============================================
    // 2. PERSIAPAN FILE (FETCH DARI CLOUDINARY DENGAN SIGNED URL)
    // ============================================
    let base64Data = "";

    if (existingTranscript.fileUrl && existingTranscript.filePublicId) {
      console.log("🔐 Generating signed URL for:", existingTranscript.filePublicId);
      
      try {
        // Deteksi resource_type dari filePublicId atau fileName
        let resourceType: 'image' | 'raw' | 'video' = 'raw';
        const fileName = existingTranscript.fileName.toLowerCase();
        
        if (fileName.endsWith('.pdf') || fileName.endsWith('.doc') || fileName.endsWith('.docx')) {
          resourceType = 'raw';
        } else if (fileName.endsWith('.png') || fileName.endsWith('.jpg') || fileName.endsWith('.jpeg')) {
          resourceType = 'image';
        }

        // Generate Signed URL yang valid 1 jam
        const signedUrl = cloudinary.url(existingTranscript.filePublicId, {
          resource_type: resourceType,
          type: 'upload',
          sign_url: true,
          secure: true,
        });

        console.log("⬇️ Fetching file from Cloudinary (signed):", signedUrl);
        console.log("📋 Debug Info:");
        console.log("  - Original URL:", existingTranscript.fileUrl);
        console.log("  - Public ID:", existingTranscript.filePublicId);
        console.log("  - Resource Type:", resourceType);

        const response = await fetch(signedUrl, {
          headers: {
            "User-Agent": "Mozilla/5.0 (compatible; AspireBot/1.0)"
          }
        });

        // Handle error responses
        if (response.status === 404) {
          console.error("❌ File Not Found on Cloudinary (Status: 404)");
          console.error("🔍 Trying alternative method: Direct fetch from fileUrl");
          
          // ✅ FALLBACK: Coba fetch langsung dari fileUrl
          try {
            const directResponse = await fetch(existingTranscript.fileUrl);
            if (directResponse.ok) {
              console.log("✅ Success fetching from direct URL");
              const arrayBuffer = await directResponse.arrayBuffer();
              base64Data = Buffer.from(arrayBuffer).toString("base64");
            } else {
              throw new Error("Direct URL also failed");
            }
          } catch (fallbackError) {
            return NextResponse.json({ 
              success: false, 
              message: "File tidak ditemukan di server penyimpanan. Silakan hapus dan upload ulang transcript ini.",
              code: "FILE_NOT_FOUND",
              debug: {
                publicId: existingTranscript.filePublicId,
                url: existingTranscript.fileUrl,
                signedUrl: signedUrl
              }
            }, { status: 404 });
          }
        }

        if (response.status === 401 || response.status === 403) {
          console.error(`❌ Access Denied (Status: ${response.status})`);
          return NextResponse.json({ 
            success: false, 
            message: "Gagal mengakses file. Periksa konfigurasi Cloudinary API Key.",
            code: "ACCESS_DENIED"
          }, { status: 403 });
        }

        if (!response.ok) {
          throw new Error(`Cloudinary Error: ${response.status} - ${response.statusText}`);
        }

        const arrayBuffer = await response.arrayBuffer();
        base64Data = Buffer.from(arrayBuffer).toString("base64");
        console.log("✅ File successfully fetched and converted to base64");

      } catch (fetchError: any) {
        console.error("❌ Cloudinary Fetch Error:", fetchError.message);
        return NextResponse.json({ 
          success: false, 
          message: `Gagal mengunduh file: ${fetchError.message}`,
          code: "FETCH_ERROR"
        }, { status: 500 });
      }
    } 
    else if (existingTranscript.fileData) {
      console.log("📂 Using stored Base64 data from MongoDB");
      base64Data = existingTranscript.fileData;
    } 
    else {
      return NextResponse.json({ 
        success: false, 
        message: "Data file tidak ditemukan (URL atau Base64 hilang)",
        code: "NO_FILE_DATA"
      }, { status: 404 });
    }

    // ============================================
    // 3. EKSTRAKSI TEKS DARI FILE
    // ============================================
    let mimeType = "application/pdf";
    const fileName = existingTranscript.fileName.toLowerCase();
    if (fileName.endsWith(".png")) mimeType = "image/png";
    if (fileName.endsWith(".jpg") || fileName.endsWith(".jpeg")) mimeType = "image/jpeg";

    console.log("📄 Extracting transcript text...");
    
    const extractionResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash", 
      contents: [
        {
          role: "user",
          parts: [
            { 
              text: "Extract all text content from this academic transcript. Return ONLY the raw text with subject names and grades, no formatting or explanation." 
            },
            {
              inlineData: {
                mimeType: mimeType,
                data: base64Data, 
              },
            },
          ],
        },
      ],
    });

    const transcriptText = extractionResponse.text || "";
    if (!transcriptText) {
      throw new Error("Failed to extract text from document");
    }

    console.log("✅ Text extracted successfully");

    // ============================================
    // 4. GENERATE CAREER RECOMMENDATIONS
    // ============================================
    console.log("🤖 Generating career recommendations with AI...");

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

    const analysisResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    const textResponse = analysisResponse.text;
    if (!textResponse) {
      throw new Error("No response text received from AI");
    }
    
    // Clean up response
    const cleanedText = textResponse
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();
    
    const recommendations = JSON.parse(cleanedText);

    console.log("✅ Career recommendations generated successfully");

    // ============================================
    // 5. SAVE TO DATABASE
    // ============================================
    await collection.updateOne(
      { _id: new ObjectId(transcriptId) },
      { 
        $set: { 
          recommendations: recommendations, 
          updatedAt: new Date() 
        } 
      }
    );

    console.log("✅ Recommendations saved to database");

    return NextResponse.json({ 
      success: true, 
      data: recommendations, 
      cached: false 
    }, { status: 200 });

  } catch (error: any) {
    console.error("❌ LLM Career Error:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: error.message || "Failed to generate recommendations",
        code: "PROCESSING_ERROR"
      },
      { status: 500 }
    );
  }
}