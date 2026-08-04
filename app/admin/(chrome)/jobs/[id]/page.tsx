import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db, jobPostings } from "@/lib/db";
import { JobEditor } from "@/components/admin/JobEditor";
import { updateJob } from "../actions";
type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string; created?: string }> };
export default async function EditJobPage({ params, searchParams }: Props) {
  const { id } = await params; const jobId = Number(id);
  const state = await searchParams;
  const [job] = await db.select().from(jobPostings).where(eq(jobPostings.id, jobId)).limit(1);
  if (!job) notFound();
  return <main className="main-content"><div className="page-head-a"><div><h1>Edit <span className="it">{job.title}.</span></h1></div></div><JobEditor job={job} action={updateJob.bind(null, job.id)} savedMessage={state.created ? "Job created and ready for review." : state.saved ? "Changes saved successfully." : undefined} /></main>;
}
