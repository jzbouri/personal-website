import { NextRequest } from "next/server";
import { createStravaClient } from "@/lib/strava";
import polyline from "@mapbox/polyline";
import { reverseGeocodeToCityRegion } from "@/lib/geocoding";

function json(data: unknown, init?: number | ResponseInit) {
  return new Response(JSON.stringify(data), {
    headers: { "Content-Type": "application/json" },
    ...(typeof init === "number" ? { status: init } : init),
  });
}

type StravaSummary = {
  id: number;
  map?: { summary_polyline?: string | null; polyline?: string | null } | null;
  start_latlng?: [number, number] | null;
};

type EnrichedActivity = StravaSummary & {
  name?: unknown;
  type?: unknown;
  distance?: unknown;
  moving_time?: unknown;
  elapsed_time?: unknown;
  total_elevation_gain?: unknown;
  start_date?: unknown;
  start_date_local?: unknown;
  average_speed?: unknown;
};

export async function GET(_req: NextRequest) {
  try {
    const client = createStravaClient();
    const latest = await client.getLatestActivity<StravaSummary>();

    let enriched: EnrichedActivity | null = latest ?? null;
    if (latest && (!latest.map || (!latest.map.summary_polyline && !latest.map.polyline)) && latest.id) {
      try {
        const detailed = await client.getActivityById<Record<string, unknown>>(latest.id);
        enriched = { ...(latest as Record<string, unknown>), ...detailed } as EnrichedActivity;
      } catch {}
    }

    let svgPath: { d: string; width: number; height: number } | undefined;
    try {
      const encoded = (enriched?.map as { summary_polyline?: string | null; polyline?: string | null } | undefined)?.summary_polyline
        || (enriched?.map as { polyline?: string | null } | undefined)?.polyline
        || null;
      if (encoded) {
        const points = polyline.decode(encoded) as [number, number][];
        if (points && points.length >= 2) {
          const lats = points.map(p => p[0]);
          const lngs = points.map(p => p[1]);
          const minLat = Math.min(...lats);
          const maxLat = Math.max(...lats);
          const minLng = Math.min(...lngs);
          const maxLng = Math.max(...lngs);
          const rangeLat = Math.max(1e-6, maxLat - minLat);
          const rangeLng = Math.max(1e-6, maxLng - minLng);
          const aspect = rangeLat / rangeLng;
          const width = 1000;
          const height = Math.max(1, Math.round(width * aspect));
          const pad = 40;
          const toXY = (lat: number, lng: number) => {
            const x = pad + ((lng - minLng) / rangeLng) * (width - 2 * pad);
            const y = pad + (1 - (lat - minLat) / rangeLat) * (height - 2 * pad);
            return { x, y };
          };
          const xy = points.map(([la, lo]) => toXY(la, lo));
          const d = xy.reduce((acc, p, i) => (i === 0 ? `M ${p.x} ${p.y}` : acc + ` L ${p.x} ${p.y}`), "");
          svgPath = { d, width, height };
        }
      }
    } catch {}

    const safe = enriched ? {
      id: enriched.id,
      name: typeof enriched.name === "string" ? enriched.name : undefined,
      type: typeof enriched.type === "string" ? enriched.type : undefined,
      distance: typeof enriched.distance === "number" ? enriched.distance : undefined,
      moving_time: typeof enriched.moving_time === "number" ? enriched.moving_time : undefined,
      elapsed_time: typeof enriched.elapsed_time === "number" ? enriched.elapsed_time : undefined,
      total_elevation_gain: typeof enriched.total_elevation_gain === "number" ? enriched.total_elevation_gain : undefined,
      start_date: typeof enriched.start_date === "string" ? enriched.start_date : undefined,
      start_date_local: typeof enriched.start_date_local === "string" ? enriched.start_date_local : undefined,
      average_speed: typeof enriched.average_speed === "number" ? enriched.average_speed : undefined,
    } : null;

    let location: string | null = null;
  const start = Array.isArray((enriched as StravaSummary | null)?.start_latlng) ? (enriched as StravaSummary).start_latlng : null;
    if (Array.isArray(start) && start.length === 2 && typeof start[0] === "number" && typeof start[1] === "number") {
      try {
        location = await reverseGeocodeToCityRegion(start[0], start[1]);
      } catch {}
    }

    const response = json({ latest: safe, svgPath, location }, 200);
    response.headers.set(
      "Cache-Control",
      "public, max-age=60, s-maxage=60, stale-while-revalidate=60"
    );
    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return json({ error: message }, 500);
  }
}


