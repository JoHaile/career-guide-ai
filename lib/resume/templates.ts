/**
 * Resume template definitions and utilities
 */

import type { ResumeTemplate, ResumeState } from "./types";

export const TEMPLATES: Record<ResumeTemplate, {
  name: string;
  description: string;
  preview: string;
}> = {
  "minimalist-tech": {
    name: "Minimalist Tech",
    description: "Clean, modern design perfect for tech professionals",
    preview: "Two-column layout with sidebar skills, minimal color palette"
  },
  "modern-executive": {
    name: "Modern Executive",
    description: "Professional layout emphasizing leadership and impact",
    preview: "Full-width layout with accent colors and strong typography"
  },
  "creative-dev": {
    name: "Creative Dev",
    description: "Modern design with creative flair for designers and developers",
    preview: "Colorful sections with project highlights and visual hierarchy"
  },
  "classic-academic": {
    name: "Classic Academic",
    description: "Traditional academic resume with emphasis on education",
    preview: "Conservative layout ideal for academia and research roles"
  },
  "startup-hybrid": {
    name: "Startup Hybrid",
    description: "Dynamic layout blending professional and startup culture",
    preview: "Compact, achievement-focused with emphasis on growth and impact"
  }
};

export function getTemplateStyles(template: ResumeTemplate) {
  const baseStyles = {
    container: "w-full bg-white p-12 text-gray-900 font-sans",
    heading: "font-bold tracking-tight",
    section: "mb-6",
    sectionTitle: "text-sm font-bold uppercase tracking-wide border-b border-gray-300 pb-2 mb-4",
  };

  switch (template) {
    case "minimalist-tech":
      return {
        ...baseStyles,
        container: "w-full bg-white p-10 text-gray-800 font-sans grid grid-cols-3 gap-8",
        sectionTitle: "text-xs font-bold uppercase tracking-wider text-gray-600 pb-2 mb-3",
        accent: "bg-gray-900 text-white",
      };
    
    case "modern-executive":
      return {
        ...baseStyles,
        container: "w-full bg-white p-12 text-gray-900 font-serif",
        headerColor: "bg-gradient-to-r from-blue-600 to-blue-700 text-white p-8",
        sectionTitle: "text-base font-bold text-blue-600 uppercase tracking-widest border-l-4 border-blue-600 pl-3 mb-3",
      };
    
    case "creative-dev":
      return {
        ...baseStyles,
        container: "w-full bg-gray-50 p-12 text-gray-900",
        headerColor: "bg-gradient-to-r from-purple-600 to-pink-600 text-white p-10 rounded-lg",
        sectionTitle: "text-base font-bold text-purple-600 uppercase tracking-wider mb-4 relative after:absolute after:bottom-0 after:left-0 after:h-1 after:w-12 after:bg-gradient-to-r after:from-purple-600 after:to-pink-600",
      };
    
    case "classic-academic":
      return {
        ...baseStyles,
        container: "w-full bg-white p-12 text-gray-900 font-serif",
        sectionTitle: "text-xs font-bold uppercase tracking-widest text-gray-700 pb-2 mb-3 border-b-2 border-gray-400",
      };
    
    case "startup-hybrid":
      return {
        ...baseStyles,
        container: "w-full bg-white p-10 text-gray-900",
        sectionTitle: "text-sm font-bold uppercase tracking-wide text-gray-700 pb-2 mb-3",
        compact: true,
      };
    
    default:
      return baseStyles;
  }
}

export function validateResumeData(resume: ResumeState): string[] {
  const errors: string[] = [];

  if (!resume.contact.name) errors.push("Missing name");
  if (!resume.contact.email) errors.push("Missing email");
  if (resume.experience.length === 0) errors.push("No work experience added");
  if (resume.skills.length === 0) errors.push("No skills added");

  return errors;
}

export function getResumeSummary(resume: ResumeState): string {
  const parts = [];
  if (resume.contact.name) parts.push(resume.contact.name);
  if (resume.experience[0]?.role) parts.push(`${resume.experience[0].role} at ${resume.experience[0].company}`);
  if (resume.skills.length) parts.push(`${resume.skills.length} skills`);
  return parts.join(" • ");
}
