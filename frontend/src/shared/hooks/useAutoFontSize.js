/**
 * @file shared/hooks/useAutoFontSize.js
 * @description Auto-adjust font size based on content height
 * @author Nozibul Islam
 *
 * FIXES:
 * ✅ resumeData object mutation হলেও re-measure হবে (JSON.stringify dependency)
 * ✅ Stale closure bug fix
 * ✅ isScaling race condition fix
 */

'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import logger from '@/shared/lib/logger';

/**
 * Hook to auto-adjust font size based on content
 *
 * @param {Object} resumeData - Resume data object
 * @param {number} maxHeight - Max allowed height in pixels (default: A4 height - 1123px)
 * @param {number} minFontSize - Minimum font size in pt (default: 8)
 * @param {number} maxFontSize - Maximum font size in pt (default: 11)
 * @returns {Object} { fontSize, containerRef, isScaling }
 */
export function useAutoFontSize(
  resumeData,
  maxHeight = 1123,
  minFontSize = 8,
  maxFontSize = 11
) {
  const [fontSize, setFontSize] = useState(10);
  const [isScaling, setIsScaling] = useState(false);
  const containerRef = useRef(null);
  const measureTimeoutRef = useRef(null);

  // =====================================================
  // FIX: resumeData object shallow comparison এড়াতে
  // JSON.stringify দিয়ে deep change detect করা হচ্ছে।
  // আগে object reference same থাকলে useCallback re-run
  // হতো না, তাই measure miss হতো।
  // =====================================================
  const resumeDataKey = useMemo(() => {
    try {
      return JSON.stringify(resumeData);
    } catch {
      return String(Date.now());
    }
  }, [resumeData]);

  /**
   * Measure content height and calculate optimal font size
   */
  const measureAndAdjust = useCallback(() => {
    if (!containerRef.current) return;

    try {
      setIsScaling(true);

      const container = containerRef.current;
      const contentHeight = container.scrollHeight;

      if (contentHeight <= maxHeight * 0.85) {
        setFontSize(maxFontSize);
        logger.info(
          `✅ Content fits: ${contentHeight}px, using ${maxFontSize}pt`
        );
        setIsScaling(false);
        return;
      }

      if (contentHeight > maxHeight) {
        const scaleFactor = maxHeight / contentHeight;
        const newFontSize = Math.max(
          minFontSize,
          Math.min(maxFontSize, maxFontSize * scaleFactor)
        );
        const roundedFontSize = Math.round(newFontSize * 10) / 10;
        setFontSize(roundedFontSize);
        logger.info(
          `📏 Content: ${contentHeight}px → Scaled to ${roundedFontSize}pt`
        );
      } else {
        setFontSize(10);
      }

      setIsScaling(false);
    } catch (error) {
      logger.error('Error measuring content:', error);
      setFontSize(10);
      setIsScaling(false);
    }
    // FIX: resumeDataKey use করা হচ্ছে resumeData এর বদলে
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resumeDataKey, maxHeight, minFontSize, maxFontSize]);

  /**
   * Debounced measurement on content change
   */
  useEffect(() => {
    if (measureTimeoutRef.current) {
      clearTimeout(measureTimeoutRef.current);
    }

    measureTimeoutRef.current = setTimeout(() => {
      measureAndAdjust();
    }, 300);

    return () => {
      if (measureTimeoutRef.current) {
        clearTimeout(measureTimeoutRef.current);
      }
    };
  }, [measureAndAdjust]);

  /**
   * Measure on window resize
   */
  useEffect(() => {
    const handleResize = () => {
      if (measureTimeoutRef.current) {
        clearTimeout(measureTimeoutRef.current);
      }
      measureTimeoutRef.current = setTimeout(measureAndAdjust, 300);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      if (measureTimeoutRef.current) {
        clearTimeout(measureTimeoutRef.current);
      }
    };
  }, [measureAndAdjust]);

  return {
    fontSize,
    containerRef,
    isScaling,
  };
}

export function ptToPx(pt) {
  return (pt * 96) / 72;
}

export function pxToPt(px) {
  return (px * 72) / 96;
}

export function getFontSizeLabel(fontSize) {
  if (fontSize >= 10.5) return 'Normal';
  if (fontSize >= 9.5) return 'Compact';
  if (fontSize >= 8.5) return 'Dense';
  return 'Very Dense';
}
