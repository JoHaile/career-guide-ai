/**
 * Resume data structures for all templates and builder state
 */

export interface ResumeContact {
  name: string;
  email: string;
  phone?: string;
  location?: string;
  website?: string;
  linkedIn?: string;
}

export interface ResumeExperience {
  id: string;
  company: string;
  role: string;
  startDate: string; // YYYY-MM
  endDate?: string; // YYYY-MM or "Present"
  description: string; // Multi-line or bullet format
  highlights?: string[];
}

export interface ResumeEducation {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy?: string;
  startDate?: string; // YYYY-MM
  endDate?: string; // YYYY-MM
  graduationYear?: number;
  gpa?: string;
}

export interface ResumeSkill {
  id: string;
  name: string;
  proficiency?: "Beginner" | "Intermediate" | "Advanced" | "Expert";
  category?: string; // Technical, Leadership, etc.
}

export interface ResumeProject {
  id: string;
  name: string;
  description: string;
  link?: string;
  technologies?: string[];
  startDate?: string;
  endDate?: string;
}

export interface ResumeCertification {
  id: string;
  name: string;
  issuer: string;
  date?: string; // YYYY-MM
  expirationDate?: string;
  credentialId?: string;
  credentialUrl?: string;
}

export interface ResumeSection {
  id: string;
  title: string;
  type: "contact" | "summary" | "experience" | "education" | "skills" | "projects" | "certifications" | "custom";
  visible: boolean;
  order: number;
  content: any; // Type-specific content
}

export type ResumeTemplate = 
  | "minimalist-tech" 
  | "modern-executive" 
  | "creative-dev" 
  | "classic-academic" 
  | "startup-hybrid";

export interface ResumeState {
  // Metadata
  id: string;
  templateId: ResumeTemplate;
  createdAt: string;
  updatedAt: string;
  
  // Core data
  contact: ResumeContact;
  summary?: string;
  experience: ResumeExperience[];
  education: ResumeEducation[];
  skills: ResumeSkill[];
  projects?: ResumeProject[];
  certifications?: ResumeCertification[];
  
  // Custom sections
  customSections?: ResumeSection[];
  
  // Formatting preferences
  colorScheme?: "default" | "blue" | "green" | "purple" | "red";
  accentColor?: string;
  fontSize?: "small" | "normal" | "large";
}

export interface ResumeBuilderState {
  // Currently editing resume
  currentResumeId?: string;
  currentTemplate: ResumeTemplate;
  editMode: "form" | "editor";
  
  // All user resumes (for multi-resume support)
  resumes: ResumeState[];
  
  // UI state
  expandedSections: string[];
  previewMode: boolean;
  showValidation: boolean;
}

/**
 * Parsed resume from file upload (before transformation to ResumeState)
 */
export interface ParsedResumeContent {
  contact: Partial<ResumeContact>;
  summary?: string;
  experience: Partial<ResumeExperience>[];
  education: Partial<ResumeEducation>[];
  skills: Partial<ResumeSkill>[];
  rawText?: string; // Original extracted text
  parseQuality: "high" | "medium" | "low";
  parseWarnings?: string[];
}
