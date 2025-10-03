const STRAVA_API_BASE = "https://www.strava.com/api/v3" as const;

export type StravaAccess = {
  accessToken: string;
};

export interface StravaClientOptions {
  accessToken?: string;
}

export class StravaClient {
  private readonly accessToken: string;

  constructor(options: StravaClientOptions = {}) {
    const token = options.accessToken || process.env.STRAVA_ACCESS_TOKEN || process.env.NEXT_PUBLIC_STRAVA_ACCESS_TOKEN;
    if (!token) {
      throw new Error("STRAVA_ACCESS_TOKEN is required");
    }
    this.accessToken = token;
  }

  private async request<T>(path: string, init?: RequestInit): Promise<T> {
    const url = `${STRAVA_API_BASE}${path}`;
    const res = await fetch(url, {
      ...init,
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        ...(init?.headers || {}),
      },
      cache: "no-store",
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(text || `Strava request failed: ${res.status} ${res.statusText}`);
    }
    return (await res.json()) as T;
  }

  getAthleteStats(athleteId: number) {
    return this.request<unknown>(`/athletes/${athleteId}/stats`);
  }
}

export function createStravaClient(options: StravaClientOptions = {}) {
  return new StravaClient(options);
}


