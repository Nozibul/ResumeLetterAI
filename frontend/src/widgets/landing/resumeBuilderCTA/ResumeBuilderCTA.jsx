'use client';
/**
 * @file ResumeBuilderCTA.jsx
 * @author Nozibul Islam
 * @description Call-to-Action section for ResumeLetterAI landing page
 * @copyright (c) 2025 ResumeLetterAI
 * @license MIT
 */

import Typography from '@/shared/components/atoms/typography/Typography';
import { features } from '@/local-data/cta-features';
import { CTABanner } from '@/shared/components/molecules/ctaBanner/CTABanner';

const ResumeBuilderCTA = () => {
  return (
    <section className="min-h-screen">
      <main className="px-6 sm:px-8 py-16">
        <div className="max-w-6xl mx-auto">
          {/* ===== Section Header ===== */}
          <header className="text-center mb-16">
            <Typography variant="h2">Make Your Resume Stand Out!</Typography>
          </header>

          {/* ===== Features Grid ===== */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-12 sm:mb-16">
            {features?.map((feature) => (
              <article
                key={feature.id}
                className="text-center p-6 sm:p-8 bg-white rounded-2xl shadow-xl border border-gray-100 hover:shadow-md transition-shadow duration-300"
              >
                <div
                  className={`w-14 h-14 sm:w-16 sm:h-16 ${feature.iconBg} rounded-2xl mx-auto mb-4 sm:mb-6 flex items-center justify-center`}
                >
                  {feature.icon}
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
                  {feature.description}
                </p>
              </article>
            ))}
          </div>

          {/* ===== CTA Banner ===== */}
          <CTABanner />
        </div>
      </main>
    </section>
  );
};

export default ResumeBuilderCTA;
