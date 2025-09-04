"use client";

import Link from "next/link";
import Image from "next/image";
import type { ExperienceItem } from "./types";

interface ExperienceCardProps {
  item: ExperienceItem;
}

export default function ExperienceCard({ item }: ExperienceCardProps) {
  return (
    <article className="group rounded-lg border border-white/10 p-4 transition-colors hover:border-white/20">
      <div className="flex items-start gap-4">
        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md border border-white/10 bg-white/5">
          <Image
            src={item.companyLogoSrc}
            alt={`${item.companyName} logo`}
            fill
            sizes="48px"
            className="object-contain p-1"
          />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <h3 className="text-base font-semibold leading-tight text-white">
              {item.companyName}
            </h3>
            <div className="flex items-center gap-2 text-sm text-white/70">
              <span>
                {item.startDate} – {item.endDate}
              </span>
              {item.location ? <span aria-hidden>•</span> : null}
              {item.location ? (
                <span className="whitespace-nowrap">{item.location}</span>
              ) : null}
            </div>
          </div>
          <p className="mt-1 line-clamp-2 text-sm text-white/60">
            {item.companyDescription}
          </p>
        </div>
        <Link
          href={item.companyUrl}
          target="_blank"
          rel="noreferrer noopener"
          aria-label={`Visit ${item.companyName} website`}
          className="ml-auto hidden items-center gap-1 rounded-full bg-white px-3 py-1.5 text-sm font-medium text-black transition-colors hover:bg-white/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 sm:inline-flex"
        >
          Visit
          <span aria-hidden>↗</span>
        </Link>
      </div>

      <p className="mt-3 text-sm text-white/80">{item.roleDescription}</p>

      <div className="mt-4 sm:hidden">
        <Link
          href={item.companyUrl}
          target="_blank"
          rel="noreferrer noopener"
          aria-label={`Visit ${item.companyName} website`}
          className="inline-flex w-full justify-center gap-1 rounded-full bg-white px-3 py-2 text-sm font-medium text-black transition-colors hover:bg-white/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
        >
          Visit
          <span aria-hidden>↗</span>
        </Link>
      </div>
    </article>
  );
}


