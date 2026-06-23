"use client";

/**
 * Plant schedule — a saved working list for landscape buyers to collect species
 * while browsing, compare specs side-by-side, export to CSV, and push the whole
 * lot to a quote. Stored under pl_schedule, independent of the buy/quote carts.
 */

export type ScheduleItem = {
  slug: string;
  latin: string;
  common?: string;
  image?: string;
  size?: string;
  priceCents?: number;
  water?: string;
  light?: string;
  growthRate?: string;
  matureSize?: string;
};

const KEY = "pl_schedule";

export function getSchedule(): ScheduleItem[] {
  if (typeof window === "undefined") return [];
  try {
    const v = JSON.parse(localStorage.getItem(KEY) || "[]");
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

export function saveSchedule(items: ScheduleItem[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(items));
  document.querySelectorAll("[data-schedule-count]").forEach((el) => {
    el.textContent = String(items.length);
    (el as HTMLElement).style.display = items.length > 0 ? "" : "none";
  });
  window.dispatchEvent(new CustomEvent("pl-schedule-change", { detail: { total: items.length } }));
}

export function inSchedule(slug: string): boolean {
  return getSchedule().some((i) => i.slug === slug);
}

export function toggleSchedule(item: ScheduleItem): boolean {
  const items = getSchedule();
  const idx = items.findIndex((i) => i.slug === item.slug);
  if (idx >= 0) {
    items.splice(idx, 1);
    saveSchedule(items);
    return false;
  }
  items.push(item);
  saveSchedule(items);
  return true;
}

export function removeFromSchedule(slug: string) {
  saveSchedule(getSchedule().filter((i) => i.slug !== slug));
}

export function clearSchedule() {
  saveSchedule([]);
}

export function scheduleCount(): number {
  return getSchedule().length;
}
