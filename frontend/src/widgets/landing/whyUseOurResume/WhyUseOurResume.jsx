/**
 * @file WhyUseOurResume.jsx
 * @author Nozibul Islam
 *
 * @copyright (c) 2025 ResumeLetterAI. All rights reserved.
 * @license MIT
 */

import ChooseUsLeftSection from '@/shared/components/molecules/chooseUsLeftSection/ChooseUsLeftSection';
import { ChooseUsRightSection } from '@/shared/components/molecules/chooseUsRightSection/ChooseUsRightSection';

export const WhyUseOurResume = () => {
  return (
    <>
      <div className="mt-20 grid xl:grid-cols-2 lg:grid-cols-2 md:grid-cols-1 sm:grid-cols-1 xs:grid-cols-1 gap-8 ">
        <div>
          <ChooseUsRightSection />
        </div>
        <div>
          <ChooseUsLeftSection />
        </div>
      </div>
    </>
  );
};
