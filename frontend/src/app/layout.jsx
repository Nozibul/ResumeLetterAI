/**
 * @file Root layout and metadata configuration for the ResumeLetterAI application.
 * @author Nozibul Islam <nozibulislamspi@gmail.com>
 * @copyright (c) 2025 ResumeLetterAI. All rights reserved.
 * @license MIT
 */

import { Lora } from 'next/font/google';
import '@/styles/globals.css';
import { Navigation } from '@/widgets/navigation/Navigation';

// 1. Font Configuration:
// Optimized for performance using CSS variables.
const lora = Lora({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-lora',
});

// 2. Metadata Configuration:
// Central hub for SEO, Social Sharing, and core application info.
export const metadata = {
  // --- Core Metadata ---
  metadataBase: new URL('https://www.resumeletterai.com'), // IMPORTANT: Set your production domain here.
  title: {
    default: 'ResumeLetterAI - AI-Powered Resume & Cover Letter Builder',
    template: '%s | ResumeLetterAI',
  },
  description:
    'Craft professional, ATS-friendly resumes and compelling cover letters in minutes with the power of AI. Build your future with ResumeLetterAI.',
  keywords: [
    'AI resume builder',
    'cover letter generator',
    'resume templates',
    'ATS-friendly resume',
    'career tools',
    'job application',
  ],

  // --- Author and Generator Info ---
  authors: [{ name: 'Nozibul Islam', url: 'https://github.com/N0zibul' }],
  creator: 'Nozibul Islam',
  publisher: 'ResumeLetterAI',
  generator: 'Next.js',

  // --- PWA & Mobile ---
  applicationName: 'ResumeLetterAI',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'ResumeLetterAI',
  },
  formatDetection: {
    telephone: false,
  },

  // --- Social Media & Open Graph (og:*) ---
  openGraph: {
    title: 'ResumeLetterAI - Your AI-Powered Career Assistant',
    description:
      'Stop guessing, start applying. Create job-winning resumes and cover letters with AI.',
    url: '/', // Relative to metadataBase
    siteName: 'ResumeLetterAI',
    images: [
      {
        url: '/og-image.png', // Relative to metadataBase: https://www.resumeletterai.com/og-image.png
        width: 1200,
        height: 630,
        alt: 'ResumeLetterAI: An intelligent tool for resume and cover letter creation.',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },

  // --- Twitter Card ---
  twitter: {
    card: 'summary_large_image',
    title: 'ResumeLetterAI - Your AI-Powered Career Assistant',
    description:
      'Stop guessing, start applying. Create job-winning resumes and cover letters with AI.',
    creator: '@YourTwitterHandle', // IMPORTANT: Replace with your Twitter handle
    images: ['/og-image.png'], // Relative to metadataBase
  },

  // --- Icons & Favicons ---
  // Next.js automatically uses /app/favicon.ico and /app/apple-touch-icon.png if they exist.
  // This 'icons' object provides more control and fallbacks.
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },

  // --- Search Engine Control ---
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

// 3. Viewport Configuration (for themeColor and mobile behavior):
// This is the new, recommended way to handle viewport-related tags.
export const viewport = {
  themeColor: '#ffffff',
  width: 'device-width',
  initialScale: 1,
};

// 4. Root Layout Component:
// The main shell wrapping every page in the application.
export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${lora.variable} h-full`}>
      <body
        className={`${lora.className} tracking-wide flex min-h-full flex-col`}
      >
        <Navigation />

        {/* This <main> tag will grow to fill the available space, pushing the footer to the bottom. */}
        <main className="flex-1">{children}</main>

        {/* <Footer /> */}
      </body>
    </html>
  );
}
