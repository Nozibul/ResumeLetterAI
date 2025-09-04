'use client';
import React from 'react';
import ScrollToTop from '@/shared/components/atoms/scrollToTop/ScrollToTop';
import {
  BrandSection,
  FooterBottom,
  FooterSection,
} from '@/shared/components/organisms/footerSection/FooterSection';
import { useScrollToTop } from '@/shared/hooks/useScrollToTop';
import { FOOTER_LINKS } from '@/local-data/footer-data';

const Footer = React.memo(() => {
  const { showScrollTop, scrollToTop } = useScrollToTop();

  return (
    <footer className=" relative bg-gradient-to-br from-[#060d43] to-[#3c9180] text-white">
      {/* Professional Curved Top Design */}
      <div className="absolute top-0 left-0 w-full overflow-hidden leading-none">
        <svg
          className="relative block w-full h-10 md:h-12 lg:h-16"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1440 54"
          preserveAspectRatio="none"
        >
          <path
            fill="#ffffff"
            d="M0,54 C120,18 240,0 360,9 C480,18 600,54 720,54 C840,54 960,18 1080,9 C1200,0 1320,18 1440,54 L1440,0 L0,0 Z"
          />
        </svg>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-20 md:pt-24 lg:pt-28">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 lg:gap-12">
          {/* Brand Section */}
          <BrandSection />

          {/* Footer Sections */}
          <FooterSection
            title="AI Tools"
            links={FOOTER_LINKS.tools}
            testIdPrefix="tools"
          />
          <FooterSection
            title="Resources"
            links={FOOTER_LINKS.resources}
            testIdPrefix="resources"
          />
          <FooterSection
            title="Company"
            links={FOOTER_LINKS.company}
            testIdPrefix="company"
          />
          <FooterSection
            title="Legal"
            links={FOOTER_LINKS.legal}
            testIdPrefix="legal"
          />
        </div>

        {/* Bottom Section */}
        <FooterBottom />
      </div>

      {/* Scroll to Top Button */}
      <ScrollToTop show={showScrollTop} onClick={scrollToTop} />
    </footer>
  );
});

Footer.displayName = 'Footer';

export default Footer;
