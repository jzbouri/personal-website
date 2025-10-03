"use client";

import ExperienceCard from "./ExperienceCard";
import type { ExperienceItem } from "./types";

interface ExperienceListProps {
  items: ExperienceItem[];
  emptyState?: React.ReactNode;
}

export default function ExperienceList({ items, emptyState }: ExperienceListProps) {
  if (!items || items.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-white/10 p-6 text-center text-white/50">
        {emptyState ?? "No experiences added yet."}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 items-stretch gap-4 sm:gap-5 md:grid-cols-2">
      {items.map((item) => (
        <div key={item.id}>
          <ExperienceCard item={item} />
        </div>
      ))}
    </div>
  );
}





