'use client';

import { features } from '@/local-data/chooseUS';
import MotionCards, { MotionCardContent } from '@/components/ui/motioncards';
import Image from 'next/image';

const ChooseUsLeftSection = () => {
  return (
    <div className=" mx-auto flex flex-col items-center justify-center">
      <MotionCards interval={3000}>
        {features?.length > 0 ? (
          features.map((feature, index) => {
            return (
              <MotionCardContent key={`feature-${feature.id}-${index}`}>
                <div className="flex items-center gap-4 p-6 w-full">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full overflow-hidden shadow-sm">
                      <Image
                        src={feature.img}
                        alt={feature.title || 'Feature image'}
                        width={50}
                        height={50}
                        className="w-full h-full object-cover"
                        priority={index < 2} // Optimize loading for first 2 images
                      />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold mb-1">
                      {feature.title}
                    </h3>
                    <span className=" text-[13px] mt-2">
                      {feature.description}
                    </span>
                  </div>
                </div>
              </MotionCardContent>
            );
          })
        ) : (
          <MotionCardContent>
            <div className="p-6 text-center text-gray-500">
              <div className="w-8 h-8 border-2 border-gray-300 border-t-teal-500 rounded-full animate-spin mx-auto mb-2"></div>
              Loading features...
            </div>
          </MotionCardContent>
        )}
      </MotionCards>
    </div>
  );
};

export default ChooseUsLeftSection;
