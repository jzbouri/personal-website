"use client";

import ProjectCard from "./ProjectCard";
import type { ProjectItem } from "./types";

interface ProjectListProps {
  items: ProjectItem[];
  emptyState?: React.ReactNode;
}

export default function ProjectList({ items, emptyState }: ProjectListProps) {
  if (!items || items.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-white/10 p-6 text-center text-white/50">
        {emptyState ?? "No projects added yet."}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 items-stretch gap-4 sm:gap-5 md:grid-cols-2">
      {items.map((item) => (
        <div key={item.id}>
          <ProjectCard item={item} />
        </div>
      ))}
    </div>
  );
}


