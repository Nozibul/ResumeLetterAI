/**
 * @file ContentFeed.test.jsx
 * Minimal tests for ContentFeed component
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ContentFeed from './ContentFeed';

describe('ContentFeed Component', () => {
  const mockSetActive = jest.fn();
  const resumeFeed = [
    { id: 1, title: 'Resume 1', category: 'web_dev' },
    { id: 2, title: 'Resume 2', category: 'data_sci' },
  ];

  // 1. Render Test
  test('renders without crashing', () => {
    const { container } = render(
      <ContentFeed
        resumeFeed={resumeFeed}
        active={1}
        setActive={mockSetActive}
      />
    );
    expect(container.firstChild).toBeInTheDocument();
  });

  // 2. Props Test - items rendered correctly
  test('displays feed items with formatted categories', () => {
    render(
      <ContentFeed
        resumeFeed={resumeFeed}
        active={1}
        setActive={mockSetActive}
      />
    );

    // Verify titles are rendered
    const resume1Title = screen.getByText('Resume 1');
    const resume2Title = screen.getByText('Resume 2');
    expect(resume1Title).toBeInTheDocument();
    expect(resume2Title).toBeInTheDocument();

    // Verify categories are rendered next to titles
    const resume1Category = resume1Title.nextSibling;
    const resume2Category = resume2Title.nextSibling;

    // Assuming formatCategoryName keeps underscores or capitalization
    expect(resume1Category.textContent).toMatch(/WEB_DEV/i);
    expect(resume2Category.textContent).toMatch(/Data_Sci/i);
  });

  // 3. Logic Test - clicking item triggers setActive
  test('calls setActive with correct id when an item is clicked', () => {
    render(
      <ContentFeed
        resumeFeed={resumeFeed}
        active={1}
        setActive={mockSetActive}
      />
    );

    const item2 = screen.getByText('Resume 2').closest('div');
    fireEvent.click(item2);
    expect(mockSetActive).toHaveBeenCalledWith(2);
  });

  // 4. Active class styling test
  test('applies active class to the active item', () => {
    render(
      <ContentFeed
        resumeFeed={resumeFeed}
        active={2}
        setActive={mockSetActive}
      />
    );

    const activeItem = screen.getByText('Resume 2').closest('div');
    expect(activeItem).toHaveClass(
      'bg-teal-100',
      'border-l-4',
      'border-teal-500',
      'text-black'
    );
  });

  // 5. Empty resumeFeed test
  test('renders correctly when resumeFeed is empty', () => {
    render(
      <ContentFeed resumeFeed={[]} active={null} setActive={mockSetActive} />
    );
    expect(screen.queryByText('Resume 1')).not.toBeInTheDocument();
    expect(screen.queryByText('Resume 2')).not.toBeInTheDocument();
  });
});
