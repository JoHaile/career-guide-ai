"use client";

import React, { useCallback, useState } from "react";
import { parseResumeFileAction } from "@/app/actions/resume-actions";
import type { ParsedResumeContent } from "@/lib/resume/types";
import { toast } from "sonner";
import * as pdfjs from "pdfjs-dist";
import { Upload, Loader2 } from "lucide-react";

interface ResumeFileUploadProps {
  onParsed: (content: ParsedResumeContent) => void;
  onUploadStart?: () => void;
  onUploadEnd?: () => void;
}

export function ResumeFileUpload({
  onParsed,
  onUploadStart,
  onUploadEnd,
}: ResumeFileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Initialize PDF.js worker
  React.useEffect(() => {
    pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
  }, []);

  const extractTextFromPDF = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjs.getDocument(arrayBuffer).promise;
    let fullText = "";

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const text = textContent.items
        .map((item: any) => item.str)
        .join(" ");
      fullText += text + "\n";
    }

    return fullText;
  };

  const extractTextFromFile = async (file: File): Promise<string> => {
    if (file.type === "application/pdf") {
      return extractTextFromPDF(file);
    } else if (
      file.type === "text/plain" ||
      file.name.endsWith(".txt")
    ) {
      return file.text();
    } else if (
      file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      file.name.endsWith(".docx")
    ) {
      // For DOCX, we'll just show a message
      toast.error("DOCX files not yet supported. Please use PDF or TXT.");
      throw new Error("DOCX not supported");
    } else {
      toast.error("Please upload a PDF or TXT file");
      throw new Error("Unsupported file type");
    }
  };

  const handleFile = useCallback(
    async (file: File) => {
      if (!file) return;

      // Validate file type
      const validTypes = ["application/pdf", "text/plain"];
      if (!validTypes.includes(file.type) && !file.name.endsWith(".txt")) {
        toast.error("Please upload a PDF or TXT file");
        return;
      }

      setIsLoading(true);
      onUploadStart?.();

      try {
        // Extract text from file
        const fileContent = await extractTextFromFile(file);

        if (!fileContent.trim()) {
          toast.error("Could not extract text from file");
          return;
        }

        // Send to server for parsing
        const result = await parseResumeFileAction(fileContent, file.name);

        if (result.success && result.data) {
          toast.success("Resume parsed successfully!");
          onParsed(result.data);
        } else {
          toast.error(result.error || "Failed to parse resume");
        }
      } catch (error) {
        console.error("File upload error:", error);
        toast.error("Failed to process file");
      } finally {
        setIsLoading(false);
        onUploadEnd?.();
      }
    },
    [onParsed, onUploadStart, onUploadEnd]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (files?.length) {
      handleFile(files[0]);
    }
  };

  return (
    <div className="w-full">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
          transition-colors duration-200
          ${
            isDragging
              ? "border-blue-500 bg-blue-50"
              : "border-gray-300 hover:border-gray-400 bg-gray-50 hover:bg-gray-100"
          }
          ${isLoading ? "pointer-events-none opacity-75" : ""}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.txt"
          onChange={handleFileChange}
          disabled={isLoading}
          className="hidden"
          aria-label="Upload resume"
        />

        {isLoading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            <p className="text-sm text-gray-600">Processing your resume...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <Upload className="w-8 h-8 text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-900">
                Drag and drop your resume here
              </p>
              <p className="text-xs text-gray-500 mt-1">
                or click to select a file (PDF or TXT)
              </p>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              Maximum file size: 10MB
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
