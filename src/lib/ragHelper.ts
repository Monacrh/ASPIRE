// src/lib/ragHelper.ts

import { GoogleGenAI } from "@google/genai";
import { careerDatabase, createCareerSearchText, CareerKnowledge } from "./careerDatabase";

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_GEMINI_API_KEY || "",
});

// Cache untuk embeddings (agar tidak perlu generate ulang setiap request)
let careerEmbeddingsCache: { career: CareerKnowledge; embedding: number[] }[] | null = null;

/**
 * Generate text embedding menggunakan Gemini
 */
async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const result = await ai.models.embedContent({
      model: "text-embedding-004",
      contents: text,
    });
    
    if (!result.embeddings || result.embeddings.length === 0) {
      throw new Error("No embeddings returned from API");
    }
    
    const embedding = result.embeddings[0].values;
    if (!embedding) {
      throw new Error("Embedding values are undefined");
    }
    
    return embedding;
  } catch (error) {
    console.error("Embedding generation error:", error);
    throw error;
  }
}

/**
 * Cosine similarity calculation
 */
function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Initialize career embeddings (call once on server start or lazy load)
 */
export async function initializeCareerEmbeddings() {
  if (careerEmbeddingsCache) return careerEmbeddingsCache;
  
  console.log("Generating career embeddings...");
  
  const embeddings = await Promise.all(
    careerDatabase.map(async (career) => {
      const searchText = createCareerSearchText(career);
      const embedding = await generateEmbedding(searchText);
      return { career, embedding };
    })
  );
  
  careerEmbeddingsCache = embeddings;
  console.log(`✅ Generated ${embeddings.length} career embeddings`);
  
  return embeddings;
}

/**
 * Parse transcript and extract student profile
 */
export interface StudentProfile {
  subjects: { name: string; grade: string; score: number }[];
  strengths: string[];
  weaknesses: string[];
  avgScore: number;
  topSubjects: string[];
}

export function parseTranscriptText(transcriptText: string): StudentProfile {
  // This is a simplified parser - you'd want to make this more robust
  // For now, we'll extract basic patterns
  
  const subjectPattern = /([A-Za-z\s]+)\s+([A-F][+-]?|\d+)/g;
  const subjects: { name: string; grade: string; score: number }[] = [];
  
  let match;
  while ((match = subjectPattern.exec(transcriptText)) !== null) {
    const name = match[1].trim();
    const grade = match[2];
    const score = gradeToScore(grade);
    subjects.push({ name, grade, score });
  }
  
  // Calculate strengths and weaknesses
  const avgScore = subjects.reduce((sum, s) => sum + s.score, 0) / subjects.length;
  const strengths = subjects.filter(s => s.score >= 85).map(s => s.name);
  const weaknesses = subjects.filter(s => s.score < 70).map(s => s.name);
  const topSubjects = subjects
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map(s => s.name);
  
  return { subjects, strengths, weaknesses, avgScore, topSubjects };
}

function gradeToScore(grade: string): number {
  const gradeMap: { [key: string]: number } = {
    'A+': 97, 'A': 93, 'A-': 90,
    'B+': 87, 'B': 83, 'B-': 80,
    'C+': 77, 'C': 73, 'C-': 70,
    'D+': 67, 'D': 63, 'D-': 60,
    'F': 50
  };
  
  // If numeric grade
  if (!isNaN(Number(grade))) {
    return Number(grade);
  }
  
  return gradeMap[grade.toUpperCase()] || 75;
}

/**
 * Create search query from student profile
 */
function createStudentQuery(profile: StudentProfile): string {
  return `
    Student with strong academic performance in: ${profile.topSubjects.join(', ')}.
    Average score: ${profile.avgScore.toFixed(1)}.
    Key strengths in: ${profile.strengths.join(', ')}.
    Looking for careers that match these academic strengths and interests.
    ${profile.strengths.length > 3 ? 'Diverse skill set with multiple strong areas.' : 'Specialized focus in core subjects.'}
  `.trim();
}

/**
 * Main RAG function: Search relevant careers based on transcript
 */
export async function searchRelevantCareers(
  transcriptText: string,
  topK: number = 10
): Promise<{ career: CareerKnowledge; score: number }[]> {
  // 1. Initialize embeddings if not already done
  const careerEmbeddings = await initializeCareerEmbeddings();
  
  // 2. Parse student transcript
  const studentProfile = parseTranscriptText(transcriptText);
  
  // 3. Create search query
  const searchQuery = createStudentQuery(studentProfile);
  
  // 4. Generate embedding for search query
  const queryEmbedding = await generateEmbedding(searchQuery);
  
  // 5. Calculate similarity scores
  const results = careerEmbeddings.map(({ career, embedding }) => ({
    career,
    score: cosineSimilarity(queryEmbedding, embedding)
  }));
  
  // 6. Sort by score and return top K
  return results
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}

/**
 * Calculate grade-based match score
 */
export function calculateGradeMatch(
  profile: StudentProfile,
  career: CareerKnowledge
): number {
  let matchScore = 0;
  let totalWeight = 0;
  
  for (const threshold of career.gradeThresholds) {
    const studentSubject = profile.subjects.find(
      s => s.name.toLowerCase().includes(threshold.subject.toLowerCase()) ||
           threshold.subject.toLowerCase().includes(s.name.toLowerCase())
    );
    
    if (studentSubject) {
      const requiredScore = gradeToScore(threshold.minimumGrade);
      const weight = threshold.importance === 'critical' ? 1.0 : 
                     threshold.importance === 'important' ? 0.6 : 0.3;
      
      if (studentSubject.score >= requiredScore) {
        matchScore += (studentSubject.score / 100) * weight;
      } else {
        matchScore += ((studentSubject.score / requiredScore) * 0.5) * weight;
      }
      
      totalWeight += weight;
    }
  }
  
  return totalWeight > 0 ? (matchScore / totalWeight) * 100 : 50;
}