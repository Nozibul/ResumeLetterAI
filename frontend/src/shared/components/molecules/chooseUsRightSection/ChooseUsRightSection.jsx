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
      <div>
        <div className=" p-4 mt-2">
          <Image
            src="/assets/choose-us/why.png"
            alt="why-use-our-resume"
            width={400}
            height={400}
            className="w-full rounded-xl"
          />
        </div>

        <div className="mt-4">
          <small className="text-gray-600 ">
            Build your resume effortlessly with our simple, professional tool.
            Export unlimited templates for free, showcase your skills your way,
            and never worry about losing progress—autosave has you covered.
            Create job-winning resumes in minutes, no design skills needed!
          </small>
        </div>
        {/* Button Center */}

        <Button variant="primary" size="md" className="mt-4">
          Try It Out Yourself
        </Button>
      </div>
    </>
  );
};
