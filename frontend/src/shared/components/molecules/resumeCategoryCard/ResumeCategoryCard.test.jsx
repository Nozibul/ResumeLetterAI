/**
 * @file ResumeCategoryCard.test.jsx
 * @author Nozibul Islam
 *
 * @copyright (c) 2025 ResumeLetterAI. All rights reserved.
 * @license MIT
 */

import { render, screen, fireEvent } from '@testing-library/react';
import ResumeCategoryCard from './ResumeCategoryCard';
import '@testing-library/jest-dom';

// Mock formatCategoryName for consistent output
jest.mock('@/lib/formatCategoryName', () => ({
  formatCategoryName: jest.fn((cat) => cat.replace('_', ' ')),
}));

describe('ResumeCategoryCard', () => {
  const mockTemplates = { category: 'WEB_DEV' };
  const mockOnClick = jest.fn();

  // 1. Render test
  test('renders without crashing', () => {
    render(
      <ResumeCategoryCard
        templates={mockTemplates}
        isActive
        onClick={mockOnClick}
      />
    );
    expect(screen.getByText(/web dev/i)).toBeInTheDocument();
  });

  // 2. Props test - isActive class & custom className
  test('applies isActive and className props correctly', () => {
    render(
      <ResumeCategoryCard
        templates={mockTemplates}
        isActive={true}
        className="custom-class"
      />
    );
    const card = screen.getByRole('button');
    expect(card).toHaveClass('custom-class');
    expect(card).toHaveClass('scale-110'); // isActive applied
  });

  // 3. Click / keyboard event test
  test('triggers onClick when clicked or Enter pressed', () => {
    render(
      <ResumeCategoryCard templates={mockTemplates} onClick={mockOnClick} />
    );
    const card = screen.getByRole('button');

    fireEvent.click(card);
    expect(mockOnClick).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(card, { key: 'Enter', code: 'Enter' });
    expect(mockOnClick).toHaveBeenCalledTimes(2);
  });

  // 4. Memo test
  test('component is memoized', () => {
    expect(ResumeCategoryCard.$$typeof).toBe(Symbol.for('react.memo'));
  });

  // 5. Null / empty props test
  test('renders correctly with minimal props', () => {
    render(<ResumeCategoryCard templates={{ category: 'DATA_SCI' }} />);
    expect(screen.getByText(/data sci/i)).toBeInTheDocument();
  });

  // 6. Content test - formatted category
  test('displays formatted category', () => {
    render(<ResumeCategoryCard templates={{ category: 'FRONT_END' }} />);
    expect(screen.getByText('FRONT END Resume')).toBeInTheDocument();
  });
});
