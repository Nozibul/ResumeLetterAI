/**
 * @file useScrollToTop.test.js
 * @author Nozibul Islam <nozibulislamspi@gmail.com>
 *
 * @copyright (c) 2025 ResumeLetterAI. All rights reserved.
 * @license MIT
 */

import { renderHook, act } from '@testing-library/react';
import { waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useScrollToTop } from './useScrollToTop';

describe('useScrollToTop', () => {
  beforeEach(() => {
    // Reset scroll position
    Object.defineProperty(window, 'scrollY', { writable: true, value: 0 });
    window.scrollTo = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('initially showScrollTop is false', () => {
    const { result } = renderHook(() => useScrollToTop(100));
    expect(result.current.showScrollTop).toBe(false);
  });

  test('showScrollTop becomes true when scrollY exceeds threshold', async () => {
    const { result } = renderHook(() => useScrollToTop(100));

    act(() => {
      window.scrollY = 150;
      window.dispatchEvent(new Event('scroll'));
    });

    await waitFor(() => {
      expect(result.current.showScrollTop).toBe(true);
    });
  });

  test('showScrollTop remains false when scrollY below threshold', () => {
    const { result } = renderHook(() => useScrollToTop(200));

    act(() => {
      window.scrollY = 150;
      window.dispatchEvent(new Event('scroll'));
    });

    expect(result.current.showScrollTop).toBe(false);
  });

  test('scrollToTop calls window.scrollTo with smooth behavior', () => {
    const { result } = renderHook(() => useScrollToTop());

    act(() => {
      result.current.scrollToTop();
    });

    expect(window.scrollTo).toHaveBeenCalledWith({
      top: 0,
      behavior: 'smooth',
    });
  });
});
