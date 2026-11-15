import { Inter } from "next/font/google";

// Kept out of config.ts: next/font only works inside the Next.js build, and config.ts is imported by non-UI modules
// (e.g. lib/backup) that also run in tests.
export const fontBase = Inter({ subsets: ["latin"], variable: "--font-base" });
