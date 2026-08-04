import { JobEditor } from "@/components/admin/JobEditor";
import { createJob } from "../actions";
export default function NewJobPage() { return <main className="main-content"><div className="page-head-a"><div><h1>New <span className="it">job.</span></h1></div></div><JobEditor action={createJob} /></main>; }
