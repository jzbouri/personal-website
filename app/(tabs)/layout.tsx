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
    return "software";
  }, [pathname]);

  const subtitle = activeId === "software" ? "Software engineer" : "Athlete";

  const links = activeId === "software"
    ? [
        { label: "GitHub", href: "https://github.com/jzbouri" },
        { label: "LinkedIn", href: "https://www.linkedin.com/in/jalal-bouri" },
      ]
    : [
        { label: "Strava", href: "https://www.strava.com/athletes/56842043" },
      ];

  const items = [
    { id: "software", label: "Software Engineering", href: "/software" },
    { id: "athletics", label: "Athletics", href: "/athletics" },
  ];

  return (
    <main className="mx-auto max-w-3xl">
      <Header subtitle={subtitle} links={links} />
      <TabBar items={items} selectedId={activeId} />
      <div className="pt-6">{children}</div>
    </main>
  );
}


