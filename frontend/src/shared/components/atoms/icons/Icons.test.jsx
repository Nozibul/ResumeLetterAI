import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Icons from './Icons';

describe('Icons Component', () => {
  // 1. Render test
  test('renders icon based on iconName', () => {
    render(<Icons iconName="star" data-testid="star-icon" />);
    const icon = screen.getByTestId('star-icon');
    expect(icon).toBeInTheDocument();
  });

  // 2. Props: size
  test('applies correct size classes', () => {
    render(<Icons iconName="users" size="lg" data-testid="users-icon" />);
    const icon = screen.getByTestId('users-icon');
    expect(icon).toHaveClass('w-6', 'h-6'); // lg size
  });

  // 3. Props: className
  test('applies additional custom className', () => {
    render(
      <Icons
        iconName="mail"
        size="sm"
        className="text-red-500"
        data-testid="mail-icon"
      />
    );
    const icon = screen.getByTestId('mail-icon');
    expect(icon).toHaveClass('w-4', 'h-4'); // sm size
    expect(icon).toHaveClass('text-red-500'); // custom class
  });

  // 4. Logic: different icon names should render
  test('renders different icons correctly', () => {
    const { rerender } = render(
      <Icons iconName="phone" data-testid="dynamic-icon" />
    );
    let icon = screen.getByTestId('dynamic-icon');
    expect(icon).toBeInTheDocument();

    rerender(<Icons iconName="github" data-testid="dynamic-icon" />);
    icon = screen.getByTestId('dynamic-icon');
    expect(icon).toBeInTheDocument();
  });

  // 5. Memoization test
  test('is wrapped with React.memo', () => {
    expect(Icons.$$typeof).toBe(Symbol.for('react.memo'));
  });
});
