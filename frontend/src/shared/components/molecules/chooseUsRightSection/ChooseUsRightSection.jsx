'use client';

import Image from 'next/image';
import Button from '../../atoms/buttons/Button';

/**
 * @file ChooseUsRightSection.jsx
 * @author Nozibul Islam
 *
 * @copyright (c) 2025 ResumeLetterAI. All rights reserved.
 * @license MIT
 */

export const ChooseUsRightSection = () => {
  return (
    <>
      <div className="px-12 w-full mx-auto">
        <div className=" -mt-16">
          <Image
            src="/assets/choose-us/why.png"
            alt="why-use-our-resume"
            width={400}
            height={400}
            className="w-full rounded-xl"
          />
        </div>

        <div className="mt-10">
          <p className="text-gray-600 text-sm">
            Build your resume effortlessly with our simple, professional tool.
            Export unlimited templates for free, and never worry about losing
            progress—autosave has you covered. Create job-winning resumes in
            minutes, no design skills needed!
          </p>
        </div>
        {/* Button Center */}

        <Button variant="primary" size="md" className="mt-10">
          Try It Out Yourself
        </Button>
      </div>
    </>
  );
};
