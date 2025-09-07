"use client";

import Header from "@/components/layout/Header";
import TabBar from "@/components/ui/TabBar";
import { useMemo } from "react";
import { usePathname } from "next/navigation";

export default function TabsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();

  const activeId = useMemo(() => {
    if (pathname.startsWith("/athletics")) return "athletics";
    if (pathname.startsWith("/music")) return "music";
    if (pathname.startsWith("/life")) return "life";
    return "software";
  }, [pathname]);

  const subtitle = (() => {
    switch (activeId) {
      case "software":
        return "Software engineer";
      case "athletics":
        return "Athlete";
      case "music":
        return "Music enjoyer";
      case "life":
        return "Chill guy";
      default:
        return "Software engineer";
    }
  })();

  const links = (() => {
    switch (activeId) {
      case "software":
        return [
          { label: "GitHub", href: "https://github.com/jzbouri" },
          { label: "LinkedIn", href: "https://www.linkedin.com/in/jalal-bouri" },
        ];
      case "athletics":
        return [
          { label: "Strava", href: "https://www.strava.com/athletes/56842043" },
        ];
      case "music":
        return [
          { label: "Spotify", href: "https://open.spotify.com/user/aqxyzyqukhns1qtu04uji0os5" },
          { label: "Last.fm", href: "https://www.last.fm/user/tubulant_lemon" },
        ];
      default:
        return [];
    }
  })();

  const items = [
    { id: "software", label: "Software Engineering", href: "/software" },
    { id: "athletics", label: "Athletics", href: "/athletics" },
    { id: "music", label: "Music", href: "/music" },
    { id: "life", label: "Life", href: "/life" },
  ];

  return (
    <main className="mx-auto max-w-3xl">
      <Header subtitle={subtitle} links={links} />
      <TabBar items={items} selectedId={activeId} />
      <div className="pt-6">{children}</div>
    </main>
  );
}


