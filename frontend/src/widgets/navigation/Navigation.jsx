'use client';

import Link from 'next/link';
import { useState } from 'react';

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';

import Button from '@/shared/components/atoms/buttons/Button';
import clsx from 'clsx';
import Typography from '@/shared/components/atoms/typography/Typography';
import Image from 'next/image';
import { COMPANY_INFO } from '@/local-data/footer-data';
import { useIsAuthenticated } from '@/shared/store/hooks/useAuth';


const components = [
  {
    title: 'Alert Dialog',
    href: '#',
    description: 'A modal dialog that interrupts the user.',
  },
  {
    title: 'Hover Card',
    href: '#',
    description: 'Preview content available behind a link.',
  },
  {
    title: 'Progress',
    href: '#',
    description: 'Show progress of a task with a bar.',
  },
];

export function Navigation() {
  const isAuthenticated = useIsAuthenticated();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  return (
    <nav className="sticky top-0 z-50 w-full bg-white shadow-md">
      <div className="mx-auto">
        <div className="flex items-center justify-between mx-10 h-20">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link
              href="/"
              className="flex items-center gap-2 text-md font-bold"
            >
              <Image
                src={COMPANY_INFO.logo}
                alt="Logo"
                width={50}
                height={50}
              />
              {/* ResumeLetterAI */}
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <NavigationMenu>
              <NavigationMenuList className="flex items-center gap-2">
                {/* Home */}
                <NavigationMenuItem>
                  <NavigationMenuLink
                    asChild
                    className={clsx(navigationMenuTriggerStyle(), 'text-sm')}
                  >
                    <Link href="/">Home</Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>

                {/* Resume Templates */}
                <NavigationMenuItem>
                  <NavigationMenuLink
                    asChild
                    className={clsx(navigationMenuTriggerStyle(), 'text-sm')}
                  >
                    <Link href="/resume-templates">Resume Templates</Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>

                {/* Cover Letter */}
                <NavigationMenuItem>
                  <NavigationMenuLink
                    asChild
                    className={clsx(navigationMenuTriggerStyle(), 'text-sm')}
                  >
                    <Link href="/cover-letter-AI">Cover Letter</Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>

                {/* Consultant */}
                <NavigationMenuItem>
                  <NavigationMenuLink
                    asChild
                    className={clsx(navigationMenuTriggerStyle(), 'text-sm')}
                  >
                    <Link href="/consultant">Consultant</Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>

                {/* Career Craft Dropdown */}
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="text-sm">
                    Career Craft
                  </NavigationMenuTrigger>
                  <NavigationMenuContent className="z-50 bg-white shadow-lg border-none rounded-md p-2">
                    <ul className="w-[300px]">
                      {components.map((component) => (
                        <ListItem
                          key={component.title}
                          title={component.title}
                          href={component.href}
                        >
                          {component.description}
                        </ListItem>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>

        {/* Desktop Auth Button */}
          {
            isAuthenticated ? (
              <div className="hidden md:block">
                <Link href="/dashboard">
                  <Button variant="primary" size="loging_md">
                   Dashboard
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="hidden md:block">
                <Link href="/login">
                  <Button variant="primary" size="loging_md">
                    SIGN IN 
                  </Button>
                </Link>
              </div>
            )
          }

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {/* Hamburger icon */}
              <svg
                className={`${isMobileMenuOpen ? 'hidden' : 'block'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
              {/* Close icon */}
              <svg
                className={`${isMobileMenuOpen ? 'block' : 'hidden'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t border-gray-200">
              {/* Mobile Menu Items */}
              <Link
                href="#"
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                href="/resume-templates"
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Resume Templates
              </Link>
              <Link
                href="/cover-letter-AI"
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Cover Letter
              </Link>
              <Link
                href="/consultant"
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Consultant
              </Link>

              {/* Mobile Career Craft submenu */}
              <div className="px-3 py-2">
                <div className="text-base font-medium text-gray-700 mb-2">
                  Career Craft
                </div>
                <div className="space-y-1 pl-4">
                  {components.map((component) => (
                    <Link
                      key={component.title}
                      href={component.href}
                      className="block px-2 py-1 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <div className="font-medium">{component.title}</div>
                      <div className="text-xs text-gray-500">
                        {component.description}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Mobile Auth Button */}
              <div className="px-3 py-2">
                <Link
                  href="/dashboard"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Button variant="primary" size="md" className="w-full">
                    Dashboard
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

/* Optimized reusable ListItem component */
function ListItem({ title, children, href }) {
  return (
    <li>
      <NavigationMenuLink asChild>
        <Link
          href={href}
          className="rounded-md p-2 no-underline transition-colors hover:bg-slate-100 focus:bg-slate-100"
        >
          {title && <div className="text-sm font-medium">{title}</div>}
          {children && <Typography variant="caption">{children}</Typography>}
        </Link>
      </NavigationMenuLink>
    </li>
  );
}