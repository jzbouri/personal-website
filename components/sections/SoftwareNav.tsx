"use client";

import { useEffect, useRef, useState } from "react";

const SECTIONS = [
  { id: "github", label: "GitHub" },
  { id: "experiences", label: "Experience" },
  { id: "projects", label: "Projects" },
] as const;
type SectionId = typeof SECTIONS[number]["id"];

export default function SoftwareNav() {
  const [activeId, setActiveId] = useState<SectionId>(SECTIONS[0].id);
  const navRef = useRef<HTMLDivElement | null>(null);
  const listRef = useRef<HTMLUListElement | null>(null);
  const linkRefs = useRef<Record<string, HTMLAnchorElement | null>>({});
  const [indicator, setIndicator] = useState<{ x: number; width: number }>({ x: 0, width: 0 });
  const isAutoScrollingRef = useRef<boolean>(false);
  const rafRef = useRef<number | null>(null);
  const [isStuck, setIsStuck] = useState<boolean>(false);

  useEffect(() => {
    const computeActive = () => {
      const navTop = navRef.current?.getBoundingClientRect().top ?? 1;
      setIsStuck(navTop <= 0);

      if (isAutoScrollingRef.current) return;
      const navHeight = navRef.current?.offsetHeight ?? 0;
      const scrollYWithOffset = window.scrollY + navHeight + 12;
      let currentId: SectionId = SECTIONS[0].id;
      for (const s of SECTIONS) {
        const el = document.getElementById(s.id);
        if (!el) continue;
        const top = el.getBoundingClientRect().top + window.scrollY;
        if (scrollYWithOffset >= top - 2) currentId = s.id;
      }
      setActiveId(currentId);
    };

    computeActive();
    window.addEventListener("scroll", computeActive, { passive: true });
    window.addEventListener("resize", computeActive);
    return () => {
      window.removeEventListener("scroll", computeActive);
      window.removeEventListener("resize", computeActive);
    };
  }, []);

  useEffect(() => {
    const updateIndicator = () => {
      const listEl = listRef.current;
      const activeLink = linkRefs.current[activeId];
      if (!listEl || !activeLink) return;
      const listRect = listEl.getBoundingClientRect();
      const linkRect = activeLink.getBoundingClientRect();
      const style = window.getComputedStyle(listEl);
      const paddingLeft = parseFloat(style.paddingLeft || "0");
      const paddingRight = parseFloat(style.paddingRight || "0");
      let x = linkRect.left - listRect.left;
      let width = linkRect.width;

      const isFirst = activeId === SECTIONS[0].id;
      const isLast = activeId === SECTIONS[SECTIONS.length - 1].id;
      if (isFirst) {
        x = Math.max(0, x - paddingLeft);
        width += paddingLeft;
      }
      if (isLast) {
        width += paddingRight;
      }
      setIndicator({ x, width });
    };
    updateIndicator();
    window.addEventListener("resize", updateIndicator);
    const id = window.setTimeout(updateIndicator, 0);
    return () => {
      window.removeEventListener("resize", updateIndicator);
      window.clearTimeout(id);
    };
  }, [activeId]);

  const scrollTo = (id: SectionId) => (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    setActiveId(id);
    const el = document.getElementById(id);
    if (el) {
      const navHeight = navRef.current?.offsetHeight ?? 0;
      const targetTop = el.getBoundingClientRect().top + window.scrollY - navHeight - 12;

      const startY = window.scrollY;
      const delta = targetTop - startY;
      const duration = Math.min(800, Math.max(300, Math.abs(delta) * 0.4));
      const startTime = performance.now();

      const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      isAutoScrollingRef.current = true;

      const step = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(1, elapsed / duration);
        const eased = easeInOutCubic(progress);
        window.scrollTo({ top: startY + delta * eased });
        if (progress < 1) {
          rafRef.current = requestAnimationFrame(step);
        } else {
          isAutoScrollingRef.current = false;
          setActiveId(id);
        }
      };

      rafRef.current = requestAnimationFrame(step);
    }
  };

  return (
    <nav
      ref={navRef}
      className={
        "sticky top-0 z-40 py-2 " +
        (isStuck
          ? "mx-[calc(50%-50vw)] px-[calc(50vw-50%)] bg-gradient-to-b from-black/95 via-black/95 to-black/95 border-b border-white/10 shadow-lg shadow-black/30"
          : "-mx-4 px-4 bg-transparent")
      }
    >
      <div className="w-full overflow-x-auto">
        <ul ref={listRef} className="relative mx-auto flex w-max gap-1 rounded-full border border-white/10 bg-white/5 p-1">
          <div
            aria-hidden
            className="pointer-events-none absolute top-0 left-0 h-full rounded-full border border-emerald-400/30 bg-emerald-400/20 transition-all duration-300 ease-out"
            style={{ transform: `translateX(${indicator.x}px)`, width: indicator.width }}
          />
          {SECTIONS.map((section) => {
            const isActive = activeId === section.id;
            return (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  onClick={scrollTo(section.id)}
                  aria-current={isActive ? "page" : undefined}
                  className={
                    "relative z-10 inline-flex items-center rounded-full border px-3 py-1.5 text-sm font-medium transition-colors border-transparent " +
                    (isActive ? "text-emerald-100" : "text-white/70 hover:text-white/90")
                  }
                  ref={(el) => { linkRefs.current[section.id] = el; }}
                >
                  {section.label}
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}


