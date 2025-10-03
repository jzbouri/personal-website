"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Timeframe = "ytd" | "recent" | "all";
type Sport = "run" | "ride";

type AthleteStats = {
  all_run_totals?: Totals;
  all_ride_totals?: Totals;
  recent_run_totals?: Totals;
  recent_ride_totals?: Totals;
  ytd_run_totals?: Totals;
  ytd_ride_totals?: Totals;
  [key: string]: unknown;
};

type Totals = {
  count?: number;
  distance?: number;
  moving_time?: number;
  elevation_gain?: number;
};

function toKm(m: number | undefined): number {
  if (m === undefined || m === null) return 0;
  return m / 1000;
}

function clampNumber(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return n;
}

export default function AthleticsStats() {
  const [stats, setStats] = useState<AthleteStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sport, setSport] = useState<Sport>("run");
  const [timeframe, setTimeframe] = useState<Timeframe>("all");
  const [menuOpen, setMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let isCancelled = false;
    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/strava/athlete/stats?id=56842043`, { cache: "no-store" });
        if (!res.ok) throw new Error(`Failed: ${res.status}`);
        const json = (await res.json()) as { athleteId: number; data: AthleteStats };
        if (!isCancelled) setStats(json.data);
      } catch (e) {
        if (!isCancelled) setError(e instanceof Error ? e.message : "Unknown error");
      } finally {
        if (!isCancelled) setIsLoading(false);
      }
    }
    load();
    return () => { isCancelled = true; };
  }, []);

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

  const display = useMemo(() => {
    if (!stats) return null;
    const altKey = (timeframe === "all"
      ? `all_${sport}_totals`
      : `${timeframe}_${sport}_totals`) as keyof AthleteStats;
    const totals = stats[altKey] as Totals | undefined;
    return totals ?? null;
  }, [stats, timeframe, sport]);

  const title = sport === "run" ? "Running stats" : "Biking stats";
  const activitiesLabel = sport === "run" ? "Runs" : "Rides";

  
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-white/90 font-brand-mono">{title}</h3>
        <div className="flex items-center gap-3">
          <div ref={trackRef} className="relative grid grid-cols-2 rounded-full border border-white/10 bg-[var(--surface-3)] p-0 shadow-sm shadow-white/5 overflow-hidden">
            <button
              onClick={() => setSport("run")}
              aria-pressed={sport === "run"}
              className={`relative z-10 rounded-full px-4 py-2 text-sm font-semibold transition-colors text-center ${sport === "run" ? "text-emerald-100" : "text-white/70"}`}
            >
              Run
            </button>
            <button
              onClick={() => setSport("ride")}
              aria-pressed={sport === "ride"}
              className={`relative z-10 rounded-full px-4 py-2 text-sm font-semibold transition-colors text-center ${sport === "ride" ? "text-emerald-100" : "text-white/70"}`}
            >
              Ride
            </button>
            <span
              className="pointer-events-none absolute top-0 bottom-0 left-0 z-10 rounded-full border border-emerald-400/40 bg-emerald-400/20"
              style={{ width: "50%", transform: sport === "run" ? "translateX(0px)" : "translateX(100%)", transition: "transform 300ms ease-out" }}
              aria-hidden
            />
          </div>

          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              aria-haspopup="listbox"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((o) => !o)}
              className="group inline-flex items-center gap-2 rounded-lg border border-white/10 bg-[var(--surface-1)] px-3 py-2 text-white/90 shadow-sm shadow-white/5 outline-none transition-colors hover:border-white/20 focus:ring-2 focus:ring-white/40 text-sm"
            >
              <span className="truncate">
                {timeframe === "ytd" ? "Year to date" : timeframe === "recent" ? "Past month" : "All time"}
              </span>
              <span className={`text-white/60 transition-transform ${menuOpen ? "rotate-180" : ""}`}>▾</span>
            </button>
            {menuOpen ? (
              <ul role="listbox" className="absolute right-0 z-20 mt-2 w-44 overflow-hidden rounded-xl border border-white/10 bg-[var(--surface-1)] p-1 shadow-lg shadow-black/20">
                {([{ v: "ytd", l: "Year to date" }, { v: "recent", l: "Past month" }, { v: "all", l: "All time" }] as { v: Timeframe; l: string }[]).map(({ v, l }) => (
                  <li key={v} role="option" aria-selected={v === timeframe}>
                    <button
                      type="button"
                      onClick={() => { setTimeframe(v); setMenuOpen(false); }}
                      className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-white/90 transition-colors ${v === timeframe ? "bg-white/10" : "hover:bg-white/5"}`}
                    >
                      <span>{l}</span>
                      {v === timeframe ? <span className="inline-block h-1.5 w-1.5 rounded-full bg-white/60" /> : null}
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-white/10 bg-[var(--surface-1)] p-4">
              <div className="h-5 w-1/3 rounded bg-white/10 animate-pulse" />
              <div className="mt-4 h-8 w-2/3 rounded bg-white/10 animate-pulse" />
              <div className="mt-2 h-3 w-1/2 rounded bg-white/10 animate-pulse" />
              <div className="mt-2 h-3 w-1/3 rounded bg-white/10 animate-pulse" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-red-200 text-sm">{error}</div>
      ) : display ? (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <StatCard title={activitiesLabel} value={clampNumber(display.count ?? 0)} unit="" decimals={0} />
          <StatCard title="Distance" value={clampNumber(toKm(display.distance))} unit=" km" decimals={1} />
          <StatCard title="Elevation gain" value={clampNumber(display.elevation_gain ?? 0)} unit=" m" decimals={0} />
          <StatCard title="Moving time" value={clampNumber((display.moving_time ?? 0) / 3600)} unit=" h" decimals={1} />
        </div>
      ) : (
        <p className="text-white/60">No stats available.</p>
      )}
    </section>
  );
}

function useCountUp(target: number, durationMs = 600) {
  const [display, setDisplay] = useState(0);
  const displayRef = useRef(0);
  useEffect(() => { displayRef.current = display; }, [display]);
  useEffect(() => {
    let raf: number | null = null;
    let startTime: number | null = null;
    const startVal = displayRef.current;
    const endVal = target;
    const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
    const tick = (ts: number) => {
      if (startTime === null) startTime = ts;
      const elapsed = ts - startTime;
      const t = Math.min(1, elapsed / durationMs);
      const eased = easeOut(t);
      setDisplay(startVal + (endVal - startVal) * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => { if (raf) cancelAnimationFrame(raf); };
  }, [target, durationMs]);
  return display;
}

function StatCard({ title, value, unit, decimals = 0 }: { title: string; value: number; unit?: string; decimals?: number }) {
  const animated = useCountUp(value, 500);
  const formatted = useMemo(() => {
    return `${animated.toFixed(decimals)}${unit ?? ""}`;
  }, [animated, unit, decimals]);
  return (
    <article className="group relative overflow-hidden rounded-2xl border border-white/10 bg-[var(--surface-1)] p-4 sm:p-5 transition-all duration-300 hover:border-white/20">
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" aria-hidden>
        <div className="absolute inset-0 bg-[radial-gradient(120%_120%_at_0%_0%,rgba(96,165,250,0.16),transparent_60%),radial-gradient(120%_120%_at_100%_100%,rgba(34,211,238,0.16),transparent_60%),radial-gradient(140%_140%_at_100%_0%,rgba(192,132,252,0.16),transparent_60%)]" />
      </div>
      <div className="relative z-10">
        <p className="text-xs uppercase tracking-wide text-white/60">{title}</p>
        <p className="mt-2 text-3xl font-extrabold text-white">{formatted}</p>
      </div>
    </article>
  );
}


