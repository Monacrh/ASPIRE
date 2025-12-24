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

    // Validasi input dasar
    if (!fileData) {
      return NextResponse.json(
        { success: false, message: "File data is required" },
        { status: 400 }
      );
    }

    // --- 1. CEK CACHE / DATA YANG SUDAH ADA ---
    // Jika transcriptId ada, kita coba cek DB dulu
    if (transcriptId) {
      const client = await clientPromise;
      const db = client.db(DB_NAME);
      const collection = db.collection(COLLECTION_NAME);

      // Ambil dokumen transcript
      const existingTranscript = await collection.findOne({ _id: new ObjectId(transcriptId) });

      // Jika data sudah ada DAN tidak dipaksa regenerate, kembalikan data lama
      if (existingTranscript?.recommendations && !forceRegenerate) {
        return NextResponse.json({ 
          success: true, 
          data: existingTranscript.recommendations,
          cached: true // Flag untuk memberi tahu frontend ini data lama
        }, { status: 200 });
      }
    }

    // --- 2. JIKA BELUM ADA / FORCE REGENERATE, PANGGIL AI ---
    let mimeType = "application/pdf";
    if (fileName?.endsWith(".png")) mimeType = "image/png";
    if (fileName?.endsWith(".jpg") || fileName?.endsWith(".jpeg")) mimeType = "image/jpeg";

    const prompt = `
You are an expert Career Counselor and Data Analyst specializing in academic performance analysis and career path recommendations.

TASK: Analyze the attached academic transcript and provide ALL suitable career path recommendations based on the student's academic profile.

ANALYSIS REQUIREMENTS:
1. Examine the student's academic performance across all subjects
2. Identify patterns in grades (highest performing subjects, consistent strengths, areas of struggle)
3. Evaluate subject categories: STEM, Humanities, Arts, Social Sciences, Languages
4. Consider grade trends (improving, declining, or stable performance)
5. Assess the academic level and difficulty of courses taken
6. Look for specializations or focused areas of study

RECOMMENDATION CRITERIA:
- Analyze the transcript deeply and suggest ALL genuinely suitable career paths (minimum 3, no maximum limit)
- If the student shows diverse strengths, provide MORE career options (could be 5, 8, 10+ careers)
- If the student is highly specialized, provide fewer but highly relevant options
- Career paths MUST align with the student's demonstrated academic strengths
- The percentage represents the PROPORTION of suitability among ALL suggested careers
- **CRITICAL**: ALL percentages MUST sum to exactly 100% (this is for pie chart visualization)
- Ensure diversity: include technical, creative, analytical, and people-oriented careers when applicable
- Consider both traditional and emerging career opportunities
- Base salary ranges on current market standards (MUST USE USD ONLY, format: $XX,XXX - $XXX,XXX)
- Provide realistic and actionable career roadmaps

OUTPUT FORMAT:
Return ONLY a valid JSON array with NO markdown formatting (no \`\`\`json tags).
Provide as many career recommendations as genuinely fit the student's profile (minimum 3, no maximum).
Each recommendation must follow this exact structure:

[
  {
    "id": "1",
    "name": "Career Title (e.g., Data Scientist)",
    "percentage": 25,
    "color": "#FFD93D",
    "description": "A compelling 2-3 sentence description that captures the essence of this role and why it fits the student's profile. Make it inspiring and realistic.",
    "details": [
      "Core Skill 1 (e.g., Statistical Analysis)",
      "Core Skill 2 (e.g., Machine Learning)",
      "Core Skill 3 (e.g., Data Visualization)",
      "Core Skill 4 (e.g., Python Programming)"
    ],
    "tags": [
      "Short Tag 1 (e.g., High Demand)",
      "Short Tag 2 (e.g., Analytical)"
    ],
    "salary": "$80,000 - $120,000",
    "tools": [
      "Tool/Technology 1",
      "Tool/Technology 2",
      "Tool/Technology 3",
      "Tool/Technology 4"
    ],
    "stats": {
      "logic": 85,
      "creativity": 60,
      "social": 45
    },
    "careerPath": [
      { "level": "Junior/Entry Role", "years": "0-2y" },
      { "level": "Mid-Level Role", "years": "2-5y" },
      { "level": "Senior Role", "years": "5-8y" },
      { "level": "Lead/Director Role", "years": "8y+" }
    ],
    "dayInLife": [
      { "activity": "Primary Activity", "percentage": 40 },
      { "activity": "Secondary Activity", "percentage": 30 },
      { "activity": "Collaborative Work", "percentage": 20 },
      { "activity": "Learning & Development", "percentage": 10 }
    ],
    "growthMetrics": {
      "demand": 90,
      "growth": "+25% yearly",
      "trend": "rising"
    },
    "industries": [
      "Industry 1",
      "Industry 2",
      "Industry 3"
    ],
    "learningResources": [
      { "platform": "Coursera", "type": "Specialization Course" },
      { "platform": "Udemy", "type": "Practical Bootcamp" },
      { "platform": "LinkedIn Learning", "type": "Skill Path" }
    ],
    "similarCareers": [
      "Related Career 1",
      "Related Career 2",
      "Related Career 3"
    ]
  }
]

IMPORTANT RULES:
1. Use DISTINCT colors for each career (choose from: #FFD93D, #FF90E8, #4DE1C1, #FFA07A, #A78BFA, #FB923C, #34D399, #60A5FA, #F87171, #FBBF24)
2. **CRITICAL**: ALL percentages across ALL careers MUST sum to EXACTLY 100% (for pie chart distribution)
3. The percentage represents the WEIGHT/PROPORTION of each career among all recommendations
4. Higher percentage = stronger alignment with transcript, but all must total 100%
5. Order careers from highest to lowest percentage
6. Salary MUST be in USD format: "$XX,XXX - $XXX,XXX" (e.g., "$60,000 - $95,000") - NO OTHER CURRENCY
7. Stats (logic, creativity, social) should total around 180-200 for realistic balance
8. dayInLife percentages MUST total exactly 100% for each career
9. Provide specific, real tools and platforms (not generic placeholders)
10. Growth metrics should reflect actual market trends for 2024-2025
11. Career paths should be realistic and industry-standard
12. Learning resources should be real, accessible platforms
13. Suggest as many careers as appropriate - if transcript shows diverse strengths, include more options (5, 8, 10+ careers are fine)

ANALYSIS APPROACH:
- For strong math/science grades → Consider STEM careers (Engineering, Data Science, Medicine)
- For high language/literature scores → Consider Communication, Writing, Teaching, Law
- For arts/design excellence → Consider Creative, UX/UI, Architecture, Marketing
- For social science strengths → Consider Business, HR, Psychology, Social Work
- For balanced performance → Consider hybrid roles (Product Management, Consulting)
- For leadership indicators → Emphasize management track potential

Remember: Quality over quantity. Each recommendation should be thoughtful, data-driven, and genuinely helpful to the student's future.

PERCENTAGE CALCULATION GUIDE:
- Think of percentages as slices of a pie chart that MUST total 100%
- Distribute based on strength of alignment: strongest fit gets largest percentage
- The number of careers affects distribution:
  * 3 careers example: 45%, 35%, 20% (total = 100%)
  * 5 careers example: 30%, 25%, 20%, 15%, 10% (total = 100%)
  * 8 careers example: 18%, 16%, 14%, 12%, 11%, 10%, 10%, 9% (total = 100%)
  * 10 careers example: 15%, 13%, 12%, 11%, 10%, 10%, 9%, 8%, 7%, 5% (total = 100%)
- Minimum percentage per career should be around 5% to be visible in the chart
- Don't suggest careers just to fill numbers - only include genuinely suitable paths

DECISION TREE FOR NUMBER OF CAREERS:
- Highly specialized transcript (strong in 1-2 areas) → 3-5 careers
- Balanced performance across multiple areas → 5-8 careers  
- Diverse excellence in many subjects → 8-12 careers
- Focus on QUALITY and RELEVANCE, not hitting a specific number
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash", 
      contents: [
        {
          role: "user",
          parts: [
            { text: prompt },
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

    const textResponse = response.text;

    if (!textResponse) {
        throw new Error("No response text received from AI");
    }
    
    // Bersihkan format markdown jika ada
    const cleanedText = textResponse.replace(/```json/g, "").replace(/```/g, "").trim();
    
    let recommendations;
    try {
        recommendations = JSON.parse(cleanedText);
    } catch (parseError) {
        console.error("JSON Parse Error:", parseError);
        console.error("Raw Text:", cleanedText);
        throw new Error("Failed to parse AI response as JSON");
    }

    // --- 3. SIMPAN HASIL KE DATABASE (UPDATE) ---
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
    }

    return NextResponse.json({ 
      success: true, 
      data: recommendations,
      cached: false // Flag bahwa ini data baru
    }, { status: 200 });

  } catch (error: any) {
    console.error("LLM Error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to generate recommendations" },
      { status: 500 }
    );
  }
}