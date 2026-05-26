"use client";

import React, { useState } from "react";
import { ResumeFileUpload } from "./resume-file-upload";
import type { ParsedResumeContent, ResumeState } from "@/lib/resume/types";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

type WizardStep = "method" | "upload" | "review";

interface ResumeWizardProps {
  onComplete: (resumeData: ResumeState) => void;
  onCancel?: () => void;
}

export function ResumeWizard({ onComplete, onCancel }: ResumeWizardProps) {
  const [step, setStep] = useState<WizardStep>("upload");
  const [uploadedData, setUploadedData] = useState<ParsedResumeContent | null>(null);

  const handleUploadParsed = (data: ParsedResumeContent) => {
    setUploadedData(data);
    setStep("review");
  };

  const handleBack = () => {
    if (step === "review") {
      setStep("upload");
      setUploadedData(null);
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
              {step === "upload" && "Upload your existing resume"}
              {step === "review" && "Review and customize your resume"}
            </p>
          </div>
        </div>
      </div>

      {/* Step 1: File Upload */}
      {step === "upload" && (
        <div className="space-y-6">
          <ResumeFileUpload onParsed={handleUploadParsed} />
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

      {/* Step 2: Review */}
      {step === "review" && uploadedData && (
        <div className="space-y-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-900">Resume Parsed Successfully</h3>
            <p className="text-sm text-blue-800 mt-1">
              Your resume has been parsed. Click the button below to continue editing in the resume builder.
            </p>
          </div>
          <Button onClick={() => onComplete({
            contact: uploadedData.contact,
            summary: uploadedData.summary,
            experience: uploadedData.experience || [],
            education: uploadedData.education || [],
            skills: uploadedData.skills || [],
            selectedTemplate: "modern-executive",
          })} className="w-full">
            Continue to Resume Editor
          </Button>
        </div>
      )}
    </div>
  );
}
