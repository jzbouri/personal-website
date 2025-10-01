"use client";

import { FiCheck, FiCopy, FiMail, FiPhone } from "react-icons/fi";
import { FaDiscord, FaXTwitter, FaGithub, FaLinkedin, FaStrava, FaSpotify, FaLastfm, FaInstagram } from "react-icons/fa6";
import type { ContactItem } from "./types";
import { useCallback } from "react";

function useIsHttp() {
  return useCallback((href?: string) => Boolean(href && /^https?:\/\//i.test(href)), []);
}

function Icon({ label }: { label: string }) {
  switch (label) {
    case "Phone":
      return <FiPhone className="h-5 w-5 text-white/80" aria-hidden />;
    case "Email":
      return <FiMail className="h-5 w-5 text-white/80" aria-hidden />;
    case "Instagram":
      return <FaInstagram className="h-5 w-5 text-white/80" aria-hidden />;
    case "X":
      return <FaXTwitter className="h-5 w-5 text-white/80" aria-hidden />;
    case "LinkedIn":
      return <FaLinkedin className="h-5 w-5 text-white/80" aria-hidden />;
    case "Discord":
      return <FaDiscord className="h-5 w-5 text-white/80" aria-hidden />;
    case "GitHub":
      return <FaGithub className="h-5 w-5 text-white/80" aria-hidden />;
    case "Strava":
      return <FaStrava className="h-5 w-5 text-white/80" aria-hidden />;
    case "Spotify":
      return <FaSpotify className="h-5 w-5 text-white/80" aria-hidden />;
    case "Last.fm":
      return <FaLastfm className="h-5 w-5 text-white/80" aria-hidden />;
    default:
      return null;
  }
}

export default function ContactCard({ item, copied, onCopy }: { item: ContactItem; copied: boolean; onCopy: (value: string) => void; }) {
  const isHttp = useIsHttp();
  const href = item.link || (item.label === "Discord" ? "https://discord.com" : undefined);
  const external = isHttp(href);

  const article = (
    <article className="relative overflow-hidden rounded-2xl border border-white/10 bg-[var(--surface-1)] p-4 transition-all duration-300 hover:border-white/20 hover:bg-[var(--surface-2)] group focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40">
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" aria-hidden>
        <div className="absolute inset-0 bg-[radial-gradient(120%_120%_at_0%_0%,rgba(96,165,250,0.16),transparent_60%),radial-gradient(120%_120%_at_100%_100%,rgba(34,211,238,0.16),transparent_60%),radial-gradient(140%_140%_at_100%_0%,rgba(192,132,252,0.16),transparent_60%)]" />
      </div>
      <div className="relative z-10 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5">
            <Icon label={item.label} />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-white/80">{item.label}</p>
            <p className="truncate text-sm text-emerald-200/90">{item.value}</p>
          </div>
        </div>
        <div className="shrink-0">
          <button
            type="button"
            aria-label={`Copy ${item.label} value`}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              item.onClick?.();
              if (typeof navigator !== "undefined" && navigator.clipboard) {
                navigator.clipboard.writeText(item.value).catch(() => {});
              }
              onCopy(item.value);
            }}
            className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2.5 py-1 text-xs font-semibold text-emerald-200 hover:border-emerald-400/60 transition-colors"
          >
            {copied ? <FiCheck className="h-4 w-4" aria-hidden /> : <FiCopy className="h-4 w-4" aria-hidden />}
            <span>{copied ? "Copied" : "Copy"}</span>
          </button>
        </div>
      </div>
    </article>
  );

  if (href) {
    return (
      <a
        href={href}
        target={external ? "_blank" : undefined}
        rel={external ? "noopener noreferrer" : undefined}
        aria-label={`${item.label}: ${item.value}`}
        className="block group"
      >
        {article}
      </a>
    );
  }

  return (
    <button
      type="button"
      aria-label={`${item.label}: ${item.value}. Copy to clipboard`}
      onClick={() => {
        item.onClick?.();
        if (typeof navigator !== "undefined" && navigator.clipboard) {
          navigator.clipboard.writeText(item.value).catch(() => {});
        }
        onCopy(item.value);
      }}
      className="block w-full text-left"
    >
      {article}
    </button>
  );
}


