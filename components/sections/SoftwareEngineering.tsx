"use client";

import ExperienceList from "@/components/experience/ExperienceList";
import { ExperienceItem } from "../experience/types";

const experiences: ExperienceItem[] = [
  {
    id: "uwaggs",
    companyName: "UWAGGS",
    companyLogoSrc: "/uwaggs_logo.jpeg",
    companyDescription: "For-credit program that helps uWaterloo's varsity teams analyze and improve their performance through data science",
    startDate: "September 2025",
    endDate: "Present",
    roleDescription: "Creating and enhancing software used by data scientists to assist uWaterloo's varsity women's hockey team",
    companyUrl: "https://www.uwaggs.ca/",
    location: "Waterloo, ON 🇨🇦",
  },
  {
    id: "ridges",
    companyName: "Ridges",
    companyLogoSrc: "/ridges_logo.jpeg",
    companyDescription: "AI / Crypto company that develops AI agents using crypto mining",
    startDate: "January 2025",
    endDate: "Present",
    roleDescription: "Everything including backend, frontend, cloud infrastructure, observability, security, and much more. Helped the company grow from ~100K USD market cap to over 70M USD market cap, and had a SOTA agent after just 4 months (73.2% on SWE-Bench).",
    companyUrl: "https://ridges.ai",
    location: "Richmond Hill, ON 🇨🇦",
  },
  {
    id: "deloitte-2025",
    companyName: "Deloitte (2025)",
    companyLogoSrc: "/deloitte_logo.png",
    companyDescription: "The largest professional services company in the world",
    startDate: "May 2025",
    endDate: "August 2025",
    roleDescription: "Developed service management software for various teams within the Strategy, Risk, and Transactions department",
    companyUrl: "https://deloitte.com",
    location: "Toronto, ON 🇨🇦",
  },
  {
    id: "shipd",
    companyName: "Shipd / Datacurve (YC W24)",
    companyLogoSrc: "/shipd_logo.jpeg",
    companyDescription: "A platform that allows users to create and solve unique data structures and algorithms problems",
    startDate: "Sept 2024",
    endDate: "August 2024",
    roleDescription: "Created and solved data structures and algorithms questions in Typescript, Python and Java, which were sold to AI companies as training data",
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
    roleDescription: "Member of the Alphalabs team, developing several proof of concepts and proof of technologies for Deloitte employees",
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
    roleDescription: "Assisted with the development of company landing page, as well as a leetcode-style application used by university students",
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
    roleDescription: "Developed and deployed two full-stack company websites, and implemented software that automates data entry",
    companyUrl: "https://cbnwo.com/",
    location: "Mississauga, ON 🇨🇦",
  },
];

export default function SoftwareEngineering() {
  return (
    <section className="space-y-4">
      <div className="flex items-baseline justify-between">
        <div>
          <p className="mt-1 text-sm text-white/60">Some companies/organizations I&apos;ve worked for.</p>
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
      <ExperienceList items={experiences} emptyState={<span>Add your experiences to see them here.</span>} />
    </section>
  );
}


