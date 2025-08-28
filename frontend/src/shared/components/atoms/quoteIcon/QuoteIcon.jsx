/**
 * @file QuoteIcon.jsx
 * @description Atom component for displaying quote icon
 */

import PropTypes from 'prop-types';
import clsx from 'clsx';
import { QUOTE_MARKS_PATH } from '@/lib/constants';

export const QuoteIcon = ({ color }) => (
  <svg
    className={clsx('w-12 h-8 transition-colors duration-200', color)}
    viewBox="0 0 24 16"
    fill="currentColor"
    aria-hidden="true"
    role="img"
  >
    <path d={QUOTE_MARKS_PATH} />
  </svg>
);

QuoteIcon.propTypes = {
  color: PropTypes.string.isRequired,
};
