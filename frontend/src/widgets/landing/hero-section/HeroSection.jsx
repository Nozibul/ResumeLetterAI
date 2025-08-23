/**
 * @file HeroSection.jsx
 * @author Nozibul Islam
 *
 * @copyright (c) 2025 ResumeLetterAI. All rights reserved.
 * @license MIT
 */

'use client';

import BackgroundAnimation from '@/shared/components/atoms/backgroundAnimation/BackgroundAnimation';
import Button from '@/shared/components/atoms/buttons/Button';
import FeatureBadge from '@/shared/components/molecules/featureBadge/FeatureBadge';
import Icon from '@/shared/components/atoms/icons/Icon';
import RatingDisplay from '@/shared/components/atoms/ratingDisplay/RatingDisplay';
import TrustIndicator from '@/shared/components/atoms/trustIndicator/TrustIndicator';
import Typography from '@/shared/components/atoms/typography/Typography';
import FloatingElement from '@/shared/components/atoms/foatingElement/FloatingElement';
import BannerSlide from './bannerSlide/BannerSlide';

export const HeroSection = () => {
  return (
    <section>
      <BackgroundAnimation>
        {/* <div className="relative z-10"> */}
        <div className="grid grid-cols-1 md:grid-cols-5 w-full min-h-screen p-8 gap-6">
          {/* Left Section */}
          <div className="md:col-span-3 space-y-12">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 w-full">
              <TrustIndicator text="Users trust us" value="1.1k+" />
              <RatingDisplay rating={4.9} totalReviews="1.1k" />
            </div>

            <div className="space-y-4">
              <Typography variant="h2">
                Build Your Professional Resume in Minutes
              </Typography>
              <Typography variant="body">
                Create a standout resume with our AI-powered builder. Choose
                from professional templates, customize your content, and
                download in minutes.
              </Typography>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center pt-6 gap-6 w-full">
              <Button
                variant="primary"
                size="md"
                icon={
                  <Icon
                    iconName="sparkles"
                    className="group-hover:animate-spin"
                  />
                }
                className="group"
              >
                Build My Resume Free
              </Button>
              <Button
                variant="secondary"
                size="md"
                icon={<Icon iconName="play" />}
              >
                Cover Letter
              </Button>
            </div>

            <div className="flex flex-wrap gap-4">
              <FeatureBadge text="30-min build" icon="zap" />
              <FeatureBadge text="ATS-friendly" icon="edit" color="green" />
              <FeatureBadge
                text="Free download"
                icon="download"
                color="purple"
              />
            </div>
          </div>

          {/* Right Section */}
          <div className="md:col-span-2 flex justify-center md:justify-end items-center">
            <BannerSlide />
            <FloatingElement>AI-Powered</FloatingElement>
          </div>
        </div>
      </BackgroundAnimation>
    </section>
  );
};
