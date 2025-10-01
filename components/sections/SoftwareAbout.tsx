"use client";

export default function SoftwareAbout() {
  const handleProjectsClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const navLink = document.querySelector('nav a[href="#projects"]') as HTMLAnchorElement | null;
    if (navLink) {
      navLink.click();
      return;
    }
    const el = document.getElementById("projects");
    if (!el) return;
    const stickyNav = document.querySelector("nav.sticky") as HTMLElement | null;
    const navHeight = stickyNav?.offsetHeight ?? 0;
    const targetTop = el.getBoundingClientRect().top + window.scrollY - navHeight - 12;
    const startY = window.scrollY;
    const delta = targetTop - startY;
    const duration = Math.min(800, Math.max(300, Math.abs(delta) * 0.4));
    const startTime = performance.now();
    const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      const eased = easeInOutCubic(progress);
      window.scrollTo({ top: startY + delta * eased });
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  return (
    <div id="about" className="scroll-mt-28 sm:scroll-mt-32 group">
      <article className="relative overflow-hidden rounded-2xl border border-white/10 bg-[var(--surface-1)] p-4 sm:p-5 md:p-6 transition-all duration-300 hover:border-white/20 hover:bg-[var(--surface-2)]">
        <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" aria-hidden>
          <div className="absolute inset-0 bg-[radial-gradient(120%_120%_at_0%_0%,rgba(96,165,250,0.16),transparent_60%),radial-gradient(120%_120%_at_100%_100%,rgba(34,211,238,0.16),transparent_60%),radial-gradient(140%_140%_at_100%_0%,rgba(192,132,252,0.16),transparent_60%)]" />
        </div>
        <div className="relative z-10">
          <h2 className="text-sm font-semibold text-white/90 font-brand-mono">About</h2>
          <div className="mt-2 space-y-3 text-white/80">
            <p>
              I&apos;m a software engineer focused on scalable and secure full-stack development - backend services, cloud infrastructure, frontend, and observability. I&apos;ve shipped products at {" "}
              <a
                href="https://www.linkedin.com/company/deloitte/people/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-300 underline decoration-emerald-300/30 underline-offset-4 transition-colors hover:text-emerald-200"
              >
                global enterprises with over 500k employees
              </a>
              , and {" "}
              <a
                href="https://www.linkedin.com/company/ridges-ai/people/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-300 underline decoration-emerald-300/30 underline-offset-4 transition-colors hover:text-emerald-200"
              >
                teams as small as four
              </a>
              , plus some {" "}
              <a
                href="#projects"
                onClick={handleProjectsClick}
                className="text-emerald-300 underline decoration-emerald-300/30 underline-offset-4 transition-colors hover:text-emerald-200"
              >
                solo projects
              </a>
              .
            </p>
            <p>
              I completed first year CS at Carleton before transferring to the CS program at uWaterloo, where I&apos;m entering my third year. Core stack: Python, Java, the Next.js/React ecosystem, and AWS/Azure, with growing blockchain/trading experience.
            </p>
            <p>
              I learn quickly and enjoy picking up new tools. Feel free to {" "}
              <a
                href="mailto:jz.bouri@gmail.com"
                className="text-emerald-300 underline decoration-emerald-300/30 underline-offset-4 transition-colors hover:text-emerald-200"
              >
                reach out
              </a>
              .
            </p>
          </div>
        </div>
      </article>
    </div>
  );
}


