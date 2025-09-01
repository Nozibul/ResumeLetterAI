'use client';

/**
 * @file ResumeGuide.jsx
 * @author Nozibul Islam
 *
 * @copyright (c) 2025 ResumeLetterAI. All rights reserved.
 * @license MIT
 */

import Typography from '@/shared/components/atoms/typography/Typography.jsx';
import { worksInfo } from '@/local-data/works-info';
import Icon from '@/shared/components/atoms/icons/Icon';

const ResumeGuide = () => {
  return (
    <>
      <section className="w-full p-4 text-center -mt-14">
        <Typography className="mb-2" variant="h2">
          How Create Resume
        </Typography>

        <Typography variant="body" className="text-gray-500">
          Create Resume Following 3 Simple Steps
        </Typography>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 justify-items-center w-full mt-12">
          {worksInfo?.length > 0 ? (
            worksInfo.map((work) => {
              const { id, title, description, icon } = work;

              return (
                <div className="grid justify-items-center" key={id}>
                  <div className="flex justify-center items-center relative">
                    <div className="flex h-48 w-48 sm:h-52 sm:w-52 rounded-full border-[6px] border-[#bdbbc9] justify-center items-center">
                      <Icon
                        iconName={icon}
                        size="xxl"
                        className="text-teal-600"
                      />
                    </div>
                    <div className="h-12 w-12 rounded-full bg-gradient-to-r from-teal-500 to-purple-300 text-white absolute top-[35px] right-[-6px] flex items-center justify-center">
                      0{id}
                    </div>
                  </div>
                  <div className="px-8 mt-6 text-center">
                    <Typography className="mb-2" variant="h4">
                      {title}
                    </Typography>
                    <Typography variant="caption">{description}</Typography>
                  </div>
                </div>
              );
            })
          ) : (
            <p>Loading...</p>
          )}
        </div>
      </section>
    </>
  );
};

export default ResumeGuide;
