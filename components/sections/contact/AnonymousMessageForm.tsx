"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { FiLoader, FiSend } from "react-icons/fi";

type DeviceType = "Mobile" | "Tablet" | "Desktop" | "Unknown";

type Meta = {
  ip: string | null;
  os: string | null;
  deviceType: DeviceType;
};

function useClientInfo() {
  const [meta, setMeta] = useState<Meta>({ ip: null, os: null, deviceType: "Unknown" });

  useEffect(() => {
    let aborted = false;

    function detectOS(userAgent: string, platformHint?: string | null): string | null {
      const ua = userAgent.toLowerCase();
      const plat = (platformHint || "").toLowerCase();
      if (/windows nt|win64|win32/.test(ua) || /windows/.test(plat)) return "Windows";
      if (/mac os x|macintosh/.test(ua) || /mac/.test(plat)) return "macOS";
      if (/iphone|ipad|ipod|ios/.test(ua) || /ios/.test(plat)) return "iOS";
      if (/android/.test(ua)) return "Android";
      if (/cros/.test(ua) || /chrome os/.test(plat)) return "Chrome OS";
      if (/linux/.test(ua) || /linux/.test(plat)) return "Linux";
      return null;
    }

    function detectDeviceType(userAgent: string, isMobileHint?: boolean): DeviceType {
      if (typeof isMobileHint === "boolean") return isMobileHint ? "Mobile" : "Desktop";
      const ua = userAgent.toLowerCase();
      if (/ipad|tablet/.test(ua)) return "Tablet";
      if (/mobi|iphone|android/.test(ua)) return "Mobile";
      return "Desktop";
    }

    const nav: Navigator | undefined = typeof navigator !== "undefined" ? navigator : undefined;
    const ua = nav?.userAgent || "";
    const uaData = (nav
      ? (nav as unknown as { userAgentData?: { mobile?: boolean; platform?: string } }).userAgentData
      : undefined);

    const os = detectOS(ua, uaData?.platform ?? null);
    const deviceType = detectDeviceType(ua, uaData?.mobile);

    setMeta((m) => ({ ...m, os, deviceType }));

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    fetch("https://api.ipify.org?format=json", { signal: controller.signal })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("ipify: bad response"))))
      .then((data: { ip?: string }) => {
        if (!aborted) setMeta((m) => ({ ...m, ip: data?.ip ?? null }));
      })
      .catch(() => {
        if (!aborted) setMeta((m) => ({ ...m, ip: null }));
      })
      .finally(() => clearTimeout(timeoutId));

    return () => {
      aborted = true;
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, []);

  return meta;
}

export default function AnonymousMessageForm() {
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const meta = useClientInfo();

  const maxChars = 500;
  const remaining = useMemo(() => maxChars - message.length, [message]);
  const canSubmit = message.trim().length > 0 && !submitting;

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setStatus("idle");
    setErrorMsg(null);

    const payload = {
      message: message.trim(),
      ip: meta.ip,
      os: meta.os,
      deviceType: meta.deviceType,
    };

    try {
      await new Promise((resolve) => setTimeout(resolve, 700));
      if (typeof window !== "undefined") {
        console.log("Anonymous message payload", payload);
      }
      setStatus("success");
      setMessage("");
    } catch (err) {
      setStatus("error");
      setErrorMsg("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }, [canSubmit, message, meta]);

  return (
    <form onSubmit={handleSubmit} className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] p-4 transition-all duration-300 hover:border-white/20 hover:bg-white/[0.03] focus-within:border-white/20">
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" aria-hidden>
        <div className="absolute inset-0 bg-[radial-gradient(120%_120%_at_0%_0%,rgba(96,165,250,0.12),transparent_60%),radial-gradient(120%_120%_at_100%_100%,rgba(34,211,238,0.12),transparent_60%),radial-gradient(140%_140%_at_100%_0%,rgba(192,132,252,0.12),transparent_60%)]" />
      </div>

      <div className="relative z-10 space-y-3">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="text-sm font-semibold text-white/90 font-brand-mono">Send an anonymous message</h3>
          <p className="text-xs text-white/50">{remaining} / {maxChars}</p>
        </div>

        <div>
          <label htmlFor="anon-msg" className="sr-only">Your message</label>
          <textarea
            id="anon-msg"
            value={message}
            onChange={(e) => setMessage(e.target.value.slice(0, maxChars))}
            placeholder="Write your message..."
            rows={5}
            className="w-full resize-y rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/40 outline-none transition-[border,background] focus:border-white/20 focus:bg-white/7"
            maxLength={maxChars}
          />
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-xs text-white/60">
            Inspired by my middle school <a href="https://en.wikipedia.org/wiki/Sarahah" target="_blank" rel="noopener noreferrer" className="text-emerald-300 underline decoration-emerald-300/30 underline-offset-4 transition-colors hover:text-emerald-200">Sarahah</a> obsession
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {status === "success" && (
              <span className="text-xs font-medium text-emerald-300">Message sent successfully</span>
            )}
            {status === "error" && (
              <span className="text-xs font-medium text-red-300">{errorMsg ?? "Error"}</span>
            )}
            <button
              type="submit"
              disabled={!canSubmit}
              className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1.5 text-sm font-semibold text-emerald-200 transition-colors hover:border-emerald-400/60 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <FiLoader className="h-4 w-4 animate-spin" aria-hidden />
                  <span>Sending…</span>
                </>
              ) : (
                <>
                  <FiSend className="h-4 w-4" aria-hidden />
                  <span>Send</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}


