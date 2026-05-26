/**
 * Market salary benchmarking engine with realistic distributions
 * Provides 25th/50th/90th percentile salary bands for career roles
 */

export interface SalaryBenchmark {
  title: string;
  region: string;
  percentile25: number;
  percentile50: number;
  percentile90: number;
  currency: string;
  dataPoints: number; // Simulated count of salary data points
  lastUpdated: Date;
}

export interface MarketInsights {
  benchmark: SalaryBenchmark;
  trend: "increasing" | "stable" | "decreasing";
  topIndustries: { industry: string; avgSalary: number }[];
  premiumSkills: { skill: string; salaryBoost: number }[]; // percentage boost
}

/**
 * Simulated market salary data for common roles
 * In production, this would pull from database or salary API
 */
const MARKET_DATA: Record<
  string,
  { p25: number; p50: number; p90: number; trend: "increasing" | "stable" | "decreasing" }
> = {
  "software engineer": { p25: 85000, p50: 120000, p90: 180000, trend: "increasing" },
  "senior software engineer": { p25: 130000, p50: 170000, p90: 240000, trend: "increasing" },
  "staff engineer": { p25: 180000, p50: 250000, p90: 350000, trend: "increasing" },
  "engineering manager": { p25: 140000, p50: 185000, p90: 260000, trend: "stable" },
  "product manager": { p25: 110000, p50: 150000, p90: 220000, trend: "increasing" },
  "ux designer": { p25: 70000, p50: 95000, p90: 135000, trend: "stable" },
  "data scientist": { p25: 95000, p50: 130000, p90: 190000, trend: "increasing" },
  "data engineer": { p25: 100000, p50: 140000, p90: 200000, trend: "increasing" },
  "devops engineer": { p25: 105000, p50: 145000, p90: 210000, trend: "increasing" },
  "solutions architect": { p25: 120000, p50: 160000, p90: 240000, trend: "stable" },
  "security engineer": { p25: 110000, p50: 150000, p90: 220000, trend: "increasing" },
  "frontend engineer": { p25: 80000, p50: 115000, p90: 170000, trend: "increasing" },
  "backend engineer": { p25: 85000, p50: 125000, p90: 185000, trend: "increasing" },
  "fullstack engineer": { p25: 90000, p50: 130000, p90: 190000, trend: "increasing" },
  "machine learning engineer": { p25: 120000, p50: 160000, p90: 240000, trend: "increasing" },
  "marketing manager": { p25: 80000, p50: 115000, p90: 170000, trend: "stable" },
  "sales manager": { p25: 85000, p50: 130000, p90: 200000, trend: "stable" },
  "finance analyst": { p25: 60000, p50: 80000, p90: 120000, trend: "stable" },
  "business analyst": { p25: 70000, p50: 95000, p90: 140000, trend: "stable" },
};

export const INDUSTRY_RANGES: Record<string, { min: number; max: number }> = {
  "Tech/SaaS": { min: 85000, max: 350000 },
  Finance: { min: 80000, max: 300000 },
  Healthcare: { min: 65000, max: 200000 },
  Consulting: { min: 75000, max: 250000 },
  Manufacturing: { min: 60000, max: 150000 },
  Education: { min: 50000, max: 120000 },
  Government: { min: 55000, max: 140000 },
  Retail: { min: 45000, max: 100000 },
};

export const PREMIUM_SKILLS: Record<string, number> = {
  "AI/ML": 25, // 25% salary boost
  "Cloud Architecture": 20,
  "Full-Stack": 15,
  "System Design": 18,
  Leadership: 20,
  "Team Management": 25,
  Security: 22,
  DevOps: 18,
  "Data Science": 20,
  Python: 8,
  TypeScript: 12,
  Golang: 15,
  Rust: 20,
  AWS: 15,
  "GCP/Azure": 12,
  Kubernetes: 18,
  "Problem Solving": 10,
};

/**
 * Normalize job title to match market data
 */
function normalizeTitle(title: string): string {
  const lower = title.toLowerCase().trim();

  // Check for exact matches first
  if (MARKET_DATA[lower]) return lower;

  // Check for partial matches
  for (const key of Object.keys(MARKET_DATA)) {
    if (lower.includes(key)) return key;
  }

  // Handle role-level adjustments
  if (
    lower.includes("senior") ||
    lower.includes("lead") ||
    lower.includes("principal")
  ) {
    const baseRole = lower
      .replace(/senior|lead|principal/g, "")
      .trim();
    if (baseRole.includes("engineer")) return "senior software engineer";
    if (baseRole.includes("developer")) return "senior software engineer";
  }

  if (lower.includes("junior") || lower.includes("entry")) {
    return "software engineer"; // Junior is lower than base
  }

  // Default fallback
  return "software engineer";
}

/**
 * Get salary benchmark for a job title and region
 */
export function getSalaryBenchmark(
  jobTitle: string,
  region: string = "United States"
): SalaryBenchmark {
  const normalized = normalizeTitle(jobTitle);
  const data = MARKET_DATA[normalized] || MARKET_DATA["software engineer"];

  // Apply region adjustment (simplified)
  let regionMultiplier = 1.0;
  if (region.toLowerCase().includes("san francisco")) regionMultiplier = 1.2;
  if (region.toLowerCase().includes("new york")) regionMultiplier = 1.15;
  if (region.toLowerCase().includes("london")) regionMultiplier = 0.85;
  if (region.toLowerCase().includes("india")) regionMultiplier = 0.5;
  if (region.toLowerCase().includes("remote")) regionMultiplier = 1.05;

  return {
    title: jobTitle,
    region,
    percentile25: Math.round(data.p25 * regionMultiplier),
    percentile50: Math.round(data.p50 * regionMultiplier),
    percentile90: Math.round(data.p90 * regionMultiplier),
    currency: "USD",
    dataPoints: Math.floor(Math.random() * 400 + 100), // Simulated
    lastUpdated: new Date(),
  };
}

/**
 * Calculate salary with skills adjustments
 */
export function calculateAdjustedSalary(
  baseSalary: number,
  skills: string[]
): number {
  let multiplier = 1.0;

  for (const skill of skills) {
    const boost = PREMIUM_SKILLS[skill] || 0;
    multiplier += boost / 100;
  }

  return Math.round(baseSalary * multiplier);
}

/**
 * Get comprehensive market insights for a role
 */
export function getMarketInsights(jobTitle: string, region: string = "United States"): MarketInsights {
  const benchmark = getSalaryBenchmark(jobTitle, region);

  // Determine trend based on role type
  let trend: "increasing" | "stable" | "decreasing" = "stable";
  const normalized = normalizeTitle(jobTitle);
  const roleData = MARKET_DATA[normalized];
  if (roleData) {
    trend = roleData.trend;
  }

  // Top industries for this role (simulated)
  const topIndustries = [
    { industry: "Tech/SaaS", avgSalary: Math.round(benchmark.percentile50 * 1.1) },
    { industry: "Finance", avgSalary: Math.round(benchmark.percentile50 * 1.05) },
    { industry: "Healthcare", avgSalary: Math.round(benchmark.percentile50 * 0.9) },
  ].sort((a, b) => b.avgSalary - a.avgSalary);

  // Premium skills for this role (simulated)
  const relevantSkills = [
    "AI/ML",
    "System Design",
    "Leadership",
    "Cloud Architecture",
  ];
  const premiumSkills = relevantSkills.map((skill) => ({
    skill,
    salaryBoost: PREMIUM_SKILLS[skill] || 10,
  }));

  return {
    benchmark,
    trend,
    topIndustries,
    premiumSkills,
  };
}

/**
 * Get salary distribution percentiles
 */
export function getSalaryDistribution(benchmark: SalaryBenchmark) {
  const { percentile25, percentile50, percentile90 } = benchmark;
  const percentile10 = Math.round(percentile25 * 0.75);
  const percentile75 = Math.round(percentile50 + (percentile90 - percentile50) * 0.5);

  return {
    p10: percentile10,
    p25: percentile25,
    p50: percentile50,
    p75: percentile75,
    p90: percentile90,
    min: percentile10,
    max: percentile90,
    range: percentile90 - percentile10,
    median: percentile50,
  };
}

/**
 * Estimate salary based on experience and skills
 */
export function estimatePersonalSalary(
  jobTitle: string,
  yearsExperience: number,
  skills: string[],
  region: string = "United States"
): {
  min: number;
  expected: number;
  max: number;
} {
  const benchmark = getSalaryBenchmark(jobTitle, region);

  // Experience adjustment
  let experienceMultiplier = 1.0;
  if (yearsExperience < 2) experienceMultiplier = 0.75;
  else if (yearsExperience < 5) experienceMultiplier = 0.85;
  else if (yearsExperience < 10) experienceMultiplier = 1.0;
  else if (yearsExperience < 15) experienceMultiplier = 1.15;
  else experienceMultiplier = 1.3;

  const baseExpected = Math.round(benchmark.percentile50 * experienceMultiplier);
  const skillsAdjusted = calculateAdjustedSalary(baseExpected, skills);

  return {
    min: Math.round(benchmark.percentile25 * experienceMultiplier),
    expected: skillsAdjusted,
    max: Math.round(benchmark.percentile90 * experienceMultiplier),
  };
}
