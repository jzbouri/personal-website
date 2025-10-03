import { createAdminClient } from "@/utils/supabase/admin";

const STRAVA_TOKEN_URL = "https://www.strava.com/oauth/token";

export interface StravaTokens {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  expires_in: number;
}

export interface StravaAuthRow {
  id?: number;
  access_token: string;
  refresh_token: string;
  expires_at: number;
  expires_in: number;
  token_type?: string;
}

interface TokenRefreshResponse {
  token_type: string;
  access_token: string;
  expires_at: number;
  expires_in: number;
  refresh_token: string;
}

async function fetchTokensFromDb(): Promise<StravaAuthRow> {
  const supabase = createAdminClient();
  
  const { data, error } = await supabase
    .from("strava_auth")
    .select("*")
    .limit(1)
    .single();

  if (error || !data) {
    throw new Error(`Failed to fetch Strava tokens from database: ${error?.message || "No data found"}`);
  }

  return data as StravaAuthRow;
}

async function updateTokensInDb(tokens: StravaTokens): Promise<void> {
  const supabase = createAdminClient();
  
  const { data: existing } = await supabase
    .from("strava_auth")
    .select("id")
    .limit(1)
    .single();

  if (!existing) {
    throw new Error("No existing Strava auth row found to update");
  }

  const { error } = await supabase
    .from("strava_auth")
    .update({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_at: tokens.expires_at,
      expires_in: tokens.expires_in,
    })
    .eq("id", existing.id);

  if (error) {
    throw new Error(`Failed to update Strava tokens in database: ${error.message}`);
  }
}

async function refreshAccessToken(refreshToken: string): Promise<StravaTokens> {
  const clientId = process.env.STRAVA_CLIENT_ID;
  const clientSecret = process.env.STRAVA_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("STRAVA_CLIENT_ID and STRAVA_CLIENT_SECRET environment variables are required");
  }

  const response = await fetch(STRAVA_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    throw new Error(`Failed to refresh Strava token: ${response.status} ${response.statusText} ${errorText}`);
  }

  const data = (await response.json()) as TokenRefreshResponse;

  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: data.expires_at,
    expires_in: data.expires_in,
  };
}

function isTokenExpired(expiresAt: number): boolean {
  const now = Math.floor(Date.now() / 1000);
  const bufferTime = 300;
  return expiresAt <= now + bufferTime;
}

export async function getValidStravaAccessToken(): Promise<string> {
  const tokens = await fetchTokensFromDb();

  if (isTokenExpired(tokens.expires_at)) {
    console.log("Strava access token expired or expiring soon, refreshing...");
    
    const newTokens = await refreshAccessToken(tokens.refresh_token);
    
    await updateTokensInDb(newTokens);
    
    console.log("Strava access token refreshed successfully");
    
    return newTokens.access_token;
  }

  return tokens.access_token;
}

export async function forceRefreshStravaToken(): Promise<StravaTokens> {
  const tokens = await fetchTokensFromDb();
  const newTokens = await refreshAccessToken(tokens.refresh_token);
  await updateTokensInDb(newTokens);
  return newTokens;
}

