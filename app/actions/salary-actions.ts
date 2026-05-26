"use server";

import { headers } from "next/headers";
import { getMarketInsights, getSalaryBenchmark, estimatePersonalSalary } from "@/lib/salary/benchmarks";
import { auth } from "@/lib/auth";

/**
 * Get salary benchmark for a job title
 */
export async function getSalaryBenchmarkAction(
  jobTitle: string,
  region: string = "United States"
) {
  try {
    const benchmark = getSalaryBenchmark(jobTitle, region);
    return {
      success: true,
      data: benchmark,
    };
  } catch (error) {
    return {
      success: false,
      error: "Failed to fetch salary benchmark",
    };
  }
}

/**
 * Get market insights for a role
 */
export async function getMarketInsightsAction(
  jobTitle: string,
  region: string = "United States"
) {
  try {
    const insights = getMarketInsights(jobTitle, region);
    return {
      success: true,
      data: insights,
    };
  } catch (error) {
    return {
      success: false,
      error: "Failed to fetch market insights",
    };
  }
}

/**
 * Estimate personal salary based on experience and skills
 */
export async function estimatePersonalSalaryAction(
  jobTitle: string,
  yearsExperience: number,
  skills: string[],
  region: string = "United States"
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user?.id) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    const estimate = estimatePersonalSalary(jobTitle, yearsExperience, skills, region);
    return {
      success: true,
      data: estimate,
    };
  } catch (error) {
    return {
      success: false,
      error: "Failed to estimate salary",
    };
  }
}
