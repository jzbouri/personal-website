"use client";

import RecentTracks from "@/components/sections/RecentTracks";
import TopArtists from "@/components/sections/TopArtists";

export default function MusicPage() {
  return (
    <section className="space-y-3">
      <RecentTracks user="tubulant_lemon" />
      <TopArtists user="tubulant_lemon" />
    </section>
  );
}



