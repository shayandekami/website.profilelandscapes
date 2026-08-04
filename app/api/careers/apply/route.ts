import { NextResponse } from "next/server";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { nanoid } from "nanoid";
import { z } from "zod";
import { db, applicationEvents, careerApplications, jobPostings } from "@/lib/db";
import { eq } from "drizzle-orm";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

const MAX_RESUME = 8 * 1024 * 1024;
const ALLOWED = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

const Input = z.object({
  jobId: z.coerce.number().int().positive().optional(),
  roleInterest: z.string().trim().min(2).max(200),
  firstName: z.string().trim().min(1).max(100),
  lastName: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().min(6).max(60),
  suburb: z.string().trim().max(160).optional(),
  linkedinUrl: z.union([z.string().trim().url().max(500), z.literal("")]).optional(),
  portfolioUrl: z.union([z.string().trim().url().max(500), z.literal("")]).optional(),
  coverLetter: z.string().trim().min(80).max(6000),
  yearsExperience: z.string().trim().max(60).optional(),
  availability: z.string().trim().max(120).optional(),
  workRights: z.string().trim().min(2).max(120),
  driversLicence: z.boolean(),
  consent: z.literal(true),
  website: z.string().max(300).optional(),
});

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() || request.headers.get("x-real-ip") || "unknown";
  if (!rateLimit(`career:${ip}`, 3, 10 * 60_000)) {
    return NextResponse.json({ error: "Too many applications were submitted from this connection. Please wait and try again." }, { status: 429 });
  }
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "We could not read the application or CV. Check the file and try again." }, { status: 400 });
  }
  const parsed = Input.safeParse({
    jobId: form.get("jobId") || undefined,
    roleInterest: form.get("roleInterest"),
    firstName: form.get("firstName"),
    lastName: form.get("lastName"),
    email: form.get("email"),
    phone: form.get("phone"),
    suburb: form.get("suburb") || undefined,
    linkedinUrl: form.get("linkedinUrl") || "",
    portfolioUrl: form.get("portfolioUrl") || "",
    coverLetter: form.get("coverLetter"),
    yearsExperience: form.get("yearsExperience") || undefined,
    availability: form.get("availability") || undefined,
    workRights: form.get("workRights"),
    driversLicence: form.get("driversLicence") === "true",
    consent: form.get("consent") === "true",
    website: form.get("website") || undefined,
  });
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Please check the application form." }, { status: 400 });
  }
  if (parsed.data.website) return NextResponse.json({ ok: true });

  const resume = form.get("resume");
  if (!(resume instanceof File) || resume.size === 0) {
    return NextResponse.json({ error: "Please attach your CV or résumé." }, { status: 400 });
  }
  if (resume.size > MAX_RESUME) {
    return NextResponse.json({ error: "Your CV is larger than 8 MB." }, { status: 400 });
  }
  if (!ALLOWED.has(resume.type)) {
    return NextResponse.json({ error: "CV must be a PDF, DOC or DOCX file." }, { status: 400 });
  }

  if (parsed.data.jobId) {
    const [job] = await db.select({ id: jobPostings.id, status: jobPostings.status }).from(jobPostings).where(eq(jobPostings.id, parsed.data.jobId)).limit(1);
    if (!job) return NextResponse.json({ error: "That role is no longer available. Choose general application instead." }, { status: 400 });
    if (job.status !== "live") return NextResponse.json({ error: "That role has closed. You can still send a general expression of interest." }, { status: 400 });
  }

  const referenceCode = `APP-${new Date().getFullYear()}-${nanoid(6).toUpperCase()}`;
  const accessToken = nanoid(40);
  const safeOriginal = resume.name.replace(/[^a-zA-Z0-9.\-_]/g, "_").slice(0, 160);
  const storedFilename = `${referenceCode}-${nanoid(8)}-${safeOriginal}`;
  const storageDir = join(process.cwd(), "storage", "applications");
  await mkdir(storageDir, { recursive: true });
  const resumePath = join(storageDir, storedFilename);
  await writeFile(resumePath, Buffer.from(await resume.arrayBuffer()));

  let application: typeof careerApplications.$inferSelect;
  try {
    application = await db.transaction(async (tx) => {
      const [created] = await tx.insert(careerApplications).values({
        referenceCode,
        accessToken,
        jobId: parsed.data.jobId,
        roleInterest: parsed.data.roleInterest,
        firstName: parsed.data.firstName,
        lastName: parsed.data.lastName,
        email: parsed.data.email.toLowerCase(),
        phone: parsed.data.phone,
        suburb: parsed.data.suburb || null,
        linkedinUrl: parsed.data.linkedinUrl || null,
        portfolioUrl: parsed.data.portfolioUrl || null,
        coverLetter: parsed.data.coverLetter,
        yearsExperience: parsed.data.yearsExperience || null,
        availability: parsed.data.availability || null,
        workRights: parsed.data.workRights,
        driversLicence: parsed.data.driversLicence,
        resumePath,
        resumeFilename: safeOriginal,
        resumeMime: resume.type,
        resumeSize: resume.size,
        consentAt: new Date(),
      }).returning();
      await tx.insert(applicationEvents).values({
        applicationId: created.id,
        status: "new",
        candidateVisible: true,
        message: "Application received. Our team will review it within five business days.",
      });
      return created;
    });
  } catch (error) {
    await unlink(resumePath).catch(() => undefined);
    console.error("[careers] application storage failed", error);
    return NextResponse.json({ error: "We could not safely save your application. Please try again." }, { status: 500 });
  }

  try {
    const { notifyCareerApplication } = await import("@/lib/email");
    await notifyCareerApplication({
      name: application.firstName,
      email: application.email,
      reference: application.referenceCode,
      role: application.roleInterest,
      token: application.accessToken,
      origin: new URL(request.url).origin,
    });
  } catch (error) {
    console.error("[careers] acknowledgement email failed", error);
  }

  return NextResponse.json({ ok: true, token: accessToken, reference: referenceCode });
}
