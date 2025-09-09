/**
 * @file CTABanner.test.jsx
 * @author Nozibul Islam
 *
 * @copyright (c) 2025 ResumeLetterAI. All rights reserved.
 * @license MIT
 */

import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { CTABanner } from './CTABanner';

describe('CTABanner Component', () => {
  test('renders without crashing', () => {
    render(<CTABanner />);

    // Image
    expect(screen.getByAltText('ResumeLetterAI CTA')).toBeInTheDocument();

    // Heading
    expect(
      screen.getByText(
        /Is Your Resume Ready to Beat the ATS\? Check Now for Free!/i
      )
    ).toBeInTheDocument();

    // Typography / Description
    expect(
      screen.getByText(/Boost your chances of landing your dream job/i)
    ).toBeInTheDocument();

    // Button
    expect(
      screen.getByRole('button', { name: /Check Your Resume/i })
    ).toBeInTheDocument();
  });
});
