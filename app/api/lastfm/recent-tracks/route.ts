import { NextRequest } from "next/server";
import { createLastFmClient } from "@/lib/lastfm";

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
    const limitParam = searchParams.get("limit");
    const page = searchParams.get("page");
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const extended = searchParams.get("extended");

    const client = createLastFmClient();
    type LastFmImageRaw = { size?: string; ["#text"]?: string };
    type LastFmTrackRaw = {
      name?: unknown;
      url?: unknown;
      artist?: string | { ["#text"]?: string };
      album?: string | { ["#text"]?: string };
      image?: LastFmImageRaw[];
      date?: { uts?: string; ["#text"]?: string };
      ["@attr"]?: { nowplaying?: string };
    };
    const raw = (await client.getRecentTracks({
      user,
      limit: limitParam ? Number(limitParam) : 10,
      page: page ? Number(page) : undefined,
      from: from ? Number(from) : undefined,
      to: to ? Number(to) : undefined,
      extended: (extended === "1" ? 1 : extended === "0" ? 0 : undefined) as 0 | 1 | undefined,
    })) as { recenttracks?: { track?: LastFmTrackRaw[] } };

    const tracks = (raw?.recenttracks?.track ?? []).map((t) => {
      const name = typeof t?.name === "string" ? t.name : String(t?.name ?? "");
      const url = typeof t?.url === "string" ? t.url : "";
      const artistText = typeof t?.artist === "string" ? t.artist : t?.artist?.["#text"];
      const albumText = typeof t?.album === "string" ? t.album : t?.album?.["#text"];
      const image = Array.isArray(t?.image)
        ? t.image
            .filter((i) => i && (i["#text"] || i.size))
            .map((i) => ({ size: i.size, ["#text"]: i["#text"] }))
        : undefined;
      const date = t?.date && (t.date.uts || t.date["#text"]) ? { uts: t.date.uts, ["#text"]: t.date["#text"] } : undefined;
      const nowplaying = t?.["@attr"]?.nowplaying === "true" ? "true" : undefined;
      const attr = nowplaying ? { nowplaying } : undefined;
      return {
        name,
        url,
        artist: artistText ? { ["#text"]: String(artistText) } : "",
        album: albumText ? { ["#text"]: String(albumText) } : "",
        image,
        date,
        ["@attr"]: attr,
      };
    });

    const response = json({ user, tracks }, 200);
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


