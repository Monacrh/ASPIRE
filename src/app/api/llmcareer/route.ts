import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { searchRelevantCareers, calculateGradeMatch, parseTranscriptText } from "@/src/lib/ragHelper";
import clientPromise from "@/src/lib/mongodb";
import { ObjectId } from "mongodb";
import { Transcript } from "@/src/types/transcript";

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_GEMINI_API_KEY || "",
});

const DB_NAME = "aspire_db";
const COLLECTION_NAME = "transcripts";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fileData, fileName, transcriptId, forceRegenerate = false } = body;

    if (!fileData) {
      return NextResponse.json(
        { success: false, message: "File data is required" },
        { status: 400 }
      );
    }

    // ============================================
    // CHECK IF RECOMMENDATIONS ALREADY EXIST (Skip if forceRegenerate)
    // ============================================
    if (transcriptId && !forceRegenerate) {
      const client = await clientPromise;
      const db = client.db(DB_NAME);
      
      const existingTranscript = await db.collection<Transcript>(COLLECTION_NAME).findOne({
        _id: new ObjectId(transcriptId)
      });

      if (existingTranscript?.recommendations) {
        console.log("✅ Using cached recommendations from database");
        return NextResponse.json({ 
          success: true, 
          data: existingTranscript.recommendations,
          cached: true 
        }, { status: 200 });
      }
    }

    // ============================================
    // GENERATE NEW RECOMMENDATIONS
    // ============================================

    // Tentukan MIME type sederhana
    let mimeType = "application/pdf";
    if (fileName?.endsWith(".png")) mimeType = "image/png";
    if (fileName?.endsWith(".jpg") || fileName?.endsWith(".jpeg")) mimeType = "image/jpeg";

    console.log("📄 Extracting transcript text...");
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
    console.log("✅ Transcript extracted:", transcriptText.substring(0, 200) + "...");

    console.log("🔍 Searching relevant careers using RAG...");
    const relevantCareers = await searchRelevantCareers(transcriptText, 12);
    
    const studentProfile = parseTranscriptText(transcriptText);
    
    const careersWithScores = relevantCareers.map(({ career, score: embeddingScore }) => {
      const gradeMatchScore = calculateGradeMatch(studentProfile, career);
      const finalScore = (embeddingScore * 0.6) + (gradeMatchScore * 0.4);
      
      return {
        career,
        embeddingScore,
        gradeMatchScore,
        finalScore
      };
    });

    const topCareers = careersWithScores
      .sort((a, b) => b.finalScore - a.finalScore)
      .slice(0, 8);

    console.log("✅ Found relevant careers:", topCareers.map(c => c.career.title).join(", "));

    const careerContext = topCareers.map(({ career, finalScore }) => `
**${career.title}** (Match Score: ${finalScore.toFixed(1)}%)
- Description: ${career.description}
- Required Subjects: ${career.requiredSubjects.join(", ")}
- Key Skills: ${career.requiredSkills.join(", ")}
- Academic Profile: ${career.academicProfile}
- Salary: ${career.salaryRange}
- Growth: ${career.growthRate}
- Demand Level: ${career.demandLevel}/100
- Trend: ${career.trend}
- Industries: ${career.industries.join(", ")}
- Tools: ${career.tools.join(", ")}
- Tags: ${career.tags.join(", ")}
`).join("\n---\n");

    const prompt = `
You are an expert Career Counselor with access to a comprehensive career knowledge base.

STUDENT TRANSCRIPT DATA:
${transcriptText}

RELEVANT CAREERS FROM KNOWLEDGE BASE (Ranked by Match Score):
${careerContext}

TASK: Using the above career knowledge base and the student's transcript, generate personalized career recommendations.

ANALYSIS REQUIREMENTS:
1. Use the provided career options as your PRIMARY reference
2. Analyze which careers best match the student's academic strengths
3. Consider the match scores but apply your own judgment based on transcript details
4. You can recommend 4-8 careers depending on the student's profile diversity
5. Prioritize careers with high match scores (>70%) but feel free to include emerging opportunities if relevant

RECOMMENDATION RULES:
- **CRITICAL**: ALL percentages MUST sum to exactly 100%
- Percentages represent the proportion/weight of each career among all recommendations
- Higher percentage = stronger alignment with transcript
- Order careers from highest to lowest percentage
- Include careers from the knowledge base that genuinely fit the student
- Use the salary ranges, tools, and details from the knowledge base
- Salary MUST be in USD format: "$XX,XXX - $XXX,XXX"

OUTPUT FORMAT:
Return ONLY valid JSON (no markdown formatting):

[
  {
    "id": "1",
    "name": "Career Title from Knowledge Base",
    "percentage": 30,
    "color": "#FFD93D",
    "description": "Enhanced description based on student's specific strengths and the knowledge base",
    "details": ["Core Skill 1", "Core Skill 2", "Core Skill 3", "Core Skill 4"],
    "tags": ["Tag1", "Tag2"],
    "salary": "$XX,XXX - $XXX,XXX",
    "tools": ["Tool1", "Tool2", "Tool3", "Tool4"],
    "stats": {
      "logic": 85,
      "creativity": 60,
      "social": 45
    },
    "careerPath": [
      { "level": "Junior Role", "years": "0-2y" },
      { "level": "Mid-Level", "years": "2-5y" },
      { "level": "Senior", "years": "5-8y" },
      { "level": "Lead/Director", "years": "8y+" }
    ],
    "dayInLife": [
      { "activity": "Primary Activity", "percentage": 40 },
      { "activity": "Secondary Activity", "percentage": 30 },
      { "activity": "Collaboration", "percentage": 20 },
      { "activity": "Learning", "percentage": 10 }
    ],
    "growthMetrics": {
      "demand": 90,
      "growth": "+25% yearly",
      "trend": "rising"
    },
    "industries": ["Industry1", "Industry2", "Industry3"],
    "learningResources": [
      { "platform": "Coursera", "type": "Specialization" },
      { "platform": "Udemy", "type": "Bootcamp" }
    ],
    "similarCareers": ["Related Career 1", "Related Career 2"]
  }
]

IMPORTANT:
1. Use DISTINCT colors: #FFD93D, #FF90E8, #4DE1C1, #FFA07A, #A78BFA, #FB923C, #34D399, #60A5FA
2. ALL percentages MUST sum to exactly 100%
3. Use information from the knowledge base for accuracy
4. Personalize descriptions based on the student's transcript
5. dayInLife percentages must total 100% per career
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 3000,
      },
    });

    const textResponse = response.text;

    if (!textResponse) {
      throw new Error("No response text received from AI");
    }
    
    const cleanedText = textResponse.replace(/```json/g, "").replace(/```/g, "").trim();
    
    let recommendations;
    try {
      recommendations = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error("JSON Parse Error:", parseError);
      console.error("Raw Text:", cleanedText);
      throw new Error("Failed to parse AI response as JSON");
    }

    // Validasi percentage total = 100
    const totalPercentage = recommendations.reduce((sum: number, rec: any) => sum + rec.percentage, 0);
    if (Math.abs(totalPercentage - 100) > 1) {
      console.warn(`⚠️ Percentage sum is ${totalPercentage}%, adjusting to 100%`);
      const factor = 100 / totalPercentage;
      recommendations = recommendations.map((rec: any) => ({
        ...rec,
        percentage: Math.round(rec.percentage * factor),
      }));
    }

    console.log("✅ Generated recommendations:", recommendations.length, "careers");

    // ============================================
    // SAVE TO DATABASE
    // ============================================
    if (transcriptId) {
      const client = await clientPromise;
      const db = client.db(DB_NAME);
      
      await db.collection<Transcript>(COLLECTION_NAME).updateOne(
        { _id: new ObjectId(transcriptId) },
        { 
          $set: { 
            recommendations: recommendations,
            updatedAt: new Date()
          }
        }
      );
      
      console.log("💾 Recommendations saved to database");
    }

    return NextResponse.json({ 
      success: true, 
      data: recommendations,
      cached: false 
    }, { status: 200 });

  } catch (error: any) {
    console.error("LLM Error:", error);
    
    // Handle quota exceeded
    if (error.message?.includes("quota") || error.message?.includes("429") || error.status === 429) {
      return NextResponse.json(
        {
          success: false,
          message: "API quota exceeded. Please wait a few minutes and try again.",
          error: "QUOTA_EXCEEDED",
        },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { success: false, message: error.message || "Failed to generate recommendations" },
      { status: 500 }
    );
  }
}