import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import FloatingElement from './FloatingElement';

describe('FloatingElement Component', () => {
  // 1. Render Test
  test('renders children correctly', () => {
    render(<FloatingElement>Test Child</FloatingElement>);
    const el = screen.getByText('Test Child');
    expect(el).toBeInTheDocument();
  });

  // 2. Default animation test
  test('applies default "bounce" animation class', () => {
    render(<FloatingElement>Animated</FloatingElement>);
    const el = screen.getByText('Animated');
    expect(el).toHaveClass('animate-bounce');
    expect(el).toHaveClass('[animation-duration:1.5s]');
  });

  // 3. Custom animation test
  test('applies "pulse" animation class when animation prop is set', () => {
    render(<FloatingElement animation="pulse">Pulse Test</FloatingElement>);
    const el = screen.getByText('Pulse Test');
    expect(el).toHaveClass('animate-pulse');
    expect(el).toHaveClass('[animation-duration:1s]');
  });

  // 4. Custom className merging test
  test('merges custom className with default classes', () => {
    render(
      <FloatingElement className="custom-class">Custom Class</FloatingElement>
    );
    const el = screen.getByText('Custom Class');
    expect(el).toHaveClass('custom-class');
    expect(el).toHaveClass('bg-teal-500', 'text-white', 'rounded-full');
  });

  // 5. Memoization test
  test('component is memoized', () => {
    expect(FloatingElement.$$typeof).toBe(Symbol.for('react.memo'));
  });
});
