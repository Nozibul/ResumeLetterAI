'use client';
/**
 * @file ReviewCarousel.tsx
 * @author Enterprise-optimized review carousel
 */

import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { Play, Pause, ChevronLeft, ChevronRight } from 'lucide-react';
import { reviewsData } from '@/local-data/review-data';
import { ReviewStats } from '@/shared/components/molecules/reviewStats/ReviewStats';
import ReviewCard from '@/shared/components/molecules/reviewCard/ReviewCard';

// Enterprise-level carousel with full optimization
export const ReviewCarousel = memo(
  ({
    reviews = reviewsData,
    autoPlay = true,
    autoPlayInterval = 3000,
    // Responsive cards configuration
    cardsToShow = { xs: 1, sm: 1, md: 2, lg: 3 },
    moveByCards = 1,
    showIndicators = true,
    showControls = true,
    enableKeyboardNavigation = true,
  }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(autoPlay);
    const [isUserInteracting, setIsUserInteracting] = useState(false);
    const [currentBreakpoint, setCurrentBreakpoint] = useState('lg');

    // Detect screen size
    useEffect(() => {
      const updateBreakpoint = () => {
        const width = window.innerWidth;
        if (width < 640) setCurrentBreakpoint('xs');
        else if (width < 768) setCurrentBreakpoint('sm');
        else if (width < 1024) setCurrentBreakpoint('md');
        else setCurrentBreakpoint('lg');
      };

      updateBreakpoint();
      window.addEventListener('resize', updateBreakpoint);
      return () => window.removeEventListener('resize', updateBreakpoint);
    }, []);

    // Get current cards to show based on screen size
    const getCurrentCardsToShow = useCallback(() => {
      return typeof cardsToShow === 'object'
        ? cardsToShow[currentBreakpoint] || cardsToShow.lg || 3
        : cardsToShow;
    }, [cardsToShow, currentBreakpoint]);

    // Memoized calculations
    const {
      totalCards,
      extendedReviews,
      startIndex,
      totalSlides,
      currentCardsToShow,
    } = useMemo(() => {
      const currentCardsToShow = getCurrentCardsToShow();
      const totalCards = reviews.length;
      const extendedReviews = [...reviews, ...reviews, ...reviews];
      const startIndex = reviews.length;
      const totalSlides = Math.ceil(totalCards / currentCardsToShow);

      return {
        totalCards,
        extendedReviews,
        startIndex,
        totalSlides,
        currentCardsToShow,
      };
    }, [reviews, getCurrentCardsToShow]);

    // Initialize position
    useEffect(() => {
      setCurrentIndex(startIndex);
    }, [startIndex]);

    // Auto-play logic
    useEffect(() => {
      if (!isPlaying || isUserInteracting) return;

      const interval = setInterval(() => {
        setCurrentIndex((prev) => prev + moveByCards);
      }, autoPlayInterval);

      return () => clearInterval(interval);
    }, [isPlaying, moveByCards, autoPlayInterval, isUserInteracting]);

    // Handle infinite loop reset
    useEffect(() => {
      if (currentIndex >= startIndex + totalCards) {
        const timer = setTimeout(() => {
          setCurrentIndex(startIndex);
        }, 1000);
        return () => clearTimeout(timer);
      }
      if (currentIndex < startIndex) {
        const timer = setTimeout(() => {
          setCurrentIndex(startIndex + totalCards - moveByCards);
        }, 1000);
        return () => clearTimeout(timer);
      }
    }, [currentIndex, startIndex, totalCards, moveByCards]);

    // Navigation functions
    const nextSlide = useCallback(() => {
      setIsUserInteracting(true);
      setCurrentIndex((prev) => prev + moveByCards);
      setTimeout(() => setIsUserInteracting(false), 1500);
    }, [moveByCards]);

    const prevSlide = useCallback(() => {
      setIsUserInteracting(true);
      setCurrentIndex((prev) => prev - moveByCards);
      setTimeout(() => setIsUserInteracting(false), 1500);
    }, [moveByCards]);

    const goToSlide = useCallback(
      (slideIndex) => {
        setIsUserInteracting(true);
        setCurrentIndex(startIndex + slideIndex * currentCardsToShow);
        setTimeout(() => setIsUserInteracting(false), 1500);
      },
      [startIndex, currentCardsToShow]
    );

    const togglePlayPause = useCallback(() => {
      setIsPlaying((prev) => !prev);
    }, []);

    // Current slide calculation
    const getCurrentSlideIndex = useCallback(() => {
      const adjustedIndex = currentIndex - startIndex;
      return Math.floor(adjustedIndex / currentCardsToShow) % totalSlides;
    }, [currentIndex, startIndex, currentCardsToShow, totalSlides]);

    // Keyboard navigation
    useEffect(() => {
      if (!enableKeyboardNavigation) return;

      const handleKeyPress = (e) => {
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          prevSlide();
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          nextSlide();
        } else if (e.key === ' ') {
          e.preventDefault();
          togglePlayPause();
        }
      };

      document.addEventListener('keydown', handleKeyPress);
      return () => document.removeEventListener('keydown', handleKeyPress);
    }, [enableKeyboardNavigation, prevSlide, nextSlide, togglePlayPause]);

    // Visible cards for performance
    const visibleCardIndices = useMemo(() => {
      const indices = new Set();
      for (
        let i = currentIndex - 1;
        i <= currentIndex + currentCardsToShow;
        i++
      ) {
        if (i >= 0 && i < extendedReviews.length) {
          indices.add(i);
        }
      }
      return indices;
    }, [currentIndex, currentCardsToShow, extendedReviews.length]);

    // Get responsive card width classes
    const getCardWidthClass = useCallback(() => {
      const widthMap = {
        1: 'w-full',
        2: 'w-1/2',
        3: 'w-1/3',
        4: 'w-1/4',
      };
      return widthMap[currentCardsToShow] || 'w-1/3';
    }, [currentCardsToShow]);

    return (
      <div
        className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6"
        role="region"
        aria-label="Customer reviews carousel"
      >
        {/* Review Stats */}
        <ReviewStats />

        {/* Carousel Container */}
        <div
          className="relative overflow-hidden rounded-xl sm:rounded-2xl"
          role="group"
          aria-label="Reviews"
        >
          <div
            className="flex transition-transform duration-1000 ease-out"
            style={{
              transform: `translateX(-${(currentIndex * 100) / currentCardsToShow}%)`,
            }}
            onMouseEnter={() => setIsUserInteracting(true)}
            onMouseLeave={() => setIsUserInteracting(false)}
            onTouchStart={() => setIsUserInteracting(true)}
            onTouchEnd={() =>
              setTimeout(() => setIsUserInteracting(false), 1500)
            }
          >
            {extendedReviews.map((review, index) => (
              <div
                key={`${review.id}-${Math.floor(index / reviews.length)}`}
                className={`${getCardWidthClass()} flex-shrink-0 px-1 sm:px-2`}
              >
                <ReviewCard
                  review={review}
                  isVisible={visibleCardIndices.has(index)}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Indicators */}
        {showIndicators && totalSlides > 1 && (
          <div
            className="flex justify-center gap-1.5 sm:gap-2 mt-6 sm:mt-8"
            role="tablist"
            aria-label="Review slides"
          >
            {[...Array(totalSlides)].map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`transition-all duration-300 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  index === getCurrentSlideIndex()
                    ? 'bg-purple-500 w-6 sm:w-8 h-1.5 sm:h-2'
                    : 'bg-gray-300 hover:bg-gray-400 w-1.5 sm:w-2 h-1.5 sm:h-2'
                }`}
                data-testid={`indicator-${index}`}
                role="tab"
                aria-selected={index === getCurrentSlideIndex()}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}

        {/* Controls */}
        {showControls && (
          <div
            className="flex justify-center items-center gap-3 sm:gap-4 mt-4 sm:mt-6"
            role="group"
            aria-label="Carousel controls"
          >
            <button
              onClick={prevSlide}
              className="p-2 sm:p-2.5 rounded-lg bg-white shadow-md hover:shadow-lg active:shadow-sm transition-all duration-200 border border-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-500 touch-manipulation"
              data-testid="button-prev"
              aria-label="Previous reviews"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
            </button>

            <button
              onClick={togglePlayPause}
              className="p-2.5 sm:p-3 rounded-lg bg-gradient-to-r from-teal-500 to-blue-400 text-white shadow-lg hover:shadow-xl active:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-teal-600 touch-manipulation"
              data-testid="button-play-pause"
              aria-label={isPlaying ? 'Pause carousel' : 'Play carousel'}
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 sm:w-5 sm:h-5" />
              ) : (
                <Play className="w-4 h-4 sm:w-5 sm:h-5" />
              )}
            </button>

            <button
              onClick={nextSlide}
              className="p-2 sm:p-2.5 rounded-lg bg-white shadow-md hover:shadow-lg active:shadow-sm transition-all duration-200 border border-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-500 touch-manipulation"
              data-testid="button-next"
              aria-label="Next reviews"
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
            </button>
          </div>
        )}
      </div>
    );
  }
);

ReviewCarousel.displayName = 'ReviewCarousel';
