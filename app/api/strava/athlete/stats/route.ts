import { NextRequest } from "next/server";
import { createStravaClient } from "@/lib/strava";

function json(data: unknown, init?: number | ResponseInit) {
  return new Response(JSON.stringify(data), {
    headers: { "Content-Type": "application/json" },
    ...(typeof init === "number" ? { status: init } : init),
  });
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const idParam = searchParams.get("id");
    const athleteId = idParam ? Number(idParam) : 56842043;

    const client = createStravaClient();
    type TotalsRaw = { count?: unknown; distance?: unknown; moving_time?: unknown; elevation_gain?: unknown };
    type StatsRaw = {
      all_run_totals?: TotalsRaw; all_ride_totals?: TotalsRaw;
      recent_run_totals?: TotalsRaw; recent_ride_totals?: TotalsRaw;
      ytd_run_totals?: TotalsRaw; ytd_ride_totals?: TotalsRaw;
    };
    const raw = (await client.getAthleteStats(athleteId)) as StatsRaw;
    const sanitizeTotals = (t: TotalsRaw | undefined) => t ? {
      count: typeof t.count === "number" ? t.count : undefined,
      distance: typeof t.distance === "number" ? t.distance : undefined,
      moving_time: typeof t.moving_time === "number" ? t.moving_time : undefined,
      elevation_gain: typeof t.elevation_gain === "number" ? t.elevation_gain : undefined,
    } : undefined;
    const data = {
      all_run_totals: sanitizeTotals(raw?.all_run_totals),
      all_ride_totals: sanitizeTotals(raw?.all_ride_totals),
      recent_run_totals: sanitizeTotals(raw?.recent_run_totals),
      recent_ride_totals: sanitizeTotals(raw?.recent_ride_totals),
      ytd_run_totals: sanitizeTotals(raw?.ytd_run_totals),
      ytd_ride_totals: sanitizeTotals(raw?.ytd_ride_totals),
    };

    const response = json({ athleteId, data }, 200);
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


