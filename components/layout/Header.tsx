"use client";

import TypingText from "@/components/reactbits/TypingText";
import { FaGithub, FaLinkedin, FaStrava, FaSpotify, FaLastfm, FaInstagram } from "react-icons/fa6";

interface HeaderProps {
  subtitle: string;
  links?: { label: string; href: string }[];
}

export default function Header({ subtitle, links = [] }: HeaderProps) {
  const renderIcon = (label: string) => {
    const lower = label.toLowerCase();
    if (lower.includes("github")) return <FaGithub size={18} />;
    if (lower.includes("linkedin")) return <FaLinkedin size={18} />;
    if (lower.includes("instagram")) return <FaInstagram size={18} />;
    if (lower.includes("strava")) return <FaStrava size={18} />;
    if (lower.includes("spotify")) return <FaSpotify size={18} />;
    if (lower.includes("last.fm") || lower.includes("lastfm") || lower.includes("last")) return <FaLastfm size={18} />;
    return <FaGithub size={18} />;
  };

  return (
    <header className="relative mb-6 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] p-6">
      <div className="pointer-events-none absolute inset-0 opacity-70" aria-hidden>
        <div className="absolute inset-0 bg-[radial-gradient(120%_120%_at_0%_0%,rgba(96,165,250,0.16),transparent_60%),radial-gradient(120%_120%_at_100%_100%,rgba(34,211,238,0.14),transparent_60%),radial-gradient(140%_140%_at_100%_0%,rgba(192,132,252,0.18),transparent_60%)]" />
      </div>

      <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl sm:text-4xl font-mono tracking-tight text-white">Jalal Bouri</h1>
          <div className="mt-4">
            <TypingText
              text={subtitle}
              className="font-mono text-lg sm:text-xl leading-none text-white/80"
              typingSpeed={30}
              backspaceSpeed={15}
              pauseBeforeBackspace={0}
            />
          </div>
        </div>

        {links.length > 0 && (
          <nav key={subtitle} className="flex flex-wrap items-center gap-2 sm:gap-3">
            {links.map((link, idx) => (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-white/80 shadow-sm shadow-white/5 transition-all hover:border-white/20 hover:bg-white/[0.06] hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
                aria-label={link.label}
                title={link.label}
                style={{ animation: "fade-in-up 320ms ease-out both", animationDelay: `${idx * 60}ms` }}
              >
                {renderIcon(link.label)}
                <span className="sr-only">{link.label}</span>
              </a>
            ))}
            <style jsx>{`
              @keyframes fade-in-up { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
          </nav>
        )}
      </div>
    </header>
  );
}


