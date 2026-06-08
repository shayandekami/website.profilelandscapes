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
};
