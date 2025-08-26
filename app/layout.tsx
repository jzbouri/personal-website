import type { Metadata } from "next";
import "./globals.css";
import { Cuprum, Martel, Cousine } from "next/font/google";

const cuprum = Cuprum({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-sans",
});
const martel = Martel({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-serif",
});
const cousine = Cousine({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Jalal's Site",
  description: "Jalal Bouri's personal website",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${cuprum.className} ${martel.variable} ${cousine.variable} p-6`}>
        {children}
      </body>
    </html>
  );
}
