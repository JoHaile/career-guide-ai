import { DashboardShell } from "@/components/layouts/dashboard-shell";
import { DashboardStatsCards } from "@/components/dashboard/dashboard-stats-cards";
import { DashboardRecentActivity } from "@/components/dashboard/dashboard-recent-activity";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Briefcase, GraduationCap, Award } from "lucide-react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getDashboardStats } from "@/lib/dashboard/stats";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  const [userProfile, resume, userSkills, stats] = await Promise.all([
    prisma.userProfile.findUnique({
      where: { userId: session.user.id },
    }),
    prisma.resume.findFirst({
      where: { userId: session.user.id, isPrimary: true },
      include: {
        workExperience: { orderBy: { startDate: "desc" }, take: 3 },
        education: { orderBy: { graduationYear: "desc" }, take: 3 },
      },
    }),
    prisma.userSkill.findMany({
      where: { userId: session.user.id },
      include: { skill: true },
      orderBy: { proficiencyLevel: "desc" },
      take: 6,
    }),
    getDashboardStats(session.user.id),
  ]);

  return (
    <DashboardShell title="Dashboard">
      {userProfile && (
        <div className="px-4 lg:px-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <div className="flex items-center gap-4">
                <Avatar className="size-16 border-2 border-primary">
                  <AvatarImage
                    src={session.user.image ?? ""}
                    alt={session.user.name}
                  />
                  <AvatarFallback className="text-xl">
                    {session.user.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-2xl">{session.user.name}</CardTitle>
                  <CardDescription className="text-base font-medium text-primary">
                    {userProfile.currentTitle ?? "Add your title"}
                  </CardDescription>
                  <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="size-3" />
                    {userProfile.location ?? "Location not set"}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href="/profile">Profile</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/dashboard/edit-profile">Edit</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {resume && resume.workExperience.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Briefcase className="size-4" />
                      Experience
                    </div>
                    {resume.workExperience.slice(0, 2).map((exp) => (
                      <div key={exp.id} className="text-sm">
                        <p className="font-medium">{exp.role}</p>
                        <p className="text-xs text-muted-foreground">
                          {exp.company}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
                {resume && resume.education.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <GraduationCap className="size-4" />
                      Education
                    </div>
                    {resume.education.slice(0, 2).map((edu) => (
                      <div key={edu.id} className="text-sm">
                        <p className="font-medium">{edu.degree}</p>
                        <p className="text-xs text-muted-foreground">
                          {edu.institution}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
                {userSkills.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Award className="size-4" />
                      Top skills
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {userSkills.slice(0, 5).map((us) => (
                        <Badge key={us.id} variant="secondary" className="text-xs">
                          {us.skill.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <DashboardStatsCards
        avgMatch={stats.avgMatch}
        skillCount={stats.skillCount}
        analysisCount={stats.analysisCount}
        activeLearningPaths={stats.activeLearningPaths}
        highFitJobs={stats.highFitJobs}
      />

      <DashboardRecentActivity
        recentAnalyses={stats.recentAnalyses}
        recentLearningPaths={stats.recentLearningPaths}
      />

      <div className="px-4 pb-6 lg:px-6">
        <Card className="border-dashed">
          <CardContent className="flex flex-wrap items-center justify-between gap-4 py-6">
            <div>
              <p className="font-medium">Quick actions</p>
              <p className="text-sm text-muted-foreground">
                Explore jobs, analyze gaps, build resumes, or research salary insights
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button asChild>
                <Link href="/jobs">Job Explorer</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/skill-gap">Skill-Gap</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/resume">Resume Builder</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/salary-benchmarks">Salary Insights</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
