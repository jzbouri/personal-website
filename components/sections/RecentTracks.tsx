"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

type LastFmRecentTracks = {
  recenttracks?: {
    track?: Array<Track>;
    [key: string]: unknown;
  };
};

type Track = {
  name: string;
  artist: { ["#text"]?: string } | string;
  album: { ["#text"]?: string } | string;
  url: string;
  image?: Array<{ size?: string; ["#text"]?: string }>;
  date?: { uts?: string; ["#text"]?: string };
  ["@attr"]?: { nowplaying?: string };
};

function formatPlayedAt(date?: { uts?: string; ["#text"]?: string }) {
  if (!date?.uts) return "Now";
  const d = new Date(Number(date.uts) * 1000);
  const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });
  const minutes = Math.round((Date.now() - d.getTime()) / 60000);
  if (minutes < 60) return rtf.format(-minutes, "minute");
  const hours = Math.round(minutes / 60);
  if (hours < 24) return rtf.format(-hours, "hour");
  const days = Math.round(hours / 24);
  return rtf.format(-days, "day");
}

function pickImage(images?: Track["image"]) {
  if (!images || !images.length) return null;
  const desiredOrder = ["extralarge", "large", "medium", "small"];
  for (const size of desiredOrder) {
    const found = images.find((img) => img.size === size && img["#text"]);
    if (found?.["#text"]) return found["#text"] as string;
  }
  return images.find((i) => i["#text"])?.["#text"] ?? null;
}

export default function RecentTracks({ user = "tubulant_lemon" }: { user?: string }) {
  const [tracks, setTracks] = useState<Track[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;
    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/lastfm/recent-tracks?user=${encodeURIComponent(user)}&limit=10`, { cache: "no-store" });
        if (!res.ok) throw new Error(`Failed: ${res.status}`);
        const json = (await res.json()) as { user: string; data: LastFmRecentTracks };
        const list = (json?.data?.recenttracks?.track ?? []) as Track[];
        if (!isCancelled) setTracks(list.slice(0, 10));
      } catch (e) {
        if (!isCancelled) setError(e instanceof Error ? e.message : "Unknown error");
      } finally {
        if (!isCancelled) setIsLoading(false);
      }
    }
    load();
    return () => { isCancelled = true; };
  }, [user]);

  return (
    <section className="space-y-3">
      {isLoading ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-white/10 bg-[var(--surface-1)] p-4 sm:p-5">
              <div className="flex gap-4">
                <div className="h-16 w-16 rounded-md bg-white/10 animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-2/3 rounded bg-white/10 animate-pulse" />
                  <div className="h-3 w-1/2 rounded bg-white/10 animate-pulse" />
                  <div className="h-3 w-1/3 rounded bg-white/10 animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-red-200 text-sm">{error}</div>
      ) : tracks && tracks.length ? (
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {tracks.map((t, idx) => {
            const img = pickImage(t.image);
            const artist = typeof t.artist === "string" ? t.artist : (t.artist?.["#text"] || "");
            const album = typeof t.album === "string" ? t.album : (t.album?.["#text"] || "");
            const isNow = idx === 0 && t?.["@attr"]?.nowplaying === "true";
            const playedAt = formatPlayedAt(t.date);
            return (
              <li key={`${t.url}-${idx}`}>
                <Link href={t.url} target="_blank" rel="noopener noreferrer" className="group block rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40">
                  <article className={`relative overflow-hidden rounded-2xl border p-4 sm:p-5 transition-all duration-300 ${isNow ? "border-emerald-400/40 bg-[var(--surface-1)] hover:border-emerald-400/60" : "border-white/10 bg-[var(--surface-1)] hover:border-white/20"}`}>
                    <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" aria-hidden>
                      <div className="absolute inset-0 bg-[radial-gradient(120%_120%_at_0%_0%,rgba(96,165,250,0.16),transparent_60%),radial-gradient(120%_120%_at_100%_100%,rgba(34,211,238,0.16),transparent_60%),radial-gradient(140%_140%_at_100%_0%,rgba(192,132,252,0.16),transparent_60%)]" />
                    </div>
                    {isNow ? (
                      <div className="absolute right-3 top-3 z-10 rounded-full bg-emerald-400/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-200 border border-emerald-400/40 flex items-center gap-1">
                        <span className="eq-bar eq-1" />
                        <span className="eq-bar eq-2" />
                        <span className="eq-bar eq-3" />
                        Now
                      </div>
                    ) : null}
                    <div className="relative z-10 flex items-center gap-4">
                      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md border border-white/10 bg-white/5 shadow-sm shadow-white/5">
                        {img ? (
                          <Image src={img} alt={`${t.name} cover`} fill sizes="64px" className="object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-xs text-white/40">No Art</div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline gap-2">
                          <h4 className="truncate text-base font-semibold leading-tight tracking-tight text-white font-brand-mono">{t.name}</h4>
                        </div>
                        <p className="mt-1 truncate text-sm text-white/70">
                          <span className="text-white/80">{artist}</span>
                          {album ? <span className="text-white/40"> &middot; {album}</span> : null}
                        </p>
                        <p className="mt-1 text-xs text-white/50">{isNow ? "Now playing" : `Played ${playedAt}`}</p>
                      </div>
                    </div>
                  </article>
                </Link>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="text-white/60">No recent tracks.</p>
      )}
    </section>
  );
}


