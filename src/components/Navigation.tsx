import { useState } from "react";
import { List, Moon, Sun, X } from "@phosphor-icons/react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { GlassSurface } from "./GlassSurface";
import { portfolio } from "../content";

const links = [
  ["Home", "#home"],
  ["About", "#about"],
  ["Projects", "#projects"],
  ["Contact", "#contact"],
];

interface NavigationProps {
  theme: "light" | "dark";
  onToggleTheme: () => void;
}

export function Navigation({ theme, onToggleTheme }: NavigationProps) {
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotion();

  return (
    <header className="fixed inset-x-0 top-0 z-40 px-4 pt-4 md:px-7 md:pt-5">
      <GlassSurface className="mx-auto flex h-16 max-w-7xl items-center justify-between rounded-[18px] px-4 md:px-5">
        <a href="#home" className="focus-ring flex items-center gap-3 rounded-full" aria-label="Back to home">
          <span className="grid size-9 place-items-center rounded-full border border-[var(--glass-border)] bg-[var(--accent)] font-bold text-[#071417]">
            {portfolio.initials}
          </span>
          <span className="hidden text-sm font-semibold sm:block">{portfolio.name}</span>
        </a>

        <nav aria-label="Main navigation" className="hidden items-center gap-1 md:flex">
          {links.map(([label, href]) => (
            <a key={href} href={href} className="nav-link focus-ring rounded-full px-4 py-2 text-sm">
              {label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="icon-button focus-ring"
            onClick={onToggleTheme}
            aria-label={theme === "dark" ? "Use light theme" : "Use dark theme"}
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button
            type="button"
            className="icon-button mobile-menu-button focus-ring"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
          >
            {open ? <X size={20} /> : <List size={20} />}
          </button>
          <a href="#contact" className="primary-button nav-contact focus-ring">
            Contact me
          </a>
        </div>
      </GlassSurface>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            initial={reduce ? false : { opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.22 }}
            className="mx-auto mt-2 max-w-7xl md:hidden"
          >
            <GlassSurface className="mobile-menu-panel grid rounded-[18px] p-2">
              {links.map(([label, href]) => (
                <a
                  key={href}
                  href={href}
                  onClick={() => setOpen(false)}
                  className="focus-ring rounded-xl px-4 py-3 text-sm font-medium"
                >
                  {label}
                </a>
              ))}
            </GlassSurface>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
