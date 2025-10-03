"use client";

import AthleticsStats from "@/components/sections/AthleticsStats";
import LatestActivity from "@/components/sections/LatestActivity";
import RaceResultsTable from "@/components/sections/RaceResultsTable";

export default function AthleticsPage() {
  return (
    <section className="space-y-6">
      <AthleticsStats />
      <LatestActivity />
      <RaceResultsTable />
    </section>
  );
}


