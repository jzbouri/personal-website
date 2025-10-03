import { NextRequest } from "next/server";
import { createStravaClient } from "@/lib/strava";
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

type EnrichedActivity = StravaSummary & Record<string, unknown>;

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

    let location: string | null = null;
    const start = enriched?.start_latlng ?? undefined;
    if (Array.isArray(start) && start.length === 2) {
      location = await reverseGeocodeToCityRegion(start[0], start[1]);
    }

    const response = json({ latest: enriched, location }, 200);
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


