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
    <div className="grid grid-cols-1 gap-4">
      {items.map((item) => (
        <ExperienceCard key={item.id} item={item} />
      ))}
    </div>
  );
}





