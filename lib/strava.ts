import { getValidStravaAccessToken } from "./strava-auth";

const STRAVA_API_BASE = "https://www.strava.com/api/v3" as const;

export interface StravaClientOptions {
  accessToken?: string;
}

export class StravaClient {
  private accessToken: string | null = null;

  constructor(private options: StravaClientOptions = {}) {}

  private async getAccessToken(): Promise<string> {
    if (this.options.accessToken) {
      return this.options.accessToken;
    }

    if (this.accessToken) {
      return this.accessToken;
    }

    this.accessToken = await getValidStravaAccessToken();
    return this.accessToken;
  }

  private async request<T>(path: string, init?: RequestInit): Promise<T> {
    const token = await this.getAccessToken();
    const url = `${STRAVA_API_BASE}${path}`;
    
    const res = await fetch(url, {
      ...init,
      headers: {
        Authorization: `Bearer ${token}`,
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

  async getLatestActivity<T = unknown>(): Promise<T | null> {
    const activities = await this.request<T[]>(`/athlete/activities?per_page=1&page=1`);
    return activities?.length ? activities[0] : null;
  }

  getActivityById<T = unknown>(activityId: number) {
    return this.request<T>(`/activities/${activityId}`);
  }
}

export function createStravaClient(options: StravaClientOptions = {}) {
  return new StravaClient(options);
}


