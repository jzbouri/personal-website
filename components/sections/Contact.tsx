"use client";

import ContactList from "./contact/ContactList";
import type { ContactItem } from "./contact/types";

export default function Contact() {
  const items: ContactItem[] = [
    { link: "tel:+16479849959", label: "Phone", value: "+1 (647) 984-9959" },
    { link: "mailto:jz.bouri@gmail.com", label: "Email", value: "jz.bouri@gmail.com" },
    { link: "https://www.instagram.com/jalalbouri", label: "Instagram", value: "@jalalbouri" },
    { link: "https://x.com/jzbouri", label: "X", value: "@jzbouri" },
    { link: "https://discord.com", label: "Discord", value: "jalal4662" },
    { link: "https://www.linkedin.com/in/jalal-bouri", label: "LinkedIn", value: "jalal-bouri" },
  ];

  return (
    <section className="space-y-4">
      <ContactList items={items} />
    </section>
  );
}


