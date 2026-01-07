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
// FUNGSI MEMBERSIHKAN TEKS
// ============================================
function cleanAndSummarizeTranscript(text: string): string {
  console.log(`🧹 Cleaning transcript text (${text.length} chars)...`);
  
  // Hapus karakter null, replacement character, dan whitespace berlebih
  const cleaned = text
    .replace(/\uFFFD/g, '') // Hapus replacement character
    .replace(/[\x00-\x09\x0B-\x0C\x0E-\x1F\x7F]/g, '') // Hapus control chars
    .replace(/\s+/g, ' ') // Collapse whitespace jadi satu spasi
    .trim();

  // Batas aman token
  const MAX_CHARS = 25000; 
  
  if (cleaned.length > MAX_CHARS) {
    console.log(`⚠️ Text is very long (${cleaned.length} chars), truncating to ${MAX_CHARS}...`);
    return cleaned.substring(0, MAX_CHARS) + "\n...[Truncated]";
  }
  
  console.log(`✅ Final text length: ${cleaned.length} characters`);
  return cleaned;
}

// ============================================
// FUNGSI EXTRACT TEXT DARI PDF
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
                      fullText += decodeURIComponent(textRun.T) + ' ';
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
// FUNGSI OCR UNTUK IMAGE (OpenAI Vision)
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

    // CEK CACHE: Menggunakan 'recommendations' (field umum)
    if (existingTranscript.recommendations && !forceRegenerate) {
      // Opsional: Anda mungkin ingin mengecek apakah format datanya sesuai 'Course' atau 'Career'
      // Tapi untuk simplicity, kita anggap cache valid.
      console.log("✅ Using cached recommendations");
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
    
    const cleanedText = cleanAndSummarizeTranscript(transcriptText);

    // ============================================
    // 4. GENERATE COURSE RECOMMENDATIONS
    // ============================================
    console.log("🤖 Generating course recommendations with OpenAI...");

    const coursePrompt = `You are an Elite Academic Strategist and Technical Recruiter with deep knowledge of university curriculums and industry demands.

STUDENT PROFILE (TRANSCRIPT CONTENT):
${cleanedText}

YOUR MISSION:
1.  **Decode**: Analyze the messy OCR text to identify the student's actual subjects and grades. Ignore low grades in irrelevant subjects; focus on their peaks.
2.  **Cluster**: Group their strongest subjects into 4-6 distinct "Competency Domains" (e.g., "Full-Stack Development", "Statistical Analysis", "Digital Product Management").
3.  **Bridge**: Connect their academic past to their professional future with specific, actionable advice.

OUTPUT REQUIREMENTS (STRICT JSON):
Return ONLY valid JSON. No markdown formatting.

{
  "domains": [
    {
      "id": "1",
      "name": "Professional Domain Name (e.g., Cloud Architecture)",
      "percentage": 40,
      "color": "#FFD93D",
      "tagline": "A powerful, marketing-style 3-5 word slogan for this persona.",
      "description": "A deep, insightful analysis (3-4 sentences) explaining WHY they fit this domain. Reference specific patterns in their grades (e.g., 'Your strong performance in Calculus combined with Algorithms suggests...').",
      "evidence": [
        { "subject": "Exact Subject Name From Text", "grade": "The Grade" },
        { "subject": "Another Related Subject", "grade": "The Grade" }
      ],
      "hardSkills": [
        "Specific Tool/Framework (e.g., React.js)",
        "Industry Concept (e.g., CI/CD)",
        "Technical Skill (e.g., SQL Optimization)"
      ],
      "projectIdeas": [
        "Idea 1: A complex, portfolio-ready project title (e.g., 'Real-time Crypto Dashboard using WebSocket'). Mention the tech stack.",
        "Idea 2: Another impressive capstone-level project idea."
      ],
      "keyStrength": "One specific academic superpower (e.g., 'Algorithmic Logic' or 'Visual Storytelling').",
      "areaToImprove": "One critical gap they need to fill to be hired in this domain.",
      "academicStats": [
        { "label": "Consistency", "score": 85, "reason": "Explain based on grade variance." },
        { "label": "Theoretical Depth", "score": 75, "reason": "Based on theory-heavy courses." },
        { "label": "Practical Application", "score": 60, "reason": "Based on lab/project courses." }
      ],
      "learningPlatforms": [
        { "name": "Coursera", "course": "Exact Name of a Top-Rated Specialization" },
        { "name": "Udemy", "course": "Exact Name of a Bestseller Bootcamp" }
      ],
      "relatedRoles": ["Specific Job Title 1", "Specific Job Title 2", "Specific Job Title 3"],
      "actionPlan": "A concrete, immediate next step (e.g., 'Build a portfolio site hosting your X project')."
    }
  ]
}

RULES:
1.  **Diversity**: Generate exactly 3 or 4 domains.
2.  **Percentages**: MUST sum to exactly 100%.
3.  **Colors**: Use strictly from: #FFD93D, #FF90E8, #4DE1C1, #FFA07A, #A78BFA.
4.  **Specificity**: Do not use generic terms like "Communication" or "Hard Working". Use industry terms like "Stakeholder Management" or "System Architecture".
5.  **Platforms**: ensure 'learningPlatforms' is an array of OBJECTS with 'name' and 'course' keys.
`;

    const chatCompletion = await openai.chat.completions.create({
      model: "gpt-5-nano-2025-08-07",
      messages: [
        { role: "system", content: "You are an academic strategist. Output only JSON." },
        { role: "user", content: coursePrompt }
      ],
      temperature: 1, 
      max_completion_tokens: 16000, 
      response_format: { type: "json_object" },
    });

    const textResponse = chatCompletion.choices[0]?.message?.content;
    
    if (!textResponse) {
      console.error("❌ OpenAI returned empty response.");
      throw new Error("AI provider returned no data.");
    }

    const cleanedResponse = textResponse.replace(/```json/g, "").replace(/```/g, "").trim();
    
    let recommendations;
    try {
      const parsed = JSON.parse(cleanedResponse);
      // Handle variasi output
      recommendations = parsed.domains || parsed.data || (Array.isArray(parsed) ? parsed : [parsed]);
      
      if (!Array.isArray(recommendations) || recommendations.length === 0) {
        throw new Error("Invalid domains structure");
      }
    } catch (parseError) {
      console.error("❌ JSON Parse Error:", parseError); 
      console.error("Raw response snippet:", textResponse.substring(0, 200));
      throw new Error("Failed to parse AI response.");
    }

    // ============================================
    // 5. SAVE TO DATABASE
    // ============================================
    // Menggunakan field 'recommendations' sesuai tipe yang ada (akan menimpa data career)
    await collection.updateOne(
      { _id: new ObjectId(transcriptId) },
      { $set: { recommendations: recommendations, updatedAt: new Date() } }
    );

    console.log("✅ Course recommendations saved to 'recommendations' field");

    return NextResponse.json({ success: true, data: recommendations, cached: false }, { status: 200 });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error("❌ Process Error:", errorMessage);
    return NextResponse.json({ success: false, message: errorMessage }, { status: 500 });
  }
}