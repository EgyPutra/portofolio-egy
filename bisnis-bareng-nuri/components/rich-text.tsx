import type { Block } from "../lib/types";
import { PhotoView } from "./ui";
export function RichText({ blocks }: { blocks: Block[] }) {
  return (
    <>
      {blocks.map((b, index) => {
        if (b._type === "image" && b.image)
          return (
            <figure key={b._key || index}>
              <PhotoView photo={b.image} />
              {b.caption && <figcaption>{b.caption}</figcaption>}
            </figure>
          );
        if (!b.children?.some((c) => c.text)) return null;
        const spans = b.children.map((c, i) => {
          let child: React.ReactNode = c.text;
          if (c.marks?.includes("strong")) child = <strong>{child}</strong>;
          if (c.marks?.includes("em")) child = <em>{child}</em>;
          return <span key={i}>{child}</span>;
        });
        if (b.style === "h2") return <h2 key={b._key || index}>{spans}</h2>;
        if (b.style === "h3") return <h3 key={b._key || index}>{spans}</h3>;
        if (b.style === "blockquote")
          return <blockquote key={b._key || index}>{spans}</blockquote>;
        return <p key={b._key || index}>{spans}</p>;
      })}
    </>
  );
}
