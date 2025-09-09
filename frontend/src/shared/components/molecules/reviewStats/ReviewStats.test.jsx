/**
 * @file ReviewStats.test.jsx
 * @author Nozibul Islam
 *
 * @copyright (c) 2025 ResumeLetterAI. All rights reserved.
 * @license MIT
 */

import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ReviewStats } from './ReviewStats';

// Mock the Icons component
jest.mock('../../atoms/icons/Icons', () => ({ iconName, ...props }) => (
  <span data-testid={`icon-${iconName}`} {...props} />
));

describe('ReviewStats', () => {
  // 1. Render test
  test('renders without crashing', () => {
    render(<ReviewStats />);
    expect(screen.getByText(/what our clients say!/i)).toBeInTheDocument();
  });

  // 2. Header text presence
  test('displays header and description', () => {
    render(<ReviewStats />);
    expect(screen.getByText(/customer reviews/i)).toBeInTheDocument();
    expect(
      screen.getByText(/don’t just take our word for it/i)
    ).toBeInTheDocument();
  });

  // 3. Stats are rendered correctly
  test('renders all stats with values and labels', () => {
    render(<ReviewStats />);
    const stats = [
      { icon: 'star', value: '4.9/5', label: 'Average Rating' },
      { icon: 'heart', value: '2.5K+', label: 'Happy Customers' },
      { icon: 'zap', value: '85%', label: 'Satisfaction Rate' },
    ];

    stats.forEach((stat) => {
      expect(screen.getByText(stat.value)).toBeInTheDocument();
      expect(screen.getByText(stat.label)).toBeInTheDocument();
      expect(screen.getByTestId(`icon-${stat.icon}`)).toBeInTheDocument();
    });
  });
});
