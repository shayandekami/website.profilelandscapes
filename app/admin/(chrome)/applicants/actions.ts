"use server";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { applicationEvents, applicationNotes, auditLog, careerApplications, db } from "@/lib/db";
import { auth } from "@/lib/auth";

const STATUSES = ["new", "screening", "shortlisted", "interview", "offer", "hired", "rejected", "withdrawn"] as const;

export async function updateApplication(id: number, form: FormData) {
  const session = await auth(); if (!session?.user) throw new Error("Not signed in");
  const status = String(form.get("status")) as (typeof STATUSES)[number];
  if (!STATUSES.includes(status)) throw new Error("Invalid status");
  const ratingRaw = Number(form.get("rating") || 0);
  const rating = ratingRaw >= 1 && ratingRaw <= 5 ? ratingRaw : null;
  const message = String(form.get("candidateMessage") || "").trim() || null;
  const notify = form.get("notify") === "true";
  const [current] = await db.select().from(careerApplications).where(eq(careerApplications.id, id)).limit(1);
  if (!current) throw new Error("Application not found");

  await db.update(careerApplications).set({
    status, rating, reviewedAt: current.reviewedAt || new Date(), updatedAt: new Date(),
  }).where(eq(careerApplications.id, id));
  if (status !== current.status || message) {
    await db.insert(applicationEvents).values({
      applicationId: id, status, message, candidateVisible: true, createdById: Number(session.user.id),
    });
  }
  await db.insert(auditLog).values({ userId: Number(session.user.id), action: "application.update", resource: "application", resourceId: String(id), meta: { status, rating } });
  if (notify && (status !== current.status || message)) {
    const { notifyCareerStatus } = await import("@/lib/email");
    await notifyCareerStatus({ name: current.firstName, email: current.email, reference: current.referenceCode, statusLabel: status.replace("_", " "), message, token: current.accessToken });
  }
  revalidatePath("/admin/applicants"); revalidatePath(`/admin/applicants/${id}`); revalidatePath(`/careers/application/${current.accessToken}`);
}

export async function addApplicationNote(id: number, form: FormData) {
  const session = await auth(); if (!session?.user) throw new Error("Not signed in");
  const body = String(form.get("body") || "").trim();
  if (!body) return;
  await db.insert(applicationNotes).values({ applicationId: id, authorId: Number(session.user.id), body });
  await db.insert(auditLog).values({ userId: Number(session.user.id), action: "application.note", resource: "application", resourceId: String(id) });
  revalidatePath(`/admin/applicants/${id}`);
}
