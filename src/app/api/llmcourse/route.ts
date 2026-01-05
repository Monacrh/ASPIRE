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

    // Cek Cache untuk Course
    if (existingTranscript.recommendations && !forceRegenerate) {
      console.log("✅ Using cached course recommendations");
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
        // ✅ DETEKSI resource_type dari URL yang tersimpan di database
        let resourceType: 'image' | 'raw' | 'video' = 'raw';
        
        // Cek dari URL: apakah '/image/upload/' atau '/raw/upload/'
        if (existingTranscript.fileUrl.includes('/image/upload/')) {
          resourceType = 'image';
        } else if (existingTranscript.fileUrl.includes('/raw/upload/')) {
          resourceType = 'raw';
        } else if (existingTranscript.fileUrl.includes('/video/upload/')) {
          resourceType = 'video';
        } else {
          // Fallback: deteksi dari file extension
          const fileName = existingTranscript.fileName.toLowerCase();
          if (fileName.endsWith('.png') || fileName.endsWith('.jpg') || fileName.endsWith('.jpeg')) {
            resourceType = 'image';
          } else {
            resourceType = 'raw';
          }
        }

        console.log("📋 Debug Info:");
        console.log("  - Original URL:", existingTranscript.fileUrl);
        console.log("  - Public ID:", existingTranscript.filePublicId);
        console.log("  - Detected Resource Type:", resourceType);

        // Generate Signed URL
        const signedUrl = cloudinary.url(existingTranscript.filePublicId, {
          resource_type: resourceType,
          type: 'upload',
          sign_url: true,
          secure: true,
        });

        console.log("⬇️ Fetching file from Cloudinary (signed):", signedUrl);

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
        } else if (response.status === 401 || response.status === 403) {
          console.error(`❌ Access Denied (Status: ${response.status})`);
          return NextResponse.json({ 
            success: false, 
            message: "Gagal mengakses file. Periksa konfigurasi Cloudinary API Key.",
            code: "ACCESS_DENIED"
          }, { status: 403 });
        } else if (!response.ok) {
          throw new Error(`Cloudinary Error: ${response.status} - ${response.statusText}`);
        } else {
          // Success
          const arrayBuffer = await response.arrayBuffer();
          base64Data = Buffer.from(arrayBuffer).toString("base64");
          console.log("✅ File successfully fetched and converted to base64");
        }

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
    // 4. GENERATE COURSE RECOMMENDATIONS
    // ============================================
    console.log("🤖 Generating course recommendations with AI...");

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

OUTPUT FORMAT: 
Return ONLY a valid JSON array with NO additional text, markdown, or explanation.

JSON Structure:
[
  {
    "id": "1",
    "name": "Data Science & Analytics", 
    "percentage": 40,
    "color": "#FFD93D",
    "tagline": "Natural talent for uncovering patterns in numbers.",
    "description": "Your profile demonstrates a strong analytical mindset with consistent performance in data-related subjects. You show particular strength in statistical reasoning and pattern recognition.",
    
    "evidence": [
      { "subject": "STATISTIKA", "grade": "AB" },
      { "subject": "ANALISIS JEJARING SOSIAL", "grade": "A" },
      { "subject": "DATA MINING", "grade": "A" }
    ],

    "hardSkills": ["Python", "SQL", "Regression Analysis", "Data Visualization"],
    "projectIdeas": ["Predictive Analysis Project", "Big Data Optimization", "ML Model Development"],

    "keyStrength": "Statistical Interpretation",
    "areaToImprove": "Database Management",
    
    "academicStats": [
      { "label": "Consistency", "score": 85, "reason": "Stable performance across all math and stats subjects." },
      { "label": "Theoretical Depth", "score": 90, "reason": "High scores in complex theory exams and conceptual understanding." },
      { "label": "Practical Application", "score": 75, "reason": "Good lab scores but slightly lower than theoretical performance." }
    ],

    "learningPlatforms": ["DataCamp", "Kaggle", "Coursera"],
    "relatedRoles": ["Data Analyst", "Data Scientist", "Business Intelligence Analyst"],
    "actionPlan": "Deepen your understanding of SQL and database optimization. Practice with real-world datasets on Kaggle."
  }
]

IMPORTANT RULES:
- Percentages MUST sum to exactly 100%
- Colors MUST be from: #FFD93D, #FF90E8, #4DE1C1, #FFA07A, #A78BFA, #60A5FA
- academicStats MUST have exactly 3 metrics with scores 0-100
- Only include subjects with valid grades in evidence
- Return ONLY the JSON array, no markdown code blocks
- No explanations before or after the JSON
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
    
    let recommendations;
    try {
      recommendations = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error("❌ JSON Parse Error:", parseError);
      console.error("Raw response:", textResponse);
      throw new Error("Failed to parse AI response as JSON");
    }

    console.log("✅ Course recommendations generated successfully");

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
    console.error("❌ LLM Course Error:", error);
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