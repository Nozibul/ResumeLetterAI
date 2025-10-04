/**
 * @file CompanySuccessCard.jsx
 * @author Nozibul Islams
 */

import React from 'react';
import PropTypes from 'prop-types';

export const CompanySuccessCard = React.memo(({ company }) => {
  return (
    <div
      className={`flex-shrink-0 border border-dashed border-teal-200 rounded-xl p-4 flex flex-col items-center justify-center min-h-[120px] w-[220px] mx-4 hover:scale-102 transition-all duration-400 group bg-gradient-to-br from-[#070d3f8a] to-[#1c463e]`}
    >
      <div className="text-center">
        {/* Company Name */}
        <div
          className={`font-bold text-lg ${company.color} group-hover:text-white transition-colors duration-400 mb-2`}
        >
          {company.displayText}
        </div>

        {/* User Count */}
        <div className="text-gray-400 text-xs font-medium group-hover:text-gray-600 transition-colors duration-300">
          {company.userCount} users hired
        </div>

        {/* Success Badge */}
        <div className="mt-2 px-2 py-1 bg-white-50 border border-teal-500/30 rounded-full text-teal-400 text-xs font-semibold group-hover:bg-teal-100 group-hover:text-teal-800 transition-all duration-400">
          ✓ HIRED
        </div>
      </div>
    </div>
  );
});

CompanySuccessCard.propTypes = {
  company: PropTypes.shape({
    displayText: PropTypes.string.isRequired,
    color: PropTypes.string.isRequired,
    userCount: PropTypes.string.isRequired,
  }).isRequired,
};
