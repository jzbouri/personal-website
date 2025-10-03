"use client";

import { useEffect, useMemo, useState } from "react";

type RaceResult = {
  uuid: string;
  event_name: string;
  participants: number | null;
  distance_m: number | null;
  time_s: number | null;
  race_type: string;
  strava_start_timestamp: string;
  my_placement?: number | null;
  strava_link?: string | null;
  results_link?: string | null;
};

type SortKey = "date" | "type" | "distance" | "time" | "pace" | "place" | "participants" | "percent";
type SortDir = "asc" | "desc";

function formatDate(dateIso: string): string {
  try {
    const d = new Date(dateIso);
    return new Intl.DateTimeFormat(undefined, { year: "numeric", month: "short", day: "2-digit" }).format(d);
  } catch {
    return "-";
  }
}

function formatDistance(meters: number | null | undefined, raceType: string): string {
  if (!meters && meters !== 0) return "-";
  if (meters === 1609) return "Mile";
  const type = raceType.toLowerCase();
  if (type.includes("road") || type.includes("cross country")) {
    const km = meters / 1000;
    const str = Math.abs(Math.round(km * 10) / 10).toString();
    return `${str} km`;
  }
  return `${meters} m`;
}

function formatTime(seconds: number | null | undefined): string {
  if (!seconds && seconds !== 0) return "-";
  const mins = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);
  const s = secs < 10 ? `0${secs}` : `${secs}`;
  return `${mins}:${s}`;
}

function ordinal(n: number | null | undefined): string {
  if (!n && n !== 0) return "-";
  const v = Math.abs(n);
  const j = v % 10, k = v % 100;
  const suf = j === 1 && k !== 11 ? "st" : j === 2 && k !== 12 ? "nd" : j === 3 && k !== 13 ? "rd" : "th";
  return `${n}${suf}`;
}

function formatPace(timeSec: number | null | undefined, distanceM: number | null | undefined): string {
  if (!timeSec && timeSec !== 0) return "—";
  if (!distanceM || distanceM <= 0) return "—";
  const paceSec = timeSec / (distanceM / 1000);
  const mins = Math.floor(paceSec / 60);
  const secs = Math.round(paceSec % 60);
  const s = secs < 10 ? `0${secs}` : `${secs}`;
  return `${mins}:${s}/km`;
}

function getPlace(r: RaceResult): number | null {
  return (r.my_placement ?? null) as number | null;
}

function percentRank(place: number | null | undefined, participants: number | null | undefined): number {
  if (!place || !participants || participants <= 1) return 0;
  return Math.max(0, Math.min(100, ((place - 1) / (participants - 1)) * 100));
}

function percentColor(p: number): string {
  const hue = 120 - Math.round((p / 100) * 120);
  return `hsl(${hue} 70% 60% / 0.9)`;
}

function raceTypeClasses(type: string): string {
  const t = type.toLowerCase();
  const base = "bg-[var(--surface-5)]";
  if (t.includes("road")) return `${base} text-blue-200 border-blue-400/60`;
  if (t.includes("cross country")) return `${base} text-emerald-200 border-emerald-400/60`;
  if (t.includes("indoor")) return `${base} text-indigo-200 border-indigo-400/60`;
  if (t.includes("steeple")) return `${base} text-cyan-200 border-cyan-400/60`;
  if (t.includes("track")) return `${base} text-violet-200 border-violet-400/60`;
  return `${base} text-white/80 border-white/30`;
}

export default function RaceResultsTable() {
  const [rows, setRows] = useState<RaceResult[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [selected, setSelected] = useState<RaceResult | null>(null);

  useEffect(() => {
    let isCancelled = false;
    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/athletics/race-results`, { cache: "no-store" });
        if (!res.ok) throw new Error(`Failed: ${res.status}`);
        const json = (await res.json()) as { data?: RaceResult[] };
        if (!isCancelled) setRows(json.data ?? []);
      } catch (e) {
        if (!isCancelled) setError(e instanceof Error ? e.message : "Unknown error");
      } finally {
        if (!isCancelled) setIsLoading(false);
      }
    }
    load();
    return () => { isCancelled = true; };
  }, []);

  const sorted = useMemo(() => {
    if (!rows) return [] as RaceResult[];
    const copy = [...rows];
    const dir = sortDir === "asc" ? 1 : -1;
    copy.sort((a, b) => {
      const get = (r: RaceResult) => {
        switch (sortKey) {
          case "date": return new Date(r.strava_start_timestamp).getTime();
          case "type": return r.race_type?.toLowerCase().charCodeAt(0) ?? 0;
          case "distance": return r.distance_m ?? 0;
          case "time": return r.time_s ?? Number.POSITIVE_INFINITY;
          case "pace": {
            if (r.time_s === null || r.time_s === undefined || !r.distance_m || r.distance_m <= 0) return Number.POSITIVE_INFINITY;
            return r.time_s / (r.distance_m / 1000);
          }
          case "place": return getPlace(r) ?? Number.POSITIVE_INFINITY;
          case "participants": return r.participants ?? Number.NEGATIVE_INFINITY;
          case "percent": {
            const isDNF = r.time_s === null || r.time_s === undefined;
            return isDNF ? 100 : percentRank(getPlace(r), r.participants);
          }
        }
      };
      const va = get(a); const vb = get(b);
      if (va < vb) return -1 * dir;
      if (va > vb) return 1 * dir;
      return 0;
    });
    return copy;
  }, [rows, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (sortKey !== key) {
      setSortKey(key);
      setSortDir("asc");
    } else {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    }
  }

  return (
    <section className="space-y-3">
      <h3 className="text-sm font-semibold text-white/90 font-brand-mono">Race results</h3>
      {isLoading ? (
        <div className="rounded-2xl border border-white/10 bg-[var(--surface-1)] p-4 text-white/60">Loading...</div>
      ) : error ? (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-red-200 text-sm">{error}</div>
      ) : rows && rows.length ? (
        <div className="overflow-x-auto rounded-2xl border border-white/10">
          <table className="min-w-full border-separate border-spacing-0 text-sm">
            <thead className="bg-[var(--surface-2)] text-white/80">
              <tr>
                <Th label="Date" active={sortKey === "date"} dir={sortDir} onClick={() => toggleSort("date")} />
                <th className="px-4 py-3 text-left font-semibold">Event</th>
                <th className="px-4 py-3 text-left font-semibold">
                  <button onClick={() => toggleSort("type")} className={`inline-flex items-center gap-1 hover:text-white ${sortKey === "type" ? "text-white" : "text-white/80"}`}>
                    <span>Type</span>
                    <span className="text-xs opacity-70">{sortKey === "type" ? (sortDir === "asc" ? "▲" : "▼") : ""}</span>
                  </button>
                </th>
                <Th label="Distance" active={sortKey === "distance"} dir={sortDir} onClick={() => toggleSort("distance")} />
                <Th label="Time" active={sortKey === "time"} dir={sortDir} onClick={() => toggleSort("time")} />
                <Th label="Pace" active={sortKey === "pace"} dir={sortDir} onClick={() => toggleSort("pace")} />
                <Th label="Place" active={sortKey === "place"} dir={sortDir} onClick={() => toggleSort("place")} />
                <Th label="Participants" active={sortKey === "participants"} dir={sortDir} onClick={() => toggleSort("participants")} />
                <Th label="Relative Place" active={sortKey === "percent"} dir={sortDir} onClick={() => toggleSort("percent")} />
              </tr>
            </thead>
            <tbody>
              {sorted.map((r) => {
                const dateStr = formatDate(r.strava_start_timestamp);
                const distStr = formatDistance(r.distance_m, r.race_type);
                const isDNF = r.time_s === null || r.time_s === undefined;
                const timeStr = isDNF ? "DNF" : formatTime(r.time_s);
                const paceStr = isDNF ? "N/A" : formatPace(r.time_s, r.distance_m);
                const placeVal = isDNF ? null : getPlace(r);
                const placeStr = ordinal(placeVal);
                const p = isDNF ? 100 : percentRank(placeVal, r.participants);
                const podium = placeVal === 1 ? "bg-yellow-400/10" : placeVal === 2 ? "bg-slate-200/10" : placeVal === 3 ? "bg-amber-600/10" : "hover:bg-white/5";
                return (
                  <tr
                    key={r.uuid}
                    className={`transition-colors cursor-pointer select-none ${podium} hover:[background-image:radial-gradient(120%_120%_at_0%_0%,rgba(96,165,250,0.10),transparent_60%),radial-gradient(120%_120%_at_100%_100%,rgba(34,211,238,0.10),transparent_60%),radial-gradient(140%_140%_at_100%_0%,rgba(192,132,252,0.10),transparent_60%)]`}
                    onClick={() => setSelected(r)}
                  >
                    <td className="px-4 py-3 whitespace-nowrap text-white/90 border-t border-white/10">{dateStr}</td>
                    <td className="px-4 py-3 text-white truncate max-w-[22rem] border-t border-white/10">{r.event_name}</td>
                    <td className="px-4 py-3 border-t border-white/10 whitespace-nowrap">
                      <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold whitespace-nowrap ${raceTypeClasses(r.race_type)}`}>{r.race_type}</span>
                    </td>
                    <td className="px-4 py-3 text-white/90 whitespace-nowrap border-t border-white/10">{distStr}</td>
                    <td className={"px-4 py-3 whitespace-nowrap border-t border-white/10 " + (isDNF ? "text-red-300" : "text-white/90")}>{timeStr}</td>
                    <td className={"px-4 py-3 whitespace-nowrap border-t border-white/10 " + (isDNF ? "text-red-300" : "text-white/90")}>{paceStr}</td>
                    <td className={"px-4 py-3 whitespace-nowrap border-t border-white/10 " + (isDNF ? "text-red-300" : "text-white/90")}>{isDNF ? "N/A" : placeStr}</td>
                    <td className="px-4 py-3 text-white/80 border-t border-white/10">{r.participants ?? "-"}</td>
                    <td className="px-4 py-3 border-t border-white/10">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-24 rounded bg-white/10 overflow-hidden">
                          <div className="h-full" style={{ width: `${p}%`, backgroundColor: isDNF ? "#ef4444" : percentColor(p) }} />
                        </div>
                        <span className="text-white/80 tabular-nums">{Math.round(p)}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-white/60">No races yet.</p>
      )}

      {selected ? (
        <Modal onClose={() => setSelected(null)}>
          <div className="space-y-3">
            <h4 className="text-white font-semibold text-lg font-brand-mono">{selected.event_name}</h4>
            <div className="text-sm text-white/70">
              <span>{formatDate(selected.strava_start_timestamp)}</span>
              <span className="mx-2 text-white/30">•</span>
              <span>{formatDistance(selected.distance_m, selected.race_type)}</span>
            </div>
            <div className="grid gap-2">
              {selected.strava_link ? (
                <a href={selected.strava_link} target="_blank" rel="noopener noreferrer" className="group relative inline-flex items-center justify-center overflow-hidden rounded-lg border border-white/10 bg-white/10 px-4 py-2 text-white hover:border-white/20">
                  <span className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" aria-hidden>
                    <span className="absolute inset-0 bg-[radial-gradient(120%_120%_at_0%_0%,rgba(96,165,250,0.16),transparent_60%),radial-gradient(120%_120%_at_100%_100%,rgba(34,211,238,0.16),transparent_60%),radial-gradient(140%_140%_at_100%_0%,rgba(192,132,252,0.16),transparent_60%)]" />
                  </span>
                  <span className="relative z-10">Open my Strava activity</span>
                </a>
              ) : (
                <button className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white/40 cursor-not-allowed" disabled>Strava activity unavailable</button>
              )}
              {selected.results_link ? (
                <a href={selected.results_link} target="_blank" rel="noopener noreferrer" className="group relative inline-flex items-center justify-center overflow-hidden rounded-lg border border-white/10 bg-white/10 px-4 py-2 text-white hover:border-white/20">
                  <span className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" aria-hidden>
                    <span className="absolute inset-0 bg-[radial-gradient(120%_120%_at_0%_0%,rgba(96,165,250,0.16),transparent_60%),radial-gradient(120%_120%_at_100%_100%,rgba(34,211,238,0.16),transparent_60%),radial-gradient(140%_140%_at_100%_0%,rgba(192,132,252,0.16),transparent_60%)]" />
                  </span>
                  <span className="relative z-10">Open official results</span>
                </a>
              ) : (
                <button className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white/40 cursor-not-allowed" disabled>Official results unavailable</button>
              )}
            </div>
            <div className="text-right">
              <button onClick={() => setSelected(null)} className="group relative inline-flex items-center overflow-hidden rounded-lg border border-white/10 bg-white/10 px-3 py-1.5 text-white hover:border-white/20">
                <span className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" aria-hidden>
                  <span className="absolute inset-0 bg-[radial-gradient(120%_120%_at_0%_0%,rgba(96,165,250,0.16),transparent_60%),radial-gradient(120%_120%_at_100%_100%,rgba(34,211,238,0.16),transparent_60%),radial-gradient(140%_140%_at_100%_0%,rgba(192,132,252,0.16),transparent_60%)]" />
                </span>
                <span className="relative z-10">Close</span>
              </button>
            </div>
          </div>
        </Modal>
      ) : null}
    </section>
  );
}

function Th({ label, active, dir, onClick }: { label: string; active: boolean; dir: SortDir; onClick: () => void }) {
  return (
    <th className="px-4 py-3 text-left font-semibold">
      <button onClick={onClick} className={`inline-flex items-center gap-1 hover:text-white ${active ? "text-white" : "text-white/80"}`}>
        <span>{label}</span>
        <span className="text-xs opacity-70">{active ? (dir === "asc" ? "▲" : "▼") : ""}</span>
      </button>
    </th>
  );
}

function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-white/10 bg-[var(--surface-1)] p-5 shadow-xl shadow-black/30">
        {children}
      </div>
    </div>
  );
}


