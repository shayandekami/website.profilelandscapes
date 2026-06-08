"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db, projects, projectImages, auditLog } from "@/lib/db";
import { eq, desc } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { nanoid } from "nanoid";

const Sector = z.enum([
  "residential",
  "commercial",
  "civic",
  "healthcare",
  "hospitality",
  "other",
]);

export async function createProject() {
  const session = await auth();
  if (!session?.user) throw new Error("Not signed in");

  const slug = `untitled-${nanoid(6).toLowerCase()}`;
  const [inserted] = await db
    .insert(projects)
    .values({
      slug,
      title: "Untitled project",
      sector: "commercial",
      status: "draft",
    })
    .returning({ id: projects.id });

  await db.insert(auditLog).values({
    userId: Number(session.user.id),
    action: "project.create",
    resource: "project",
    resourceId: String(inserted.id),
  });

  revalidatePath("/admin/portfolio");
  redirect(`/admin/portfolio/${inserted.id}`);
}

const ProjectInput = z.object({
  id: z.number(),
  slug: z
    .string()
    .min(1)
    .max(200)
    .regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers, hyphens only"),
  title: z.string().min(1).max(200),
  suburb: z.string().max(120).optional().or(z.literal("")),
  sector: Sector,
  principal: z.string().max(200).optional().or(z.literal("")),
  packageValue: z.string().max(80).optional().or(z.literal("")),
  summary: z.string().max(1000).optional().or(z.literal("")),
  body: z.string().max(20000).optional().or(z.literal("")),
  heroImage: z.string().max(500).optional().or(z.literal("")),
  featured: z.boolean(),
  status: z.enum(["draft", "live"]),
});

export type SaveResult =
  | { ok: true; updatedAt: string }
  | { ok: false; error: string };

export async function saveProject(input: unknown): Promise<SaveResult> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: "Not signed in" };

  const parsed = ProjectInput.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message || "Invalid input" };
  }
  const d = parsed.data;

  // Ensure slug is unique (other than this row)
  const existing = await db.query.projects.findFirst({
    where: eq(projects.slug, d.slug),
  });
  if (existing && existing.id !== d.id) {
    return { ok: false, error: `Slug "${d.slug}" is already used by another project` };
  }

  const now = new Date();
  await db
    .update(projects)
    .set({
      slug: d.slug,
      title: d.title,
      suburb: d.suburb || null,
      sector: d.sector,
      principal: d.principal || null,
      packageValue: d.packageValue || null,
      summary: d.summary || null,
      body: d.body || null,
      heroImage: d.heroImage || null,
      featured: d.featured,
      status: d.status,
      updatedAt: now,
    })
    .where(eq(projects.id, d.id));

  await db.insert(auditLog).values({
    userId: Number(session.user.id),
    action: "project.save",
    resource: "project",
    resourceId: String(d.id),
    meta: { slug: d.slug, status: d.status },
  });

  revalidatePath("/projects");
  revalidatePath(`/projects/${d.slug}`);
  revalidatePath("/admin/portfolio");

  return { ok: true, updatedAt: now.toISOString() };
}

export async function deleteProject(id: number) {
  const session = await auth();
  if (!session?.user) throw new Error("Not signed in");

  const project = await db.query.projects.findFirst({
    where: eq(projects.id, id),
  });

  await db.delete(projects).where(eq(projects.id, id));

  if (project) {
    await db.insert(auditLog).values({
      userId: Number(session.user.id),
      action: "project.delete",
      resource: "project",
      resourceId: String(id),
      meta: { slug: project.slug, title: project.title },
    });
  }

  revalidatePath("/admin/portfolio");
  revalidatePath("/projects");
  redirect("/admin/portfolio");
}

const ImageInput = z.object({
  projectId: z.number(),
  url: z.string().min(1).max(500),
  alt: z.string().max(300).optional(),
});

export async function addProjectImage(input: unknown) {
  const session = await auth();
  if (!session?.user) return { ok: false as const, error: "Not signed in" };

  const parsed = ImageInput.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: "Invalid image" };

  // Order = current max + 1
  const last = await db
    .select({ order: projectImages.order })
    .from(projectImages)
    .where(eq(projectImages.projectId, parsed.data.projectId))
    .orderBy(desc(projectImages.order))
    .limit(1);

  const order = (last[0]?.order ?? -1) + 1;

  const [inserted] = await db
    .insert(projectImages)
    .values({
      projectId: parsed.data.projectId,
      url: parsed.data.url,
      alt: parsed.data.alt || null,
      order,
    })
    .returning();

  revalidatePath(`/admin/portfolio/${parsed.data.projectId}`);
  return { ok: true as const, image: inserted };
}

export async function removeProjectImage(id: number) {
  const session = await auth();
  if (!session?.user) throw new Error("Not signed in");

  const img = await db.query.projectImages.findFirst({
    where: eq(projectImages.id, id),
  });
  if (!img) return;

  await db.delete(projectImages).where(eq(projectImages.id, id));
  revalidatePath(`/admin/portfolio/${img.projectId}`);
}
