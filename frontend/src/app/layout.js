/**
 * @file [Root layout for the application]
 * @author Nozibul Islam <[nozibulislamspi@gmail.com]>
 * @copyright (c) 2025 ResumeLetterAI. All rights reserved.
 * @license MIT
 */

import { Inter } from "next/font/google";
import Header from "@/components/layouts/Header";
import Footer from "@/components/layouts/Footer";
import "@/styles/globals.css";

// 1. Font Configuration: Best practice for performance and flexibility.
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter", // Creates a CSS variable for easy use in Tailwind.
  display: "swap",
});

// 2. Metadata: The single source of truth for SEO, PWA, and Social Sharing.
export const metadata = {
  // --- Core Metadata ---
  title: {
    default: "ResumeLetterAI - AI-Powered Resume & Cover Letter Builder",
    template: "%s | ResumeLetterAI", // Dynamically adds site name to page titles.
  },
  description:
    "Craft professional, ATS-friendly resumes and compelling cover letters in minutes with the power of AI. Build your future with ResumeLetterAI.",
  keywords:
    "AI resume builder, cover letter generator, resume templates, ATS-friendly resume, career tools, job application",

  // --- PWA & Mobile Metadata ---
  manifest: "/site.webmanifest", // Points to the manifest file from RealFaviconGenerator.
  themeColor: "#ffffff",
  applicationName: "ResumeLetterAI",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "ResumeLetterAI",
  },
  formatDetection: {
    telephone: false,
  },

  // --- Social Media & Open Graph Metadata ---
  openGraph: {
    type: "website",
    url: "https://www.resumeletterai.com", // IMPORTANT: Replace with your actual domain.
    title: "ResumeLetterAI - Your AI-Powered Career Assistant",
    description:
      "Stop guessing, start applying. Create job-winning resumes and cover letters with AI.",
    siteName: "ResumeLetterAI",
    images: [
      {
        url: "https://www.resumeletterai.com/og-image.png", // IMPORTANT: Replace with your absolute URL.
        width: 1200,
        height: 630,
        alt: "ResumeLetterAI: An intelligent tool for resume and cover letter creation.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ResumeLetterAI - Your AI-Powered Career Assistant",
    description:
      "Stop guessing, start applying. Create job-winning resumes and cover letters with AI.",
    creator: "@YourTwitterHandle", // IMPORTANT: Replace with your Twitter handle.
    images: ["https://www.resumeletterai.com/og-image.png"], // Can use the same OG image.
  },

  // --- Icons & Favicons ---
  // Next.js automatically handles favicon.ico and apple-touch-icon.png placed in the /app directory.
  // This 'icons' object provides more specific control and fallbacks.
  icons: {
    icon: "/favicon.ico", // Standard favicon
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },

  // --- Search Engine Control ---
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

// 3. Root Layout Component: The main shell for the entire application.
export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <body className="flex min-h-full flex-col font-sans antialiased">
        <Header />

        {/* The <main> tag grows to fill available space, pushing the footer down. */}
        <main className="flex-grow">{children}</main>

        <Footer />
      </body>
    </html>
  );
}
