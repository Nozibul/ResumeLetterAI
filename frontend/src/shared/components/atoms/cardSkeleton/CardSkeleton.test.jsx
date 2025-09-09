import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { CardSkeleton } from './CardSkeleton';

jest.mock('@/components/ui/skeleton', () => ({
  Skeleton: ({ className }) => (
    <div data-testid="skeleton" className={className} />
  ),
}));

describe('CardSkeleton Component', () => {
  // 1. Render test
  test('renders without crashing', () => {
    render(<CardSkeleton count={1} />);
    const skeleton = screen.getByTestId('skeleton');
    expect(skeleton).toBeInTheDocument();
  });

  // 2. Props test (count)
  test('renders correct number of skeleton cards based on count', () => {
    const count = 5;
    render(<CardSkeleton count={count} />);
    const skeletons = screen.getAllByTestId('skeleton');
    expect(skeletons).toHaveLength(count);
  });

  // 3. Handles empty count
  test('renders nothing when count is 0', () => {
    render(<CardSkeleton count={0} />);
    const skeletons = screen.queryAllByTestId('skeleton');
    expect(skeletons).toHaveLength(0);
  });
});
