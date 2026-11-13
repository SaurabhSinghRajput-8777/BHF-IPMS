import type { Metadata } from "next";
import { IBM_Plex_Sans, Geist_Mono, Bruno_Ace_SC, Aldrich } from "next/font/google";
import "./globals.css";

const ibmPlexSans = IBM_Plex_Sans({
  variable: "--font-sans",
  weight: ["300", "400", "500", "600", "700"],
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

const aldrich = Aldrich({
  variable: "--font-aldrich",
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
      className={`${ibmPlexSans.variable} ${geistMono.variable} ${brunoAceSC.variable} ${aldrich.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-950 text-slate-100 font-sans selection:bg-slate-800 selection:text-white">
        {children}
      </body>
    </html>
  );
}
