"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { auditLog, db, jobPostings } from "@/lib/db";
import { auth } from "@/lib/auth";

const lines = (value: FormDataEntryValue | null) => String(value || "").split(/\r?\n/).map((item) => item.trim()).filter(Boolean);
const slugify = (value: string) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
function values(form: FormData) {
  const title = String(form.get("title") || "").trim();
  return {
    title, slug: slugify(String(form.get("slug") || title)), team: String(form.get("team") || "").trim(),
    location: String(form.get("location") || "").trim(), employmentType: String(form.get("employmentType") || "").trim(),
    summary: String(form.get("summary") || "").trim(), description: String(form.get("description") || "").trim() || null,
    responsibilities: lines(form.get("responsibilities")), requirements: lines(form.get("requirements")),
    desirable: lines(form.get("desirable")), salaryRange: String(form.get("salaryRange") || "").trim() || null,
    closingDate: form.get("closingDate") ? new Date(String(form.get("closingDate"))) : null,
    status: String(form.get("status") || "draft") as "draft" | "live" | "closed",
    sortOrder: Number(form.get("sortOrder") || 0), updatedAt: new Date(),
  };
}
export async function createJob(form: FormData) {
  const session = await auth(); if (!session?.user) redirect("/admin/login");
  const [job] = await db.insert(jobPostings).values(values(form)).returning();
  await db.insert(auditLog).values({ userId: Number(session.user.id), action: "job.create", resource: "job", resourceId: String(job.id) });
  revalidatePath("/careers"); revalidatePath("/admin/jobs"); redirect(`/admin/jobs/${job.id}?created=1`);
}
export async function updateJob(id: number, form: FormData) {
  const session = await auth(); if (!session?.user) redirect("/admin/login");
  await db.update(jobPostings).set(values(form)).where(eq(jobPostings.id, id));
  await db.insert(auditLog).values({ userId: Number(session.user.id), action: "job.update", resource: "job", resourceId: String(id) });
  revalidatePath("/careers"); revalidatePath("/careers/apply"); revalidatePath("/admin/jobs"); revalidatePath(`/admin/jobs/${id}`);
  redirect(`/admin/jobs/${id}?saved=1`);
}
