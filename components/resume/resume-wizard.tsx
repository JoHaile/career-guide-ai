"use client";

import React, { useState } from "react";
import { ResumeFileUpload } from "./resume-file-upload";
import { ResumeFormBuilder } from "./resume-form-builder";
import type { ParsedResumeContent, ResumeState } from "@/lib/resume/types";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

type WizardStep = "method" | "upload" | "form" | "review";

interface ResumeWizardProps {
  onComplete: (resumeData: ResumeState) => void;
  onCancel?: () => void;
}

export function ResumeWizard({ onComplete, onCancel }: ResumeWizardProps) {
  const [step, setStep] = useState<WizardStep>("method");
  const [uploadedData, setUploadedData] = useState<ParsedResumeContent | null>(null);
  const [method, setMethod] = useState<"upload" | "form" | null>(null);

  const handleUploadParsed = (data: ParsedResumeContent) => {
    setUploadedData(data);
    setStep("review");
  };

  const handleFormComplete = (resumeState: ResumeState) => {
    onComplete(resumeState);
  };

  const handleBack = () => {
    if (step === "review" && method === "upload") {
      setStep("upload");
      setUploadedData(null);
    } else if (step === "upload" || step === "form") {
      setStep("method");
      setMethod(null);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4">
          {step !== "method" && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBack}
              className="h-8 w-8"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
          )}
          <div>
            <h2 className="text-2xl font-bold">Resume Builder</h2>
            <p className="text-sm text-gray-600 mt-1">
              {step === "method" && "Choose how to build your resume"}
              {step === "upload" && "Upload your existing resume"}
              {step === "form" && "Build your resume step by step"}
              {step === "review" && "Review and customize your resume"}
            </p>
          </div>
        </div>
      </div>

      {/* Step 1: Choose Method */}
      {step === "method" && (
        <div className="space-y-4">
          <button
            onClick={() => {
              setMethod("upload");
              setStep("upload");
            }}
            className="w-full p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left group"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900 group-hover:text-blue-600">
                  Upload Resume (PATH A)
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Upload an existing resume and we&apos;ll extract the information
                </p>
              </div>
              <div className="text-2xl">📄</div>
            </div>
          </button>

          <button
            onClick={() => {
              setMethod("form");
              setStep("form");
            }}
            className="w-full p-6 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors text-left group"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900 group-hover:text-green-600">
                  Build from Scratch (PATH B)
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Build your resume step by step with our guided form
                </p>
              </div>
              <div className="text-2xl">✨</div>
            </div>
          </button>

          {onCancel && (
            <Button
              variant="outline"
              onClick={onCancel}
              className="w-full"
            >
              Cancel
            </Button>
          )}
        </div>
      )}

      {/* Step 2: File Upload */}
      {step === "upload" && (
        <div className="space-y-6">
          <ResumeFileUpload onParsed={handleUploadParsed} />
        </div>
      )}

      {/* Step 2: Form Builder */}
      {step === "form" && (
        <div className="space-y-6">
          <ResumeFormBuilder onComplete={handleFormComplete} />
        </div>
      )}

      {/* Step 3: Review (from upload) */}
      {step === "review" && uploadedData && (
        <div className="space-y-6">
          <ResumeFormBuilder
            initialData={uploadedData}
            onComplete={handleFormComplete}
          />
        </div>
      )}
    </div>
  );
}
