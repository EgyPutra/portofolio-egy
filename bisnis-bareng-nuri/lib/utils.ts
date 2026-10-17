import type { Product } from "./types";
export function safeUrl(value: unknown, hosts?: string[]): string | null {
  if (typeof value !== "string" || !value.trim()) return null;
  try {
    const u = new URL(value);
    if (u.protocol !== "https:" || u.username || u.password) return null;
    if (
      hosts &&
      !hosts.some((h) => u.hostname === h || u.hostname.endsWith("." + h))
    )
      return null;
    return u.href;
  } catch {
    return null;
  }
}
export function whatsappUrl(number: string, message: string) {
  const n = number.replace(/[\s()+-]/g, "");
  return /^[1-9]\d{7,14}$/.test(n)
    ? `https://wa.me/${n}?text=${encodeURIComponent(message)}`
    : null;
}
export function filterProducts(
  products: Product[],
  query: string,
  category: string,
) {
  const q = query.trim().toLocaleLowerCase("id");
  return products
    .filter(
      (p) =>
        p.visible &&
        (category === "Semua" || p.category === category) &&
        `${p.name} ${p.recommendationNote}`.toLocaleLowerCase("id").includes(q),
    )
    .sort((a, b) => a.sortOrder - b.sortOrder);
}
export const formatDate = (date: string) =>
  new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Makassar",
  }).format(new Date(date));
