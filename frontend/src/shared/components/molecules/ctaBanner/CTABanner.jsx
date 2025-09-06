/**
 * @file CTABanner.jsx
 * @author Nozibul Islam
 *
 * @copyright (c) 2025 ResumeLetterAI. All rights reserved.
 * @license MIT
 */

import React from 'react';
import Typography from '../../atoms/typography/Typography';
import Button from '../../atoms/buttons/Button';
import Image from 'next/image';

export const CTABanner = () => {
  return (
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
          <Typography variant="body" className="text-gray-50 text-sm mt-10">
            Boost your chances of landing your dream job. We’ll scan your resume
            for typos, provide a clear score, and give actionable suggestions to
            make it stand out. Simply upload your resume, and we’ll take care of
            the rest.
          </Typography>
          <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center md:justify-start items-center md:items-start">
            <Button className="text-xl" variant="secondary">
              Check Your Resume
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
