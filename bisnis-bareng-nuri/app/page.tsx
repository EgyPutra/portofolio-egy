import type { Metadata } from "next";
import { HomeSections } from "../components/editorial";
import { content, siteUrl } from "../lib/content";
export const metadata: Metadata = {
  alternates: siteUrl ? { canonical: siteUrl + "/" } : undefined,
};
export default function Home() {
  return <HomeSections data={content} />;
}
