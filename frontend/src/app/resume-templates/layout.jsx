/**
 * @file app/templates/layout.jsx
 * @description Templates page layout with comprehensive SEO metadata
 * @author Nozibul Islam
 *
 * Purpose:
 * - Provides SEO metadata for templates showcase page
 * - Implements Open Graph tags for social media sharing
 * - Adds JSON-LD structured data for rich search results
 * - Server component for optimal performance
 */

// ==========================================
// METADATA CONFIGURATION
// ==========================================

export const metadata = {
  // Basic Meta Tags
  title: 'Professional Resume Templates | ResumeLetterAI',
  description:
    'Browse 50+ ATS-optimized resume templates designed for IT professionals, software developers, and engineers. Modern, creative, and executive designs. Download and customize instantly.',

  // Keywords for SEO
  keywords: [
    'resume templates',
    'CV templates',
    'professional resume',
    'ATS resume templates',
    'IT resume templates',
    'software developer resume',
    'tech resume templates',
    'modern resume design',
    'executive resume template',
    'creative resume template',
  ],

  // Open Graph (Facebook, LinkedIn, WhatsApp)
  openGraph: {
    title: 'Professional Resume Templates | ResumeLetterAI',
    description:
      'Browse 50+ ATS-optimized resume templates for IT professionals. Modern, creative, and executive designs available.',
    url: '/templates', // Relative URL (inherits from root layout's metadataBase)
    siteName: 'ResumeLetterAI',
    images: [
      {
        url: '/images/og-templates.jpg', // ⚠️ TODO: Create this image (1200x630px)
        width: 1200,
        height: 630,
        alt: 'Professional Resume Templates Showcase - ResumeLetterAI',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },

  // Twitter Card (Twitter/X sharing)
  twitter: {
    card: 'summary_large_image',
    title: 'Professional Resume Templates | ResumeLetterAI',
    description:
      'Browse 50+ ATS-optimized resume templates for IT professionals',
    creator: '@resumeletterai', // ⚠️ TODO: Replace with your actual Twitter handle
    images: ['/images/twitter-templates.jpg'], // ⚠️ TODO: Create this image (1200x675px)
  },

  // Search Engine Indexing
  robots: {
    index: true, // Allow Google to index this page
    follow: true, // Allow Google to follow links on this page
    nocache: false, // Allow caching
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1, // No limit on video preview
      'max-image-preview': 'large', // Show large image previews
      'max-snippet': -1, // No limit on text snippet length
    },
  },

  // Canonical URL (prevents duplicate content issues)
  alternates: {
    canonical: '/templates',
  },

  // Additional Meta
  category: 'Career Resources',
};

// ==========================================
// LAYOUT COMPONENT
// ==========================================

export default function TemplatesLayout({ children }) {
  // JSON-LD Structured Data for Google Rich Results
  // This helps Google understand your page better and show rich snippets
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Professional Resume Templates',
    description:
      'Browse ATS-optimized resume templates for IT professionals, software developers, and engineers',
    url: 'https://www.resumeletterai.com/templates',

    // Publisher info
    publisher: {
      '@type': 'Organization',
      name: 'ResumeLetterAI',
      logo: {
        '@type': 'ImageObject',
        url: 'https://www.resumeletterai.com/logo.png', // ⚠️ Ensure this exists
      },
      url: 'https://www.resumeletterai.com',
    },

    // Breadcrumb navigation for search results
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: 'https://www.resumeletterai.com',
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Templates',
          item: 'https://www.resumeletterai.com/templates',
        },
      ],
    },

    // Main entity (the collection of templates)
    mainEntity: {
      '@type': 'ItemList',
      name: 'Resume Templates Collection',
      description: 'ATS-optimized professional resume templates',
      numberOfItems: 50, // ⚠️ TODO: Update with actual count dynamically if possible
    },
  };

  return (
    <>
      {/* Inject JSON-LD structured data into page head */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* Render child components (page.jsx) */}
      {children}
    </>
  );
}
