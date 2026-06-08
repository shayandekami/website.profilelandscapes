import { notFound } from "next/navigation";
import { db, projects, projectImages } from "@/lib/db";
import { eq, asc } from "drizzle-orm";
import { ProjectEditor } from "@/components/admin/ProjectEditor";
import {
  saveProject,
  deleteProject,
  addProjectImage,
  removeProjectImage,
} from "../actions";

type Params = { params: Promise<{ id: string }> };

export default async function ProjectEditPage({ params }: Params) {
  const { id } = await params;
  const projectId = Number(id);
  if (!Number.isFinite(projectId)) notFound();

  const project = await db.query.projects.findFirst({
    where: eq(projects.id, projectId),
  });
  if (!project) notFound();

  const images = await db
    .select()
    .from(projectImages)
    .where(eq(projectImages.projectId, projectId))
    .orderBy(asc(projectImages.order));

  return (
    <main className="main-content">
      <ProjectEditor
        project={{
          id: project.id,
          slug: project.slug,
          title: project.title,
          suburb: project.suburb || "",
          sector: project.sector,
          principal: project.principal || "",
          packageValue: project.packageValue || "",
          summary: project.summary || "",
          body: project.body || "",
          heroImage: project.heroImage || "",
          featured: project.featured,
          status: project.status,
          updatedAt: project.updatedAt.toISOString(),
        }}
        images={images.map((i) => ({
          id: i.id,
          url: i.url,
          alt: i.alt || "",
        }))}
        save={saveProject}
        remove={deleteProject}
        addImage={addProjectImage}
        removeImage={removeProjectImage}
      />
    </main>
  );
}
