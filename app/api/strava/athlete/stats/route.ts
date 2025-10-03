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
    const data = await client.getAthleteStats(athleteId);

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


