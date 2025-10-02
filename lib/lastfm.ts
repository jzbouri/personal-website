const LASTFM_BASE_URL = "http://ws.audioscrobbler.com/2.0/" as const;

type LastFmFormat = "json" | "xml";

export interface LastFmClientOptions {
  apiKey?: string;
  sharedSecret?: string;
  format?: LastFmFormat;
}

export interface LastFmRequestParams {
  [key: string]: string | number | boolean | undefined;
}

export type TopArtistsPeriod =
  | "overall"
  | "7day"
  | "1month"
  | "3month"
  | "6month"
  | "12month";

export class LastFmClient {
  private readonly apiKey: string;
  private readonly sharedSecret?: string;
  private readonly format: LastFmFormat;

  constructor(options: LastFmClientOptions = {}) {
    const envKey = process.env.LAST_FM_API_KEY;
    const envSecret = process.env.LAST_FM_SHARED_SECRET;

    this.apiKey = options.apiKey || (envKey ?? "");
    this.sharedSecret = options.sharedSecret || envSecret || undefined;
    this.format = options.format || "json";

    if (!this.apiKey) {
      throw new Error("LAST_FM_API_KEY is required");
    }
  }

  async request<T>(method: string, params: LastFmRequestParams): Promise<T> {
    const url = new URL(LASTFM_BASE_URL);
    url.searchParams.set("method", method);
    url.searchParams.set("api_key", this.apiKey);
    url.searchParams.set("format", this.format);

    for (const [key, value] of Object.entries(params)) {
      if (value === undefined) continue;
      url.searchParams.set(key, String(value));
    }

    const res = await fetch(url.toString(), { cache: "no-store" });
    if (!res.ok) {
      throw new Error(`Last.fm request failed: ${res.status} ${res.statusText}`);
    }
    return (await res.json()) as T;
  }

  getRecentTracks(args: { user: string; limit?: number; page?: number; from?: number; to?: number; extended?: 0 | 1; }) {
    return this.request<unknown>("user.getrecenttracks", args);
  }

  getTopArtists(args: { user: string; period?: TopArtistsPeriod; limit?: number; page?: number; }) {
    return this.request<unknown>("user.gettopartists", args);
  }
}

export function createLastFmClient(options: LastFmClientOptions = {}) {
  return new LastFmClient(options);
}


