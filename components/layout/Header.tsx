"use client";

import TextType from "@/components/reactbits/TextType";

export default function Header() {
  return (
    <header className="mb-10">
      <h1 className="text-4xl font-mono tracking-tight">Jalal Bouri</h1>
      <div className="mt-3">
        <TextType
          text={["Software engineer", "Athlete"]}
          className="font-mono text-lg leading-none text-white/80"
          typingSpeed={80}
          pauseDuration={1200}
          loop={true}
        />
      </div>
    </header>
  );
}


