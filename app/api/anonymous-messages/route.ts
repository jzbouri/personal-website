import { NextRequest } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";

function json(data: unknown, init?: number | ResponseInit) {
  return new Response(JSON.stringify(data), {
    headers: { "Content-Type": "application/json" },
    ...(typeof init === "number" ? { status: init } : init),
  });
}

function getHeaderIP(req: NextRequest): string | null {
  const h = req.headers;
  const xff = h.get("x-forwarded-for");
  const ip = xff?.split(",")[0]?.trim() ||
    h.get("x-real-ip") ||
    h.get("cf-connecting-ip") ||
    h.get("x-vercel-forwarded-for") ||
    null;
  return ip && ip.length > 0 ? ip : null;
}

function detectOS(userAgent: string): string | null {
  const ua = (userAgent || "").toLowerCase();
  if (/windows nt|win64|win32/.test(ua)) return "Windows";
  if (/mac os x|macintosh/.test(ua)) return "macOS";
  if (/iphone|ipad|ipod|ios/.test(ua)) return "iOS";
  if (/android/.test(ua)) return "Android";
  if (/cros|chrome os/.test(ua)) return "Chrome OS";
  if (/linux/.test(ua)) return "Linux";
  return null;
}

function detectDeviceType(userAgent: string): "Mobile" | "Tablet" | "Desktop" | "Unknown" {
  const ua = (userAgent || "").toLowerCase();
  if (/ipad|tablet/.test(ua)) return "Tablet";
  if (/mobi|iphone|android/.test(ua)) return "Mobile";
  if (ua) return "Desktop";
  return "Unknown";
}

export async function POST(req: NextRequest) {
  try {
    const supabase = createAdminClient();

    const body = await req.json().catch(() => ({}));
    const message = typeof body?.message === "string" ? body.message.trim() : "";

    if (!message) return json({ error: "Message is required" }, 400);
    if (message.length > 500) return json({ error: "Message too long" }, 400);

    const headerIp = getHeaderIP(req);
    const ua = req.headers.get("user-agent") || "";
    const os = detectOS(ua);
    const deviceType = detectDeviceType(ua);

    const row = {
      uuid: (typeof crypto !== "undefined" && typeof (crypto as any).randomUUID === "function")
        ? (crypto as any).randomUUID()
        : Math.random().toString(36).slice(2) + Date.now().toString(36),
      message,
      ip: headerIp,
      os,
      device_type: deviceType,
    } as const;

    const { data, error } = await supabase
      .from("anonymous_messages")
      .insert([row])
      .select("uuid")
      .limit(1);

    if (error) return json({ error: "an error occured" }, 500);

    return json({ ok: true, id: data?.[0]?.uuid ?? null }, 200);
  } catch (error) {
    return json({ error: "an error occured" }, 500);
  }
}


