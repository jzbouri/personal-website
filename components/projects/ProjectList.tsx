"use client";

import ProjectCard from "./ProjectCard";
import type { ProjectItem } from "./types";
import { motion, useReducedMotion } from "framer-motion";

interface ProjectListProps {
  items: ProjectItem[];
  emptyState?: React.ReactNode;
}

export default function ProjectList({ items, emptyState }: ProjectListProps) {
  const reduceMotion = useReducedMotion();

  if (!items || items.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-white/10 p-6 text-center text-white/50">
        {emptyState ?? "No projects added yet."}
      </div>
    );
  }

  return (
    <motion.div
      className="grid grid-cols-1 items-stretch gap-4 sm:gap-5 md:grid-cols-2"
      initial={reduceMotion ? undefined : "hidden"}
      animate={reduceMotion ? undefined : "show"}
      variants={
        reduceMotion
          ? undefined
          : {
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.08,
                  delayChildren: 0.05,
                },
              },
            }
      }
    >
      {items.map((item) => (
        <motion.div
          key={item.id}
          layout
          variants={
            reduceMotion
              ? undefined
              : {
                  hidden: { opacity: 0, y: 20, scale: 0.98, rotateX: -6 },
                  show: {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    rotateX: 0,
                    transition: { type: "spring", stiffness: 220, damping: 22, mass: 0.6 },
                  },
                }
          }
        >
          <ProjectCard item={item} />
        </motion.div>
      ))}
    </motion.div>
  );
}


