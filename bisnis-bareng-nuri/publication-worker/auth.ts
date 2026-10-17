import { PublicationError } from "./core";
export async function authorizePublisher(
  req: Request,
  allowedIds: string,
  fetcher: typeof fetch = fetch,
) {
  const a = req.headers.get("Authorization") || "";
  if (!a.startsWith("Bearer ") || a.length < 15)
    throw new PublicationError(
      "Sesi berakhir. Silakan masuk kembali ke Studio.",
      401,
    );
  const token = a.slice(7);
  const r = await fetcher("https://api.sanity.io/v2021-06-07/users/me", {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!r.ok)
    throw new PublicationError("Sesi berakhir. Silakan masuk kembali.", 401);
  const u = (await r.json()) as { id?: string };
  if (
    !u.id ||
    !allowedIds
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .includes(u.id)
  )
    throw new PublicationError("Akun ini tidak memiliki akses publikasi.", 403);
  return { token, id: u.id };
}
