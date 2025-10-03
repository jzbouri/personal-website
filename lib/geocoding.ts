export async function reverseGeocodeToCityRegion(lat: number, lng: number): Promise<string | null> {
  try {
    const url = new URL("https://nominatim.openstreetmap.org/reverse");
    url.searchParams.set("format", "jsonv2");
    url.searchParams.set("lat", String(lat));
    url.searchParams.set("lon", String(lng));
    url.searchParams.set("zoom", "14");
    url.searchParams.set("addressdetails", "1");
    const email = process.env.GEOCODER_EMAIL || "hello@jbouri.ca";
    url.searchParams.set("email", email);

    const res = await fetch(url.toString(), {
      headers: {
        "User-Agent": "jbouri.ca/1.0 (reverse-geocoding)",
        "Accept": "application/json",
        "Accept-Language": "en",
      },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const json = (await res.json()) as {
      address?: {
        city?: string; town?: string; village?: string; hamlet?: string; suburb?: string; neighbourhood?: string;
        state?: string; region?: string; country_code?: string;
      };
      display_name?: string;
    };
    const a = json?.address;
    if (!a) return null;
    const city = a.city || a.town || a.village || a.hamlet || a.suburb || a.neighbourhood;
    const region = a.state || a.region;
    const cc = a.country_code?.toUpperCase();
    const parts = [city, region, cc].filter(Boolean);
    return parts.length ? parts.join(", ") : json.display_name || null;
  } catch {
    return null;
  }
}
