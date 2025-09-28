"use client";

import { useState, useCallback } from "react";
import type { ContactItem } from "./types";
import ContactCard from "./ContactCard";

export default function ContactList({ items }: { items: ContactItem[] }) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = useCallback((key: string) => {
    setCopiedKey(key);
    const t = setTimeout(() => setCopiedKey((k) => (k === key ? null : k)), 1200);
    return () => clearTimeout(t);
  }, []);

  return (
    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {items.map((item) => (
        <li key={item.label} className="relative">
          <ContactCard item={item} copied={copiedKey === item.label} onCopy={() => handleCopy(item.label)} />
        </li>
      ))}
    </ul>
  );
}


