"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { TopArtistsPeriod } from "@/lib/lastfm";

type Album = {
  name: string;
  url: string;
  playcount?: string | number;
  image?: Array<{ size?: string; ["#text"]?: string }>;
  artist?: { name?: string; url?: string } | string;
  ["@attr"]?: { rank?: string };
};

type LastFmTopAlbumsResponse = {
  topalbums?: { album?: Album[] };
};

const PERIODS: { value: TopArtistsPeriod; label: string }[] = [
  { value: "7day", label: "Last 7 days" },
  { value: "1month", label: "Last month" },
  { value: "3month", label: "Last 3 months" },
  { value: "6month", label: "Last 6 months" },
  { value: "12month", label: "Last 12 months" },
  { value: "overall", label: "All time" },
];

function pickImage(images?: Album["image"]) {
  if (!images || !images.length) return null;
  const order = ["extralarge", "large", "medium", "small"];
  for (const s of order) {
    const found = images.find((i) => i.size === s && i["#text"]);
    if (found?.["#text"]) return found["#text"] as string;
  }
  return images.find((i) => i["#text"])?.["#text"] ?? null;
}

export default function TopAlbums({ user = "tubulant_lemon", limit = 5 }: { user?: string; limit?: number }) {
  const [period, setPeriod] = useState<TopArtistsPeriod>("7day");
  const [albums, setAlbums] = useState<Album[] | null>(null);
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
        const res = await fetch(`/api/lastfm/top-albums?user=${encodeURIComponent(user)}&period=${encodeURIComponent(period)}&limit=${limit}`, { cache: "no-store" });
        if (!res.ok) throw new Error(`Failed: ${res.status}`);
        const json = (await res.json()) as { user: string; period: TopArtistsPeriod; data: LastFmTopAlbumsResponse };
        const list = (json?.data?.topalbums?.album ?? []) as Album[];
        if (!isCancelled) setAlbums(list);
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

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-white/90 font-brand-mono">Top Albums</h3>
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
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[var(--surface-1)]">
            <div className="aspect-square" />
          </div>
          <div>
            <div className="grid grid-cols-2 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="relative overflow-hidden rounded-2xl border border-white/10 bg-[var(--surface-1)]">
                  <div className="aspect-square" />
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : error ? (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-red-200 text-sm">{error}</div>
      ) : albums && albums.length ? (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {(() => {
            const album = albums[0];
            const img = pickImage(album?.image);
            const artistName = typeof album?.artist === "string" ? (album?.artist as string) : (album?.artist?.name || "");
            const plays = typeof album?.playcount === "string" ? album?.playcount : String(album?.playcount ?? "");
            const sizes = "(min-width: 768px) 50vw, 100vw";
            return (
              <Link key={`left-${album?.url}`} href={album?.url || "#"} target="_blank" rel="noopener noreferrer" className="group block rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40">
                <article className="relative overflow-hidden rounded-2xl border border-white/10 bg-[var(--surface-1)] transition-all duration-300 hover:border-white/20">
                  <div className="relative w-full aspect-square">
                    {img ? (
                      <Image src={img} alt={`${album?.name} cover`} fill className="object-cover" sizes={sizes} />
                    ) : (
                      <div className="h-full w-full bg-white/5" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                  </div>
                  <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" aria-hidden>
                    <div className="absolute inset-0 bg-[radial-gradient(120%_120%_at_0%_0%,rgba(96,165,250,0.16),transparent_60%),radial-gradient(120%_120%_at_100%_100%,rgba(34,211,238,0.16),transparent_60%),radial-gradient(140%_140%_at_100%_0%,rgba(192,132,252,0.16),transparent_60%)]" />
                  </div>
                  <div className="absolute inset-x-0 bottom-0 z-10 p-4 sm:p-5">
                    <h4 className="text-lg font-extrabold tracking-tight text-white drop-shadow md:text-2xl">{album?.name}</h4>
                    <p className="mt-1 text-sm text-white/80">{artistName}</p>
                    {plays ? <p className="mt-1 text-xs text-white/70">{plays} plays</p> : null}
                  </div>
                </article>
              </Link>
            );
          })()}

          <div>
            <div className="grid grid-cols-2 gap-3">
              {albums.slice(1, 5).map((album, idx) => {
                const img = pickImage(album.image);
                const artistName = typeof album.artist === "string" ? (album.artist as string) : (album.artist?.name || "");
                const plays = typeof album.playcount === "string" ? album.playcount : String(album.playcount ?? "");
                return (
                  <Link key={`${album.url}-${idx}`} href={album.url} target="_blank" rel="noopener noreferrer" className="group block rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40">
                    <article className="relative overflow-hidden rounded-2xl border border-white/10 bg-[var(--surface-1)] transition-all duration-300 hover:border-white/20">
                      <div className="relative w-full aspect-square">
                        {img ? (
                          <Image src={img} alt={`${album.name} cover`} fill className="object-cover" sizes="(min-width: 768px) 25vw, 50vw" />
                        ) : (
                          <div className="h-full w-full bg-white/5" />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                      </div>
                      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" aria-hidden>
                        <div className="absolute inset-0 bg-[radial-gradient(120%_120%_at_0%_0%,rgba(96,165,250,0.16),transparent_60%),radial-gradient(120%_120%_at_100%_100%,rgba(34,211,238,0.16),transparent_60%),radial-gradient(140%_140%_at_100%_0%,rgba(192,132,252,0.16),transparent_60%)]" />
                      </div>
                      <div className="absolute inset-x-0 bottom-0 z-10 p-3 sm:p-4">
                        <h4 className="text-base font-extrabold tracking-tight text-white drop-shadow">
                          {album.name}
                        </h4>
                        <p className="mt-1 text-xs text-white/80">{artistName}</p>
                        {plays ? <p className="mt-1 text-[10px] text-white/70">{plays} plays</p> : null}
                      </div>
                    </article>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <p className="text-white/60">No top albums for this period.</p>
      )}
    </section>
  );
}

