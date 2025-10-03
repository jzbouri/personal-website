import NodeGeocoder from "node-geocoder";

const geocoder = NodeGeocoder({
  provider: "openstreetmap" as const,
  formatter: null,
});

export async function reverseGeocodeToCityRegion(lat: number, lng: number): Promise<string | null> {
  try {
    const res = await geocoder.reverse({ lat, lon: lng });
    const first = res?.[0] as {
      city?: string;
      town?: string;
      village?: string;
      hamlet?: string;
      suburb?: string;
      neighbourhood?: string;
      state?: string;
      administrativeLevels?: { level1long?: string; level2long?: string };
      countryCode?: string;
      formattedAddress?: string;
    } | undefined;
    if (!first) return null;
    const city = first.city || first.town || first.village || first.hamlet || first.suburb || first.neighbourhood;
    const region = first.state || first.administrativeLevels?.level1long || first.administrativeLevels?.level2long;
    const countryCode = first.countryCode;
    const parts = [city, region, countryCode].filter(Boolean);
    if (parts.length) return parts.join(", ");
    if (first.formattedAddress) return first.formattedAddress;
  } catch {
    return null;
  }

  try {
    const url = new URL("https://nominatim.openstreetmap.org/reverse");
    url.searchParams.set("format", "jsonv2");
    url.searchParams.set("lat", String(lat));
    url.searchParams.set("lon", String(lng));
    url.searchParams.set("zoom", "14");
    url.searchParams.set("addressdetails", "1");

    const res = await fetch(url.toString(), {
      headers: {
        "User-Agent": "personal-website/1.0 (reverse-geocoding)",
        Accept: "application/json",
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


