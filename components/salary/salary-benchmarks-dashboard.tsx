"use client";

import React, { useState, useEffect } from "react";
import {
  getSalaryBenchmarkAction,
  getMarketInsightsAction,
  estimatePersonalSalaryAction,
} from "@/app/actions/salary-actions";
import type {
  SalaryBenchmark,
  MarketInsights,
} from "@/lib/salary/benchmarks";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { TrendingUp, DollarSign, Briefcase } from "lucide-react";
import { toast } from "sonner";

export function SalaryBenchmarksDashboard() {
  const [jobTitle, setJobTitle] = useState("Software Engineer");
  const [region, setRegion] = useState("United States");
  const [yearsExp, setYearsExp] = useState(5);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  
  const [benchmark, setBenchmark] = useState<SalaryBenchmark | null>(null);
  const [insights, setInsights] = useState<MarketInsights | null>(null);
  const [personalEstimate, setPersonalEstimate] = useState<{
    min: number;
    expected: number;
    max: number;
  } | null>(null);
  
  const [isLoading, setIsLoading] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [benchmarkResult, insightsResult, estimateResult] = await Promise.all([
        getSalaryBenchmarkAction(jobTitle, region),
        getMarketInsightsAction(jobTitle, region),
        estimatePersonalSalaryAction(jobTitle, yearsExp, selectedSkills, region),
      ]);

      if (benchmarkResult.success && benchmarkResult.data) {
        setBenchmark(benchmarkResult.data);
      }
      if (insightsResult.success && insightsResult.data) {
        setInsights(insightsResult.data);
      }
      if (estimateResult.success && estimateResult.data) {
        setPersonalEstimate(estimateResult.data);
      }
    } catch (error) {
      console.error("[v0] Failed to fetch salary data:", error);
      toast.error("Failed to fetch salary data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const chartData = benchmark
    ? [
        {
          name: "Salary Range",
          "25th Percentile": benchmark.percentile25,
          "50th Percentile": benchmark.percentile50,
          "90th Percentile": benchmark.percentile90,
          "Your Estimate": personalEstimate?.expected || benchmark.percentile50,
        },
      ]
    : [];

  const commonSkills = [
    "AI/ML",
    "System Design",
    "Leadership",
    "Cloud Architecture",
    "Security",
    "DevOps",
    "Python",
    "TypeScript",
  ];

  return (
    <div className="space-y-6">
      {/* Search & Filters */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Salary Lookup</h3>
        
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="block text-sm font-medium mb-2">Job Title</label>
            <Input
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder="e.g., Senior Software Engineer"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Region</label>
            <Input
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              placeholder="e.g., San Francisco"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Years of Experience</label>
            <Input
              type="number"
              value={yearsExp}
              onChange={(e) => setYearsExp(parseInt(e.target.value) || 0)}
              min="0"
              max="50"
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium mb-3">Key Skills (Optional)</label>
          <div className="flex flex-wrap gap-2">
            {commonSkills.map((skill) => (
              <button
                key={skill}
                onClick={() => {
                  setSelectedSkills((prev) =>
                    prev.includes(skill)
                      ? prev.filter((s) => s !== skill)
                      : [...prev, skill]
                  );
                }}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  selectedSkills.includes(skill)
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {skill}
              </button>
            ))}
          </div>
        </div>

        <Button
          onClick={fetchData}
          disabled={isLoading}
          className="mt-6 w-full md:w-auto"
        >
          {isLoading ? "Loading..." : "Update Estimates"}
        </Button>
      </Card>

      {/* Salary Range Chart */}
      {benchmark && (
        <>
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              Salary Distribution
            </h3>

            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis 
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
                />
                <Tooltip
                  formatter={(value: any) => `$${Number(value).toLocaleString()}`}
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                  }}
                />
                <Legend />
                <Bar dataKey="25th Percentile" fill="#94a3b8" />
                <Bar dataKey="50th Percentile" fill="#3b82f6" />
                <Bar dataKey="90th Percentile" fill="#10b981" />
                {personalEstimate && (
                  <Bar dataKey="Your Estimate" fill="#f59e0b" />
                )}
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Key Metrics */}
          <div className="grid md:grid-cols-3 gap-4">
            <Card className="p-6">
              <h4 className="text-sm font-medium text-gray-600 mb-2">
                25th Percentile
              </h4>
              <p className="text-2xl font-bold text-gray-900">
                ${benchmark.percentile25.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 mt-1">Bottom quarter</p>
            </Card>

            <Card className="p-6">
              <h4 className="text-sm font-medium text-gray-600 mb-2">
                Median (50th)
              </h4>
              <p className="text-2xl font-bold text-gray-900">
                ${benchmark.percentile50.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 mt-1">Middle salary</p>
            </Card>

            <Card className="p-6">
              <h4 className="text-sm font-medium text-gray-600 mb-2">
                90th Percentile
              </h4>
              <p className="text-2xl font-bold text-gray-900">
                ${benchmark.percentile90.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 mt-1">Top earners</p>
            </Card>
          </div>

          {/* Personal Estimate */}
          {personalEstimate && (
            <Card className="p-6 bg-gradient-to-r from-amber-50 to-orange-50">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-orange-600" />
                Your Estimated Salary Range
              </h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Conservative</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ${personalEstimate.min.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Expected</p>
                  <p className="text-2xl font-bold text-orange-600">
                    ${personalEstimate.expected.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Optimistic</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ${personalEstimate.max.toLocaleString()}
                  </p>
                </div>
              </div>
              {selectedSkills.length > 0 && (
                <p className="text-xs text-gray-600 mt-4">
                  Estimate includes boost from: {selectedSkills.join(", ")}
                </p>
              )}
            </Card>
          )}

          {/* Insights */}
          {insights && (
            <>
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-blue-600" />
                  Top Industries
                </h3>
                <div className="space-y-3">
                  {insights.topIndustries.map((ind) => (
                    <div key={ind.industry} className="flex justify-between items-center">
                      <span className="text-gray-600">{ind.industry}</span>
                      <span className="font-bold text-gray-900">
                        ${ind.avgSalary.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Premium Skills</h3>
                <div className="space-y-3">
                  {insights.premiumSkills.map((skill) => (
                    <div key={skill.skill} className="flex justify-between items-center">
                      <span className="text-gray-600">{skill.skill}</span>
                      <span className="font-bold text-green-600">
                        +{skill.salaryBoost}%
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            </>
          )}
        </>
      )}
    </div>
  );
}
