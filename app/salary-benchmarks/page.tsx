"use client";

import React from "react";
import { SalaryBenchmarksDashboard } from "@/components/salary/salary-benchmarks-dashboard";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function SalaryBenchmarksPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="gap-2 mb-4">
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
          </Link>

          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">Salary Benchmarks</h1>
            <p className="text-lg text-gray-600">
              Explore market salary data for your role and region. Get personalized salary estimates based on your experience and skills.
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>How it works:</strong> Enter your job title, region, and experience level to see salary percentiles, industry comparisons, and premium skills that can boost your earning potential.
            </p>
          </div>
        </div>

        {/* Dashboard */}
        <SalaryBenchmarksDashboard />
      </div>
    </div>
  );
}
