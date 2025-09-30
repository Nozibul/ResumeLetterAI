/**
 * @file SocialLink.test.jsx
 * @author Nozibul Islam
 *
 * @copyright (c) 2025 ResumeLetterAI. All rights reserved.
 * @license MIT
 */

import { render, screen } from '@testing-library/react';
import SocialLink from './SocialLink';
import '@testing-library/jest-dom';

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Twitter: (props) => <svg data-testid="icon-twitter" {...props} />,
  Facebook: (props) => <svg data-testid="icon-facebook" {...props} />,
  Linkedin: (props) => <svg data-testid="icon-linkedin" {...props} />,
}));

describe('SocialLink', () => {
  const socialMock = {
    id: '1',
    name: 'Twitter',
    href: 'https://twitter.com',
    icon: 'Twitter',
    hoverColor: 'teal',
    ariaLabel: 'Twitter Profile',
  };

  // 1. Render test
  test('renders without crashing', () => {
    render(<SocialLink social={socialMock} />);
    const link = screen.getByTestId('social-twitter');
    expect(link).toBeInTheDocument();
  });

  // 2. Props / attributes test
  test('applies href and aria-label correctly', () => {
    render(<SocialLink social={socialMock} />);
    const link = screen.getByTestId('social-twitter');
    expect(link).toHaveAttribute('href', socialMock.href);
    expect(link).toHaveAttribute('aria-label', socialMock.ariaLabel);
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  // 3. Icon rendering test
  test('renders the correct icon', () => {
    render(<SocialLink social={socialMock} />);
    const icon = screen.getByTestId('icon-twitter');
    expect(icon).toBeInTheDocument();
  });
});
