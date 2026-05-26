"use client";

import React from "react";
import type { ResumeState } from "@/lib/resume/types";
import { getTemplateStyles } from "@/lib/resume/templates";

interface ResumeRendererProps {
  resume: ResumeState;
  className?: string;
  printMode?: boolean;
}

export function ResumeRenderer({
  resume,
  className = "",
  printMode = false,
}: ResumeRendererProps) {
  const styles = getTemplateStyles(resume.templateId);
  const isMinimalist = resume.templateId === "minimalist-tech";
  const isCreative = resume.templateId === "creative-dev";
  const isModern = resume.templateId === "modern-executive";

  if (isMinimalist) {
    return <MinimalistTechTemplate resume={resume} className={className} printMode={printMode} />;
  } else if (isCreative) {
    return <CreativeDevTemplate resume={resume} className={className} printMode={printMode} />;
  } else if (isModern) {
    return <ModernExecutiveTemplate resume={resume} className={className} printMode={printMode} />;
  } else if (resume.templateId === "classic-academic") {
    return <ClassicAcademicTemplate resume={resume} className={className} printMode={printMode} />;
  } else {
    return <StartupHybridTemplate resume={resume} className={className} printMode={printMode} />;
  }
}

// Modern Executive Template
function ModernExecutiveTemplate({ resume, className, printMode }: Omit<ResumeRendererProps, 'resume'> & { resume: ResumeState }) {
  return (
    <div
      className={`${className} w-full max-w-4xl mx-auto bg-white p-12 text-gray-900 font-serif ${printMode ? "" : "shadow-lg"}`}
      id="resume-content"
    >
      {/* Header */}
      <div className="border-b-4 border-blue-600 pb-6 mb-6">
        <h1 className="text-4xl font-bold text-gray-900">{resume.contact.name}</h1>
        <div className="flex gap-4 text-sm text-gray-600 mt-2 flex-wrap">
          {resume.contact.email && <span>{resume.contact.email}</span>}
          {resume.contact.phone && <span>{resume.contact.phone}</span>}
          {resume.contact.location && <span>{resume.contact.location}</span>}
          {resume.contact.website && <span>{resume.contact.website}</span>}
        </div>
      </div>

      {/* Professional Summary */}
      {resume.summary && (
        <div className="mb-6">
          <h2 className="text-base font-bold text-blue-600 uppercase tracking-widest border-l-4 border-blue-600 pl-3 mb-3">
            Professional Summary
          </h2>
          <p className="text-sm leading-relaxed text-gray-700">{resume.summary}</p>
        </div>
      )}

      {/* Experience */}
      {resume.experience.length > 0 && (
        <div className="mb-6">
          <h2 className="text-base font-bold text-blue-600 uppercase tracking-widest border-l-4 border-blue-600 pl-3 mb-3">
            Experience
          </h2>
          <div className="space-y-4">
            {resume.experience.map((exp) => (
              <div key={exp.id}>
                <div className="flex justify-between items-baseline">
                  <h3 className="font-bold text-gray-900">{exp.role}</h3>
                  <span className="text-xs text-gray-500">
                    {exp.startDate} – {exp.endDate || "Present"}
                  </span>
                </div>
                <p className="text-sm text-gray-600 italic">{exp.company}</p>
                <div className="text-sm text-gray-700 mt-1 space-y-1">
                  {exp.description.split("\n").map((line, idx) => (
                    line.trim() && (
                      <p key={idx} className="ml-4">
                        {line.trim().startsWith("•") ? line : `• ${line}`}
                      </p>
                    )
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education */}
      {resume.education.length > 0 && (
        <div className="mb-6">
          <h2 className="text-base font-bold text-blue-600 uppercase tracking-widest border-l-4 border-blue-600 pl-3 mb-3">
            Education
          </h2>
          <div className="space-y-3">
            {resume.education.map((edu) => (
              <div key={edu.id}>
                <div className="flex justify-between items-baseline">
                  <h3 className="font-bold text-gray-900">{edu.degree}</h3>
                  {edu.graduationYear && (
                    <span className="text-xs text-gray-500">{edu.graduationYear}</span>
                  )}
                </div>
                <p className="text-sm text-gray-600">{edu.institution}</p>
                {edu.fieldOfStudy && (
                  <p className="text-sm text-gray-600">{edu.fieldOfStudy}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skills */}
      {resume.skills.length > 0 && (
        <div>
          <h2 className="text-base font-bold text-blue-600 uppercase tracking-widest border-l-4 border-blue-600 pl-3 mb-3">
            Skills
          </h2>
          <div className="flex flex-wrap gap-2">
            {resume.skills.map((skill) => (
              <span
                key={skill.id}
                className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded"
              >
                {skill.name}
                {skill.proficiency && skill.proficiency !== "Intermediate" && (
                  <span className="text-gray-500 ml-1">({skill.proficiency})</span>
                )}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Minimalist Tech Template
function MinimalistTechTemplate({ resume, className, printMode }: Omit<ResumeRendererProps, 'resume'> & { resume: ResumeState }) {
  return (
    <div
      className={`${className} w-full max-w-4xl mx-auto bg-white p-10 text-gray-800 font-sans grid grid-cols-4 gap-8 ${printMode ? "" : "shadow-lg"}`}
      id="resume-content"
    >
      {/* Sidebar */}
      <div className="col-span-1 bg-gray-900 text-white p-8">
        <h1 className="text-lg font-bold break-words">{resume.contact.name}</h1>
        
        {/* Contact */}
        <div className="mt-6 space-y-2 text-xs">
          {resume.contact.email && (
            <div>
              <p className="font-bold text-gray-300">EMAIL</p>
              <p className="break-words">{resume.contact.email}</p>
            </div>
          )}
          {resume.contact.phone && (
            <div>
              <p className="font-bold text-gray-300">PHONE</p>
              <p>{resume.contact.phone}</p>
            </div>
          )}
          {resume.contact.location && (
            <div>
              <p className="font-bold text-gray-300">LOCATION</p>
              <p>{resume.contact.location}</p>
            </div>
          )}
        </div>

        {/* Skills */}
        {resume.skills.length > 0 && (
          <div className="mt-6">
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-300 mb-3">
              Skills
            </h2>
            <div className="space-y-2">
              {resume.skills.map((skill) => (
                <div key={skill.id} className="text-xs">
                  <p className="font-medium">{skill.name}</p>
                  {skill.proficiency && (
                    <p className="text-gray-400 text-xs">{skill.proficiency}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="col-span-3 space-y-6">
        {resume.summary && (
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-700 pb-2 mb-2">
              About
            </h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              {resume.summary}
            </p>
          </div>
        )}

        {resume.experience.length > 0 && (
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-700 pb-2 mb-3">
              Experience
            </h2>
            <div className="space-y-4">
              {resume.experience.map((exp) => (
                <div key={exp.id}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-gray-900">{exp.role}</h3>
                      <p className="text-sm text-gray-600">{exp.company}</p>
                    </div>
                    <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                      {exp.startDate} – {exp.endDate || "Present"}
                    </span>
                  </div>
                  <div className="text-sm text-gray-700 mt-1 space-y-1">
                    {exp.description.split("\n").map((line, idx) => (
                      line.trim() && (
                        <p key={idx}>{line.trim().startsWith("•") ? line : `• ${line}`}</p>
                      )
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {resume.education.length > 0 && (
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-700 pb-2 mb-3">
              Education
            </h2>
            <div className="space-y-2">
              {resume.education.map((edu) => (
                <div key={edu.id}>
                  <h3 className="font-bold text-gray-900 text-sm">{edu.degree}</h3>
                  <p className="text-sm text-gray-600">{edu.institution}</p>
                  {edu.fieldOfStudy && (
                    <p className="text-sm text-gray-600">{edu.fieldOfStudy}</p>
                  )}
                  {edu.graduationYear && (
                    <p className="text-xs text-gray-500">{edu.graduationYear}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Creative Dev Template
function CreativeDevTemplate({ resume, className, printMode }: Omit<ResumeRendererProps, 'resume'> & { resume: ResumeState }) {
  return (
    <div
      className={`${className} w-full max-w-4xl mx-auto bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-12 text-white font-sans ${printMode ? "" : "shadow-lg"}`}
      id="resume-content"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-10 rounded-lg mb-8">
        <h1 className="text-4xl font-bold">{resume.contact.name}</h1>
        <div className="flex gap-4 text-sm text-purple-100 mt-3 flex-wrap">
          {resume.contact.email && <span>{resume.contact.email}</span>}
          {resume.contact.phone && <span>{resume.contact.phone}</span>}
          {resume.contact.location && <span>{resume.contact.location}</span>}
        </div>
      </div>

      {/* Summary */}
      {resume.summary && (
        <div className="mb-8 bg-gray-700 p-6 rounded-lg">
          <h2 className="text-base font-bold text-pink-400 uppercase tracking-wider mb-3">
            About Me
          </h2>
          <p className="text-gray-100 text-sm leading-relaxed">{resume.summary}</p>
        </div>
      )}

      {/* Experience */}
      {resume.experience.length > 0 && (
        <div className="mb-8">
          <h2 className="text-base font-bold text-pink-400 uppercase tracking-wider mb-4">
            Experience
          </h2>
          <div className="space-y-4">
            {resume.experience.map((exp) => (
              <div key={exp.id} className="bg-gray-700 p-4 rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-white">{exp.role}</h3>
                    <p className="text-purple-300">{exp.company}</p>
                  </div>
                  <span className="text-xs text-gray-300">
                    {exp.startDate} – {exp.endDate || "Present"}
                  </span>
                </div>
                <div className="text-sm text-gray-200 mt-3 space-y-1">
                  {exp.description.split("\n").map((line, idx) => (
                    line.trim() && (
                      <p key={idx}>{line.trim().startsWith("•") ? line : `• ${line}`}</p>
                    )
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skills & Education */}
      <div className="grid grid-cols-2 gap-6">
        {resume.skills.length > 0 && (
          <div>
            <h2 className="text-base font-bold text-pink-400 uppercase tracking-wider mb-3">
              Skills
            </h2>
            <div className="flex flex-wrap gap-2">
              {resume.skills.map((skill) => (
                <span
                  key={skill.id}
                  className="text-xs bg-purple-600 text-white px-3 py-1 rounded-full"
                >
                  {skill.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {resume.education.length > 0 && (
          <div>
            <h2 className="text-base font-bold text-pink-400 uppercase tracking-wider mb-3">
              Education
            </h2>
            <div className="space-y-2">
              {resume.education.map((edu) => (
                <div key={edu.id}>
                  <h3 className="font-bold text-white text-sm">{edu.degree}</h3>
                  <p className="text-sm text-purple-300">{edu.institution}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Classic Academic Template
function ClassicAcademicTemplate({ resume, className, printMode }: Omit<ResumeRendererProps, 'resume'> & { resume: ResumeState }) {
  return (
    <div
      className={`${className} w-full max-w-4xl mx-auto bg-white p-12 text-gray-900 font-serif ${printMode ? "" : "shadow-lg"}`}
      id="resume-content"
    >
      {/* Header */}
      <div className="text-center border-b-2 border-gray-400 pb-4 mb-6">
        <h1 className="text-3xl font-bold">{resume.contact.name}</h1>
        <div className="flex justify-center gap-4 text-xs text-gray-600 mt-2">
          {resume.contact.email && <span>{resume.contact.email}</span>}
          {resume.contact.phone && <span>|</span>}
          {resume.contact.phone && <span>{resume.contact.phone}</span>}
          {resume.contact.location && <span>|</span>}
          {resume.contact.location && <span>{resume.contact.location}</span>}
        </div>
      </div>

      {/* Education (prioritized in academic style) */}
      {resume.education.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xs font-bold uppercase tracking-widest text-gray-700 pb-2 mb-3 border-b-2 border-gray-400">
            Education
          </h2>
          <div className="space-y-3">
            {resume.education.map((edu) => (
              <div key={edu.id}>
                <h3 className="font-bold text-gray-900">{edu.degree}</h3>
                <p className="text-sm text-gray-700">{edu.institution}</p>
                {edu.fieldOfStudy && (
                  <p className="text-sm text-gray-600">Field: {edu.fieldOfStudy}</p>
                )}
                {edu.graduationYear && (
                  <p className="text-sm text-gray-600">Graduated: {edu.graduationYear}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Experience */}
      {resume.experience.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xs font-bold uppercase tracking-widest text-gray-700 pb-2 mb-3 border-b-2 border-gray-400">
            Professional Experience
          </h2>
          <div className="space-y-4">
            {resume.experience.map((exp) => (
              <div key={exp.id}>
                <h3 className="font-bold text-gray-900">{exp.role}</h3>
                <p className="text-sm text-gray-600">{exp.company}</p>
                <p className="text-xs text-gray-500">
                  {exp.startDate} – {exp.endDate || "Present"}
                </p>
                <div className="text-sm text-gray-700 mt-1 space-y-1">
                  {exp.description.split("\n").map((line, idx) => (
                    line.trim() && (
                      <p key={idx}>{line.trim().startsWith("•") ? line : `• ${line}`}</p>
                    )
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skills */}
      {resume.skills.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xs font-bold uppercase tracking-widest text-gray-700 pb-2 mb-3 border-b-2 border-gray-400">
            Skills
          </h2>
          <div className="flex flex-wrap gap-2">
            {resume.skills.map((skill) => (
              <span key={skill.id} className="text-sm text-gray-700">
                {skill.name}{resume.skills.indexOf(skill) !== resume.skills.length - 1 ? "," : ""}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Summary */}
      {resume.summary && (
        <div>
          <h2 className="text-xs font-bold uppercase tracking-widest text-gray-700 pb-2 mb-3 border-b-2 border-gray-400">
            Professional Summary
          </h2>
          <p className="text-sm text-gray-700 leading-relaxed">{resume.summary}</p>
        </div>
      )}
    </div>
  );
}

// Startup Hybrid Template
function StartupHybridTemplate({ resume, className, printMode }: Omit<ResumeRendererProps, 'resume'> & { resume: ResumeState }) {
  return (
    <div
      className={`${className} w-full max-w-4xl mx-auto bg-white p-10 text-gray-900 font-sans ${printMode ? "" : "shadow-lg"}`}
      id="resume-content"
    >
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">{resume.contact.name}</h1>
        <p className="text-sm text-gray-600 mt-1">
          {resume.experience[0]?.role || "Professional"}
          {resume.contact.location && ` • ${resume.contact.location}`}
        </p>
        <div className="flex gap-4 text-xs text-gray-500 mt-2">
          {resume.contact.email && <span>{resume.contact.email}</span>}
          {resume.contact.phone && <span>{resume.contact.phone}</span>}
          {resume.contact.website && <span>{resume.contact.website}</span>}
        </div>
      </div>

      {/* Summary */}
      {resume.summary && (
        <div className="mb-5 text-sm text-gray-700 leading-relaxed">
          {resume.summary}
        </div>
      )}

      {/* Experience */}
      {resume.experience.length > 0 && (
        <div className="mb-5">
          <h2 className="text-sm font-bold uppercase tracking-wide text-gray-700 pb-2 mb-3">
            Experience
          </h2>
          <div className="space-y-3">
            {resume.experience.map((exp) => (
              <div key={exp.id}>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-gray-900">{exp.role}</h3>
                    <p className="text-sm text-gray-600">{exp.company}</p>
                  </div>
                  <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                    {exp.startDate} – {exp.endDate || "Present"}
                  </span>
                </div>
                <div className="text-sm text-gray-700 mt-1 space-y-1">
                  {exp.description.split("\n").map((line, idx) => (
                    line.trim() && (
                      <p key={idx}>{line.trim().startsWith("•") ? line : `• ${line}`}</p>
                    )
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education & Skills */}
      <div className="grid grid-cols-2 gap-6">
        {resume.education.length > 0 && (
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wide text-gray-700 pb-2 mb-3">
              Education
            </h2>
            <div className="space-y-2">
              {resume.education.map((edu) => (
                <div key={edu.id}>
                  <h3 className="font-bold text-gray-900 text-sm">{edu.degree}</h3>
                  <p className="text-xs text-gray-600">{edu.institution}</p>
                  {edu.graduationYear && (
                    <p className="text-xs text-gray-500">{edu.graduationYear}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {resume.skills.length > 0 && (
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wide text-gray-700 pb-2 mb-3">
              Skills
            </h2>
            <div className="flex flex-wrap gap-2">
              {resume.skills.map((skill) => (
                <span
                  key={skill.id}
                  className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                >
                  {skill.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
