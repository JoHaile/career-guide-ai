import { prisma } from "@/lib/prisma";
import { fetchArbeitnowJobs } from "./arbeitnow";
import { normalizeArbeitnowJob } from "./normalize";
import type { JobListItem } from "./types";
import { Prisma } from "@prisma/client";

export async function syncJobsToDatabase(
  externalIds?: string[]
): Promise<number> {
  const apiJobs = await fetchArbeitnowJobs();
  const toSync = externalIds
    ? apiJobs.filter((j) => externalIds.includes(j.slug))
    : apiJobs;

  let synced = 0;

  for (const apiJob of toSync) {
    const normalized = normalizeArbeitnowJob(apiJob);

    await prisma.jobListing.upsert({
      where: { externalId: normalized.externalId },
      update: {
        title: normalized.title,
        company: normalized.company,
        location: normalized.location,
        locationType: normalized.locationType,
        description: normalized.description,
        requiredSkills: normalized.requiredSkills,
        postedDate: normalized.postedDate,
        source: normalized.source,
      },
      create: {
        externalId: normalized.externalId,
        title: normalized.title,
        company: normalized.company,
        location: normalized.location,
        locationType: normalized.locationType,
        description: normalized.description,
        requiredSkills: normalized.requiredSkills,
        postedDate: normalized.postedDate,
        source: normalized.source,
      },
    });
    synced++;
  }

  return synced;
}

export function toJobListItem(
  job: {
    id: string;
    externalId: string | null;
    title: string;
    company: string;
    location: string;
    locationType: string | null;
    description: string;
    requiredSkills: Prisma.JsonValue;
    postedDate: Date | null;
    source: string | null;
  },
  extras?: { url?: string; remote?: boolean; tags?: string[]; jobTypes?: string[] }
): JobListItem {
  const skills = job.requiredSkills;
  const requiredSkills = Array.isArray(skills)
    ? (skills as string[])
    : typeof skills === "string"
      ? [skills]
      : null;

  return {
    id: job.id,
    externalId: job.externalId,
    title: job.title,
    company: job.company,
    location: job.location,
    locationType: job.locationType,
    description: job.description,
    requiredSkills,
    postedDate: job.postedDate?.toISOString() ?? null,
    source: job.source,
    ...extras,
  };
}
