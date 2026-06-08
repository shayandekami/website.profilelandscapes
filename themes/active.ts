/**
 * Resolves the active theme from the THEME env var.
 *
 * Each supported theme is statically imported here so Next.js can tree-shake
 * unused themes out of the production bundle. To register a new theme:
 *   1. Add an import below
 *   2. Add a case to the switch
 */
import type { Theme } from "./types";
import { theme as profileLandscapes } from "./profile-landscapes";

const themeName = process.env.THEME || "profile-landscapes";

let active: Theme;
switch (themeName) {
  case "profile-landscapes":
  default:
    active = profileLandscapes;
    break;
}

export const theme = active;
