import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import TemplateFeed from './TemplateFeed';
import Image from 'next/image';

// Mock Next.js Image for testing
jest.mock('next/image', () => (props) => {
  // eslint-disable-next-line @next/next/no-img-element
  return <img {...props} />;
});

describe('TemplateFeed Component', () => {
  const testImage = '/test-image.png';

  // 1. Render test with image
  test('renders image when feedImage prop is provided', () => {
    render(<TemplateFeed feedImage={testImage} />);
    const img = screen.getByAltText('Resume Template Preview');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', testImage);
  });

  // 2. Null / fallback test
  test('renders fallback text when feedImage is not provided', () => {
    render(<TemplateFeed feedImage={null} />);
    expect(screen.getByText('No preview available')).toBeInTheDocument();
  });

  // 3. Props test
  test('applies width and height style correctly', () => {
    render(<TemplateFeed feedImage={testImage} />);
    const img = screen.getByAltText('Resume Template Preview');
    expect(img.style.width).toBe('600px');
    expect(img.style.height).toBe('630px');
  });
});
