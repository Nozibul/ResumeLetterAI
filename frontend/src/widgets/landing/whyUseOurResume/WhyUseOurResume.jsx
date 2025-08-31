/**
 * @file WhyUseOurResume.jsx
 * @author Nozibul Islam
 *
 * @copyright (c) 2025 ResumeLetterAI. All rights reserved.
 * @license MIT
 */

import ChooseUsLeftSection from '@/shared/components/molecules/chooseUsLeftSection/ChooseUsLeftSection';
import { ChooseUsRightSection } from '@/shared/components/molecules/chooseUsRightSection/ChooseUsRightSection';
import Image from 'next/image';

export const WhyUseOurResume = () => {
  return (
    <>
      <div className="mx-8 p-6 mt-12 grid xl:grid-cols-2 lg:grid-cols-2 md:grid-cols-1 sm:grid-cols-1 xs:grid-cols-1 gap-4 ">
        <div className="">
          <ChooseUsLeftSection />
        </div>
        <div>
          <ChooseUsRightSection />
        </div>
      </div>
    </>
  );
};
