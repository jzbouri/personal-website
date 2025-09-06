"use client";

import { useMemo, useState } from "react";
import Tabs from "@/components/ui/Tabs";
import Header from "@/components/layout/Header";
import SoftwareEngineering from "@/components/sections/SoftwareEngineering";
import Athletics from "@/components/sections/Athletics";

export default function Home() {
  const items = [
    { id: "software", label: "Software Engineering", content: <SoftwareEngineering /> },
    { id: "athletics", label: "Athletics", content: <Athletics /> },
  ];

  const [activeId, setActiveId] = useState<string>(items[0].id);

  const subtitle = useMemo(() => {
    if (activeId === "software") return "Software engineer";
    if (activeId === "athletics") return "Athlete";
    return "";
  }, [activeId]);

  const links = useMemo(() => {
    if (activeId === "software") {
      return [
        { label: "GitHub", href: "https://github.com/jzbouri" },
        { label: "LinkedIn", href: "https://www.linkedin.com/in/jalal-bouri" },
      ];
    }
    if (activeId === "athletics") {
      return [
        { label: "Strava", href: "https://www.strava.com/athletes/56842043" },
      ];
    }
    return [] as { label: string; href: string }[];
  }, [activeId]);

  return (
    <main className="mx-auto max-w-3xl">
      <Header subtitle={subtitle} links={links} />
      <Tabs items={items} initialTabId={activeId} onChange={setActiveId} />
    </main>
  );
}
