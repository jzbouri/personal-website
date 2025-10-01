"use client";

import Link from "next/link";
import Image from "next/image";
import type { ElementType } from "react";
import type { ProjectItem } from "./types";

interface ProjectCardProps {
  item: ProjectItem;
}

export default function ProjectCard({ item }: ProjectCardProps) {
  const Wrapper: ElementType = item.linkUrl ? Link : "div";

  return (
    <Wrapper
      {...(item.linkUrl
        ? {
            href: item.linkUrl,
            target: "_blank",
            rel: "noreferrer noopener",
            "aria-label": `Visit ${item.name} link`,
          }
        : {})}
      className="group block h-full rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
    >
      <article className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-[var(--surface-1)] p-4 transition-all duration-300 hover:border-white/20 hover:bg-[var(--surface-2)] sm:p-5">
        <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" aria-hidden>
          <div className="absolute inset-0 bg-[radial-gradient(120%_120%_at_0%_0%,rgba(96,165,250,0.16),transparent_60%),radial-gradient(120%_120%_at_100%_100%,rgba(34,211,238,0.16),transparent_60%),radial-gradient(140%_140%_at_100%_0%,rgba(192,132,252,0.16),transparent_60%)]" />
        </div>

        <div className="relative z-10 flex items-start gap-4">
          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md border border-white/10 bg-white/5 shadow-sm shadow-white/5">
            {item.logoSrc ? (
              <Image src={item.logoSrc} alt={`${item.name} logo`} fill sizes="48px" className="object-contain p-1" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xs text-white/40">No Logo</div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-start gap-3">
              <h3 className="truncate text-base font-semibold leading-tight tracking-tight text-white font-brand-mono">
                {item.name}
              </h3>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-white/60">
              <span className="flex items-center gap-1">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="opacity-70" aria-hidden>
                  <path d="M12 8a1 1 0 0 1 1 1v3.382l2.447 1.224a1 1 0 1 1-.894 1.788l-3-1.5A1 1 0 0 1 11 13V9a1 1 0 0 1 1-1zm0-6a10 10 0 1 0 0 20 10 10 0 0 0 0-20z"/>
                </svg>
                <span className="whitespace-nowrap">
                  {item.startDate}
                  {item.endDate ? ` – ${item.endDate}` : ""}
                </span>
              </span>
              {null}
            </div>
          </div>
        </div>

        <div className="mt-3 space-y-1.5">
          <div className="text-[11px] uppercase tracking-wider text-white/40">About</div>
          {typeof item.description === "string" ? (
            <p
              className="text-[15px] leading-relaxed text-white/85 [&_a]:text-emerald-300 [&_a:hover]:text-emerald-200 [&_a]:underline [&_a]:decoration-emerald-400/50 [&_a]:underline-offset-2"
              dangerouslySetInnerHTML={{ __html: item.description }}
            />
          ) : (
            <p className="text-[15px] leading-relaxed text-white/85 [&_a]:text-emerald-300 [&_a:hover]:text-emerald-200 [&_a]:underline [&_a]:decoration-emerald-400/50 [&_a]:underline-offset-2">{item.description}</p>
          )}
        </div>

        {item.tech?.length ? (
          <div className="mt-3 space-y-1.5">
            <div className="text-[11px] uppercase tracking-wider text-white/40">Tech stack</div>
            <div className="flex flex-wrap gap-2">
              {item.tech.slice(0, 5).map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2.5 py-1 text-[11px] font-medium text-emerald-200"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        ) : null}
      </article>
    </Wrapper>
  );
}


