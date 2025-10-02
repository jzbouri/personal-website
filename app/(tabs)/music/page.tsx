"use client";

import RecentTracks from "@/components/sections/RecentTracks";
import TopArtists from "@/components/sections/TopArtists";
import TopAlbums from "@/components/sections/TopAlbums";

export default function MusicPage() {
  const user = "tubulant_lemon";

  return (
    <section className="space-y-3">
      <RecentTracks user={user} />
      <TopArtists user={user} />
      <TopAlbums user={user} />
    </section>
  );
}



