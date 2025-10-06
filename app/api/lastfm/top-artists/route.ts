import { NextRequest } from "next/server";
import { createLastFmClient, TopArtistsPeriod } from "@/lib/lastfm";

function json(data: unknown, init?: number | ResponseInit) {
  return new Response(JSON.stringify(data), {
    headers: { "Content-Type": "application/json" },
    ...(typeof init === "number" ? { status: init } : init),
  });
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const user = searchParams.get("user") || "tubulant_lemon";
    const period = (searchParams.get("period") || "7day") as TopArtistsPeriod;
    const limitParam = searchParams.get("limit");
    const page = searchParams.get("page");

    const client = createLastFmClient();
    type LastFmArtistRaw = { name?: unknown; url?: unknown; playcount?: string | number; ["@attr"]?: { rank?: string } };
    const raw = (await client.getTopArtists({
      user,
      period,
      limit: limitParam ? Number(limitParam) : 5,
      page: page ? Number(page) : undefined,
    })) as { topartists?: { artist?: LastFmArtistRaw[] } };

    const artists = (raw?.topartists?.artist ?? []).map((a, idx: number) => ({
      name: String(a?.name ?? ""),
      url: String(a?.url ?? ""),
      playcount: typeof a?.playcount === "string" || typeof a?.playcount === "number" ? a.playcount : undefined,
      ["@attr"]: { rank: a?.["@attr"]?.rank || String(idx + 1) },
    }));

    const response = json({ user, period, artists }, 200);
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



