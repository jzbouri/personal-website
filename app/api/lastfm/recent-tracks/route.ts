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
    const data = await client.getRecentTracks({
      user,
      limit: limitParam ? Number(limitParam) : 10,
      page: page ? Number(page) : undefined,
      from: from ? Number(from) : undefined,
      to: to ? Number(to) : undefined,
      extended: (extended === "1" ? 1 : extended === "0" ? 0 : undefined) as 0 | 1 | undefined,
    });

    const response = json({ user, data }, 200);
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


