"use client";

import React, { useState, useEffect } from "react";
import { ResumeWizard } from "@/components/resume/resume-wizard";
import { ResumeRenderer } from "@/components/resume/resume-renderer";
import { ResumeExportControls } from "@/components/resume/resume-export-controls";
import { loadResumeStateAction } from "@/app/actions/resume-actions";
import type { ResumeState } from "@/lib/resume/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Edit2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function ResumePage() {
  const [resumeState, setResumeState] = useState<ResumeState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    async function loadResume() {
      try {
        const result = await loadResumeStateAction();
        if (result.success && result.data) {
          setResumeState(result.data as ResumeState);
        } else {
          setIsEditing(true);
        }
      } catch (error) {
        console.error("[v0] Failed to load resume:", error);
        toast.error("Failed to load resume");
        setIsEditing(true);
      } finally {
        setIsLoading(false);
      }
    }

    loadResume();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  if (isEditing || !resumeState) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
          <ResumeWizard
            onComplete={(resume) => {
              setResumeState(resume);
              setIsEditing(false);
              toast.success("Resume created successfully!");
            }}
            onCancel={() => {
              if (resumeState) {
                setIsEditing(false);
              } else {
                window.history.back();
              }
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="gap-2 mb-4">
                  <ArrowLeft className="w-4 h-4" />
                  Back to Dashboard
                </Button>
              </Link>
              <h1 className="text-3xl font-bold">{resumeState.contact.name}&apos;s Resume</h1>
            </div>
            <Button
              onClick={() => setIsEditing(true)}
              className="gap-2"
            >
              <Edit2 className="w-4 h-4" />
              Edit Resume
            </Button>
          </div>

          {/* Export Controls */}
          <Card className="p-4">
            <ResumeExportControls resume={resumeState} />
          </Card>
        </div>

        {/* Resume Preview */}
        <div className="bg-white shadow-lg">
          <ResumeRenderer resume={resumeState} printMode={false} />
        </div>
      </div>
    </div>
  );
}
