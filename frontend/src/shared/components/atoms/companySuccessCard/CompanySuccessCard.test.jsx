/**
 * @file CompanySuccessCard.test.jsx
 * Minimal tests for CompanySuccessCard
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { CompanySuccessCard } from './CompanySuccessCard';

describe('CompanySuccessCard Component', () => {
  const company = {
    displayText: 'TechCorp',
    color: 'text-red-500',
    userCount: '20',
  };

  // 1. Render Test
  test('renders without crashing', () => {
    const { container } = render(<CompanySuccessCard company={company} />);
    expect(container.firstChild).toBeInTheDocument();
  });

  // 2. Props Test (company data)
  test('displays company name and user count correctly', () => {
    render(<CompanySuccessCard company={company} />);

    const name = screen.getByText('TechCorp');
    expect(name).toBeInTheDocument();
    expect(name).toHaveClass('text-red-500');

    const users = screen.getByText('20 users hired');
    expect(users).toBeInTheDocument();
  });

  // 3. Memo Test
  test('component is memoized', () => {
    expect(CompanySuccessCard.$$typeof).toBe(Symbol.for('react.memo'));
  });
});
