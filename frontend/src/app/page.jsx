'use client';
/**
 * @file page.jsx -
 * @author Nozibul Islam
 *
 * @copyright (c) 2025 ResumeLetterAI. All rights reserved.
 * @license MIT
 */

import CategoryCard from '@/widgets/landing/categoryCard/CategoryCard';
import { HeroSection } from '@/widgets/landing/hero-section/HeroSection';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br to-blue-50 via-white-50 ">
      <HeroSection />
      <CategoryCard />
      {/* Additional sections can be added here */}
      {/* 
      <FeaturesSection />
      <TestimonialsSection />
      <PricingSection />
      <FooterSection />
      */}
    </main>
  );
}
