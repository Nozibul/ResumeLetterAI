/**
 * @file ReviewCard.test.jsx
 * @author Nozibul Islam
 *
 * @copyright (c) 2025 ResumeLetterAI. All rights reserved.
 * @license MIT
 */
import { render, screen } from '@testing-library/react';
import ReviewCard from './ReviewCard';
import '@testing-library/jest-dom';

// Mock next/image to render a simple img tag
jest.mock('next/image', () => ({ src, alt, ...props }) => (
  <img src={src} alt={alt} {...props} />
));

describe('ReviewCard', () => {
  const mockReview = {
    name: 'John Doe',
    review: 'This is an excellent service!',
    rating: 4.9,
    avatar: '/avatar.jpg',
    position: 'Software Engineer',
    company: 'Tech Co.',
  };

  // 1. Render test
  test('renders without crashing', () => {
    render(<ReviewCard review={mockReview} />);
    expect(
      screen.getByText(/this is an excellent service!/i)
    ).toBeInTheDocument();
  });

  // 2. Content test
  test('displays review content, name, position, and company', () => {
    render(<ReviewCard review={mockReview} />);
    expect(screen.getByText(mockReview.name)).toBeInTheDocument();
    expect(screen.getByText(mockReview.position)).toBeInTheDocument();
    expect(screen.getByText(mockReview.company)).toBeInTheDocument();
  });

  // 3. isVisible prop affects loading attribute
  test('sets image loading attribute according to isVisible prop', () => {
    const { rerender } = render(
      <ReviewCard review={mockReview} isVisible={true} />
    );
    expect(
      screen.getByAltText(`Portrait of ${mockReview.name}`)
    ).toHaveAttribute('loading', 'eager');

    rerender(<ReviewCard review={mockReview} isVisible={false} />);
    expect(
      screen.getByAltText(`Portrait of ${mockReview.name}`)
    ).toHaveAttribute('loading', 'lazy');
  });

  // 4. Null / optional props handling
  test('renders correctly when optional props are missing', () => {
    const minimalReview = { name: 'Jane', review: 'Great!', rating: 5 };
    render(<ReviewCard review={minimalReview} />);
    expect(screen.getByText(/great!/i)).toBeInTheDocument();
  });

  // 5. Memo test
  test('component is memoized', () => {
    expect(ReviewCard.$$typeof).toBe(Symbol.for('react.memo'));
  });
});
