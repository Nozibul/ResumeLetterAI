'use client';
/**
 * @file BannerSlide.jsx
 * @author Nozibul Islam
 *
 * @copyright (c) 2025 ResumeLetterAI. All rights reserved.
 * @license MIT
 */

import Image from 'next/image';
import { useEffect, useState } from 'react';

const itemData = [
  {
    id: 1,
    imagePath: '/assets/banner-image/home_page_resume1.svg',
  },
  {
    id: 2,
    imagePath: '/assets/banner-image/home_page_resume2.svg',
  },
  {
    id: 3,
    imagePath: '/assets/banner-image/home_page_resume3.svg',
  },
];

const BannerSlide = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const totalSlides = itemData.length;

  // Auto-slide effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % totalSlides);
    }, 5000); // 5 seconds per slide

    return () => clearInterval(interval);
  }, []); // empty array to prevent warnings

  return (
    <>
      <div className="relative w-full lg:w-96 lg:-mt-10 md:w-80 sm:w-72 xs:w-60 h-[570px] mx-auto overflow-hidden rounded-lg">
        {itemData.map((item, ind) => (
          <div
            key={item.id}
            className={`absolute top-0 left-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
              ind === currentSlide ? 'opacity-100 ' : 'opacity-0 z-0'
            } flex justify-center items-center`}
          >
            <Image
              className="transition-transform duration-700 ease-linear hover:scale-95"
              src={item.imagePath}
              alt={`resume-image-${item.id}`}
              priority
              width={490}
              height={570}
            />
          </div>
        ))}
      </div>
    </>
  );
};

export default BannerSlide;
