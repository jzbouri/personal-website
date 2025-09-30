"use client";

import { useEffect, useRef, useState } from "react";
import { FaArrowUp } from "react-icons/fa6";
import type React from "react";

const SECTIONS = [
  { id: "about", label: "About" },
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
  const [shiftX, setShiftX] = useState<number>(0);
  const [isCompact, setIsCompact] = useState<boolean>(false);
  const [hasMounted, setHasMounted] = useState<boolean>(false);
  const [enableShiftTransition, setEnableShiftTransition] = useState<boolean>(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    const id = requestAnimationFrame(() => setEnableShiftTransition(true));
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(([entry]) => {
      setIsStuck(!entry.isIntersecting);
    }, { threshold: [0, 1] });
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const computeActive = () => {
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
      const borderLeft = parseFloat(style.borderLeftWidth || "0");
      const borderRight = parseFloat(style.borderRightWidth || "0");

      if (isFirst) {
        const extraLeft = paddingLeft + borderLeft;
        x = Math.max(0, x - extraLeft);
        width += extraLeft;
      }

      if (isLast) {
        const extraRight = paddingRight + borderRight;
        x = Math.max(0, x - extraRight / 2);
        width += extraRight;
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

  useEffect(() => {
    const handleResizeFlag = () => {
      const vw = window.innerWidth || 0;
      setIsCompact(vw < 430);
    };
    handleResizeFlag();
    window.addEventListener("resize", handleResizeFlag);
    return () => window.removeEventListener("resize", handleResizeFlag);
  }, []);

  useEffect(() => {
    const computeShift = () => {
      const listEl = listRef.current;
      const wrapperEl = listEl?.parentElement as HTMLElement | null;
      if (!listEl || !wrapperEl) return;
      const wrapperWidth = wrapperEl.clientWidth;
      const listWidth = listEl.offsetWidth;
      const leftover = Math.max(0, wrapperWidth - listWidth);
      const target = isCompact ? (leftover / 2) : (isStuck ? leftover : leftover / 2);
      setShiftX(target);
    };
    computeShift();
    window.addEventListener("resize", computeShift);
    return () => window.removeEventListener("resize", computeShift);
  }, [isStuck, activeId, isCompact]);

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

  const scrollToTop = () => {
    const startY = window.scrollY;
    if (startY === 0) return;
    const targetTop = 0;
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
        setActiveId(SECTIONS[0].id);
      }
    };
    rafRef.current = requestAnimationFrame(step);
  };

  const handleNavClick = (e: React.MouseEvent<HTMLElement>) => {
    if (!isStuck || !isCompact) return;
    const listEl = listRef.current;
    if (listEl && listEl.contains(e.target as Node)) return;
    scrollToTop();
  };

  return (
    <>
      <div ref={sentinelRef} aria-hidden className="h-px w-px" />
      <nav
        ref={navRef}
        className={"sticky top-0 z-40 py-2 mx-[calc(50%-50vw)] px-[calc(50vw-50%)]"}
        onClick={handleNavClick}
      >
      <div className="pointer-events-none absolute inset-0 transition-opacity duration-300 ease-out" aria-hidden style={{ opacity: isStuck ? 1 : 0, transform: "translateZ(0)", willChange: "opacity, transform", backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}>
        <div className="h-full w-full bg-gradient-to-b from-black/95 via-black/95 to-black/95 border-b border-white/10 shadow-lg shadow-black/30 backdrop-blur-sm" style={{ transform: "translateZ(0)", willChange: "opacity, transform", backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }} />
      </div>
      <div className="relative z-10 flex items-center gap-2 px-4 min-h-12">
        {!isCompact && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); scrollToTop(); }}
            aria-label="Scroll to top"
            title="Scroll to top"
            className={
              "absolute left-4 top-1/2 -translate-y-1/2 inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-white/80 shadow-sm shadow-white/5 transition-all duration-300 ease-out hover:border-white/20 hover:bg-white/[0.12] hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 " +
              (isStuck ? "opacity-100 translate-y-[-50%]" : "opacity-0 -translate-y-[60%] pointer-events-none")
            }
          >
            <FaArrowUp size={16} />
          </button>
        )}
        <div className="flex-1 w-0 overflow-x-auto">
          <ul
            ref={listRef}
            className={`relative flex w-max gap-1 rounded-full border border-white/10 bg-white/5 p-1 ease-out ${hasMounted ? "opacity-100" : "opacity-0"} ${enableShiftTransition && !isCompact ? "transition-[opacity,transform]" : "transition-opacity"} duration-300 will-change-transform`}
            style={{ transform: `translateX(${shiftX}px)` }}
          >
            <div
              aria-hidden
              className="pointer-events-none absolute top-0 left-0 h-full rounded-full border border-emerald-400/30 bg-emerald-400/20 duration-300 ease-out"
              style={{ transform: `translateX(${indicator.x}px)`, width: indicator.width, transition: enableShiftTransition ? "transform 300ms ease-out, width 300ms ease-out" : "none" }}
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
      </div>
      </nav>
    </>
  );
}


