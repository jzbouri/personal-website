"use client";

import { useId, useState } from "react";
import type { KeyboardEvent, ReactNode } from "react";

export interface TabItem {
  id: string;
  label: string;
  content: ReactNode;
}

interface TabsProps {
  items: TabItem[];
  initialTabId?: string;
  onChange?: (id: string) => void;
  className?: string;
}

export default function Tabs({
  items,
  initialTabId,
  onChange,
  className = "",
}: TabsProps) {
  const baseId = useId();
  const [activeId, setActiveId] = useState<string>(
    initialTabId ?? (items[0] ? items[0].id : "")
  );

  const selectTab = (id: string) => {
    setActiveId(id);
    if (onChange) onChange(id);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const currentIndex = items.findIndex((item) => item.id === activeId);
    if (currentIndex === -1) return;

    if (event.key === "ArrowRight") {
      event.preventDefault();
      const nextIndex = (currentIndex + 1) % items.length;
      selectTab(items[nextIndex].id);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      const prevIndex = (currentIndex - 1 + items.length) % items.length;
      selectTab(items[prevIndex].id);
    } else if (event.key === "Home") {
      event.preventDefault();
      selectTab(items[0].id);
    } else if (event.key === "End") {
      event.preventDefault();
      selectTab(items[items.length - 1].id);
    }
  };

  return (
    <div className={className}>
      <div
        role="tablist"
        aria-label="Sections"
        className="flex items-center gap-2 border-b border-white/10"
        onKeyDown={handleKeyDown}
      >
        {items.map((item) => {
          const selected = item.id === activeId;
          return (
            <button
              key={item.id}
              id={`${baseId}-tab-${item.id}`}
              role="tab"
              aria-selected={selected}
              aria-controls={`${baseId}-panel-${item.id}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => selectTab(item.id)}
              className={`px-3 py-2 text-sm transition-colors ${
                selected
                  ? "text-white border-b-2 border-white"
                  : "text-white/60 hover:text-white/90"
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      {items.map((item) => {
        const selected = item.id === activeId;
        return (
          <div
            key={item.id}
            id={`${baseId}-panel-${item.id}`}
            role="tabpanel"
            aria-labelledby={`${baseId}-tab-${item.id}`}
            hidden={!selected}
            className="pt-6"
          >
            {selected ? item.content : null}
          </div>
        );
      })}
    </div>
  );
}


