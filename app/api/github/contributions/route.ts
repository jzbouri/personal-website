import { NextRequest } from "next/server";
import { fetchContributionSummary } from "@/lib/github";

function json(data: unknown, init?: number | ResponseInit) {
  return new Response(JSON.stringify(data), {
    headers: { "Content-Type": "application/json" },
    ...(typeof init === "number" ? { status: init } : init),
  });
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const login = searchParams.get("login") || searchParams.get("user") || undefined;
    const from = searchParams.get("from") || undefined;
    const to = searchParams.get("to") || undefined;

    if (!login) return json({ error: "Missing required query param: login" }, 400);
    if (!from) return json({ error: "Missing required query param: from" }, 400);
    if (!to) return json({ error: "Missing required query param: to" }, 400);

    const summary = await fetchContributionSummary({ login, from, to });

    return json(
      {
        login: summary.login,
        range: summary.range,
        totalContributions: summary.totals.calendarTotal,
        breakdown: summary.totals,
      },
      200
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return json({ error: message }, 500);
  }
}


