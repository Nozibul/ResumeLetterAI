'use client';
/**
 * @file ResumeBuilderCTA.jsx
 * @author Nozibul Islam
 * @description Call-to-Action section for ResumeLetterAI landing page
 * @copyright (c) 2025 ResumeLetterAI
 * @license MIT
 */

import Typography from '@/shared/components/atoms/typography/Typography';
import { features, stats } from '@/local-data/cta-features';
import Button from '@/shared/components/atoms/buttons/Button';
import Image from 'next/image';

const ResumeBuilderCTA = () => {
  return (
    <section className="min-h-screen">
      <main className="px-6 sm:px-8 py-16">
        <div className="max-w-6xl mx-auto">
          {/* ===== Section Header ===== */}
          <header className="text-center mb-16">
            <Typography variant="h2">Land Your Dream Job Today!</Typography>
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

          {/* ===== Stats Section ===== */}
          <section className="bg-white rounded-2xl p-8 sm:p-12 shadow-lg border border-gray-100 mb-20">
            <div className="text-center mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Trusted by Leading Organizations
              </h3>
              <p className="text-gray-600 text-base sm:text-lg">
                Join thousands of companies already using our platform
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
              {stats.map((stat) => (
                <div key={stat.id} className="p-4">
                  <div className={`text-4xl font-bold ${stat.color} mb-3`}>
                    {stat.value}
                  </div>
                  <p className="text-gray-600 font-medium">{stat.label}</p>
                </div>
              ))}
            </div>
          </section>

          {/* ===== CTA Banner ===== */}
          <section className="bg-gradient-to-br from-[#62cbb6] to-[#2c3896] rounded-2xl  p-6 ">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4 ">
              {/* ===== Left Column: Image ===== */}
              <div className="flex justify-center md:justify-start">
                <Image
                  src="/assets/checker-image-ats.webp"
                  alt="ResumeLetterAI CTA"
                  width={500}
                  height={500}
                />
              </div>

              {/* ===== Right Column: Text + Button ===== */}
              <div className="">
                <h2 className="text-2xl sm:text-3xl font-semibold text-white mb-6">
                  Is Your Resume Ready to Beat the ATS? Check Now for Free!
                </h2>
                <Typography
                  variant="body"
                  className="text-gray-50 text-sm mt-10"
                >
                  Boost your chances of landing your dream job. We’ll scan your
                  resume for typos, provide a clear score, and give actionable
                  suggestions to make it stand out. Simply upload your resume,
                  and we’ll take care of the rest.
                </Typography>
                <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center md:justify-start items-center md:items-start">
                  <Button className="text-xl" variant="secondary">
                    Check Your Resume
                  </Button>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </section>
  );
};

export default ResumeBuilderCTA;
