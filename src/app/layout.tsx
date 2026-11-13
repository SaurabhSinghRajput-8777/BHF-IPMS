import type { Metadata } from "next";
import { Geist, Geist_Mono, Bruno_Ace_SC } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const brunoAceSC = Bruno_Ace_SC({
  variable: "--font-bruno",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Bennett Hatchery IPMS | Centre for Innovation and Entrepreneurship",
  description:
    "Centralized Intellectual Property Management System for startups incubated under Bennett Hatchery, Bennett University.",
  keywords: [
    "Bennett Hatchery",
    "CIE",
    "Bennett University",
    "Intellectual Property",
    "IPMS",
    "Patent",
    "Trademark",
    "Copyright",
    "Startup Incubation",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${brunoAceSC.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 font-sans">
        {children}
      </body>
    </html>
  );
}
