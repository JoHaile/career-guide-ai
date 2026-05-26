"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateJson, generateText, isGeminiConfigured } from "@/lib/gemini/client";
import type { ResumeState, ParsedResumeContent } from "@/lib/resume/types";

/**
 * Save resume state to user's database record
 */
export async function saveResumeStateAction(
  resumeData: ResumeState
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        resumeData: resumeData as any,
      },
    });

    return { success: true, data: user.resumeData };
  } catch (error) {
    console.error("[v0] Failed to save resume:", error);
    return { success: false, error: "Failed to save resume" };
  }
}

/**
 * Load resume state from user's database record
 */
export async function loadResumeStateAction() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { resumeData: true },
    });

    if (!user?.resumeData) {
      return { success: true, data: null };
    }

    return { success: true, data: user.resumeData };
  } catch (error) {
    console.error("[v0] Failed to load resume:", error);
    return { success: false, error: "Failed to load resume" };
  }
}

/**
 * Parse uploaded resume file using Gemini
 * Expects file content as base64 string
 */
export async function parseResumeFileAction(
  fileContent: string,
  fileName: string
): Promise<{
  success: boolean;
  data?: ParsedResumeContent;
  error?: string;
}> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    if (!isGeminiConfigured()) {
      return { success: false, error: "AI service not configured" };
    }

    // Determine file type from extension
    const isPlainText = fileName.endsWith('.txt');
    
    // Create prompt for parsing
    const prompt = `You are a resume parser. Extract the following information from this resume and return it as JSON:
- Contact information (name, email, phone, location, website, LinkedIn)
- Professional summary or objective
- Work experience (company, role, dates, description/bullets)
- Education (institution, degree, field of study, graduation year, GPA)
- Skills (name, category, proficiency level if mentioned)

Resume content:
${fileContent}

Return a JSON object with this structure:
{
  "contact": { "name": "", "email": "", "phone": "", "location": "", "website": "", "linkedIn": "" },
  "summary": "",
  "experience": [{ "id": "", "company": "", "role": "", "startDate": "", "endDate": "", "description": "", "highlights": [] }],
  "education": [{ "id": "", "institution": "", "degree": "", "fieldOfStudy": "", "startDate": "", "endDate": "", "graduationYear": 0, "gpa": "" }],
  "skills": [{ "id": "", "name": "", "proficiency": "", "category": "" }],
  "parseQuality": "high|medium|low",
  "parseWarnings": []
}

Be thorough and extract all relevant information. For missing fields, use empty strings or null.`;

    const parsed = await generateJson<ParsedResumeContent>(prompt);

    return {
      success: true,
      data: {
        ...parsed,
        rawText: fileContent,
      },
    };
  } catch (error) {
    console.error("[v0] Resume parsing failed:", error);
    return { success: false, error: "Failed to parse resume" };
  }
}

/**
 * Generate professional summary for a resume using AI
 */
export async function generateResumeSummaryAction(
  jobTitle: string,
  yearsExperience: number,
  skills: string[],
  achievements: string[]
): Promise<{
  success: boolean;
  summary?: string;
  error?: string;
}> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    if (!isGeminiConfigured()) {
      return { success: false, error: "AI service not configured" };
    }

    const prompt = `Write a professional 2-3 sentence resume summary for a ${jobTitle} with ${yearsExperience} years of experience.

Key skills: ${skills.join(", ")}
Key achievements: ${achievements.join(", ")}

Make it compelling, action-oriented, and ATS-friendly. Avoid clichés.`;

    const summary = await generateText(prompt);

    return {
      success: true,
      summary: summary.trim(),
    };
  } catch (error) {
    console.error("[v0] Summary generation failed:", error);
    return { success: false, error: "Failed to generate summary" };
  }
}

/**
 * Optimize resume bullet points using AI
 */
export async function optimizeBulletsAction(
  bullets: string[]
): Promise<{
  success: boolean;
  optimizedBullets?: string[];
  error?: string;
}> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    if (!isGeminiConfigured()) {
      return { success: false, error: "AI service not configured" };
    }

    const prompt = `Optimize these resume bullet points to be more impactful, quantifiable, and ATS-friendly. 
Return a JSON array of improved bullets.

Original bullets:
${bullets.map((b, i) => `${i + 1}. ${b}`).join("\n")}

Return format: { "bullets": ["optimized bullet 1", "optimized bullet 2", ...] }`;

    const result = await generateJson<{ bullets: string[] }>(prompt);

    return {
      success: true,
      optimizedBullets: result.bullets,
    };
  } catch (error) {
    console.error("[v0] Bullet optimization failed:", error);
    return { success: false, error: "Failed to optimize bullets" };
  }
}

/**
 * Get resume tailoring suggestions for a job posting
 */
export async function getTailoringAdviceAction(
  resumeSummary: string,
  resumeSkills: string[],
  jobDescription: string
): Promise<{
  success: boolean;
  advice?: {
    skillsToEmphasize: string[];
    skillsToAdd: string[];
    bulletPointSuggestions: string[];
    overallAdvice: string;
  };
  error?: string;
}> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    if (!isGeminiConfigured()) {
      return { success: false, error: "AI service not configured" };
    }

    const prompt = `Analyze this resume and job description to provide tailoring advice.

Resume Summary:
${resumeSummary}

Resume Skills:
${resumeSkills.join(", ")}

Job Description:
${jobDescription}

Return a JSON object with this structure:
{
  "skillsToEmphasize": ["skill1", "skill2"],
  "skillsToAdd": ["skill3"],
  "bulletPointSuggestions": ["suggestion1", "suggestion2"],
  "overallAdvice": "General advice on tailoring this resume for the role"
}`;

    const advice = await generateJson<{
      skillsToEmphasize: string[];
      skillsToAdd: string[];
      bulletPointSuggestions: string[];
      overallAdvice: string;
    }>(prompt);

    return {
      success: true,
      advice,
    };
  } catch (error) {
    console.error("[v0] Tailoring advice failed:", error);
    return { success: false, error: "Failed to get tailoring advice" };
  }
}
