/**
 * @file FooterLink.jsx
 * @author Nozibul Islam
 *
 * @copyright (c) 2025 ResumeLetterAI. All rights reserved.
 * @license MIT
 */

import React from 'react';
import Link from 'next/link';
import PropTypes from 'prop-types';

const FooterLink = React.memo(({ href, children, testId, className = '' }) => (
  <Link
    href={href}
    className={`block text-slate-300 hover:text-teal-500 text-sm transition-all duration-200 hover:translate-x-1 focus:outline-none focus:text-blue-400 focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50 rounded-sm ${className}`}
    data-testid={testId}
  >
    {children}
  </Link>
));

FooterLink.prototypes = {
  href: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  testId: PropTypes.string,
  className: PropTypes.string,
};

export default FooterLink;
