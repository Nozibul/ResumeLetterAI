"use client";
/**
 * @file FooterWrapper.jsx
 * @description Conditional footer rendering based on current pathname
 * @author Nozibul Islam
 */

import { usePathname } from 'next/navigation';

export default function FooterWrapper({ children, hideOn = [] }) {
  const pathname = usePathname();
  
  // Check if current path matches any of the hideOn paths
  const shouldHide = hideOn.some(path => pathname.startsWith(path));
  
  // If should hide, return nothing
  if (shouldHide) {
    return null;
  }
  
  // Otherwise, render the footer
  return <>{children}</>;
}