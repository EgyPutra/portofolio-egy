import { seed } from "../content/seed";
import snapshot from "../content/published.json";
import origin from "../content/site-origin.json";
import type { SiteContent } from "./types";
// Only a frozen, explicitly published file is read by the public build. No Sanity token or draft query.
export const content: SiteContent = Object.keys(snapshot).length
  ? (snapshot as SiteContent)
  : seed;
export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || origin.previewOrigin;
