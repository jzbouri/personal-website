"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { TopArtistsPeriod } from "@/lib/lastfm";

type Artist = {
  name: string;
  url: string;
  playcount?: string | number;
  ["@attr"]?: { rank?: string };
};

type LastFmTopArtistsResponse = {
  topartists?: {
    artist?: Artist[];
    [key: string]: unknown;
  };
};

const PERIODS: { value: TopArtistsPeriod; label: string }[] = [
  { value: "7day", label: "Last 7 days" },
  { value: "1month", label: "Last month" },
  { value: "3month", label: "Last 3 months" },
  { value: "6month", label: "Last 6 months" },
  { value: "12month", label: "Last 12 months" },
  { value: "overall", label: "All time" },
];

export default function TopArtists({ user = "tubulant_lemon", limit = 6 }: { user?: string; limit?: number }) {
  const [period, setPeriod] = useState<TopArtistsPeriod>("7day");
  const [artists, setArtists] = useState<Artist[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let isCancelled = false;
    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        const url = `/api/lastfm/top-artists?user=${encodeURIComponent(user)}&period=${encodeURIComponent(period)}&limit=${limit}`;
        const res = await fetch(url, { cache: "no-store" });
        if (!res.ok) throw new Error(`Failed: ${res.status}`);
        const json = (await res.json()) as { user: string; period: TopArtistsPeriod; data: LastFmTopArtistsResponse };
        const list = (json?.data?.topartists?.artist ?? []) as Artist[];
        if (!isCancelled) setArtists(list);
      } catch (e) {
        if (!isCancelled) setError(e instanceof Error ? e.message : "Unknown error");
      } finally {
        if (!isCancelled) setIsLoading(false);
      }
    }
    load();
    return () => {
      isCancelled = true;
    };
  }, [user, period, limit]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!dropdownRef.current) return;
      if (!dropdownRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-white/90 font-brand-mono">Top Artists</h3>
        <div className="inline-flex items-center gap-2 text-sm text-white/70" ref={dropdownRef}>
          <span>Timeframe</span>
          <div className="relative">
            <button
              type="button"
              aria-haspopup="listbox"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((o) => !o)}
              className="group inline-flex items-center gap-2 rounded-lg border border-white/10 bg-[var(--surface-1)] px-3 py-2 text-white/90 shadow-sm shadow-white/5 outline-none transition-colors hover:border-white/20 focus:ring-2 focus:ring-white/40"
            >
              <span className="truncate">{PERIODS.find((p) => p.value === period)?.label || "Select"}</span>
              <span className={`text-white/60 transition-transform ${menuOpen ? "rotate-180" : ""}`}>▾</span>
            </button>
            {menuOpen ? (
              <ul
                role="listbox"
                tabIndex={-1}
                className="absolute right-0 z-20 mt-2 w-44 overflow-hidden rounded-xl border border-white/10 bg-[var(--surface-1)] p-1 shadow-lg shadow-black/20"
              >
                {PERIODS.map((p) => {
                  const isActive = p.value === period;
                  return (
                    <li key={p.value} role="option" aria-selected={isActive}>
                      <button
                        type="button"
                        onClick={() => {
                          setPeriod(p.value);
                          setMenuOpen(false);
                        }}
                        className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-white/90 transition-colors ${isActive ? "bg-white/10" : "hover:bg-white/5"}`}
                      >
                        <span>{p.label}</span>
                        {isActive ? <span className="text-xs text-white/60">✓</span> : null}
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : null}
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {Array.from({ length: limit }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-white/10 bg-[var(--surface-1)] p-4 sm:p-5">
              <div className="flex items-center gap-4">
                <div className="h-8 w-8 shrink-0 rounded-md bg-white/10 animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-2/3 rounded bg-white/10 animate-pulse" />
                  <div className="h-3 w-1/4 rounded bg-white/10 animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-red-200 text-sm">{error}</div>
      ) : artists && artists.length ? (
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {artists.map((a, idx) => {
            const rank = a?.["@attr"]?.rank || String(idx + 1);
            const plays = typeof a.playcount === "string" ? a.playcount : String(a.playcount ?? "");
            return (
              <li key={`${a.url}-${idx}`}>
                <Link
                  href={a.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
                >
                  <article className="relative overflow-hidden rounded-2xl border border-white/10 bg-[var(--surface-1)] p-4 sm:p-5 transition-all duration-300 hover:border-white/20">
                    <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" aria-hidden>
                      <div className="absolute inset-0 bg-[radial-gradient(120%_120%_at_0%_0%,rgba(96,165,250,0.16),transparent_60%),radial-gradient(120%_120%_at_100%_100%,rgba(34,211,238,0.16),transparent_60%),radial-gradient(140%_140%_at_100%_0%,rgba(192,132,252,0.16),transparent_60%)]" />
                    </div>
                    <div className="relative z-10 flex items-center gap-4">
                      <div className="flex h-8 w-8 items-center justify-center shrink-0 rounded-md border border-white/10 bg-white/5 text-xs font-semibold text-white/70">
                        {rank}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="truncate text-base font-semibold leading-tight tracking-tight text-white font-brand-mono">
                          {a.name}
                        </h4>
                        {plays ? (
                          <p className="mt-1 text-xs text-white/50">{plays} plays</p>
                        ) : null}
                      </div>
                    </div>
                  </article>
                </Link>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="text-white/60">No top artists for this period.</p>
      )}
    </section>
  );
}


