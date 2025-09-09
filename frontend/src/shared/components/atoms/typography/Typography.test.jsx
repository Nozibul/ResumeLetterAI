// Typography.minimal.test.jsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Typography from './Typography';

describe('Typography Component', () => {
  // 1. Default render test
  // Ensure the component renders correctly with default props (body variant)
  test('renders default body variant', () => {
    render(<Typography>Default text</Typography>);
    const el = screen.getByText('Default text');
    expect(el.tagName.toLowerCase()).toBe('p');
    expect(el).toHaveClass('text-lg', 'font-semibold', 'mt-2');
  });

  // 2. Variant → HTML tag mapping test
  // Check that each variant renders the correct HTML tag
  const variantMap = [
    { variant: 'h1', tag: 'h1', text: 'Heading1' },
    { variant: 'h2', tag: 'h2', text: 'Heading2' },
    { variant: 'h3', tag: 'h3', text: 'Heading3' },
    { variant: 'h4', tag: 'h4', text: 'Heading4' },
    { variant: 'lead', tag: 'p', text: 'Lead text' },
    { variant: 'body', tag: 'p', text: 'Body text' },
    { variant: 'small', tag: 'span', text: 'Small text' },
    { variant: 'caption', tag: 'span', text: 'Caption text' },
  ];

  variantMap.forEach(({ variant, tag, text }) => {
    test(`variant "${variant}" renders as <${tag}>`, () => {
      const { container } = render(
        <Typography variant={variant}>{text}</Typography>
      );
      expect(container.firstChild.tagName.toLowerCase()).toBe(tag);
    });
  });

  // 3. Hero highlighting logic test
  // Verify that the middle word(s) are highlighted correctly for odd/even word counts
  // Hero highlighting logic test (robust version)
  test('h1 highlights middle word(s) correctly', () => {
    // Odd word count
    const textOdd = 'One Two Three';
    const { container: containerOdd } = render(
      <Typography variant="h1">{textOdd}</Typography>
    );
    const spansOdd = containerOdd.querySelectorAll('span');
    const spanTextsOdd = Array.from(spansOdd).map((s) => s.textContent.trim());

    // Ensure all words are wrapped in spans
    expect(spanTextsOdd).toEqual(['One', 'Two', 'Three']);

    // Middle word highlighted
    expect(spansOdd[1]).toHaveClass('bg-clip-text');
    expect(spansOdd[0]).not.toHaveClass('bg-clip-text');
    expect(spansOdd[2]).not.toHaveClass('bg-clip-text');

    // Even word count
    const textEven = 'One Two Three Four';
    const { container: containerEven } = render(
      <Typography variant="h2">{textEven}</Typography>
    );
    const spansEven = containerEven.querySelectorAll('span');
    const spanTextsEven = Array.from(spansEven).map((s) =>
      s.textContent.trim()
    );

    // Ensure all words are wrapped in spans
    expect(spanTextsEven).toEqual(['One', 'Two', 'Three', 'Four']);

    // Middle two words highlighted
    expect(spansEven[1]).toHaveClass('bg-clip-text');
    expect(spansEven[2]).toHaveClass('bg-clip-text');
    expect(spansEven[0]).not.toHaveClass('bg-clip-text');
    expect(spansEven[3]).not.toHaveClass('bg-clip-text');
  });

  // 4. Custom `as` prop override test
  // Ensure that the component renders the specified custom HTML tag
  test('renders correct tag when "as" prop is used', () => {
    const { container } = render(
      <Typography as="section" variant="body">
        Custom Section
      </Typography>
    );
    expect(container.firstChild.tagName.toLowerCase()).toBe('section');
    expect(container.firstChild).toHaveClass(
      'text-lg',
      'font-semibold',
      'mt-2'
    );
  });

  // 5. ClassName merging test
  // Ensure that custom className is merged with variant classes
  test('merges custom className with variant classes', () => {
    const { container } = render(
      <Typography variant="body" className="extra-class">
        Merge classes
      </Typography>
    );
    expect(container.firstChild).toHaveClass(
      'text-lg',
      'font-semibold',
      'mt-2',
      'extra-class'
    );
  });

  // 6. Props forwarding test
  // Verify that additional props are forwarded to the rendered element
  test('forwards additional props', () => {
    render(
      <Typography variant="body" data-testid="typo" id="custom-id">
        Props test
      </Typography>
    );
    const el = screen.getByTestId('typo');
    expect(el).toHaveAttribute('id', 'custom-id');
  });

  // 7. Rendering safety test with null children
  // Ensure the component does not crash when children is null
  test('renders null children without crashing', () => {
    const { container } = render(
      <Typography variant="body">{null}</Typography>
    );
    expect(container.firstChild).toBeInTheDocument();
  });

  // 8. Rendering safety test with number children
  // Ensure the component correctly renders numeric children
  test('renders number children correctly', () => {
    render(<Typography variant="body">{123}</Typography>);
    expect(screen.getByText('123')).toBeInTheDocument();
  });
});
