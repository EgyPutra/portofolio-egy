export const dynamic = "force-static";
import type { MetadataRoute } from "next";
import { content, siteUrl } from "../lib/content";
export default function sitemap(): MetadataRoute.Sitemap {
  if (!siteUrl) return [];
  return [
    "/",
    "/tentang/",
    "/cerita/",
    "/oriflame/",
    "/rekomendasi/",
    "/privasi/",
    "/informasi/",
    ...content.stories
      .filter((s) => s.visible)
      .map((s) => `/cerita/${s.slug}/`),
  ].map((path) => ({ url: siteUrl + path }));
}
