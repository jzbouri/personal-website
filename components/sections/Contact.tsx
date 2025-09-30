"use client";

import ContactList from "./contact/ContactList";
import dynamic from "next/dynamic";
import type { ContactItem } from "./contact/types";

export default function Contact() {
  const items: ContactItem[] = [
    { link: "tel:+16479849959", label: "Phone", value: "+1 (647) 984-9959" },
    { link: "mailto:jz.bouri@gmail.com", label: "Email", value: "jz.bouri@gmail.com" },
    { link: "https://www.instagram.com/jalalbouri", label: "Instagram", value: "@jalalbouri" },
    { link: "https://x.com/jzbouri", label: "X", value: "@jzbouri" },
    { link: "https://discord.com", label: "Discord", value: "jalal4662" },
    { link: "https://www.linkedin.com/in/jalal-bouri", label: "LinkedIn", value: "jalal-bouri" },
    { link: "https://github.com/jzbouri", label: "GitHub", value: "jzbouri" },
    { link: "https://www.strava.com/athletes/56842043", label: "Strava", value: "56842043" },
    { link: "https://open.spotify.com/user/aqxyzyqukhns1qtu04uji0os5", label: "Spotify", value: "aqxyzyqukhns1qtu04uji0os5" },
    { link: "https://www.last.fm/user/tubulant_lemon", label: "Last.fm", value: "tubulant_lemon" },
  ];

  const AnonymousMessageForm = dynamic(() => import("./contact/AnonymousMessageForm"), { ssr: false });

  return (
    <section className="space-y-4">
      <ContactList items={items} />
      <AnonymousMessageForm />
    </section>
  );
}


