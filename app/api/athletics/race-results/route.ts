import { NextRequest } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";

function json(data: unknown, init?: number | ResponseInit) {
  return new Response(JSON.stringify(data), {
    headers: { "Content-Type": "application/json" },
    ...(typeof init === "number" ? { status: init } : init),
  });
}

export async function GET(_req: NextRequest) {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase.from("race_results").select("*");
    if (error) throw error;
    const response = json({ data }, 200);
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


