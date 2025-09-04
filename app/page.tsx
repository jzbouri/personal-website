"use client";

import Tabs from "@/components/ui/Tabs";
import Header from "@/components/layout/Header";
import SoftwareEngineering from "@/components/sections/SoftwareEngineering";
import Athletics from "@/components/sections/Athletics";

export default function Home() {
  const items = [
    { id: "software", label: "Software Engineering", content: <SoftwareEngineering /> },
    { id: "athletics", label: "Athletics", content: <Athletics /> },
  ];

  return (
    <main className="mx-auto max-w-3xl">
      <Header />
      <Tabs items={items} />
    </main>
  );
}
