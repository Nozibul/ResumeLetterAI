/**
 * @file Button.test.jsx
 * @description Minimal test suite for Button component
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Button from './Button';

describe('Button Component', () => {
  // 1. Rendering test
  test('renders default button', () => {
    render(<Button>Click Me</Button>);
    const btn = screen.getByRole('button', { name: 'Click Me' });
    expect(btn).toBeInTheDocument();
    expect(btn).toHaveClass('inline-flex', 'font-semibold');
  });

  // 2. Props test
  test('applies variant and size classes correctly', () => {
    render(
      <Button variant="secondary" size="lg" className="custom-class">
        Props Test
      </Button>
    );
    const btn = screen.getByRole('button', { name: 'Props Test' });
    expect(btn).toHaveClass('bg-white'); // secondary variant
    expect(btn).toHaveClass('px-8', 'py-4'); // lg size
    expect(btn).toHaveClass('custom-class'); // custom class
  });

  test('renders icon correctly based on position', () => {
    const Icon = () => <span data-testid="icon">★</span>;

    // LEFT ICON
    render(
      <Button icon={<Icon />} iconPosition="left">
        Icon Left
      </Button>
    );

    // Find the button using child text + closest button
    const btn = screen.getByText('Icon Left').closest('button');
    expect(btn).toBeInTheDocument(); // Button exists
    expect(btn.querySelector('[data-testid="icon"]')).toBeInTheDocument(); // Icon exists

    // RIGHT ICON
    render(
      <Button icon={<Icon />} iconPosition="right">
        Icon Right
      </Button>
    );
    const btn2 = screen.getByText('Icon Right').closest('button');
    expect(btn2).toBeInTheDocument();
    expect(btn2.querySelector('[data-testid="icon"]')).toBeInTheDocument();
  });

  // 3. Logic test (analytics)
  test('calls analytics and onClick correctly', () => {
    const onClick = jest.fn();
    const analytics = { event: 'button_click', properties: { id: 1 } };

    render(
      <Button onClick={onClick} analytics={analytics}>
        Click
      </Button>
    );

    const btn = screen.getByRole('button', { name: 'Click' });
    fireEvent.click(btn);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  // 4. Event test (disabled & loading)
  test('does not call onClick when disabled or loading', () => {
    const onClick = jest.fn();
    const { rerender } = render(
      <Button onClick={onClick} disabled>
        Disabled
      </Button>
    );
    const btn = screen.getByRole('button', { name: 'Disabled' });
    fireEvent.click(btn);
    expect(onClick).not.toHaveBeenCalled();

    rerender(
      <Button onClick={onClick} loading>
        Loading
      </Button>
    );
    const btn2 = screen.getByRole('button', { name: 'Loading' });
    fireEvent.click(btn2);
    expect(onClick).not.toHaveBeenCalled();
  });

  // 5. Style test (loading spinner)
  test('shows loading spinner when loading is true', () => {
    render(<Button loading>Loading</Button>);
    const spinner = screen
      .getByRole('button')
      .querySelector('div.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  // 6. Null / edge case tests
  test('renders correctly with null children', () => {
    render(<Button>{null}</Button>);
    const btn = screen.getByRole('button');
    expect(btn).toBeInTheDocument();
  });

  test('renders without icon if not provided', () => {
    render(<Button>Text Only</Button>);
    const btn = screen.getByRole('button', { name: 'Text Only' });
    const iconSpan = btn.querySelector('[data-testid="icon"]');
    expect(iconSpan).not.toBeInTheDocument();
  });
});
