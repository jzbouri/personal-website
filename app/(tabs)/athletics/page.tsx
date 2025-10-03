"use client";

import AthleticsStats from "@/components/sections/AthleticsStats";
import RaceResultsTable from "@/components/sections/RaceResultsTable";

export default function AthleticsPage() {
  return (
    <section className="space-y-6">
      <AthleticsStats />
      <RaceResultsTable />
    </section>
  );
}


