import { render, screen } from '@testing-library/react';
import RatingDisplay from './RatingDisplay';
import '@testing-library/jest-dom';

describe('RatingDisplay Component', () => {
  // 1. Render Test
  test('renders without crashing', () => {
    render(<RatingDisplay />);
    expect(screen.getByText('4.9/5')).toBeInTheDocument();
  });

  // 2. Props Test
  test('renders correct rating from props', () => {
    render(<RatingDisplay rating={3.5} />);
    expect(screen.getByText('3.5/5')).toBeInTheDocument();
  });

  test('applies custom className from props', () => {
    render(<RatingDisplay className="custom-class" />);
    expect(screen.getByText('4.9/5').parentElement).toHaveClass('custom-class');
  });

  // 3. Memo Test
  test('is memoized', () => {
    expect(RatingDisplay.$$typeof).toBe(Symbol.for('react.memo'));
  });

  // 4. Empty / null children test
  // RatingDisplay doesn’t take children, but test renders default correctly
  test('renders default content when no rating prop is passed', () => {
    render(<RatingDisplay />);
    expect(screen.getByText('4.9/5')).toBeInTheDocument();
  });
});
