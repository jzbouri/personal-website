"use client";

import TypingText from "@/components/reactbits/TypingText";

interface HeaderProps {
  subtitle: string;
}

export default function Header({ subtitle }: HeaderProps) {
  return (
    <header className="mb-10">
      <h1 className="text-4xl font-mono tracking-tight">Jalal Bouri</h1>
      <div className="mt-3">
        <TypingText
          text={subtitle}
          className="font-mono text-lg leading-none text-white/80"
          typingSpeed={80}
          backspaceSpeed={40}
          pauseBeforeBackspace={0}
        />
      </div>
    </header>
  );
}


