import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Jalal's Site",
  description: "Jalal Bouri's personal website",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
