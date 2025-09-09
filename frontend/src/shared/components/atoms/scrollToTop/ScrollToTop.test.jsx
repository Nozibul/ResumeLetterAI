/**
 * @file ScrollToTop.test.jsx
 * @author Nozibul Islam
 *
 * @copyright (c) 2025 ResumeLetterAI. All rights reserved.
 * @license MIT
 */

import { render, screen, fireEvent } from '@testing-library/react';
import ScrollToTop from './ScrollToTop';
import '@testing-library/jest-dom';

describe('ScrollToTop Component', () => {
  // 1. Render Test
  test('renders correctly when show is true', () => {
    render(<ScrollToTop show={true} onClick={() => {}} />);
    const btn = screen.getByTestId('scroll-to-top');
    expect(btn).toBeInTheDocument();
  });

  // 2. Null / hidden test
  test('does not render when show is false', () => {
    render(<ScrollToTop show={false} onClick={() => {}} />);
    const btn = screen.queryByTestId('scroll-to-top');
    expect(btn).toBeNull();
  });

  // 3. Props test
  test('applies onClick prop correctly', () => {
    const handleClick = jest.fn();
    render(<ScrollToTop show={true} onClick={handleClick} />);
    const btn = screen.getByTestId('scroll-to-top');
    fireEvent.click(btn);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  // 4. Memo test
  test('is memoized', () => {
    expect(ScrollToTop.$$typeof).toBe(Symbol.for('react.memo'));
  });

  // 5. Accessibility / label test
  test('has proper aria-label', () => {
    render(<ScrollToTop show={true} onClick={() => {}} />);
    const btn = screen.getByLabelText('Scroll to top');
    expect(btn).toBeInTheDocument();
  });
});
