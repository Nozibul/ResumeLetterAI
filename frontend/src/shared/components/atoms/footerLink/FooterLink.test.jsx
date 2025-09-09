import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import FooterLink from './FooterLink';

describe('FooterLink Component', () => {
  // 1. Render test
  test('renders children text correctly', () => {
    render(<FooterLink href="/about">About Us</FooterLink>);
    const link = screen.getByText('About Us');
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/about');
  });

  // 2. Custom className test
  test('applies custom className along with default classes', () => {
    render(
      <FooterLink href="/contact" className="custom-class">
        Contact
      </FooterLink>
    );
    const link = screen.getByText('Contact');
    expect(link).toHaveClass('custom-class');
    expect(link).toHaveClass('text-slate-300', 'hover:text-blue-400');
  });

  // 3. testId prop test
  test('renders with provided testId', () => {
    render(
      <FooterLink href="/privacy" testId="privacy-link">
        Privacy Policy
      </FooterLink>
    );
    const link = screen.getByTestId('privacy-link');
    expect(link).toBeInTheDocument();
    expect(link).toHaveTextContent('Privacy Policy');
  });

  // 4. Memoization test
  test('component is memoized', () => {
    expect(FooterLink.$$typeof).toBe(Symbol.for('react.memo'));
  });
});
