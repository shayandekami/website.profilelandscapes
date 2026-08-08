import type { Metadata } from "next";
import { asc, eq } from "drizzle-orm";
import { db, jobPostings } from "@/lib/db";
import { getPage, featureAccess } from "@/lib/content";
import { theme } from "@/themes/active";
import { CareersHub } from "@/themes/profile-landscapes/sections/CareersHub";
import { CareersJobs } from "@/themes/profile-landscapes/sections/CareersJobs";

export const metadata: Metadata = {
  title: "Careers",
  description: "Open roles and career pathways at Profile Landscapes.",
};

export default async function CareersPage() {
  const [page, jobs] = await Promise.all([
    getPage("/careers"),
    db.select().from(jobPostings).where(eq(jobPostings.status, "live")).orderBy(asc(jobPostings.sortOrder), asc(jobPostings.title)),
  ]);
  if (!page) return null;

  // Employee perks are gated until Carlo approves accurate copy — public sees them
  // hidden; signed-in staff see them in preview (featureAccess returns visible=true).
  const perksVisible = (await featureAccess("careers_perks")).visible;

  const publicJobs = jobs.map((job) => ({
    id: job.id, title: job.title, team: job.team, location: job.location,
    employmentType: job.employmentType, summary: job.summary, requirements: job.requirements,
  }));

  return page.sections.map((section, index) => {
    if (section.type === "careers_hub") return <CareersHub key={index} props={{ ...section.props, jobs: publicJobs, showBenefits: perksVisible }} />;
    if (section.type === "careers_jobs" || (section.type === "rich" && String(section.props.html || "").includes("Open roles"))) {
      return <CareersJobs key={index} jobs={publicJobs} />;
    }
    const Component = theme.sections[section.type];
    const props = section.type === "cta"
      ? { ...section.props, body: "Send your CV and tell us what kind of work you want to do. We review every application and provide a private progress link.", cta: { label: "Start your application →", href: "/careers/apply" } }
      : section.props;
    return Component ? <Component key={index} props={props} /> : null;
  });
}
