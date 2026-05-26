import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function upsertCareerRoleForJob(
  jobTitle: string,
  requiredSkills: string[]
) {
  const title = jobTitle.trim();

  let role = await prisma.careerRole.findUnique({
    where: { title },
    include: { requiredSkills: { include: { skill: true } } },
  });

  if (!role) {
    role = await prisma.careerRole.create({
      data: {
        title,
        description: `Career role derived from job listings for ${title}`,
        demandLevel: "medium",
      },
      include: { requiredSkills: { include: { skill: true } } },
    });
  }

  for (let i = 0; i < requiredSkills.length; i++) {
    const skillName = requiredSkills[i];
    let skill = await prisma.skill.findUnique({
      where: { name: skillName },
    });

    if (!skill) {
      skill = await prisma.skill.create({
        data: {
          name: skillName,
          category: "Technical",
        },
      });
    }

    const existing = await prisma.requiredSkill.findFirst({
      where: { roleId: role.id, skillId: skill.id },
    });

    if (!existing) {
      await prisma.requiredSkill.create({
        data: {
          roleId: role.id,
          skillId: skill.id,
          importance: Math.max(1, 10 - Math.floor(i / 3)),
        },
      });
    }
  }

  return prisma.careerRole.findUnique({
    where: { id: role.id },
    include: { requiredSkills: { include: { skill: true } } },
  });
}

export function estimateSalaryForTitle(title: string): {
  percentile25: number;
  median: number;
  percentile75: number;
} {
  const lower = title.toLowerCase();

  if (
    lower.includes("senior") ||
    lower.includes("lead") ||
    lower.includes("principal") ||
    lower.includes("architect")
  ) {
    return { percentile25: 75000, median: 95000, percentile75: 120000 };
  }
  if (
    lower.includes("junior") ||
    lower.includes("entry") ||
    lower.includes("intern") ||
    lower.includes("graduate")
  ) {
    return { percentile25: 35000, median: 45000, percentile75: 55000 };
  }
  if (
    lower.includes("manager") ||
    lower.includes("director") ||
    lower.includes("head")
  ) {
    return { percentile25: 80000, median: 105000, percentile75: 140000 };
  }
  if (
    lower.includes("developer") ||
    lower.includes("engineer") ||
    lower.includes("programmer")
  ) {
    return { percentile25: 55000, median: 72000, percentile75: 95000 };
  }
  if (lower.includes("designer") || lower.includes("ux")) {
    return { percentile25: 45000, median: 60000, percentile75: 80000 };
  }
  if (lower.includes("analyst") || lower.includes("data")) {
    return { percentile25: 50000, median: 68000, percentile75: 90000 };
  }

  return { percentile25: 40000, median: 55000, percentile75: 75000 };
}
