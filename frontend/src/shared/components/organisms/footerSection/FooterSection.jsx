'use client';
import React from 'react';
import Link from 'next/link';
import PropTypes from 'prop-types';

// Data imports
import {
  SOCIAL_LINKS,
  CONTACT_INFO,
  COMPANY_INFO,
} from '../../../../local-data/footer-data';

// Component imports
import FooterLink from '../../atoms/footerLink/FooterLink';
import SocialLink from '../../molecules/socialLink/SocialLink';
import Icons from '../../atoms/icons/Icons';
import Image from 'next/image';
import Button from '../../atoms/buttons/Button';

// Section component for better organization
export const FooterSection = React.memo(({ title, links, testIdPrefix }) => (
  <div className="space-y-4 ">
    <h3 className="text-lg font-semibold text-white mb-6">{title}</h3>
    <nav className="space-y-3">
      {links.map((link, index) => (
        <FooterLink
          key={`${testIdPrefix}-${index}`}
          href={link.href}
          testId={`${testIdPrefix}-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
        >
          {link.label}
        </FooterLink>
      ))}
    </nav>
  </div>
));

FooterSection.displayName = 'FooterSection';

FooterSection.propTypes = {
  title: PropTypes.string.isRequired,
  links: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      href: PropTypes.string.isRequired,
    })
  ).isRequired,
  testIdPrefix: PropTypes.string.isRequired,
};

// Contact info component using Icon component
const ContactInfo = React.memo(({ iconName, label, href, display, testId }) => (
  <div className="flex items-center space-x-2 text-slate-300">
    <Icons
      iconName={iconName}
      size="sm"
      className="text-teal-300 flex-shrink-0"
    />
    <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2">
      <span className="text-sm">{label}:</span>
      <span
        className=" text-sm hover:text-teal-300 transition-colors duration-200 font-medium focus:outline-none focus:text-blue-400 focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50 rounded-sm"
        data-testid={testId}
      >
        {display}
      </span>
    </div>
  </div>
));

ContactInfo.displayName = 'ContactInfo';

ContactInfo.propTypes = {
  iconName: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  href: PropTypes.string.isRequired,
  display: PropTypes.string.isRequired,
  testId: PropTypes.string.isRequired,
};

// Brand Logo component
const BrandLogo = React.memo(() => (
  <div className="flex items-center space-x-3 mb-6 -mt-6">
    <div className=" flex items-center justify-center shadow-lg">
      <Image src={COMPANY_INFO.logo} alt="Logo" width={80} height={80} />
    </div>
    <span className="text-3xl font-bold bg-gradient-to-r from-white via-white to-teal-300 bg-clip-text text-transparent">
      {COMPANY_INFO.name}
    </span>
  </div>
));

BrandLogo.displayName = 'BrandLogo';

// CTA Button component
const CTAButton = React.memo(() => (
  <Link href="/signup">
    <Button size="md" variant="secondary">
      {COMPANY_INFO.ctaText}
    </Button>
  </Link>
));

CTAButton.displayName = 'CTAButton';

// Social Links Section component
const SocialLinksSection = React.memo(() => (
  <div className="flex space-x-4 pt-6">
    {SOCIAL_LINKS.map((social) => (
      <SocialLink key={social.id} social={social} />
    ))}
  </div>
));

SocialLinksSection.displayName = 'SocialLinksSection';

// Brand Section component
export const BrandSection = React.memo(() => (
  <div className="lg:col-span-2 space-y-6">
    <BrandLogo />

    {/* Description */}
    <p className="text-slate-200 text-sm leading-relaxed max-w-sm ">
      {COMPANY_INFO.description}
    </p>

    {/* CTA Button */}
    <CTAButton />

    {/* Social Media Icons */}
    <SocialLinksSection />
  </div>
));

BrandSection.displayName = 'BrandSection';

// Contact Section component
const ContactSection = React.memo(() => (
  <div className=" flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-8">
    <ContactInfo
      iconName="phone"
      label={CONTACT_INFO.phone.label}
      href={CONTACT_INFO.phone.href}
      display={CONTACT_INFO.phone.display}
      testId="phone-link"
    />
    <ContactInfo
      iconName="mail"
      label={CONTACT_INFO.email.label}
      href={CONTACT_INFO.email.href}
      display={CONTACT_INFO.email.display}
      testId="email-link"
    />
  </div>
));

ContactSection.displayName = 'ContactSection';

// Footer Bottom component
export const FooterBottom = React.memo(() => (
  <div className="mt-8 pt-6 border-t border-slate-500">
    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-6 lg:space-y-0">
      {/* Copyright */}
      <div className="text-slate-300 text-sm">
        © {new Date().getFullYear()} {COMPANY_INFO.name}. All rights reserved.
      </div>
      {/* Contact Information */}
      <ContactSection />
    </div>

    {/* Additional Info */}
    <div className="mt-6 pt-6 border-t border-slate-400">
      <p className="text-xs text-slate-300 text-center max-w-4xl mx-auto">
        {COMPANY_INFO.additionalInfo}
      </p>
    </div>
  </div>
));

FooterBottom.displayName = 'FooterBottom';
