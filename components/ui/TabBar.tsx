"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId } from "react";
import type React from "react";
import type { AriaAttributes, HTMLAttributes } from "react";

export interface TabBarItem {
  id: string;
  label: string;
  href?: string;
}

interface TabBarProps {
  items: TabBarItem[];
  selectedId: string;
  onSelect?: (id: string) => void;
  className?: string;
  baseId?: string;
  onKeyDown?: (event: React.KeyboardEvent<HTMLDivElement>) => void;
}

export default function TabBar({
  items,
  selectedId,
  onSelect,
  className = "",
  baseId,
  onKeyDown,
}: TabBarProps) {
  const internalBaseId = useId();
  const usedBaseId = baseId ?? internalBaseId;
  const router = useRouter();

  const handleKeyDownInternal = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const currentIndex = items.findIndex((item) => item.id === selectedId);
    if (currentIndex === -1) return;
    if (event.key === "ArrowRight") {
      event.preventDefault();
      const nextIndex = (currentIndex + 1) % items.length;
      const next = items[nextIndex];
      if (next.href) router.push(next.href);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      const prevIndex = (currentIndex - 1 + items.length) % items.length;
      const prev = items[prevIndex];
      if (prev.href) router.push(prev.href);
    } else if (event.key === "Home") {
      event.preventDefault();
      if (items[0]?.href) router.push(items[0].href);
    } else if (event.key === "End") {
      event.preventDefault();
      const last = items[items.length - 1];
      if (last?.href) router.push(last.href);
    }
    if (onKeyDown) onKeyDown(event);
  };

  return (
    <div
      role="tablist"
      aria-label="Sections"
      className={`flex items-center gap-2 border-b border-white/10 ${className}`}
      onKeyDown={handleKeyDownInternal}
    >
      {items.map((item) => {
        const selected = item.id === selectedId;
        const commonClass = `px-3 py-2 text-sm transition-colors ${
          selected ? "text-white border-b-2 border-white" : "text-white/60 hover:text-white/90"
        }`;

        type TabAriaProps = AriaAttributes & {
          id: string;
          role: "tab";
          "aria-controls": string;
          tabIndex: number;
        };
        const ariaAttrs: TabAriaProps | undefined = baseId
          ? {
              id: `${usedBaseId}-tab-${item.id}`,
              role: "tab",
              "aria-selected": selected,
              "aria-controls": `${usedBaseId}-panel-${item.id}`,
              tabIndex: selected ? 0 : -1,
            }
          : undefined;

        if (item.href) {
          return (
            <Link key={item.id} href={item.href} className={commonClass} {...(ariaAttrs ?? ({} as Partial<HTMLAttributes<HTMLElement>>))}>
              {item.label}
            </Link>
          );
        }

        return (
          <button
            key={item.id}
            className={commonClass}
            onClick={() => onSelect && onSelect(item.id)}
            {...(ariaAttrs ?? ({} as Partial<HTMLAttributes<HTMLElement>>))}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}


