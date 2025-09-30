/**
 * @file FooterSection.test.jsx
 * @author Nozibul Islam
 *
 * @copyright (c) 2025 ResumeLetterAI. All rights reserved.
 * @license MIT
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { FooterSection } from '@/shared/components/organisms/footerSection/FooterSection';

// Sample props for integration test
const sampleLinks = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
];

describe('FooterSection Integration Test', () => {
  test('renders title and links correctly', () => {
    render(
      <FooterSection
        title="Quick Links"
        links={sampleLinks}
        testIdPrefix="footer"
      />
    );

    // Check if title is rendered
    expect(screen.getByText('Quick Links')).toBeInTheDocument();

    // Check if all links are rendered
    sampleLinks.forEach((link) => {
      const linkElement = screen.getByTestId(
        `footer-${link.label.toLowerCase()}`
      );
      expect(linkElement).toBeInTheDocument();
      expect(linkElement).toHaveTextContent(link.label);
      expect(linkElement).toHaveAttribute('href', link.href);
    });
  });
});
