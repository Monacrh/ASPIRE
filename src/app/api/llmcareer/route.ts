import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/src/lib/mongodb";
import { ObjectId } from "mongodb";
import { Transcript } from "@/src/types/transcript";
import { v2 as cloudinary } from 'cloudinary';
import OpenAI from "openai";
import PDFParser from "pdf2json";

// ============================================
// KONFIGURASI CLOUDINARY
// ============================================
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ============================================
// KONFIGURASI OPENAI
// ============================================
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
});

const DB_NAME = 'aspire_db';
const COLLECTION_NAME = 'transcripts';

// ============================================
// FUNGSI UNTUK MEMBERSIHKAN TEKS (SEDERHANA)
// ============================================
function cleanAndSummarizeTranscript(text: string): string {
  console.log(`🧹 Cleaning transcript text (${text.length} chars)...`);
  
  // Hapus karakter null, replacement character, dan whitespace berlebih
  const cleaned = text
    .replace(/\uFFFD/g, '') // Hapus replacement character
    .replace(/[\x00-\x09\x0B-\x0C\x0E-\x1F\x7F]/g, '') // Hapus control chars
    .replace(/\s+/g, ' ') // Collapse whitespace jadi satu spasi
    .trim();

  // FIX: Jangan gunakan Regex kompleks untuk memotong teks.
  // Model AI sekarang kuat menampung hingga 100.000+ karakter.
  // 6000-20000 karakter masih sangat aman.
  
  const MAX_CHARS = 25000; // Batas aman yang sangat besar
  
  if (cleaned.length > MAX_CHARS) {
    console.log(`⚠️ Text is very long (${cleaned.length} chars), truncating to ${MAX_CHARS}...`);
    return cleaned.substring(0, MAX_CHARS) + "\n...[Truncated]";
  }
  
  console.log(`✅ Final text length: ${cleaned.length} characters (No aggressive summarization)`);
  return cleaned;
}

// ============================================
// FUNGSI EXTRACT TEXT DARI PDF dengan pdf2json
// ============================================
async function extractTextFromPDF(base64Data: string): Promise<string> {
  console.log("📄 Extracting text from PDF with pdf2json...");
  
  return new Promise((resolve, reject) => {
    try {
      const pdfParser = new PDFParser();
      
      pdfParser.on("pdfParser_dataReady", (pdfData) => {
        try {
          let fullText = '';
          
          if (pdfData.Pages) {
            for (const page of pdfData.Pages) {
              if (page.Texts) {
                for (const text of page.Texts) {
                  for (const textRun of text.R) {
                    if (textRun.T) {
                      const decodedText = decodeURIComponent(textRun.T);
                      fullText += decodedText + ' ';
                    }
                  }
                }
              }
              fullText += '\n';
            }
          }
          
          console.log(`✅ PDF parsed successfully (${pdfData.Pages?.length || 0} pages)`);
          resolve(fullText.trim());
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Unknown error';
          reject(new Error(`Failed to process PDF data: ${errorMessage}`));
        }
      });
      
      pdfParser.on("pdfParser_dataError", (errData: Error | { parserError: Error }) => {
        const errorMessage = errData instanceof Error 
          ? errData.message 
          : ('parserError' in errData ? errData.parserError.message : 'Unknown PDF error');
        console.error("❌ PDF Parse Error:", errorMessage);
        reject(new Error(`PDF parsing failed: ${errorMessage}`));
      });
      
      const buffer = Buffer.from(base64Data, 'base64');
      pdfParser.parseBuffer(buffer);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error("❌ PDF Parser Error:", errorMessage);
      reject(new Error(`PDF extraction failed: ${errorMessage}`));
    }
  });
}

// ============================================
// FUNGSI OCR UNTUK IMAGE dengan OpenAI Vision
// ============================================
async function extractTextFromImage(base64Data: string, mimeType: string): Promise<string> {
  console.log("🖼️ Extracting text from image with OpenAI Vision...");
  
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4.1-nano-2025-04-14",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Extract ALL text content from this academic transcript. Return ONLY the raw text with subject names and grades. Include everything you can read. No formatting, no explanation, just the text."
            },
            {
              type: "image_url",
              image_url: {
                url: `data:${mimeType};base64,${base64Data}`
              }
            }
          ]
        }
      ],
      max_tokens: 4096,
      temperature: 0.1,
    });

    const extractedText = response.choices[0]?.message?.content || "";
    
    if (!extractedText) {
      throw new Error("No text extracted from image");
    }
    
    console.log("✅ Text extracted with OpenAI Vision");
    return extractedText;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error("❌ OpenAI Vision Error:", errorMessage);
    throw new Error(`Image extraction failed: ${errorMessage}`);
  }
}

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
    // 2. PERSIAPAN FILE
    // ============================================
    let base64Data = "";

    if (existingTranscript.fileUrl && existingTranscript.filePublicId) {
      try {
        let resourceType: 'image' | 'raw' | 'video' = 'raw';
        
        // Deteksi tipe resource cloudinary
        if (existingTranscript.fileUrl.includes('/image/upload/')) resourceType = 'image';
        else if (existingTranscript.fileUrl.includes('/raw/upload/')) resourceType = 'raw';
        else {
            const fName = existingTranscript.fileName.toLowerCase();
            if (fName.endsWith('.png') || fName.endsWith('.jpg') || fName.endsWith('.jpeg')) resourceType = 'image';
        }

        const signedUrl = cloudinary.url(existingTranscript.filePublicId, {
          resource_type: resourceType,
          type: 'upload',
          sign_url: true,
          secure: true,
        });

        console.log("⬇️ Fetching file from Cloudinary...");
        const response = await fetch(signedUrl);

        if (!response.ok) {
          console.warn("⚠️ Signed URL failed, trying direct URL...");
          const directResponse = await fetch(existingTranscript.fileUrl);
          if (directResponse.ok) {
             const arrayBuffer = await directResponse.arrayBuffer();
             base64Data = Buffer.from(arrayBuffer).toString("base64");
          } else {
             throw new Error("Failed to fetch file from both Signed and Direct URLs");
          }
        } else {
          const arrayBuffer = await response.arrayBuffer();
          base64Data = Buffer.from(arrayBuffer).toString("base64");
        }
      } catch (fetchError) {
        console.error("❌ Fetch Error:", fetchError);
        return NextResponse.json({ success: false, message: "Gagal mengunduh file" }, { status: 500 });
      }
    } else if (existingTranscript.fileData) {
      base64Data = existingTranscript.fileData;
    } else {
      return NextResponse.json({ success: false, message: "Data file hilang" }, { status: 404 });
    }

    // ============================================
    // 3. EKSTRAKSI TEKS
    // ============================================
    const fileName = existingTranscript.fileName.toLowerCase();
    let transcriptText = "";

    if (fileName.endsWith('.pdf')) {
      transcriptText = await extractTextFromPDF(base64Data);
    } else if (fileName.match(/\.(png|jpg|jpeg)$/)) {
      const mimeType = fileName.endsWith('.png') ? "image/png" : "image/jpeg";
      transcriptText = await extractTextFromImage(base64Data, mimeType);
    } else {
      return NextResponse.json({ success: false, message: "Unsupported file" }, { status: 400 });
    }
    
    // PENTING: Gunakan fungsi clean yang BARU (tanpa regex pemotong)
    const cleanedText = cleanAndSummarizeTranscript(transcriptText);

    // ============================================
    // 4. GENERATE CAREER RECOMMENDATIONS
    // ============================================
    console.log("🤖 Generating career recommendations with OpenAI...");

    const recommendationPrompt = `You are an expert Career Counselor with 15 years of experience in academic advising and career planning.

STUDENT PROFILE (TRANSCRIPT CONTENT):
${cleanedText}

TASK: 
1. Analyze the student's academic strengths, weaknesses, and patterns from the transcript above.
2. Based on that analysis, provide 4-8 COMPREHENSIVE career recommendations. 
3. For each career, provide DETAILED, SPECIFIC information tailored to this student.

IMPORTANT: Be thorough and detailed. Don't use generic descriptions. Match the student's background to specific career paths.

Return ONLY valid JSON with this EXACT structure:
{
  "recommendations": [
    {
      "id": "1",
      "name": "Specific Career Title (be precise, not generic)",
      "percentage": 18,
      "color": "#FFD93D",
      "description": "Write 3-4 detailed sentences explaining WHY this career matches the student's transcript. Reference specific courses or strengths.",
      "details": [
        "Specific technical skill related to their coursework",
        "Another specific skill they need to develop",
        "Soft skill relevant to this career",
        "Domain knowledge from their studies",
        "Additional technical competency",
        "Professional skill for career growth"
      ],
      "tags": ["Tag1", "Tag2", "Tag3", "Tag4"],
      "salary": "$50,000 - $90,000",
      "tools": ["Specific Tool 1", "Specific Tool 2", "Specific Tool 3", "Specific Tool 4", "Specific Tool 5"],
      "stats": { "logic": 85, "creativity": 60, "social": 45 },
      "careerPath": [
        { "level": "Entry Level Position Name", "years": "0-2y" },
        { "level": "Mid-Level Position Name", "years": "2-5y" },
        { "level": "Senior Position Name", "years": "5-8y" },
        { "level": "Lead/Executive Position", "years": "8y+" }
      ],
      "dayInLife": [
        { "activity": "Specific main task", "percentage": 35 },
        { "activity": "Another specific activity", "percentage": 25 },
        { "activity": "Collaboration/meetings", "percentage": 20 },
        { "activity": "Learning/research", "percentage": 12 },
        { "activity": "Administrative", "percentage": 8 }
      ],
      "growthMetrics": {
        "demand": 90,
        "growth": "+22% yearly",
        "trend": "rising"
      },
      "industries": ["Specific Industry 1", "Specific Industry 2", "Specific Industry 3"],
      "learningResources": [
        { "platform": "Coursera", "type": "Specific Course" },
        { "platform": "Udemy", "type": "Specific Bootcamp" },
        { "platform": "YouTube/Other", "type": "Additional resource" }
      ],
      "similarCareers": ["Related Career 1", "Related Career 2", "Related Career 3"]
    }
  ]
}

CRITICAL REQUIREMENTS:
1. **Generate 6-8 careers** to give students options.
2. **Percentages**: MUST sum to exactly 100%.
3. **Colors**: Use palette: #FFD93D, #FF90E8, #4DE1C1, #FFA07A, #A78BFA, #FB923C, #34D399, #60A5FA.
4. **Skills/Tools**: Be specific (e.g., "Python, PyTorch" NOT just "Programming").
5. **Output**: Return ONLY the JSON object with "recommendations" key.`;

    const chatCompletion = await openai.chat.completions.create({
      model: "gpt-5-nano-2025-08-07",
      messages: [
        { role: "system", content: "You are a career counselor. Output only JSON." },
        { role: "user", content: recommendationPrompt }
      ],
      temperature: 1, 
      max_completion_tokens: 16000, 
      response_format: { type: "json_object" },
    });

    const textResponse = chatCompletion.choices[0]?.message?.content;
    
    // ERROR HANDLING YANG LEBIH BAIK
    if (!textResponse) {
      console.error("❌ OpenAI returned empty response. Transcript length:", cleanedText.length);
      throw new Error("AI provider returned no data. Please try again.");
    }

    const cleanedResponse = textResponse.replace(/```json/g, "").replace(/```/g, "").trim();
    
    let recommendations;
    try {
      const parsed = JSON.parse(cleanedResponse);
      recommendations = parsed.recommendations || parsed.data || parsed.careers || (Array.isArray(parsed) ? parsed : [parsed]);
      
      if (!Array.isArray(recommendations) || recommendations.length === 0) {
        throw new Error("Invalid recommendations structure");
      }
    } catch (parseError) {
      console.error("❌ JSON Parse Error. Raw response:", textResponse.substring(0, 200));
      throw new Error("Failed to parse AI response.");
    }

    // ============================================
    // 5. SAVE TO DATABASE
    // ============================================
    await collection.updateOne(
      { _id: new ObjectId(transcriptId) },
      { $set: { recommendations: recommendations, updatedAt: new Date() } }
    );

    console.log("✅ Recommendations saved successfully");

    return NextResponse.json({ success: true, data: recommendations, cached: false }, { status: 200 });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error("❌ Process Error:", errorMessage);
    return NextResponse.json({ success: false, message: errorMessage }, { status: 500 });
  }
}