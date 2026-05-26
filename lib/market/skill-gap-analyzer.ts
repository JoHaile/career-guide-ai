import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { extractExperienceGaps } from "./skill-extractor";
import { upsertCareerRoleForJob } from "./career-role";
import { getOrCreateSalaryBenchmark } from "./salary-benchmark";
import { buildSkillGapAnalysis } from "@/lib/ai/skill-gap";
import { friendlyAiMessage } from "@/lib/ai/messages";

export interface UserProfileForAnalysis {
  skills: { name: string; proficiency: number }[];
  workExperience: {
    role: string;
    company: string;
    description: string;
  }[];
  currentTitle?: string | null;
  careerGoal?: string | null;
}

export interface SkillGapAnalysisResult {
  skillGapId: string;
  matchPercentage: number;
  missingSkills: string[];
  matchedSkills: string[];
  experienceGaps: string[];
  reportSummary: string;
  strengths: string[];
  recommendations: string[];
  roleId: string | null;
  source: "gemini" | "fallback";
  warning: string | null;
  salaryBenchmark: {
    jobTitle: string;
    region: string;
    percentile25: number | null;
    median: number | null;
    percentile75: number | null;
  } | null;
}

export async function analyzeSkillGap(
  userId: string,
  jobId: string,
  profile: UserProfileForAnalysis
): Promise<SkillGapAnalysisResult> {
  const job = await prisma.jobListing.findUnique({ where: { id: jobId } });
  if (!job) throw new Error("Job not found");

  const requiredSkills = Array.isArray(job.requiredSkills)
    ? (job.requiredSkills as string[])
    : [];

  let matchedSkills: string[] = [];
  let missingSkills: string[] = [];
  let experienceGaps: string[] = [];
  let matchPercentage = 0;
  let reportSummary = "";
  let strengths: string[] = [];
  let recommendations: string[] = [];
  let source: "gemini" | "fallback" = "fallback";
  let warning: string | null = null;

  const ai = await buildSkillGapAnalysis({
    jobTitle: job.title,
    company: job.company,
    jobDescription: job.description.slice(0, 3000),
    requiredSkills,
    userSkills: profile.skills,
    workExperience: profile.workExperience,
    currentTitle: profile.currentTitle,
  });

  if (ai.analysis) {
    source = ai.source;
    warning = ai.warning;
    matchPercentage = Math.min(100, Math.max(0, ai.analysis.matchPercentage));
    matchedSkills = ai.analysis.matchedSkills;
    missingSkills = ai.analysis.missingSkills;
    experienceGaps = ai.analysis.experienceGaps;
    reportSummary = ai.analysis.reportSummary;
    strengths = ai.analysis.strengths;
    recommendations = ai.analysis.recommendations;
  } else {
    warning = ai.warning ? friendlyAiMessage(ai.warning) : friendlyAiMessage(new Error("ai"));
    const userSkillNames = new Set(profile.skills.map((s) => s.name.toLowerCase()));
    for (const required of requiredSkills) {
      const lower = required.toLowerCase();
      const matched = [...userSkillNames].some(
        (u) => u.includes(lower) || lower.includes(u)
      );
      if (matched) matchedSkills.push(required);
      else missingSkills.push(required);
    }
    const userExpText = profile.workExperience
      .map((e) => `${e.role} ${e.description}`)
      .join(" ");
    experienceGaps = extractExperienceGaps(job.description, userExpText);
    matchPercentage = Math.round(
      (matchedSkills.length / Math.max(requiredSkills.length, 1)) * 100
    );
    reportSummary = `${matchPercentage}% match for ${job.title} at ${job.company}.`;
    recommendations = [
      "Add more skills to your profile",
      "Focus on the missing skills listed below",
    ];
  }

  if (warning) warning = friendlyAiMessage(warning);

  const allMissing = [...missingSkills, ...experienceGaps];
  const role = await upsertCareerRoleForJob(job.title, requiredSkills);
  const salaryBenchmark = await getOrCreateSalaryBenchmark(job.title, job.location);

  const skillGap = await prisma.skillGap.create({
    data: {
      userId,
      roleId: role?.id ?? null,
      jobId: job.id,
      missingSkills: allMissing,
      matchPercentage: new Prisma.Decimal(matchPercentage),
      reportSummary,
    },
  });

  return {
    skillGapId: skillGap.id,
    matchPercentage,
    missingSkills,
    matchedSkills,
    experienceGaps,
    reportSummary,
    strengths,
    recommendations,
    roleId: role?.id ?? null,
    source,
    warning,
    salaryBenchmark: {
      jobTitle: salaryBenchmark.jobTitle,
      region: salaryBenchmark.region,
      percentile25: salaryBenchmark.percentile25
        ? Number(salaryBenchmark.percentile25)
        : null,
      median: salaryBenchmark.median ? Number(salaryBenchmark.median) : null,
      percentile75: salaryBenchmark.percentile75
        ? Number(salaryBenchmark.percentile75)
        : null,
    },
  };
}

export async function getUserProfileForAnalysis(userId: string) {
  const resume = await prisma.resume.findFirst({
    where: { userId, isPrimary: true },
    include: { workExperience: true },
  });
  const userSkills = await prisma.userSkill.findMany({
    where: { userId },
    include: { skill: true },
  });
  const profile = await prisma.userProfile.findUnique({ where: { userId } });

  return {
    skills: userSkills.map((us) => ({
      name: us.skill.name,
      proficiency: us.proficiencyLevel,
    })),
    workExperience: (resume?.workExperience ?? []).map((we) => ({
      role: we.role,
      company: we.company,
      description: we.descriptionBullets,
    })),
    currentTitle: profile?.currentTitle,
    careerGoal: profile?.bio,
  };
}
