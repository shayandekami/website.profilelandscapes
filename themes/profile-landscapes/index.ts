import type { Theme } from "../types";
import { sections } from "./sections";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { ShopPage } from "./shop/ShopPage";
import { ProductPage } from "./shop/ProductPage";
import { NurseryPage } from "./nursery/NurseryPage";
import { PlantPage } from "./nursery/PlantPage";
import { EncyclopediaPage } from "./encyclopedia/EncyclopediaPage";
import { EntryPage } from "./encyclopedia/EntryPage";

export const nav: Theme["nav"] = [
  {
    key: "work",
    label: "Work",
    href: "/projects",
    matches: ["projects", "services", "capability", "landscape-design"],
    tagline: "Design, construct, maintain — Sydney since 1999.",
    children: [
      { href: "/projects", label: "Projects", description: "Recent & signature work" },
      { href: "/services", label: "Services", description: "Construction, maintenance, design" },
      { href: "/landscape-design", label: "Design studio", description: "Concepts, planting plans, visualisation" },
      { href: "/capability", label: "Capability", description: "Team, plant & contracting scope" },
    ],
  },
  {
    key: "plants",
    label: "Plants",
    href: "/nursery",
    matches: ["nursery", "encyclopedia"],
    tagline: "Grown at Petersham. Documented since 1999.",
    children: [
      { href: "/nursery", label: "Nursery", description: "Retail & trade stock from our yard" },
      { href: "/encyclopedia", label: "Encyclopedia", description: "318 plant entries, curated by Carlo" },
    ],
  },
  {
    key: "about",
    label: "About",
    href: "/about",
    matches: ["about", "careers"],
    tagline: "A quarter-century of landscape craft.",
    children: [
      { href: "/about", label: "About the studio", description: "Our story, director, awards" },
      { href: "/careers", label: "Careers", description: "Roles on site and in the studio" },
    ],
  },
];

export const theme: Theme = {
  name: "Profile Landscapes",
  stylesheet: "/themes/profile-landscapes/site.css",
  sections,
  chrome: { Header, Footer },
  nav,
  tokens: {
    "--ink": "#133024",
    "--paper": "#ffffff",
    "--bone": "#f4efe4",
    "--accent": "#1f5a3d",
    "--cream": "#e8dcb6",
  },
  commerce: {
    ShopPage,
    ProductPage,
  },
  nursery: {
    NurseryPage,
    PlantPage,
  },
  encyclopedia: {
    IndexPage: EncyclopediaPage,
    EntryPage,
  },
};
