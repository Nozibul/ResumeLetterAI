/**
 * @file FeatureBadge.test.jsx
 * @author Nozibul Islam
 *
 * @copyright (c) 2025 ResumeLetterAI. All rights reserved.
 * @license MIT
 */

import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import FeatureBadge from './FeatureBadge';

describe('FeatureBadge Component', () => {
  // 1. Render test
  test('renders without crashing', () => {
    render(<FeatureBadge icon="star" text="Top Feature" />);
    expect(screen.getByText('Top Feature')).toBeInTheDocument();
  });

  // 2. Props test: color and className
  test('applies correct color and additional className', () => {
    render(
      <FeatureBadge
        icon="star"
        text="Top Feature"
        color="blue"
        className="custom-class"
      />
    );
    const badge = screen.getByText('Top Feature').parentElement;
    expect(badge).toHaveClass('bg-blue-100 text-blue-800 border-blue-200');
    expect(badge).toHaveClass('custom-class');
  });

  // 3. Memo test
  test('component is memoized', () => {
    expect(FeatureBadge.$$typeof).toBe(Symbol.for('react.memo'));
  });

  // 4. Null / empty children test
  test('renders without crashing even if text is empty', () => {
    render(<FeatureBadge icon="star" text="" />);
    const { container } = render(<FeatureBadge icon="star" text="" />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });
});
