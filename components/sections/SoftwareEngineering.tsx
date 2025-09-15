"use client";

import ExperienceList from "@/components/experience/ExperienceList";
import { ExperienceItem } from "../experience/types";
import GitHubContributions from "./GitHubContributions";
import ProjectList from "@/components/projects/ProjectList";
import { ProjectItem } from "../projects/types";
import SoftwareAbout from "@/components/sections/SoftwareAbout";

import SoftwareNav from "@/components/sections/SoftwareNav";
const experiences: ExperienceItem[] = [
  {
    id: "uwaggs",
    companyName: "UWAGGS",
    companyLogoSrc: "/uwaggs_logo.jpeg",
    companyDescription: "For-credit program that helps uWaterloo's varsity teams analyze and improve their performance through data science",
    startDate: "September 2025",
    endDate: "Present",
    roleDescription: "Creating and enhancing software used by data scientists to assist uWaterloo's varsity women's hockey team. Scrapers, observability tools, cloud infrastructure, etc.",
    companyUrl: "https://www.uwaggs.ca/",
    location: "Waterloo, ON 🇨🇦",
  },
  {
    id: "deloitte-2025",
    companyName: "Deloitte (2025)",
    companyLogoSrc: "/deloitte_logo.png",
    companyDescription: "The largest professional services company in the world",
    startDate: "May 2025",
    endDate: "August 2025",
    roleDescription: "Developed service management software for various teams within the Strategy, Risk, and Transactions department. Namely, a company-comparison workflow, a skills classification pipeline, and a pipeline for ingesting large financial documents for AI search.",
    companyUrl: "https://deloitte.com",
    location: "Toronto, ON 🇨🇦",
  },
  {
    id: "ridges",
    companyName: "Ridges",
    companyLogoSrc: "/ridges_logo.jpeg",
    companyDescription: "AI / Blockchain company that develops AI agents using crypto mining",
    startDate: "January 2025",
    endDate: "April 2025",
    roleDescription: "Everything including backend, frontend, cloud infrastructure, observability, security, and much more. Helped the company grow from ~100K USD market cap to over 70M USD market cap, and had a <a href='https://www.ridges.ai/benchmarks' target='_blank' rel='noopener noreferrer'>SOTA agent</a> after just 4 months (73.6% on SWE-Bench).",
    companyUrl: "https://ridges.ai",
    location: "Richmond Hill, ON 🇨🇦",
  },
  {
    id: "shipd",
    companyName: "Shipd / Datacurve (YC W24)",
    companyLogoSrc: "/shipd_logo.jpeg",
    companyDescription: "A platform that allows users to create and solve unique data structures and algorithms problems",
    startDate: "Sept 2024",
    endDate: "December 2024",
    roleDescription: "Created and solved data structures and algorithms questions in Typescript, Python and Java, which were sold to AI companies as training data.",
    companyUrl: "https://shipd.ai/",
    location: "Remote, company based in San Francisco, CA 🇺🇸",
  },
  {
    id: "deloitte-2024",
    companyName: "Deloitte (2024)",
    companyLogoSrc: "/deloitte_logo.png",
    companyDescription: "The largest professional services company in the world",
    startDate: "May 2024",
    endDate: "August 2024",
    roleDescription: "Member of the Alphalabs team, developing several proof of concepts and proof of technologies for Deloitte employees. Worked on features for improving Deloitte's flagship AI chatbot, Gen-D, and a few other projects.",
    companyUrl: "https://deloitte.com",
    location: "Toronto, ON 🇨🇦",
  },
  {
    id: "cu-blueprint",
    companyName: "Carleton Blueprint",
    companyLogoSrc: "/cu_blueprint_logo.jpeg",
    companyDescription: "Organization that creates pro-bono software for non-profits",
    startDate: "January 2024",
    endDate: "August 2024",
    roleDescription: "Assisted with the development of the company landing page, as well as a leetcode-style application used by Carleton University students.",
    companyUrl: "https://carletonblueprint.org/",
    location: "Ottawa, ON 🇨🇦",
  },
  {
    id: "lcmc",
    companyName: "Legal Credit Management Corp.",
    companyLogoSrc: "/lcmc_logo.png",
    companyDescription: "Debt collection agency",
    startDate: "May 2022",
    endDate: "September 2023",
    roleDescription: "Developed and deployed two full-stack company websites, and implemented software that automates data entry.",
    companyUrl: "https://cbnwo.com/",
    location: "Mississauga, ON 🇨🇦",
  },
];

const projects: ProjectItem[] = [
  {
    id: "bittensor-trading-desk",
    name: "Bittensor Trading Dashboard",
    description: "A collection of scrapers (twitter, discord, github, blockchain) and a soon-to-be dashboard for analyzing and trading subnet alpha tokens on the Bittensor network. Also planning to integrate with Bittensor's CLI so I can make trades on my own platform.",
    tech: ["Python", "Selenium", "AWS RDS, EC2", "Blockchain stuff", "Next.js (soon)"],
    startDate: "July 2025",
    endDate: "Present",
    logoSrc: "/bittensor_logo.png",
  },
  {
    id: "CC3K",
    name: "Chamber Crawler 3000+",
    description: "A C++ built dungeon crawler game. Built for CS 246 at uWaterloo. Got 100% plus an extra 10% bonus on the project.",
    tech: ["C++"],
    startDate: "March 2025",
    logoSrc: "/cc3k.png",
  },
  {
    id: "spautofy",
    name: "Spautofy",
    description: "A web application that allowed users to create and refine playlists from natural language queries. Was going great until <a href='https://support.spotify.com/ca-en/article/ai-playlist/' target='_blank' rel='noopener noreferrer'>Spotify released the exact same thing natively</a>.",
    tech: ["Next.js", "React", "Tailwind CSS", "TypeScript"],
    startDate: "May 2024",
    endDate: "August 2024",
    logoSrc: "/spautofy_logo.png",
  },
  {
    id: "search-engines",
    name: "Search Engines",
    description: "Two web crawlers and search engines built for CS 1405Z and CS 1406Z at Carleton University, one in Python and one in Java. Uses TF-IDF, PageRank, and cosine similarity for rankings, with no external libraries used. Got 100% on the projects.",
    tech: ["Python", "Java", "JavaFX"],
    startDate: "September 2023",
    endDate: "December 2023",
    linkUrl: "https://github.com/jzbouri/search-engines",
    logoSrc: "/search_engines.png",
  },
  {
    id: "p5.js",
    name: "p5.js Projects",
    description: "A collection of games, sketches, and animations made using p5.js. Done over the course of 2 years for my high school computer science classes.",
    tech: ["p5.js", "JavaScript"],
    startDate: "February 2021",
    endDate: "January 2023",
    linkUrl: "https://editor.p5js.org/353703860/sketches",
    logoSrc: "/p5js_logo.png",
  },
  {
    id: "youth-digital",
    name: "Rainbow Minecraft Mod",
    description: "First time ever coding, sometime in elementary school through the Youth Digital program. Made a rainbow-themed Minecraft mod with my own mobs, items, weapons, blocks, and texture pack.",
    tech: ["Java", "Youth Digital Platform"],
    startDate: "2015 (probably)",
    logoSrc: "/rainbow_block.png",
  }
];

export default function SoftwareEngineering() {
  return (
    <section className="space-y-4">
      <SoftwareNav />
      <SoftwareAbout />

      <div id="github" className="scroll-mt-28 sm:scroll-mt-32">
        <GitHubContributions login="jzbouri" />
      </div>

      <div id="experiences" className="scroll-mt-28 sm:scroll-mt-32 space-y-3">
        <div className="flex items-baseline justify-between">
          <div>
            <p className="mt-1 text-sm text-white/60">Some companies/organizations I&apos;ve worked for:</p>
          </div>
          <div className="flex">
            <a
              href="mailto:jz.bouri@gmail.com"
              className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1.5 text-xs font-semibold text-emerald-200 transition-colors hover:bg-emerald-400/20 hover:text-emerald-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/50"
              aria-label="Email Jalal about opportunities"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden className="opacity-90">
                <path d="M20 4H4c-1.103 0-2 .897-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6c0-1.103-.897-2-2-2zm0 4.236-8 5.333-8-5.333V6l8 5.333L20 6v2.236z"/>
              </svg>
              <span className="hidden sm:inline">Open to opportunities</span>
              <span className="sm:hidden">Contact</span>
            </a>
          </div>
        </div>
        <ExperienceList items={experiences} emptyState={<span>No experiences added yet.</span>} />
      </div>

      <div id="projects" className="mt-2 scroll-mt-28 sm:scroll-mt-32 space-y-3">
        <div className="mt-2">
          <p className="mt-1 text-sm text-white/60">A few projects I&apos;ve built or contributed to:</p>
        </div>
        <ProjectList items={projects} emptyState={<span>No projects added yet.</span>} />
      </div>
    </section>
  );
}
