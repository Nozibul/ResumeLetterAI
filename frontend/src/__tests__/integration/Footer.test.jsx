/**
 * @file Footer.test.jsx
 * @author Nozibul Islam
 *
 * @copyright (c) 2025 ResumeLetterAI. All rights reserved.
 * @license MIT
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Footer from '@/widgets/footer/Footer';

// Mocking child components that use next/image or other heavy imports
jest.mock('@/shared/components/organisms/footerSection/FooterSection', () => ({
  BrandSection: () => <div data-testid="brand-section" />,
  FooterBottom: () => <div data-testid="footer-bottom" />,
  FooterSection: ({ title, testIdPrefix }) => (
    <div data-testid={`footer-section-${testIdPrefix}`}>{title}</div>
  ),
}));

jest.mock('@/shared/components/atoms/scrollToTop/ScrollToTop', () => ({
  __esModule: true,
  default: ({ show, onClick }) => (
    <button data-testid="scroll-to-top" onClick={onClick}>
      Scroll
    </button>
  ),
}));

jest.mock('@/shared/hooks/useScrollToTop', () => ({
  useScrollToTop: () => ({
    showScrollTop: true,
    scrollToTop: jest.fn(),
  }),
}));

describe('Footer Integration', () => {
  it('renders Footer with all main sections', () => {
    render(<Footer />);

    // Check Brand Section
    expect(screen.getByTestId('brand-section')).toBeInTheDocument();

    // Check FooterBottom
    expect(screen.getByTestId('footer-bottom')).toBeInTheDocument();

    // Check ScrollToTop button
    expect(screen.getByTestId('scroll-to-top')).toBeInTheDocument();
  });
});
