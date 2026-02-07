'use client';
import React from 'react';
import { CONTACT_INFO, COMPANY_INFO } from '@/local-data/footer-data';
import Icons from '@/shared/components/atoms/icons/Icons';

// Contact Info Component
const ContactInfo = React.memo(({ iconName, label, display, testId }) => (
  <div className="flex items-center space-x-2 text-slate-300">
    <Icons
      iconName={iconName}
      size="sm"
      className="text-teal-300 flex-shrink-0"
    />
    <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2">
      <span className="text-xs">{label}:</span>
      <span
        className="text-xs hover:text-teal-300 transition-colors duration-200 font-medium"
        data-testid={testId}
      >
        {display}
      </span>
    </div>
  </div>
));

ContactInfo.displayName = 'ContactInfo';

// Contact Section
const ContactSection = React.memo(() => (
  <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-6">
    <ContactInfo
      iconName="phone"
      label={CONTACT_INFO.phone.label}
      display={CONTACT_INFO.phone.display}
      testId="phone-link"
    />
    <ContactInfo
      iconName="mail"
      label={CONTACT_INFO.email.label}
      display={CONTACT_INFO.email.display}
      testId="email-link"
    />
  </div>
));

ContactSection.displayName = 'ContactSection';

// Main Resume Footer
export const ResumeFooter = React.memo(() => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white  border-slate-700/50">
      {/* Subtle accent line */}
      <div className="h-[5px] bg-gradient-to-r from-transparent via-teal-500 to-transparent" />

      <div className="relative max-w-7xl mx-auto px-6 py-4">
        {/* Main Content */}
        <div className="space-y-4">
          {/* Top Section - Copyright & Contact */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
            {/* Copyright */}
            <div className="text-slate-300 text-sm">
              © {currentYear} {COMPANY_INFO.name}. All rights reserved.
            </div>

            {/* Contact Information */}
            <ContactSection />
          </div>

          {/* Additional Info */}
          <div className="py-4 border-t border-slate-500">
            <p className="w-4xl mx-auto text-xs text-slate-400 text-center leading-relaxed">
              ResumeLetterAI helps you create ATS-optimized resumes and cover
              letters to land your dream job faster.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
});

ResumeFooter.displayName = 'ResumeFooter';
