/**
 * @file page.jsx -
 * @author Nozibul Islam
 *
 * @copyright (c) 2025 ResumeLetterAI. All rights reserved.
 * @license MIT
 */

import CategoryCard from '@/widgets/landing/categoryCard/CategoryCard';
import { HeroSection } from '@/widgets/landing/hero-section/HeroSection';
import ResumeGuide from '@/widgets/landing/resumeGuide/ResumeGuide';
import { TestimonialsSection } from '@/widgets/landing/testimonialsSection/TestimonialsSection';

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <HeroSection />
      <CategoryCard />
      <ResumeGuide />
      <TestimonialsSection />
    </main>
  );
}
