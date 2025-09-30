/**
 * @file BackgroundAnimation.test.jsx
 * Minimal tests for BackgroundAnimation component
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import BackgroundAnimation from './BackgroundAnimation';

describe('BackgroundAnimation Component', () => {
  // 1. Render Test
  test('renders without crashing', () => {
    render(<BackgroundAnimation />);
    const { container } = render(<BackgroundAnimation />);
    expect(container.firstChild).toBeInTheDocument();
  });

  // 2. Props Test (children)
  test('renders children when provided', () => {
    render(
      <BackgroundAnimation>
        <div data-testid="child">Hello World</div>
      </BackgroundAnimation>
    );
    const child = screen.getByTestId('child');
    expect(child).toBeInTheDocument();
    expect(child).toHaveTextContent('Hello World');
  });

  // 3. Empty Props Test (children not provided)
  test('renders without children when none are provided', () => {
    const { container } = render(<BackgroundAnimation />);
    // The main wrapper div should exist
    const wrapper = container.firstChild;
    expect(wrapper).toBeInTheDocument();
    // Should not have any children in the relative z-10 div
    const childWrapper = wrapper.querySelector('div.relative.z-10');
    expect(childWrapper).toBeNull();
  });
});
