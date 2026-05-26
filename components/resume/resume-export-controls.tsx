"use client";

import React, { useState } from "react";
import type { ResumeState } from "@/lib/resume/types";
import { 
  exportResumeToPDF, 
  exportResumeAsText,
  copyResumeToClipboard 
} from "@/lib/resume/pdf-export";
import { Button } from "@/components/ui/button";
import {
  Download,
  Copy,
  FileText,
  Share2,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

interface ResumeExportControlsProps {
  resume: ResumeState;
  className?: string;
}

export function ResumeExportControls({
  resume,
  className = "",
}: ResumeExportControlsProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      await exportResumeToPDF(resume, {
        filename: `${resume.contact.name.replace(/\s+/g, "_")}_Resume.pdf`,
      });
      toast.success("Resume downloaded as PDF!");
    } catch (error) {
      console.error("[v0] PDF export error:", error);
      toast.error("Failed to export PDF");
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportTXT = () => {
    try {
      const text = exportResumeAsText(resume);
      const blob = new Blob([text], { type: "text/plain" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${resume.contact.name.replace(/\s+/g, "_")}_Resume.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("Resume downloaded as TXT!");
    } catch (error) {
      console.error("[v0] TXT export error:", error);
      toast.error("Failed to export as text");
    }
  };

  const handleCopyToClipboard = async () => {
    try {
      await copyResumeToClipboard(resume);
      toast.success("Resume copied to clipboard!");
    } catch (error) {
      console.error("[v0] Copy error:", error);
      toast.error("Failed to copy to clipboard");
    }
  };

  return (
    <div className={`flex gap-2 flex-wrap ${className}`}>
      <Button
        onClick={handleExportPDF}
        disabled={isExporting}
        className="gap-2"
        variant="default"
      >
        {isExporting ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Download className="w-4 h-4" />
        )}
        Export PDF
      </Button>

      <Button
        onClick={handleExportTXT}
        variant="outline"
        className="gap-2"
      >
        <FileText className="w-4 h-4" />
        Export TXT
      </Button>

      <Button
        onClick={handleCopyToClipboard}
        variant="outline"
        className="gap-2"
      >
        <Copy className="w-4 h-4" />
        Copy
      </Button>

      <Button
        variant="outline"
        className="gap-2"
        onClick={() => {
          if (navigator.share) {
            navigator.share({
              title: "My Resume",
              text: resume.contact.name,
              url: window.location.href,
            }).catch(() => {
              toast.error("Share failed");
            });
          } else {
            toast.info("Share not supported in your browser");
          }
        }}
      >
        <Share2 className="w-4 h-4" />
        Share
      </Button>
    </div>
  );
}
