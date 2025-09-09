import { render, screen } from '@testing-library/react';
import TrustIndicator from './TrustIndicator';
import '@testing-library/jest-dom';
import { User } from 'lucide-react';

describe('TrustIndicator Component', () => {
  const defaultProps = {
    value: '500',
    text: 'Trusted Users',
  };

  // 1. Render test
  test('renders without crashing', () => {
    render(<TrustIndicator {...defaultProps} />);
    expect(screen.getByText(defaultProps.value)).toBeInTheDocument();
    expect(screen.getByText(defaultProps.text)).toBeInTheDocument();
  });

  // 2. Props test - showIcon
  test('renders User icon when showIcon is true', () => {
    render(<TrustIndicator {...defaultProps} showIcon={true} />);
    expect(document.querySelector('svg')).toBeInTheDocument();
  });

  test('does not render User icon when showIcon is false', () => {
    render(<TrustIndicator {...defaultProps} showIcon={false} />);
    expect(document.querySelector('svg')).not.toBeInTheDocument();
  });

  // 3. Memo test
  test('component is memoized', () => {
    expect(TrustIndicator.$$typeof).toBe(Symbol.for('react.memo'));
  });

  // 4. Null / fallback test - minimal props
  test('renders correctly with minimal props', () => {
    render(<TrustIndicator value="100" text="Users" />);
    expect(screen.getByText('100')).toBeInTheDocument();
    expect(screen.getByText('Users')).toBeInTheDocument();
  });
});
