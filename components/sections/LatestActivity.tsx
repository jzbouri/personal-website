"use client";

import { useEffect, useRef, useState, useLayoutEffect } from "react";

type SummaryActivity = {
  id: number;
  name: string;
  type?: string;
  distance?: number;
  moving_time?: number;
  elapsed_time?: number;
  total_elevation_gain?: number;
  start_date?: string;
  start_date_local?: string;
  map?: { summary_polyline?: string | null };
  start_latlng?: [number, number] | null;
  average_speed?: number | null;
};

function metersToKm(m?: number): string {
  if (!m && m !== 0) return "-";
  const km = m / 1000;
  return (Math.round(km * 10) / 10).toString();
}

function secondsToHms(s?: number): string {
  if (!s && s !== 0) return "-";
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = Math.round(s % 60);
  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
  return h > 0 ? `${h}:${pad(m)}:${pad(sec)}` : `${m}:${pad(sec)}`;
}

function formatRelativeEnd(activity?: SummaryActivity | null): string {
  if (!activity) return "";
  const iso = activity.start_date || activity.start_date_local;
  if (!iso) return "";
  const isUtc = /Z|[+-]\d{2}:?\d{2}$/.test(iso);
  const startMs = new Date(isUtc ? iso : `${iso}Z`).getTime();
  const durationSec = (activity.elapsed_time ?? activity.moving_time ?? 0);
  const endMs = startMs + durationSec * 1000;
  const diffMs = Date.now() - endMs;
  const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });
  const minutes = Math.max(0, Math.round(diffMs / 60000));
  if (minutes < 1) return "Just now";
  if (minutes < 60) return rtf.format(-minutes, "minute");
  const hours = Math.round(minutes / 60);
  if (hours < 24) return rtf.format(-hours, "hour");
  const days = Math.round(hours / 24);
  if (days < 30) return rtf.format(-days, "day");
  const months = Math.round(days / 30);
  if (months < 12) return rtf.format(-months, "month");
  const years = Math.round(months / 12);
  return rtf.format(-years, "year");
}

function elevationStr(m?: number): string {
  if (!m && m !== 0) return "-";
  return `${Math.round(m)} m`;
}

function pacePerKm(activity?: SummaryActivity): string {
  if (!activity?.moving_time || !activity.distance || activity.distance <= 0) return "-";
  const secPerKm = activity.moving_time / (activity.distance / 1000);
  const mins = Math.floor(secPerKm / 60);
  const secs = Math.round(secPerKm % 60);
  const s = secs < 10 ? `0${secs}` : `${secs}`;
  return `${mins}:${s}/km`;
}

function speedKmh(activity?: SummaryActivity): string {
  if (!activity?.moving_time || !activity.distance || activity.distance <= 0) return "-";
  const kmh = (activity.distance / 1000) / (activity.moving_time / 3600);
  return `${Math.round(kmh * 10) / 10} km/h`;
}

export default function LatestActivity() {
  const [activity, setActivity] = useState<SummaryActivity | null>(null);
  const [svgPath, setSvgPath] = useState<{ d: string; width: number; height: number } | null>(null);
  const [location, setLocation] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/strava/athlete/activities/latest`, { cache: "no-store" });
        if (!res.ok) throw new Error(`Failed: ${res.status}`);
        const json = (await res.json()) as { latest?: SummaryActivity | null; svgPath?: { d: string; width: number; height: number } | null; location?: string | null };
        if (!cancelled) {
          setActivity(json.latest ?? null);
          setSvgPath(json.svgPath ?? null);
          setLocation(json.location ?? null);
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Unknown error");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const svgData = svgPath;

  const pathRef = useRef<SVGPathElement | null>(null);
  const [dot, setDot] = useState<{ x: number; y: number } | null>(null);
  const [pathLength, setPathLength] = useState(0);
  const [dashOffset, setDashOffset] = useState(0);
  useLayoutEffect(() => {
    if (!pathRef.current) return;
    const path = pathRef.current;
    const total = path.getTotalLength();
    setPathLength(total);
    setDashOffset(total);
    const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
    let raf = 0;
    const start = performance.now();
    function frame(now: number) {
      const elapsed = now - start;
      const t = Math.min(1, elapsed / 5000);
      const eased = easeInOutCubic(t);
      const p = path.getPointAtLength(eased * total);
      setDot({ x: p.x, y: p.y });
      setDashOffset(total - eased * total);
      if (t < 1) raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [svgData?.d]);

  return (
    <section className="space-y-3">
      <h3 className="text-sm font-semibold text-white/90 font-brand-mono">Latest activity</h3>

      {isLoading ? (
        <div className="rounded-2xl overflow-hidden border border-white/10 bg-[var(--surface-1)]">
          <div className="px-4 py-3 border-b border-white/10">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
              <div className="h-6 w-32 rounded bg-white/10 animate-pulse" />
              <div className="h-5 w-48 rounded bg-white/10 animate-pulse" />
            </div>
          </div>
          <div className="h-[320px] bg-[var(--surface-2)] flex items-center justify-center">
            <div className="text-white/40 text-sm">Loading activity...</div>
          </div>
          <div className="p-3 border-t border-white/10">
            <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="rounded-xl border border-white/10 bg-[var(--surface-2)] px-3 py-2">
                  <div className="h-3 w-16 rounded bg-white/10 animate-pulse mb-2" />
                  <div className="h-4 w-20 rounded bg-white/10 animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-red-200 text-sm">{error}</div>
      ) : !activity ? (
        <div className="rounded-2xl border border-white/10 bg-[var(--surface-1)] p-4 text-white/70">No recent activity found.</div>
      ) : (
        <a
          href={activity ? `https://www.strava.com/activities/${activity.id}` : undefined}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative block rounded-2xl overflow-hidden border border-white/10 bg-[var(--surface-1)] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
        >
          <span className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" aria-hidden>
            <span className="absolute inset-0 bg-[radial-gradient(120%_120%_at_0%_0%,rgba(96,165,250,0.16),transparent_60%),radial-gradient(120%_120%_at_100%_100%,rgba(34,211,238,0.16),transparent_60%),radial-gradient(140%_140%_at_100%_0%,rgba(192,132,252,0.16),transparent_60%)]" />
          </span>

          <div className="px-4 py-3 border-b border-white/10">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
              <div className="min-w-0">
                <div className="truncate text-white font-semibold text-lg leading-tight">{activity.name || "Activity"}</div>
              </div>
              <div className="text-white/70 text-sm sm:pl-3 shrink-0">
                Finished {formatRelativeEnd(activity)}
                {location ? <span className="mx-2 text-white/40">•</span> : null}
                {location ? <span className="text-white/80">{location}</span> : null}
              </div>
            </div>
          </div>

          <div className="bg-[var(--surface-2)]">
            {svgData ? (
              <svg viewBox={`0 0 ${svgData.width} ${svgData.height}`} preserveAspectRatio="xMidYMid meet" style={{ height: 320, width: "100%", display: "block" }}>
                <path
                  ref={pathRef}
                  d={svgData.d}
                  fill="none"
                  stroke="rgb(52 211 153 / 0.95)"
                  strokeWidth={10}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity={0.95}
                  style={{ visibility: pathLength ? "visible" : "hidden", strokeDasharray: pathLength || 1, strokeDashoffset: dashOffset || 1 }}
                />
                {dot ? <circle cx={dot.x} cy={dot.y} r={12} fill="rgb(52 211 153)" /> : null}
              </svg>
            ) : (
              <div className="h-[320px] w-full grid place-items-center bg-[var(--surface-2)] text-white/60">No map available</div>
            )}
          </div>

          <div className="p-3 border-t border-white/10">
            <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
              <Stat label="Distance" value={`${metersToKm(activity.distance)} km`} />
              {activity.type === "Ride" ? (
                <Stat label="Speed" value={speedKmh(activity)} />
              ) : (
                <Stat label="Pace" value={pacePerKm(activity)} />
              )}
              <Stat label="Elevation" value={elevationStr(activity.total_elevation_gain)} />
              <Stat label="Moving time" value={secondsToHms(activity.moving_time)} />
            </div>
          </div>
        </a>
      )}
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-[var(--surface-2)] px-3 py-2">
      <div className="text-[11px] uppercase tracking-wide text-white/60 font-semibold">{label}</div>
      <div className="text-white mt-0.5">{value}</div>
    </div>
  );
}


