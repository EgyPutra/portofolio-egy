"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { IconMenu2, IconX, IconArrowUpRight } from "@tabler/icons-react";
import { ChatButton } from "./ui";
const links = [
  ["/tentang/", "Tentang Nuri"],
  ["/cerita/", "Cerita"],
  ["/oriflame/", "Oriflame"],
  ["/rekomendasi/", "Rekomendasi"],
];
export function Header({ demo = false }: { demo?: boolean }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const menu = useRef<HTMLButtonElement>(null);
  const nav = useRef<HTMLElement>(null);
  useEffect(() => {
    if (!open) return;
    function key(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        menu.current?.focus();
      }
      if (e.key === "Tab") {
        const items = [
          menu.current,
          ...Array.from(
            nav.current?.querySelectorAll<HTMLElement>("a,button") || [],
          ),
        ].filter(Boolean) as HTMLElement[];
        const first = items[0],
          last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
    document.addEventListener("keydown", key);
    return () => document.removeEventListener("keydown", key);
  }, [open]);
  return (
    <>
      <a className="skip-link" href="#main">
        Langsung ke konten
      </a>
      {demo && (
        <div className="preview-notice">
          Pratinjau desain <span>·</span> Foto dan produk ilustrasi{" "}
          <Link href="/informasi/">
            Selengkapnya <IconArrowUpRight size={13} />
          </Link>
        </div>
      )}
      <header className="site-header">
        <div className="shell nav-shell">
          <Link
            className="wordmark"
            href="/"
            aria-label="Bisnis Bareng Nuri, beranda"
          >
            Nuri<span className="wordmark-dot">.</span>
          </Link>
          <button
            ref={menu}
            className="icon-button menu-toggle"
            aria-expanded={open}
            aria-controls="main-nav"
            aria-label={open ? "Tutup menu" : "Buka menu"}
            onClick={() => setOpen(!open)}
          >
            {open ? <IconX /> : <IconMenu2 />}
          </button>
          <nav
            ref={nav}
            id="main-nav"
            className={open ? "nav open" : "nav"}
            aria-label="Navigasi utama"
          >
            {links.map(([href, label]) => (
              <Link
                key={href}
                href={href}
                aria-current={path === href ? "page" : undefined}
                onClick={() => setOpen(false)}
              >
                {label}
              </Link>
            ))}
            <div className="mobile-chat">
              <ChatButton />
            </div>
          </nav>
          <div className="desktop-chat">
            <ChatButton />
          </div>
        </div>
      </header>
    </>
  );
}
