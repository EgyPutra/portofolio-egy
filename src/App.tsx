import { type FormEvent, useEffect, useState } from "react";
import {
  ArrowDown,
  ArrowUpRight,
  Check,
  Code,
  Copy,
  EnvelopeSimple,
  GithubLogo,
  LinkedinLogo,
  Palette,
} from "@phosphor-icons/react";
import { motion, useReducedMotion } from "motion/react";
import { portfolio } from "./content";
import { FluidParticlesBackground } from "./components/FluidParticlesBackground";
import { GlassSurface } from "./components/GlassSurface";
import { Navigation } from "./components/Navigation";

type Theme = "light" | "dark";

function initialTheme(): Theme {
  const saved = localStorage.getItem("portfolio-theme");
  if (saved === "light" || saved === "dark") return saved;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function Reveal({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.18 }}
      transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function App() {
  const [theme, setTheme] = useState<Theme>(initialTheme);
  const [copied, setCopied] = useState(false);
  const [formStatus, setFormStatus] = useState<"idle" | "error" | "success">("idle");
  const reduce = useReducedMotion();

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("portfolio-theme", theme);
  }, [theme]);

  const copyEmail = async () => {
    await navigator.clipboard.writeText(portfolio.email);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  const submitContact = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") || "").trim();
    const email = String(form.get("email") || "").trim();
    const message = String(form.get("message") || "").trim();
    if (!name || !email || !message || !email.includes("@")) {
      setFormStatus("error");
      return;
    }
    setFormStatus("success");
    window.location.href = `mailto:${portfolio.email}?subject=${encodeURIComponent(`Portfolio message from ${name}`)}&body=${encodeURIComponent(`${message}\n\nReply to: ${email}`)}`;
  };

  return (
    <div className="site-shell">
      <FluidParticlesBackground />
      <div className="background-wash" aria-hidden="true" />
      <Navigation theme={theme} onToggleTheme={() => setTheme(theme === "dark" ? "light" : "dark")} />

      <main className="relative z-10">
        <section id="home" className="mx-auto grid min-h-[100dvh] max-w-7xl items-center gap-10 px-5 pb-14 pt-24 md:grid-cols-[1.02fr_.98fr] md:px-8 md:pb-10 md:pt-24">
          <motion.div
            initial={reduce ? false : { opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-2xl"
          >
            <p className="eyebrow mb-5">AVAILABLE FOR NEW PROJECTS</p>
            <h1 className="text-balance text-[clamp(3rem,6.3vw,5.7rem)] font-semibold leading-[0.94] tracking-[-0.065em]">
              Hi, I’m Egy. <span className="text-accent block">Software & Data Science Enthusiast.</span>
            </h1>
            <p className="mt-6 max-w-[36rem] text-base leading-relaxed text-[var(--text-muted)] md:text-lg">
              {portfolio.intro}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#projects" className="primary-button focus-ring">
                View projects <ArrowUpRight size={17} weight="bold" />
              </a>
              <a href="#contact" className="secondary-button focus-ring">
                Contact me <ArrowDown size={17} weight="bold" />
              </a>
            </div>
          </motion.div>

          <motion.div
            initial={reduce ? false : { opacity: 0, scale: 0.96, x: 26 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 0.9, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
            className="relative mx-auto w-full max-w-xl md:max-w-none"
          >
            <figure className="hero-visual" tabIndex={0} aria-label={`Profile photo of ${portfolio.name}`}>
              <img
                src="/IMG_4470.jpg"
                alt={`Profile photo of ${portfolio.name}`}
                width="1012"
                height="1800"
                fetchPriority="high"
              />
            </figure>
            <GlassSurface className="absolute bottom-3 left-3 max-w-[19rem] rounded-[18px] p-4 md:-left-5 md:bottom-8" interactive>
              <p className="font-mono text-xs leading-relaxed text-[var(--text-muted)]">Active stack: React, Laravel, Python, and Data Science.</p>
            </GlassSurface>
          </motion.div>
        </section>

        <section id="about" className="section-shell">
          <Reveal className="grid items-start gap-12 md:grid-cols-[.72fr_1.28fr] md:gap-20">
            <div>
              <h2 className="section-title">I like building software and learning from data.</h2>
              <p className="mt-5 max-w-md leading-relaxed text-[var(--text-muted)]">{portfolio.about}</p>
            </div>
            <div className="about-grid">
              <GlassSurface className="about-feature rounded-[22px] p-6 md:p-8" interactive>
                <Code size={28} weight="light" />
                <h3 className="mt-12 text-xl font-semibold">Software that solves problems</h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">
                  I build simple, maintainable applications with clear structure and useful features.
                </p>
              </GlassSurface>
              <GlassSurface className="about-note rounded-[22px] p-6 md:p-8" interactive>
                <Palette size={28} weight="light" />
                <h3 className="mt-12 text-xl font-semibold">Data that gives insight</h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">
                  I explore data to find patterns, support decisions, and turn information into something meaningful.
                </p>
              </GlassSurface>
            </div>
          </Reveal>
        </section>

        <section id="projects" className="section-shell">
          <Reveal>
            <p className="eyebrow">SELECTED PROJECTS</p>
            <h2 className="section-title mt-4">A few things I’ve been building.</h2>
            <p className="mt-4 max-w-xl text-[var(--text-muted)]">
              These projects reflect my learning journey in software development, data science, and technology-based problem solving.
            </p>
          </Reveal>

          <div className="project-grid mt-12">
            {portfolio.projects.map((project, index) => (
              <Reveal key={project.title} className={index === 0 ? "project-featured" : ""}>
                <GlassSurface className="project-card h-full rounded-[22px]" interactive>
                  <a href={project.href} aria-label={`Open project ${project.title}`} className="focus-ring block h-full rounded-[22px]">
                    <div className="project-image-wrap">
                      <img src={project.image} alt={`Preview of ${project.title}`} loading="lazy" />
                    </div>
                    <div className="p-5 md:p-6">
                      <div className="flex items-start justify-between gap-5">
                        <div>
                          <h3 className="text-xl font-semibold md:text-2xl">{project.title}</h3>
                          <p className="mt-2 max-w-xl text-sm leading-relaxed text-[var(--text-muted)]">{project.description}</p>
                        </div>
                        <ArrowUpRight className="shrink-0" size={22} />
                      </div>
                      <div className="mt-5 flex flex-wrap gap-2" aria-label="Technologies used">
                        {project.tags.map((tag) => (
                          <span key={tag} className="project-tag">{tag}</span>
                        ))}
                      </div>
                    </div>
                  </a>
                </GlassSurface>
              </Reveal>
            ))}
          </div>
        </section>

        <section id="contact" className="section-shell pb-24 md:pb-32">
          <Reveal>
            <GlassSurface className="contact-panel rounded-[22px] p-5 md:p-10 lg:p-14" interactive>
              <div className="grid gap-12 lg:grid-cols-[.8fr_1.2fr] lg:gap-20">
                <div>
                  <EnvelopeSimple size={34} weight="light" />
                  <h2 className="section-title mt-7">Have an idea worth building?</h2>
                  <p className="mt-5 max-w-md leading-relaxed text-[var(--text-muted)]">
                    Tell me what you are working on. I will reply, and we can figure out the best way to start.
                  </p>
                  <button type="button" onClick={copyEmail} className="copy-email focus-ring mt-7 rounded-xl">
                    <span>{portfolio.email}</span>
                    {copied ? <Check size={18} /> : <Copy size={18} />}
                  </button>
                </div>

                <form onSubmit={submitContact} noValidate className="grid gap-5">
                  <div className="form-field">
                    <label htmlFor="name">Name</label>
                    <input id="name" name="name" autoComplete="name" placeholder="Your name" />
                  </div>
                  <div className="form-field">
                    <label htmlFor="email">Email</label>
                    <input id="email" name="email" type="email" autoComplete="email" placeholder="name@email.com" />
                  </div>
                  <div className="form-field">
                    <label htmlFor="message">Message</label>
                    <textarea id="message" name="message" rows={5} placeholder="Share your idea, needs, or question" />
                  </div>
                  {formStatus === "error" && (
                    <p role="alert" className="form-error">Please fill in every field and use a valid email address.</p>
                  )}
                  {formStatus === "success" && (
                    <p role="status" className="form-success">Your email app is opening.</p>
                  )}
                  <button type="submit" className="primary-button focus-ring w-fit">
                    Send message <ArrowUpRight size={17} weight="bold" />
                  </button>
                </form>
              </div>
            </GlassSurface>
          </Reveal>
        </section>
      </main>

      <footer className="relative z-10 border-t border-[var(--line)] px-5 py-8 md:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-[var(--text-muted)]">© {new Date().getFullYear()} {portfolio.name}. Built with React.</p>
          <div className="flex gap-2">
            <a className="icon-button focus-ring" href={portfolio.socials.github} target="_blank" rel="noreferrer" aria-label="GitHub">
              <GithubLogo size={19} />
            </a>
            <a className="icon-button focus-ring" href={portfolio.socials.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn">
              <LinkedinLogo size={19} />
            </a>
            <a className="icon-button focus-ring" href={`mailto:${portfolio.email}`} aria-label="Email">
              <EnvelopeSimple size={19} />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
