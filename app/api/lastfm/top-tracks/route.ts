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
    type LastFmAlbumRaw = { name?: string; ["#text"]?: string };
    type LastFmArtistRaw = { name?: string; url?: string };
    type LastFmTrackRaw = { name?: unknown; url?: unknown; playcount?: string | number; artist?: string | LastFmArtistRaw; album?: string | LastFmAlbumRaw; ["@attr"]?: { rank?: string } };
    const raw = (await client.getTopTracks({
      user,
      period,
      limit: limitParam ? Number(limitParam) : 10,
      page: page ? Number(page) : undefined,
    })) as { toptracks?: { track?: LastFmTrackRaw[] } };

    const tracks = (raw?.toptracks?.track ?? []).map((t, idx: number) => ({
      name: String(t?.name ?? ""),
      url: String(t?.url ?? ""),
      playcount: typeof t?.playcount === "string" || typeof t?.playcount === "number" ? t.playcount : undefined,
      artist: typeof t?.artist === "string" ? t.artist : (t?.artist?.name ? { name: t.artist.name, url: t.artist.url } : undefined),
      album: typeof t?.album === "string" ? t.album : (t?.album?.name ? { name: t.album.name, ["#text"]: t.album["#text"] } : undefined),
      ["@attr"]: { rank: t?.["@attr"]?.rank || String(idx + 1) },
    }));

    const response = json({ user, period, tracks }, 200);
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


