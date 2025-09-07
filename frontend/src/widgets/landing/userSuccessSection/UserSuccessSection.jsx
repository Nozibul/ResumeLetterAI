'use client';
/**
 * @file UserSuccessSection.jsx
 * @author Nozibul Islam
 *
 * @copyright (c) 2025 ResumeLetterAI. All rights reserved.
 * @license MIT
 */

import React from 'react';
import { SUCCESS_COMPANIES_DATA } from '@/local-data/success-company-data';
import Button from '@/shared/components/atoms/buttons/Button';
import { CompanySuccessCard } from '@/shared/components/atoms/companySuccessCard/CompanySuccessCard';

const ScrollingRow = React.memo(
  ({
    companies,
    direction = 'left',
    className = '',
    animationDuration = 35,
  }) => (
    <div className={`relative overflow-hidden ${className}`}>
      <div
        className={`flex py-2 w-full scroll-animation-${direction} hover:pause-animation`}
        style={{
          width: '200%',
          animationDuration: `${animationDuration}s`,
        }}
      >
        {/* Original set */}
        {companies.map((company) => (
          <CompanySuccessCard
            key={`${direction}-${company.id}`}
            company={company}
          />
        ))}
        {/* Duplicate for seamless loop */}
        {companies.map((company) => (
          <CompanySuccessCard
            key={`${direction}-${company.id}-duplicate`}
            company={company}
          />
        ))}
      </div>
    </div>
  )
);

const UserSuccessSection = ({
  title = 'Where Our Users Work Now',
  subtitle = 'Join 2,500+ professionals who landed their dream jobs using ResumeLetterAI',
  companies = SUCCESS_COMPANIES_DATA,
  animationDuration = 25,
  className = '',
  showStats = true,
}) => {
  const firstRow = companies.slice(0, Math.ceil(companies.length / 2));
  const secondRow = companies.slice(Math.ceil(companies.length / 2));

  // Calculate total users hired
  const totalHired = companies.reduce((sum, company) => {
    const count = parseInt(company.userCount.replace('+', ''));
    return sum + count;
  }, 0);

  return (
    <div className="min-h-screen">
      <section
        className={` py-20 px-4 overflow-hidden ${className}`}
        role="region"
        aria-label="User success stories"
      >
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <header className="text-center mb-16">
            <h2 className=" text-3xl md:text-4xl font-light mb-4">{title}</h2>
            <p className="text-gray-500 text-base md:text-lg max-w-3xl mx-auto mb-8">
              {subtitle}
            </p>

            {/* Success Stats */}
            {showStats && (
              <div className="flex justify-center items-center space-x-8 text-center">
                <div className="bg-gradient-to-r from-[#253865]  to-[#4e445b]  rounded-lg px-6 py-3">
                  <div className="text-white text-2xl font-bold">
                    {totalHired.toLocaleString()}+
                  </div>
                  <div className="text-white text-sm">
                    Users Successfully Hired
                  </div>
                </div>
                <div className="bg-gradient-to-r from-[#4e445b] to-[#253865]  rounded-lg px-6 py-3">
                  <div className="text-white text-2xl font-bold">
                    {companies.length}
                  </div>
                  <div className="text-white text-sm">Top Global Companies</div>
                </div>
              </div>
            )}
          </header>

          {/* Scrolling Rows */}
          <div className="bg-[#08142e] rounded-2xl space-y-4 py-6">
            <ScrollingRow
              companies={firstRow}
              direction="left"
              animationDuration={animationDuration}
            />
            <ScrollingRow
              companies={secondRow}
              direction="right"
              animationDuration={animationDuration}
            />
          </div>

          {/* Call to Action */}
          <div className="text-center mt-12">
            <p className=" text-lg mb-4">Ready to join them?</p>
            <div className="flex items-center justify-center space-x-4">
              <Button variant="secondary" size="md">
                Create My Winning Resume
              </Button>
              <p>OR</p>
              <Button variant="secondary" size="md">
                My Winning Cover Letter
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default UserSuccessSection;
