"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { TopArtistsPeriod } from "@/lib/lastfm";

type Track = {
  name: string;
  url: string;
  playcount?: string | number;
  artist?: { name?: string; url?: string } | string;
  album?: { name?: string; ["#text"]?: string } | string;
  ["@attr"]?: { rank?: string };
};

type LastFmTopTracksResponse = {
  toptracks?: { track?: Track[] };
};

const PERIODS: { value: TopArtistsPeriod; label: string }[] = [
  { value: "7day", label: "Last 7 days" },
  { value: "1month", label: "Last month" },
  { value: "3month", label: "Last 3 months" },
  { value: "6month", label: "Last 6 months" },
  { value: "12month", label: "Last 12 months" },
  { value: "overall", label: "All time" },
];

export default function TopTracks({ user = "tubulant_lemon", limit = 10 }: { user?: string; limit?: number }) {
  const [period, setPeriod] = useState<TopArtistsPeriod>("7day");
  const [tracks, setTracks] = useState<Track[] | null>(null);
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
        const res = await fetch(`/api/lastfm/top-tracks?user=${encodeURIComponent(user)}&period=${encodeURIComponent(period)}&limit=${limit}`, { cache: "no-store" });
        if (!res.ok) throw new Error(`Failed: ${res.status}`);
        const json = (await res.json()) as { user: string; period: TopArtistsPeriod; data: LastFmTopTracksResponse };
        const list = (json?.data?.toptracks?.track ?? []) as Track[];
        if (!isCancelled) setTracks(list);
      } catch (e) {
        if (!isCancelled) setError(e instanceof Error ? e.message : "Unknown error");
      } finally {
        if (!isCancelled) setIsLoading(false);
      }
    }
    load();
    return () => { isCancelled = true; };
  }, [user, period, limit]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!dropdownRef.current) return;
      if (!dropdownRef.current.contains(e.target as Node)) setMenuOpen(false);
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

  function getAlbumName(input: Track["album"]): string {
    if (!input) return "";
    if (typeof input === "string") return input;
    return input.name || input["#text"] || "";
  }

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-white/90 font-brand-mono">Top Tracks</h3>
        <div className="inline-flex items-center gap-2 text-sm text-white/70" ref={dropdownRef}>
          <div className="relative">
            <button
              type="button"
              aria-haspopup="listbox"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((o) => !o)}
              className="group inline-flex items-center gap-2 rounded-lg border border-white/10 bg-[var(--surface-1)] px-3 py-2 text-white/90 shadow-sm shadow-white/5 outline-none transition-colors hover:border-white/20 focus:ring-2 focus:ring-white/40"
            >
              <span className="truncate">{PERIODS.find((p) => p.value === period)?.label}</span>
              <span className={`text-white/60 transition-transform ${menuOpen ? "rotate-180" : ""}`}>▾</span>
            </button>
            {menuOpen ? (
              <ul role="listbox" className="absolute right-0 z-20 mt-2 w-44 overflow-hidden rounded-xl border border-white/10 bg-[var(--surface-1)] p-1 shadow-lg shadow-black/20">
                {PERIODS.map((p) => {
                  const active = p.value === period;
                  return (
                    <li key={p.value} role="option" aria-selected={active}>
                      <button
                        type="button"
                        onClick={() => { setPeriod(p.value); setMenuOpen(false); }}
                        className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-white/90 transition-colors ${active ? "bg-white/10" : "hover:bg-white/5"}`}
                      >
                        <span>{p.label}</span>
                        {active ? <span className="inline-block h-1.5 w-1.5 rounded-full bg-white/60" /> : null}
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
        <ul className="space-y-2">
          {Array.from({ length: limit }).map((_, i) => (
            <li key={i} className="rounded-2xl border border-white/10 bg-[var(--surface-1)] p-3 sm:p-4">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 shrink-0 rounded-md bg-white/10 animate-pulse" />
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="h-5 w-2/3 rounded bg-white/10 animate-pulse" />
                  <div className="h-4 w-1/2 rounded bg-white/10 animate-pulse" />
                  <div className="mt-2 flex items-center gap-3">
                    <div className="h-2 w-full rounded bg-white/10 animate-pulse" />
                    <div className="h-3 w-16 shrink-0 rounded bg-white/10 animate-pulse" />
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : error ? (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-red-200 text-sm">{error}</div>
      ) : tracks && tracks.length ? (
        <ol className="space-y-2">
          {tracks.slice(0, limit).map((t, idx) => {
            const rank = t?.["@attr"]?.rank || String(idx + 1);
            const artist = typeof t.artist === "string" ? (t.artist as string) : (t.artist?.name || "");
            const album = getAlbumName(t.album);
            const playsNum = Number(typeof t.playcount === "string" ? t.playcount : t.playcount ?? 0);
            const maxPlays = Number(typeof tracks[0]?.playcount === "string" ? tracks[0]?.playcount : tracks[0]?.playcount ?? playsNum);
            const widthPct = idx === 0 ? 100 : Math.min(100, maxPlays ? (playsNum / maxPlays) * 100 : 0);
            return (
              <li key={`${t.url}-${idx}`}>
                <Link
                  href={t.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
                >
                  <article className="relative overflow-hidden rounded-2xl border border-white/10 bg-[var(--surface-1)] p-3 sm:p-4 transition-all duration-300 hover:border-white/20">
                    <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" aria-hidden>
                      <div className="absolute inset-0 bg-[radial-gradient(120%_120%_at_0%_0%,rgba(96,165,250,0.16),transparent_60%),radial-gradient(120%_120%_at_100%_100%,rgba(34,211,238,0.16),transparent_60%),radial-gradient(140%_140%_at_100%_0%,rgba(192,132,252,0.16),transparent_60%)]" />
                    </div>
                    <div className="relative z-10 flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center shrink-0 rounded-md border border-white/10 bg-white/5 text-xs font-semibold text-white/70">
                        {rank}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="truncate text-base font-semibold leading-tight tracking-tight text-white font-brand-mono">{t.name}</h4>
                        <p className="mt-1 truncate text-sm text-white/70">
                          <span className="text-white/80">{artist}</span>
                          {album ? <span className="text-white/40"> · {album}</span> : null}
                        </p>
                        <div className="mt-2 flex items-center gap-3">
                          <div className="relative h-2 w-full overflow-hidden rounded bg-white/10">
                            <div className="h-full bg-emerald-300/50 transition-[width] duration-300" style={{ width: `${widthPct}%` }} />
                          </div>
                          <span className="shrink-0 text-xs text-white/60">{playsNum} plays</span>
                        </div>
                      </div>
                    </div>
                  </article>
                </Link>
              </li>
            );
          })}
        </ol>
      ) : (
        <p className="text-white/60">No top tracks for this period.</p>
      )}
    </section>
  );
}


