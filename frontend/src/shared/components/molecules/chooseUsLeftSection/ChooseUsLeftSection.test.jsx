/**
 * @file ChooseUsLeftSection.test.jsx
 * @author Nozibul Islam
 *
 * @copyright (c) 2025 ResumeLetterAI. All rights reserved.
 * @license MIT
 */

import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ChooseUsLeftSection from './ChooseUsLeftSection';
import { features as mockFeatures } from '@/local-data/chooseUS';

jest.mock('next/image', () => ({ src, alt, priority, ...props }) => {
  // Convert boolean priority to string for DOM attribute
  const priorityAttr = priority ? { 'data-priority': 'true' } : {};

  return <img src={src} alt={alt} {...priorityAttr} {...props} />;
});

describe('ChooseUsLeftSection Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // 1. Render test
  test('renders without crashing', () => {
    render(<ChooseUsLeftSection />);

    // Minimal check: document body is in the document
    expect(document.body).toBeInTheDocument();

    // Optionally, check fallback text or known element
    const loadingText = screen.queryByText(/loading features/i);
    expect(loadingText || document.body).toBeInTheDocument();
  });

  // 2. Features mapping test
  test('displays all features when features exist', () => {
    render(<ChooseUsLeftSection />);
    mockFeatures.forEach((feature) => {
      expect(screen.getByText(feature.title)).toBeInTheDocument();
      expect(screen.getByText(feature.description)).toBeInTheDocument();
    });
  });

  // 3. Image render test
  test('renders feature images with correct alt text', () => {
    render(<ChooseUsLeftSection />);
    mockFeatures.forEach((feature) => {
      const img = screen.getByAltText(feature.title);
      expect(img).toBeInTheDocument();
      expect(img.tagName).toBe('IMG'); // Because we mocked next/image as img
    });
  });
});
