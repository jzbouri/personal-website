import { NextRequest } from "next/server";
import { randomUUID as nodeRandomUUID } from "crypto";
import twilio from "twilio";
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

async function sendSmsNotification(bodyText: string): Promise<void> {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM_NUMBER;
  const to = process.env.TWILIO_TO_NUMBER;
  if (!sid || !token || !from || !to) return;

  try {
    const client = twilio(sid, token);
    await client.messages.create({ from, to, body: bodyText });
  } catch (error) {
    console.error("Error sending SMS. ", error);
  }
}

function formatSms({ message, ip, userAgent, tsISO }: { message: string; ip: string | null; userAgent: string | null; tsISO: string; }): string {
  const lines = [
    "New anonymous message:",
    "",
    message,
    "",
    `Time: ${tsISO}`,
    "",
    `IP: ${ip ?? "unknown"}`,
    "",
    `UA: ${userAgent ?? "unknown"}`,
  ];
  return lines.join("\n");
}

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const supabase = createAdminClient();

    const body = await req.json().catch(() => ({}));
    const message = typeof body?.message === "string" ? body.message.trim() : "";

    if (!message) return json({ error: "Message is required" }, 400);
    if (message.length > 500) return json({ error: "Message too long" }, 400);

    const headerIp = getHeaderIP(req);
    const userAgent = req.headers.get("user-agent");

    const uuid = (typeof nodeRandomUUID === "function")
      ? nodeRandomUUID()
      : (typeof globalThis !== "undefined" && typeof (globalThis.crypto as Crypto | undefined)?.randomUUID === "function")
        ? (globalThis.crypto as Crypto).randomUUID()
        : `${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;

    const row = {
      uuid,
      message,
      ip: headerIp,
      user_agent: userAgent ?? null,
    } as const;

    const { data, error } = await supabase
      .from("anonymous_messages")
      .insert([row])
      .select("uuid")
      .limit(1);

    if (error) return json({ error: "an error occured" }, 500);

    const response = json({ ok: true, id: data?.[0]?.uuid ?? null }, 200);

    const tsISO = new Date().toISOString();
    const smsBody = formatSms({ message, ip: headerIp, userAgent: userAgent ?? null, tsISO });
    void sendSmsNotification(smsBody);

    return response;
  } catch {
    return json({ error: "an error occured" }, 500);
  }
}


