"use client";

import React, { useState, useEffect } from "react";
import type { ResumeState, ParsedResumeContent, ResumeContact, ResumeExperience, ResumeEducation, ResumeSkill } from "@/lib/resume/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { generateResumeSummaryAction, optimizeBulletsAction, saveResumeStateAction } from "@/app/actions/resume-actions";
import { toast } from "sonner";
import { Plus, Trash2, Wand2, Loader2 } from "lucide-react";

interface ResumeFormBuilderProps {
  initialData?: ParsedResumeContent;
  onComplete: (resumeData: ResumeState) => void;
}

export function ResumeFormBuilder({
  initialData,
  onComplete,
}: ResumeFormBuilderProps) {
  const [formStep, setFormStep] = useState<"contact" | "summary" | "experience" | "education" | "skills" | "review">("contact");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [contact, setContact] = useState<ResumeContact>(
    initialData?.contact || {
      name: "",
      email: "",
      phone: "",
      location: "",
      website: "",
      linkedIn: "",
    }
  );

  const [summary, setSummary] = useState(initialData?.summary || "");
  const [experience, setExperience] = useState<ResumeExperience[]>(
    initialData?.experience || []
  );
  const [education, setEducation] = useState<ResumeEducation[]>(
    initialData?.education || []
  );
  const [skills, setSkills] = useState<ResumeSkill[]>(
    initialData?.skills || []
  );

  // Add new experience entry
  const addExperience = () => {
    setExperience([
      ...experience,
      {
        id: Math.random().toString(),
        company: "",
        role: "",
        startDate: "",
        endDate: "",
        description: "",
        highlights: [],
      },
    ]);
  };

  // Add new education entry
  const addEducation = () => {
    setEducation([
      ...education,
      {
        id: Math.random().toString(),
        institution: "",
        degree: "",
        fieldOfStudy: "",
        startDate: "",
        endDate: "",
        graduationYear: undefined,
        gpa: "",
      },
    ]);
  };

  // Add new skill
  const addSkill = () => {
    setSkills([
      ...skills,
      {
        id: Math.random().toString(),
        name: "",
        proficiency: "Intermediate",
        category: "",
      },
    ]);
  };

  // Generate AI summary
  const generateSummary = async () => {
    if (!contact.name) {
      toast.error("Please fill in your name first");
      return;
    }

    setIsLoading(true);
    try {
      const result = await generateResumeSummaryAction(
        experience[0]?.role || "Professional",
        experience.length > 0 ? 5 : 0,
        skills.map((s) => s.name),
        experience.flatMap((e) => e.highlights || [])
      );

      if (result.success && result.summary) {
        setSummary(result.summary);
        toast.success("Summary generated!");
      } else {
        toast.error("Failed to generate summary");
      }
    } catch (error) {
      toast.error("Error generating summary");
    } finally {
      setIsLoading(false);
    }
  };

  // Optimize bullet points
  const optimizeBullets = async (expIndex: number) => {
    const exp = experience[expIndex];
    if (!exp.description) {
      toast.error("No bullet points to optimize");
      return;
    }

    setIsLoading(true);
    try {
      const bullets = exp.description
        .split("\n")
        .filter((b) => b.trim());

      const result = await optimizeBulletsAction(bullets);

      if (result.success && result.optimizedBullets) {
        const updated = [...experience];
        updated[expIndex].description = result.optimizedBullets.join("\n");
        setExperience(updated);
        toast.success("Bullets optimized!");
      } else {
        toast.error("Failed to optimize bullets");
      }
    } catch (error) {
      toast.error("Error optimizing bullets");
    } finally {
      setIsLoading(false);
    }
  };

  // Submit all data
  const handleSubmit = async () => {
    if (!contact.name || !contact.email) {
      toast.error("Please fill in required fields");
      return;
    }

    setIsSaving(true);
    try {
      const resumeState: ResumeState = {
        id: Math.random().toString(),
        templateId: "modern-executive",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        contact,
        summary: summary || undefined,
        experience,
        education,
        skills,
      };

      // Save to database
      const saveResult = await saveResumeStateAction(resumeState);
      
      if (saveResult.success) {
        toast.success("Resume saved successfully!");
        onComplete(resumeState);
      } else {
        toast.error("Failed to save resume");
      }
    } catch (error) {
      toast.error("Error saving resume");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Form Steps Navigation */}
      <div className="flex gap-2 flex-wrap">
        {(["contact", "summary", "experience", "education", "skills", "review"] as const).map(
          (step) => (
            <button
              key={step}
              onClick={() => setFormStep(step)}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                formStep === step
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {step.charAt(0).toUpperCase() + step.slice(1)}
            </button>
          )
        )}
      </div>

      {/* Contact Information */}
      {formStep === "contact" && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Contact Information</h3>
          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name *</label>
              <Input
                value={contact.name}
                onChange={(e) =>
                  setContact({ ...contact, name: e.target.value })
                }
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email *</label>
              <Input
                type="email"
                value={contact.email}
                onChange={(e) =>
                  setContact({ ...contact, email: e.target.value })
                }
                placeholder="john@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Phone</label>
              <Input
                value={contact.phone || ""}
                onChange={(e) =>
                  setContact({ ...contact, phone: e.target.value })
                }
                placeholder="(555) 123-4567"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Location</label>
              <Input
                value={contact.location || ""}
                onChange={(e) =>
                  setContact({ ...contact, location: e.target.value })
                }
                placeholder="San Francisco, CA"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Website</label>
              <Input
                value={contact.website || ""}
                onChange={(e) =>
                  setContact({ ...contact, website: e.target.value })
                }
                placeholder="https://example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">LinkedIn</label>
              <Input
                value={contact.linkedIn || ""}
                onChange={(e) =>
                  setContact({ ...contact, linkedIn: e.target.value })
                }
                placeholder="https://linkedin.com/in/johndoe"
              />
            </div>
          </div>
        </div>
      )}

      {/* Summary */}
      {formStep === "summary" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Professional Summary</h3>
            <Button
              size="sm"
              variant="outline"
              onClick={generateSummary}
              disabled={isLoading}
              className="gap-2"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Wand2 className="w-4 h-4" />
              )}
              Generate with AI
            </Button>
          </div>
          <Textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="Write a compelling 2-3 sentence professional summary..."
            rows={6}
          />
        </div>
      )}

      {/* Experience */}
      {formStep === "experience" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Work Experience</h3>
            <Button size="sm" onClick={addExperience} className="gap-2">
              <Plus className="w-4 h-4" />
              Add Experience
            </Button>
          </div>
          <div className="space-y-6">
            {experience.map((exp, idx) => (
              <div
                key={exp.id}
                className="border border-gray-200 rounded-lg p-4 space-y-4"
              >
                <div className="flex justify-between items-start">
                  <h4 className="font-medium">Experience {idx + 1}</h4>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      setExperience(experience.filter((_, i) => i !== idx))
                    }
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    placeholder="Company"
                    value={exp.company}
                    onChange={(e) => {
                      const updated = [...experience];
                      updated[idx].company = e.target.value;
                      setExperience(updated);
                    }}
                  />
                  <Input
                    placeholder="Job Title"
                    value={exp.role}
                    onChange={(e) => {
                      const updated = [...experience];
                      updated[idx].role = e.target.value;
                      setExperience(updated);
                    }}
                  />
                  <Input
                    placeholder="Start Date (YYYY-MM)"
                    value={exp.startDate}
                    onChange={(e) => {
                      const updated = [...experience];
                      updated[idx].startDate = e.target.value;
                      setExperience(updated);
                    }}
                  />
                  <Input
                    placeholder="End Date (YYYY-MM or Present)"
                    value={exp.endDate || ""}
                    onChange={(e) => {
                      const updated = [...experience];
                      updated[idx].endDate = e.target.value;
                      setExperience(updated);
                    }}
                  />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm font-medium">Description (bullet points, one per line)</label>
                    <Button
                      size="xs"
                      variant="ghost"
                      onClick={() => optimizeBullets(idx)}
                      disabled={isLoading || !exp.description}
                      className="gap-1 text-xs"
                    >
                      {isLoading ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Wand2 className="w-3 h-3" />
                      )}
                      Optimize
                    </Button>
                  </div>
                  <Textarea
                    placeholder="• Achieved X using Y&#10;• Led team of Z people"
                    value={exp.description}
                    onChange={(e) => {
                      const updated = [...experience];
                      updated[idx].description = e.target.value;
                      setExperience(updated);
                    }}
                    rows={4}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education */}
      {formStep === "education" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Education</h3>
            <Button size="sm" onClick={addEducation} className="gap-2">
              <Plus className="w-4 h-4" />
              Add Education
            </Button>
          </div>
          <div className="space-y-6">
            {education.map((edu, idx) => (
              <div
                key={edu.id}
                className="border border-gray-200 rounded-lg p-4 space-y-4"
              >
                <div className="flex justify-between items-start">
                  <h4 className="font-medium">Education {idx + 1}</h4>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      setEducation(education.filter((_, i) => i !== idx))
                    }
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    placeholder="Institution"
                    value={edu.institution}
                    onChange={(e) => {
                      const updated = [...education];
                      updated[idx].institution = e.target.value;
                      setEducation(updated);
                    }}
                  />
                  <Input
                    placeholder="Degree"
                    value={edu.degree}
                    onChange={(e) => {
                      const updated = [...education];
                      updated[idx].degree = e.target.value;
                      setEducation(updated);
                    }}
                  />
                  <Input
                    placeholder="Field of Study"
                    value={edu.fieldOfStudy || ""}
                    onChange={(e) => {
                      const updated = [...education];
                      updated[idx].fieldOfStudy = e.target.value;
                      setEducation(updated);
                    }}
                  />
                  <Input
                    placeholder="Graduation Year"
                    type="number"
                    value={edu.graduationYear || ""}
                    onChange={(e) => {
                      const updated = [...education];
                      updated[idx].graduationYear = e.target.value ? parseInt(e.target.value) : undefined;
                      setEducation(updated);
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skills */}
      {formStep === "skills" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Skills</h3>
            <Button size="sm" onClick={addSkill} className="gap-2">
              <Plus className="w-4 h-4" />
              Add Skill
            </Button>
          </div>
          <div className="space-y-3">
            {skills.map((skill, idx) => (
              <div key={skill.id} className="flex gap-3 items-end">
                <Input
                  placeholder="Skill name (e.g., React, Project Management)"
                  value={skill.name}
                  onChange={(e) => {
                    const updated = [...skills];
                    updated[idx].name = e.target.value;
                    setSkills(updated);
                  }}
                  className="flex-1"
                />
                <select
                  value={skill.proficiency || "Intermediate"}
                  onChange={(e) => {
                    const updated = [...skills];
                    updated[idx].proficiency = e.target.value as any;
                    setSkills(updated);
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option>Beginner</option>
                  <option>Intermediate</option>
                  <option>Advanced</option>
                  <option>Expert</option>
                </select>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setSkills(skills.filter((_, i) => i !== idx))}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Review & Submit */}
      {formStep === "review" && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Review Your Resume</h3>
          <div className="bg-gray-50 p-6 rounded-lg space-y-4 text-sm">
            <div>
              <strong>{contact.name}</strong> • {contact.email}
              {contact.phone && ` • ${contact.phone}`}
              {contact.location && ` • ${contact.location}`}
            </div>
            {summary && (
              <div>
                <strong>Summary:</strong> {summary}
              </div>
            )}
            {experience.length > 0 && (
              <div>
                <strong>Experience ({experience.length} roles)</strong>
              </div>
            )}
            {education.length > 0 && (
              <div>
                <strong>Education ({education.length} entries)</strong>
              </div>
            )}
            {skills.length > 0 && (
              <div>
                <strong>Skills ({skills.length} total)</strong>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex gap-4 justify-end">
        <Button
          variant="outline"
          onClick={() => {
            const steps: typeof formStep[] = [
              "contact",
              "summary",
              "experience",
              "education",
              "skills",
              "review",
            ];
            const currentIdx = steps.indexOf(formStep);
            if (currentIdx > 0) setFormStep(steps[currentIdx - 1]);
          }}
          disabled={formStep === "contact"}
        >
          Previous
        </Button>
        {formStep !== "review" ? (
          <Button
            onClick={() => {
              const steps: typeof formStep[] = [
                "contact",
                "summary",
                "experience",
                "education",
                "skills",
                "review",
              ];
              const currentIdx = steps.indexOf(formStep);
              if (currentIdx < steps.length - 1) setFormStep(steps[currentIdx + 1]);
            }}
          >
            Next
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={isSaving}
            className="gap-2"
          >
            {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
            Save & Continue
          </Button>
        )}
      </div>
    </div>
  );
}
