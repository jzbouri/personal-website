"use client";

export default function BrevNvidiaInternPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-8">
      <div className="max-w-2xl space-y-6">
        <h1 className="text-3xl font-bold text-emerald-400">
          Wassup! 🤙
        </h1>
        
        <p className="text-lg leading-relaxed text-neutral-300">
          If you&apos;re Carter, Nader, or anyone from NVIDIA/Brev checking this out, welcome! 
          My name is <span className="text-white font-semibold">Jalal Bouri</span>, and I&apos;m 
          applying to the NVIDIA Brev internship with <span className="text-white font-semibold">Adam Sidat</span>.
          We&apos;re both third-year students at uWaterloo, CS and Mechanical Engineering respectively.
        </p>

        <p className="text-lg leading-relaxed text-neutral-300">
          If you&apos;re looking for people who know AI agents and tools inside out, 
          we&apos;re genuinely the best you&apos;ll find. We were founding engineers at{" "}
          <a 
            href="https://ridges.ai/explore" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-emerald-400 hover:text-emerald-300 underline underline-offset-2"
          >
            Ridges.ai
          </a>
          , where we built a cross-benchmark AI agent evaluation platform and incentive mechanism. 
          We&apos;ve studied, evaluated, and reviewed <em>thousands</em> of agents submitted from 
          around the world, each with their own strengths and trade-offs.
        </p>

        <p className="text-lg leading-relaxed text-neutral-300">
          Through this work, we fostered an agent that surpassed SOTA on both SWE-Bench and Polyglot.{" "}
          <a 
            href="https://taodaily.io/ridges-ai-sets-a-new-standard-for-open-source-coding-agents/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-emerald-400 hover:text-emerald-300 underline underline-offset-2"
          >
            Read about it here.
          </a>
          {" "}We then built a product around this agent with real paying users, so we understand 
          the do&apos;s and don&apos;ts of creating a good agentic experience for developers.{" "}
          <a 
            href="https://x.com/ridges_ai/status/1986614529799696573" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-emerald-400 hover:text-emerald-300 underline underline-offset-2"
          >
            Check out a quick demo
          </a>
          {" "}or{" "}
          <a 
            href="https://www.ridges.ai/auth/login?returnTo=/login" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-emerald-400 hover:text-emerald-300 underline underline-offset-2"
          >
            try it for yourself
          </a>.
        </p>

        <p className="text-lg leading-relaxed text-neutral-300">
          Outside of Ridges, I&apos;ve worked at large corporations like Deloitte, fast-moving YC 
          startups like{" "}
          <a 
            href="https://slash.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-emerald-400 hover:text-emerald-300 underline underline-offset-2"
          >
            Slash
          </a>
          , and built agents in my spare time like{" "}
          <a 
            href="https://github.com/jzbouri/spautofy" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-emerald-400 hover:text-emerald-300 underline underline-offset-2"
          >
            Spautofy
          </a>
          . Adam has been the head developer of{" "}
          <a 
            href="https://diep.io" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-emerald-400 hover:text-emerald-300 underline underline-offset-2"
          >
            diep.io
          </a>
          {" "}for over a year, and his open source work has earned 150+ stars on{" "}
          <a 
            href="https://github.com/CobaltXII?tab=repositories&q=&type=&language=&sort=stargazers" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-emerald-400 hover:text-emerald-300 underline underline-offset-2"
          >
            GitHub
          </a>.
        </p>

        <p className="text-lg leading-relaxed text-neutral-300">
          We feel incredibly lucky to be building during this wave of agentic development, 
          and there&apos;s no better place to push that forward than NVIDIA.
        </p>

        <p className="text-lg leading-relaxed text-neutral-300">
          Thanks for taking the time to check this out. Talk soon 😉
        </p>

        <p className="text-neutral-500 text-sm pt-4">
          <a 
            href="https://jbouri.ca" 
            target="_blank" 
            rel="noopener noreferrer"
            className="underline decoration-neutral-600 underline-offset-2 hover:text-neutral-300 hover:decoration-neutral-400 transition-colors"
          >
            Jalal
          </a>
          {" & "}
          <a 
            href="https://cxii.org/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="underline decoration-neutral-600 underline-offset-2 hover:text-neutral-300 hover:decoration-neutral-400 transition-colors"
          >
            Adam
          </a>
        </p>
      </div>
    </main>
  );
}
