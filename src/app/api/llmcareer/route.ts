// src/app/api/llm/route.ts
import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

// 🔑 Initialize Gemini API
const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_GEMINI_API_KEY || "",
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { severity, deficiencyType, diagnosis } = body;

    // 🧩 Validate input
    if (!severity || !deficiencyType || !diagnosis) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing required fields (severity, deficiencyType, diagnosis)",
        },
        { status: 400 }
      );
    }

    // 🪄 Improved prompt with strict formatting
    const prompt = `
You are a compassionate career counselor specializing in color vision deficiency. 
A person has just received their color vision test results and needs personalized career guidance.

Begin your response now:
`;

    // 🤖 Call Gemini model
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
    });

    // 🧾 Get text from response and clean formatting
    const recommendation = response.text;

    if (!recommendation) {
      throw new Error("No response generated from AI model");
    }

    // Clean and format the response
    const cleanedRecommendation = recommendation
      .replace(/\*\*(.*?)\*\*/g, '**$1**') // Ensure bold formatting
      .replace(/###/g, '##') // Normalize headers
      .replace(/\n{3,}/g, '\n\n') // Remove excessive newlines
      .replace(/##\s+\*\*/g, '## **') // Ensure consistent spacing
      .trim();

    // Verify the response has the required sections
    const requiredSections = [
      '## **1. Personalized Assessment**',
      '## **2. Understanding Your Condition**',
      '## **3. Career Paths - Highly Recommended**',
      '## **4. Careers Requiring Accommodations**',
      '## **5. Careers to Avoid**',
      '## **6. Assistive Technology & Tools**',
      '## **7. Success Strategies**',
      '## **8. Closing Encouragement**'
    ];

    const hasAllSections = requiredSections.every(section => 
      cleanedRecommendation.includes(section)
    );

    if (!hasAllSections) {
      console.warn('LLM response missing some sections, but proceeding anyway');
    }

    return NextResponse.json(
      {
        success: true,
        recommendation: cleanedRecommendation,
        metadata: {
          model: "gemini-2.0-flash",
          generatedAt: new Date().toISOString(),
          sectionsPresent: hasAllSections,
          contentLength: cleanedRecommendation.length
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error generating career recommendation:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to generate career recommendation",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

// 🧭 GET endpoint for API status check
export async function GET() {
  try {
    const hasKey = !!process.env.GOOGLE_GEMINI_API_KEY;
    const apiStatus = hasKey ? "configured" : "missing_api_key";
    
    return NextResponse.json(
      {
        success: true,
        message: "Career recommendation API is active",
        status: apiStatus,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "API configuration error",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}