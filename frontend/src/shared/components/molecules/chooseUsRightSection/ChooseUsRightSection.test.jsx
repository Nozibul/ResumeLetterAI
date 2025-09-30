/**
 * @file ChooseUsRightSection.test.jsx
 * @author Nozibul Islam
 *
 * @copyright (c) 2025 ResumeLetterAI. All rights reserved.
 * @license MIT
 */

import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ChooseUsRightSection } from './ChooseUsRightSection';

describe('ChooseUsRightSection Component', () => {
  test('renders without crashing', () => {
    render(<ChooseUsRightSection />);

    // Check main elements
    expect(screen.getByAltText('why-use-our-resume')).toBeInTheDocument();
    expect(
      screen.getByText(/Build your resume effortlessly/i)
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Try It Out Yourself/i })
    ).toBeInTheDocument();
  });
});
