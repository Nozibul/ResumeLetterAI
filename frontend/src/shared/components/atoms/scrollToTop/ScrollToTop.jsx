'use client';
/**
 * @file ScrollToTop.jsx
 * @author Nozibul Islam
 *
 * @copyright (c) 2025 ResumeLetterAI. All rights reserved.
 * @license MIT
 */
import React from 'react';
import PropTypes from 'prop-types';
import { ChevronUp } from 'lucide-react';

const ScrollToTop = React.memo(({ show, onClick }) => {
  if (!show) return null;

  return (
    <button
      onClick={onClick}
      className="fixed bottom-8 right-8 w-12 h-12 bg-slate-300 hover:bg-teal-500 text-teal-700 hover:text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 z-50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
      aria-label="Scroll to top"
      data-testid="scroll-to-top"
    >
      <ChevronUp className="w-6 h-6 mx-auto" />
    </button>
  );
});

ScrollToTop.displayName = 'ScrollToTop';

ScrollToTop.propTypes = {
  show: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
};

export default ScrollToTop;
