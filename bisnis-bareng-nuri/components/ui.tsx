"use client";
import {
  createContext,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  IconArrowUpRight,
  IconBrandWhatsapp,
  IconX,
  IconPhoto,
} from "@tabler/icons-react";
import type { Settings, Photo } from "../lib/types";
import { safeUrl, whatsappUrl } from "../lib/utils";
const ContactContext = createContext<(kind?: string, product?: string) => void>(
  () => {},
);
export const useContact = () => useContext(ContactContext);
export function ContactProvider({
  settings,
  children,
}: {
  settings: Settings;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [context, setContext] = useState({ kind: "bisnis", product: "" });
  function open(kind = "bisnis", product = "") {
    setContext({ kind, product });
    ref.current?.showModal();
  }
  const message =
    context.kind === "bisnis"
      ? settings.whatsappBusinessMessage
      : settings.whatsappProductMessage.replace(
          "{product}",
          context.product || "pilihan produk",
        );
  const url = whatsappUrl(settings.whatsappNumber, message);
  return (
    <ContactContext.Provider value={open}>
      {children}
      <dialog
        ref={ref}
        className="contact-dialog"
        onClick={(e) => {
          if (e.target === e.currentTarget) ref.current?.close();
        }}
        aria-labelledby="dialog-title"
      >
        <button
          className="icon-button dialog-close"
          aria-label="Tutup percakapan"
          onClick={() => ref.current?.close()}
        >
          <IconX size={23} />
        </button>
        <div className="dialog-mark">
          <IconBrandWhatsapp size={30} />
        </div>
        <p className="eyebrow">MULAI PERCAKAPAN</p>
        <h2 id="dialog-title">Senang bisa berkenalan.</h2>
        {url ? (
          <>
            <p>
              Kirim pesan untuk{" "}
              {context.kind === "bisnis"
                ? "mengenal bisnis dari rumah"
                : context.product || "menanyakan pilihan produk"}
              .
            </p>
            <p className="message-preview">{message}</p>
            <a
              className="button primary"
              href={url}
              target="_blank"
              rel="noopener noreferrer"
            >
              Lanjut ke WhatsApp <IconArrowUpRight size={19} />
            </a>
          </>
        ) : (
          <>
            <p>
              {context.kind === "link"
                ? "Tautan produk ini belum tersedia."
                : "Nomor WhatsApp Nuri belum dikonfigurasi."}{" "}
              Kontak dan tautan belanja akan tersedia setelah diperbarui oleh
              Nuri.
            </p>
            <button
              className="button primary"
              onClick={() => ref.current?.close()}
            >
              Kembali menjelajah
            </button>
          </>
        )}
      </dialog>
    </ContactContext.Provider>
  );
}
export function ChatButton({
  kind = "bisnis",
  product,
  children,
  className = "button primary",
}: {
  kind?: string;
  product?: string;
  children?: ReactNode;
  className?: string;
}) {
  const open = useContact();
  return (
    <button className={className} onClick={() => open(kind, product)}>
      {children || (
        <>
          <IconBrandWhatsapp size={19} />
          Chat Nuri <IconArrowUpRight size={18} />
        </>
      )}
    </button>
  );
}
export function ExternalButton({
  url,
  children,
  className = "text-link",
  affiliate = false,
  hosts,
}: {
  url: string;
  children: ReactNode;
  className?: string;
  affiliate?: boolean;
  hosts?: string[];
}) {
  const open = useContact();
  const safe = safeUrl(url, hosts);
  return safe ? (
    <a
      href={safe}
      className={className}
      rel={`noopener noreferrer${affiliate ? " sponsored nofollow" : ""}`}
      target="_blank"
    >
      {children}
    </a>
  ) : (
    <button className={className} onClick={() => open("link")}>
      {children}
    </button>
  );
}
export function PhotoView({
  photo,
  className = "",
  priority = false,
  sizes,
}: {
  photo: Photo;
  className?: string;
  priority?: boolean;
  sizes?: string;
}) {
  const [failed, setFailed] = useState(false);
  const src = photo?.src?.startsWith("/images/")
    ? photo.src
    : safeUrl(photo?.src);
  return (
    <div className={`photo ${className}`}>
      {!failed && src ? (
        <img
          src={src}
          alt={photo.alt || "Foto belum diberi deskripsi"}
          width="1200"
          height="1000"
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : "auto"}
          decoding="async"
          sizes={sizes}
          style={
            photo.focalPoint
              ? {
                  objectPosition: `${photo.focalPoint.x * 100}% ${photo.focalPoint.y * 100}%`,
                }
              : undefined
          }
          onError={() => setFailed(true)}
        />
      ) : (
        <div className="image-missing">
          <IconPhoto size={30} />
          <span>Foto sedang disiapkan</span>
        </div>
      )}
    </div>
  );
}
