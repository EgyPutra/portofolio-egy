import type { MetadataRoute } from "next";
import { content, siteUrl } from "../lib/content";
export const dynamic = "force-static";
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: content.demo ? undefined : "/",
      disallow: content.demo ? "/" : ["/kelola/"],
    },
    sitemap: siteUrl ? siteUrl + "/sitemap.xml" : undefined,
  };
}
