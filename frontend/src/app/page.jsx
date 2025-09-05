/**
 * @file page.jsx
 * @author Nozibul Islam
 *
 * @copyright (c) 2025 ResumeLetterAI. All rights reserved.
 * @license MIT
 */

import CategoryCard from '@/widgets/landing/categoryCard/CategoryCard';
import { HeroSection } from '@/widgets/landing/hero-section/HeroSection';
import ResumeFeed from '@/widgets/landing/resumeFeed/ResumeFeed';
import ResumeGuide from '@/widgets/landing/resumeGuide/ResumeGuide';
import { TestimonialsSection } from '@/widgets/landing/testimonialsSection/TestimonialsSection';
import { WhyUseOurResume } from '@/widgets/landing/whyUseOurResume/WhyUseOurResume';
import BackgroundMeteors from '@/components/ui/backgroundmeteors';
import Footer from '@/widgets/footer/Footer';
import FAQ from '@/widgets/landing/faq/FAQ';
import ResumeBuilderCTA from '@/widgets/landing/resumeBuilderCTA/ResumeBuilderCTA';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-white via-white to-teal-50">
      <HeroSection />
      <BackgroundMeteors gridSizes={120}>
        <CategoryCard />
      </BackgroundMeteors>
      <BackgroundMeteors>
        <ResumeGuide />
      </BackgroundMeteors>
      <ResumeFeed />
      <WhyUseOurResume />
      <TestimonialsSection />
      <ResumeBuilderCTA />
      <FAQ />
      <Footer />
    </main>
  );
}
