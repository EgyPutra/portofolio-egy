import { useClient } from "sanity";
export function usePublicationApi() {
  const client = useClient({ apiVersion: "2025-02-19" });
  return async function api<T>(
    path: string,
    options: RequestInit = {},
  ): Promise<T> {
    const origin = process.env.SANITY_STUDIO_PUBLICATION_URL;
    if (!origin)
      throw new Error(
        "Pengendali publikasi belum dikonfigurasi. Isi SANITY_STUDIO_PUBLICATION_URL.",
      );
    const token = client.config().token;
    if (!token)
      throw new Error(
        "Sesi belum tersedia. Masuk kembali ke Studio dan gunakan autentikasi token.",
      );
    const response = await fetch(origin.replace(/\/$/, "") + path, {
      ...options,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        ...options.headers,
      },
    });
    const data = await response.json();
    if (!response.ok)
      throw new Error(
        data.error || "Permintaan belum berhasil. Silakan coba lagi.",
      );
    return data as T;
  };
}
