/**
 * Client-side PDF export for resumes
 * Uses html2canvas and jsPDF to generate A4 PDFs
 */

import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import type { ResumeState } from "./types";

export interface PDFExportOptions {
  filename?: string;
  scale?: number;
  quality?: number;
  orientation?: "portrait" | "landscape";
}

/**
 * Export resume as PDF
 * Renders the resume HTML element and converts to PDF
 */
export async function exportResumeToPDF(
  resumeState: ResumeState,
  options: PDFExportOptions = {}
) {
  const {
    filename = `resume_${resumeState.contact.name.replace(/\s+/g, "_")}.pdf`,
    scale = 2,
    quality = 100,
    orientation = "portrait",
  } = options;

  try {
    // Find the resume content element
    const element = document.getElementById("resume-content");
    if (!element) {
      throw new Error("Resume content element not found");
    }

    // Capture the element as canvas
    const canvas = await html2canvas(element, {
      scale,
      backgroundColor: "#ffffff",
      logging: false,
      useCORS: true,
      allowTaint: true,
    });

    // Create PDF from canvas
    const imgData = canvas.toDataURL("image/png", quality / 100);
    
    // A4 dimensions in mm
    const pdfWidth = orientation === "portrait" ? 210 : 297;
    const pdfHeight = orientation === "portrait" ? 297 : 210;
    
    // Calculate dimensions to fit image
    const imgWidth = pdfWidth - 10; // 5mm margins
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    const pdf = new jsPDF({
      orientation,
      unit: "mm",
      format: "a4",
    });

    let yPosition = 5; // 5mm top margin

    // Add image to PDF, splitting across pages if needed
    let heightLeft = imgHeight;
    while (heightLeft > 0) {
      pdf.addImage(
        imgData,
        "PNG",
        5, // 5mm left margin
        yPosition,
        imgWidth,
        imgHeight
      );

      heightLeft -= pdfHeight - 10; // Account for margins

      if (heightLeft > 0) {
        pdf.addPage();
        yPosition = -imgHeight + (pdfHeight - 10);
      }
    }

    // Save the PDF
    pdf.save(filename);

    return {
      success: true,
      filename,
    };
  } catch (error) {
    console.error("PDF export failed:", error);
    throw new Error(`Failed to export PDF: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

/**
 * Generate download link for resume as PDF
 */
export async function generateResumePDFBlob(
  resumeState: ResumeState,
  options: PDFExportOptions = {}
): Promise<Blob> {
  const {
    scale = 2,
    quality = 100,
    orientation = "portrait",
  } = options;

  try {
    const element = document.getElementById("resume-content");
    if (!element) {
      throw new Error("Resume content element not found");
    }

    const canvas = await html2canvas(element, {
      scale,
      backgroundColor: "#ffffff",
      logging: false,
      useCORS: true,
      allowTaint: true,
    });

    const imgData = canvas.toDataURL("image/png", quality / 100);
    
    const pdfWidth = orientation === "portrait" ? 210 : 297;
    const pdfHeight = orientation === "portrait" ? 297 : 210;
    
    const imgWidth = pdfWidth - 10;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    const pdf = new jsPDF({
      orientation,
      unit: "mm",
      format: "a4",
    });

    let yPosition = 5;
    let heightLeft = imgHeight;

    while (heightLeft > 0) {
      pdf.addImage(imgData, "PNG", 5, yPosition, imgWidth, imgHeight);
      heightLeft -= pdfHeight - 10;

      if (heightLeft > 0) {
        pdf.addPage();
        yPosition = -imgHeight + (pdfHeight - 10);
      }
    }

    return pdf.output("blob") as Promise<Blob>;
  } catch (error) {
    console.error("PDF blob generation failed:", error);
    throw new Error(`Failed to generate PDF: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

/**
 * Export resume as plain text
 */
export function exportResumeAsText(resumeState: ResumeState): string {
  const lines: string[] = [];

  // Header
  lines.push(resumeState.contact.name.toUpperCase());
  lines.push("=".repeat(resumeState.contact.name.length));
  
  const contactInfo = [
    resumeState.contact.email,
    resumeState.contact.phone,
    resumeState.contact.location,
    resumeState.contact.website,
  ]
    .filter(Boolean)
    .join(" | ");
  
  if (contactInfo) {
    lines.push(contactInfo);
  }
  lines.push("");

  // Summary
  if (resumeState.summary) {
    lines.push("PROFESSIONAL SUMMARY");
    lines.push("-".repeat(20));
    lines.push(resumeState.summary);
    lines.push("");
  }

  // Experience
  if (resumeState.experience.length > 0) {
    lines.push("EXPERIENCE");
    lines.push("-".repeat(10));
    resumeState.experience.forEach((exp) => {
      lines.push(`${exp.role} - ${exp.company}`);
      lines.push(`${exp.startDate} - ${exp.endDate || "Present"}`);
      lines.push(exp.description);
      lines.push("");
    });
  }

  // Education
  if (resumeState.education.length > 0) {
    lines.push("EDUCATION");
    lines.push("-".repeat(9));
    resumeState.education.forEach((edu) => {
      lines.push(`${edu.degree} in ${edu.fieldOfStudy || "N/A"}`);
      lines.push(edu.institution);
      if (edu.graduationYear) {
        lines.push(`Graduated: ${edu.graduationYear}`);
      }
      lines.push("");
    });
  }

  // Skills
  if (resumeState.skills.length > 0) {
    lines.push("SKILLS");
    lines.push("-".repeat(6));
    const skillNames = resumeState.skills.map((s) => s.name).join(", ");
    lines.push(skillNames);
  }

  return lines.join("\n");
}

/**
 * Copy resume text to clipboard
 */
export async function copyResumeToClipboard(resumeState: ResumeState): Promise<void> {
  const text = exportResumeAsText(resumeState);
  await navigator.clipboard.writeText(text);
}
