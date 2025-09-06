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

  return (
    <main className="mx-auto max-w-3xl">
      <Header subtitle={subtitle} />
      <Tabs items={items} initialTabId={activeId} onChange={setActiveId} />
    </main>
  );
}
