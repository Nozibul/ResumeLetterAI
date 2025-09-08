import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Typography from './Typography';

describe('Typography Component', () => {
  // Test: should render <h1> when variant="h1"s
  it('renders correct tag based on variant', () => {
    render(<Typography variant="h1">Hello</Typography>);
    // const el = screen.getByText('Hello');
    const el = screen.getByRole('heading', { level: 1 });
    expect(el.tagName).toBe('H1');
  });

  // Test: should render <p> as default when no variant is passed
  //   it('renders default tag <p> when no variant is provided', () => {
  //     render(<Typography>Hello</Typography>);
  //     const el = screen.getByText('Hello');
  //     expect(el.tagName).toBe('P');
  //   });

  // Test: should apply Tailwind classes for h2 variant
  //   it('applies correct classes for each variant', () => {
  //     render(<Typography variant="h2">Hello</Typography>);
  //     const el = screen.getByText('Hello');
  //     expect(el).toHaveClass(
  //       'text-2xl md:text-4xl lg:text-4xl text-black font-semibold drop-shadow-md'
  //     );
  //   });

  // Test: should render custom tag when "as" prop is provided
  //   it('supports overriding tag via "as" prop', () => {
  //     render(
  //       <Typography variant="h3" as="section">
  //         Custom Tag
  //       </Typography>
  //     );
  //     const el = screen.getByText('Custom Tag');
  //     expect(el.tagName).toBe('SECTION');
  //   });

  // Test: should highlight the middle word when text length is odd
  //   it('highlights the middle word for odd length text', () => {
  //     render(<Typography variant="h1">Hello Beautiful World</Typography>);
  //     const highlighted = screen.getByText('Beautiful', { exact: false });
  //     expect(highlighted).toHaveClass(
  //       'bg-gradient-to-r from-teal-600 to-purple-300 bg-clip-text text-transparent'
  //     );
  //   });

  // Test: should highlight two middle words when text length is even
  //   it('highlights the two middle words for even length text', () => {
  //     render(<Typography variant="h1">This is a test</Typography>);
  //     const middle1 = screen.getByText('is', { exact: false });
  //     const middle2 = screen.getByText('a', { exact: false });

  //     expect(middle1).toHaveClass(
  //       'bg-gradient-to-r from-teal-600 to-purple-300 bg-clip-text text-transparent'
  //     );
  //     expect(middle2).toHaveClass(
  //       'bg-gradient-to-r from-teal-600 to-purple-300 bg-clip-text text-transparent'
  //     );
  //   });

  // Test: should not highlight when children is a React element
  //   it('does not apply highlight when children is not string', () => {
  //     render(
  //       <Typography variant="h1">
  //         <span>Nested</span>
  //       </Typography>
  //     );
  //     const el = screen.getByText('Nested');
  //     expect(el).not.toHaveClass(
  //       'bg-gradient-to-r from-teal-600 to-purple-300 bg-clip-text text-transparent'
  //     );
  //   });
});
