import { prisma } from "@/lib/prisma";
import { estimateSalaryForTitle } from "./career-role";
import { Prisma } from "@prisma/client";

export async function getOrCreateSalaryBenchmark(
  jobTitle: string,
  region: string
) {
  const existing = await prisma.salaryBenchmark.findFirst({
    where: {
      jobTitle: { equals: jobTitle, mode: "insensitive" },
      region: { equals: region, mode: "insensitive" },
    },
  });

  if (existing) return existing;

  const estimated = estimateSalaryForTitle(jobTitle);

  return prisma.salaryBenchmark.create({
    data: {
      jobTitle,
      region,
      percentile25: new Prisma.Decimal(estimated.percentile25),
      median: new Prisma.Decimal(estimated.median),
      percentile75: new Prisma.Decimal(estimated.percentile75),
    },
  });
}
