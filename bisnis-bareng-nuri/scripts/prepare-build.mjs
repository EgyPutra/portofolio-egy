import fs from "node:fs/promises";
const data = JSON.parse(await fs.readFile("content/published.json", "utf8"));
await fs.writeFile(
  "public/publication.json",
  JSON.stringify({ publicationId: data.publicationId || "design-preview" }),
);
