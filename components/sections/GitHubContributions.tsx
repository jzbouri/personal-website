"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type ContributionApiResponse = {
  login: string;
  range: { from: string; to: string };
  totalContributions: number;
  breakdown: {
    calendarTotal: number;
    commits: number;
    pullRequests: number;
    pullRequestReviews: number;
    issues: number;
    repositories: number;
    restricted: number;
  };
};

type FetchState = {
  isLoading: boolean;
  error: string | null;
  year: ContributionApiResponse | null;
  month: ContributionApiResponse | null;
  week: ContributionApiResponse | null;
};

function formatNumber(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "-";
  return new Intl.NumberFormat().format(value);
}

async function fetchContributions(login: string, fromIso: string, toIso: string): Promise<ContributionApiResponse> {
  const url = `/api/github/contributions?login=${encodeURIComponent(login)}&from=${encodeURIComponent(fromIso)}&to=${encodeURIComponent(toIso)}`;
  const res = await fetch(url, { cache: "default" });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Request failed with status ${res.status}`);
  }
  return res.json();
}

export default function GitHubContributions({ login }: { login: string }) {
  const [state, setState] = useState<FetchState>({
    isLoading: true,
    error: null,
    year: null,
    month: null,
    week: null,
  });

  const now = useMemo(() => new Date(), []);
  const hasAnimatedRef = useRef(false);

  useEffect(() => {
    let isCancelled = false;
    const toIso = now.toISOString();
    const msInDay = 24 * 60 * 60 * 1000;
    const fromYear = new Date(now.getTime() - 365 * msInDay).toISOString();
    const fromMonth = new Date(now.getTime() - 30 * msInDay).toISOString();
    const fromWeek = new Date(now.getTime() - 7 * msInDay).toISOString();

    // Attempt to hydrate from localStorage cache (5-minute TTL)
    try {
      const key = (k: string) => `gh-contrib:${login}:${k}`;
      const cached = {
        year: localStorage.getItem(key("year")),
        month: localStorage.getItem(key("month")),
        week: localStorage.getItem(key("week")),
      };
      const parsed = Object.fromEntries(
        Object.entries(cached).map(([k, v]) => [k, v ? JSON.parse(v) : null])
      ) as Record<string, { expiresAt: number; data: ContributionApiResponse } | null>;
      const nowMs = Date.now();
      const year = parsed.year && parsed.year.expiresAt > nowMs ? parsed.year.data : null;
      const month = parsed.month && parsed.month.expiresAt > nowMs ? parsed.month.data : null;
      const week = parsed.week && parsed.week.expiresAt > nowMs ? parsed.week.data : null;
      if (year || month || week) {
        setState((s) => ({ ...s, isLoading: false, year, month, week }));
      } else {
        setState((s) => ({ ...s, isLoading: true, error: null }));
      }
    } catch {
      setState((s) => ({ ...s, isLoading: true, error: null }));
    }

    Promise.allSettled([
      fetchContributions(login, fromYear, toIso),
      fetchContributions(login, fromMonth, toIso),
      fetchContributions(login, fromWeek, toIso),
    ]).then((results) => {
      if (isCancelled) return;
      const [yearRes, monthRes, weekRes] = results;
      const next: FetchState = {
        isLoading: false,
        error: null,
        year: null,
        month: null,
        week: null,
      };

      if (yearRes.status === "fulfilled") next.year = yearRes.value;
      if (monthRes.status === "fulfilled") next.month = monthRes.value;
      if (weekRes.status === "fulfilled") next.week = weekRes.value;

      const firstError = [yearRes, monthRes, weekRes]
        .find((r) => r.status === "rejected") as PromiseRejectedResult | undefined;
      if (firstError) next.error = firstError.reason?.message || "Failed to load";

      setState(next);

      try {
        const ttlMs = 5 * 60 * 1000;
        const expiresAt = Date.now() + ttlMs;
        const key = (k: string) => `gh-contrib:${login}:${k}`;
        if (next.year) localStorage.setItem(key("year"), JSON.stringify({ expiresAt, data: next.year }));
        if (next.month) localStorage.setItem(key("month"), JSON.stringify({ expiresAt, data: next.month }));
        if (next.week) localStorage.setItem(key("week"), JSON.stringify({ expiresAt, data: next.week }));
      } catch {
      }
    });

    return () => {
      isCancelled = true;
    };
  }, [login, now]);

  // Count-up animation hook
  function useCountUp(value: number | undefined, durationMs = 400) {
    const [display, setDisplay] = useState(0);
    const startRef = useRef<number | null>(null);
    const rafRef = useRef<number | null>(null);

    useEffect(() => {
      if (value === undefined || value === null) return;
      if (hasAnimatedRef.current) {
        setDisplay(value);
        return;
      }
      const startValue = 0;
      const endValue = value;
      const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

      function tick(ts: number) {
        if (startRef.current === null) startRef.current = ts;
        const elapsed = ts - startRef.current;
        const t = Math.min(1, elapsed / durationMs);
        const eased = easeOutCubic(t);
        const current = Math.round(startValue + (endValue - startValue) * eased);
        setDisplay(current);
        if (t < 1) {
          rafRef.current = requestAnimationFrame(tick);
        } else {
          hasAnimatedRef.current = true;
        }
      }

      rafRef.current = requestAnimationFrame(tick);
      return () => {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        startRef.current = null;
      };
    }, [value, durationMs]);

    return formatNumber(display);
  }

  const yearCount = useCountUp(state.year?.totalContributions);
  const monthCount = useCountUp(state.month?.totalContributions, 400);
  const weekCount = useCountUp(state.week?.totalContributions, 400);
  const yearCommitsCount = useCountUp(state.year?.breakdown.commits, 400);
  const yearPrsCount = useCountUp(state.year?.breakdown.pullRequests, 400);
  const yearOtherRaw =
    (state.year?.breakdown.pullRequestReviews || 0) +
    (state.year?.breakdown.issues || 0) +
    (state.year?.breakdown.repositories || 0) +
    (state.year?.breakdown.restricted || 0);
  const yearOtherCount = useCountUp(yearOtherRaw, 400);

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white/90 font-brand-mono">GitHub contributions</h3>
        {state.isLoading ? (
          <span className="inline-flex items-center gap-2 text-xs text-white/60" aria-busy="true">
            <span className="h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white/80" />
            Loading
          </span>
        ) : state.error ? (
          <span className="text-xs text-red-300/80">{state.error}</span>
        ) : null}
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
        <div className="rounded-lg border border-emerald-400/25 bg-emerald-400/10 p-4 md:col-span-2 h-full flex flex-col">
          <p className="text-[11px] uppercase tracking-wide text-emerald-200/80">Past year</p>
          <p className="mt-1 text-3xl font-extrabold text-emerald-100">
            {state.isLoading ? <span className="inline-block h-6 w-20 animate-pulse rounded bg-emerald-300/30" /> : yearCount}
          </p>
          <div className="mt-auto pt-2 grid w-full max-w-[420px] grid-cols-3 gap-2 sm:max-w-[520px]">
            <div className="rounded-md border border-emerald-400/15 bg-emerald-400/5 px-3 py-2 text-center">
              <p className="text-base font-bold text-emerald-100 md:text-lg">
                {state.isLoading ? <span className="inline-block h-5 w-10 animate-pulse rounded bg-emerald-300/30" /> : yearCommitsCount}
              </p>
              <p className="text-[10px] uppercase tracking-wide text-emerald-200/70">Commits</p>
            </div>
            <div className="rounded-md border border-emerald-400/15 bg-emerald-400/5 px-3 py-2 text-center">
              <p className="text-base font-bold text-emerald-100 md:text-lg">
                {state.isLoading ? <span className="inline-block h-5 w-8 animate-pulse rounded bg-emerald-300/30" /> : yearPrsCount}
              </p>
              <p className="text-[10px] uppercase tracking-wide text-emerald-200/70">PRs</p>
            </div>
            <div className="rounded-md border border-emerald-400/15 bg-emerald-400/5 px-3 py-2 text-center">
              <p className="text-base font-bold text-emerald-100 md:text-lg">
                {state.isLoading ? <span className="inline-block h-5 w-10 animate-pulse rounded bg-emerald-300/30" /> : yearOtherCount}
              </p>
              <p className="text-[10px] uppercase tracking-wide text-emerald-200/70">Other</p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="rounded-lg border border-white/10 bg-white/5 p-4">
            <p className="text-[11px] uppercase tracking-wide text-white/70">Past month</p>
            <p className="mt-1 text-2xl font-bold text-white">
              {state.isLoading ? <span className="inline-block h-6 w-16 animate-pulse rounded bg-white/20" /> : monthCount}
            </p>
          </div>

          <div className="rounded-lg border border-white/10 bg-white/5 p-4">
            <p className="text-[11px] uppercase tracking-wide text-white/70">Past week</p>
            <p className="mt-1 text-2xl font-bold text-white">
              {state.isLoading ? <span className="inline-block h-6 w-14 animate-pulse rounded bg-white/20" /> : weekCount}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}


