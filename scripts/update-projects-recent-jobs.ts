import "dotenv/config";
import { eq } from "drizzle-orm";
import { db, pages } from "../lib/db";

const recentProps = {
  recentEyebrow: "From the live project register",
  recentTitle: "Selected recent appointments.",
  recentBody:
    "A current snapshot of landscape packages recently awarded or in delivery across Sydney. These appointments sit alongside a much broader active project register.",
  recentNote:
    "Selected recent appointments only. This is not a complete list of current or completed Profile Landscapes projects. Value bands are indicative of project scale only and do not disclose contract pricing.",
  featuredJob: {
    name: "Woolworths Eastern Creek",
    location: "Eastern Creek",
    client: "BESIX Watpac",
    stage: "In construction",
    value: "$1m+",
    summary: "A major landscape construction package currently progressing on site.",
  },
  recentJobs: [
    { name: "Woolworths Eastern Creek", location: "Eastern Creek", client: "BESIX Watpac", stage: "In construction", value: "$1m+" },
    { name: "Melrose Park Public School", location: "Melrose Park", client: "Taylor", stage: "In construction", value: "$750k–$1m" },
    { name: "WSA — Canine Facility", location: "Western Sydney Airport", client: "CPB Contractors", stage: "In construction", value: "$750k–$1m" },
    { name: "The Collective", location: "St Leonards", client: "Westbourne", stage: "In construction", value: "$250k–$500k" },
    { name: "The Switch Macquarie Park", location: "Macquarie Park", client: "Taylor", stage: "In construction", value: "$250k–$500k" },
    { name: "Tallowwood Apartments", location: "Sydney", client: "Versatile", stage: "In construction", value: "$250k–$500k" },
    { name: "Hardi Aged Care", location: "Blacktown", client: "Belmadar", stage: "Recently awarded", value: "$250k–$500k" },
  ],
};

async function main() {
  const page = await db.query.pages.findFirst({ where: eq(pages.slug, "/projects") });
  if (!page) throw new Error("The /projects CMS page does not exist.");

  const sections = (page.sections ?? []).map((section) =>
    section.type === "project_grid"
      ? { ...section, props: { ...section.props, ...recentProps } }
      : section,
  );

  await db
    .update(pages)
    .set({ sections, updatedAt: new Date() })
    .where(eq(pages.id, page.id));

  console.log("Updated /projects recent jobs CMS content.");
}

main().then(() => process.exit(0)).catch((error) => {
  console.error(error);
  process.exit(1);
});
