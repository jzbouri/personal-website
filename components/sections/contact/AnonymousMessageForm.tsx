"use client";

import { useCallback, useMemo, useState } from "react";
import { FiLoader, FiSend } from "react-icons/fi";


export default function AnonymousMessageForm() {
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const maxChars = 500;
  const remaining = useMemo(() => maxChars - message.length, [message]);
  const canSubmit = message.trim().length > 0 && !submitting;

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setStatus("idle");
    setErrorMsg(null);

    const payload = { message: message.trim() };

    try {
      const res = await fetch("/api/anonymous-messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (!res.ok || data?.ok !== true) {
        throw new Error(data?.error || `Request failed (${res.status})`);
      }
      setStatus("success");
      setMessage("");
    } catch (err) {
      setStatus("error");
      const m = err instanceof Error ? err.message : "Something went wrong. Please try again.";
      setErrorMsg(m);
    } finally {
      setSubmitting(false);
    }
  }, [canSubmit, message]);

  return (
    <form onSubmit={handleSubmit} className="group relative overflow-hidden rounded-2xl border border-white/10 bg-[var(--surface-1)] p-4 transition-all duration-300 hover:border-white/20 hover:bg-[var(--surface-2)] focus-within:border-white/20">
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
            className="w-full resize-y rounded-xl border border-white/10 bg-[var(--surface-5)] px-3 py-2 text-sm text-white placeholder-white/40 outline-none transition-[border,background] focus:border-white/20 focus:bg-[var(--surface-6)]"
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


