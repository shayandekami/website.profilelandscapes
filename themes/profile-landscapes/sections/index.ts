import type { SectionComponent } from "../../types";
import { Hero } from "./Hero";
import { Pillars } from "./Pillars";
import { Stats } from "./Stats";
import { Cta } from "./Cta";
import { PageHead } from "./PageHead";
import { TwoCol } from "./TwoCol";
import { ContactForm } from "./ContactForm";
import { ProjectGrid } from "./ProjectGrid";
import { Gallery } from "./Gallery";
import { Rich } from "./Rich";
import { FeaturedProjects } from "./FeaturedProjects";
import { NurserySpotlight } from "./NurserySpotlight";
import { Clients } from "./Clients";
import { Testimonial } from "./Testimonial";
import { CareersMini } from "./CareersMini";
import { CareersHub } from "./CareersHub";
import { DirectorProfile } from "./DirectorProfile";
import { ServiceBlocks } from "./ServiceBlocks";
import { LegalContent } from "./LegalContent";

/**
 * Maps section.type → renderer. The renderer falls back to a soft warning
 * if the DB ever contains a type this theme doesn't implement, so a missing
 * component never crashes the page.
 */
export const sections: Record<string, SectionComponent> = {
  hero: Hero,
  pillars: Pillars,
  stats: Stats,
  cta: Cta,
  page_head: PageHead,
  two_col: TwoCol,
  contact_form: ContactForm,
  project_grid: ProjectGrid,
  gallery: Gallery,
  rich: Rich,
  featured_projects: FeaturedProjects,
  nursery_spotlight: NurserySpotlight,
  clients: Clients,
  testimonial: Testimonial,
  careers_mini: CareersMini,
  careers_hub: CareersHub,
  director_profile: DirectorProfile,
  service_blocks: ServiceBlocks,
  legal_content: LegalContent,
};
