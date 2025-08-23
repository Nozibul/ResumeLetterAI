'use client';

import Link from 'next/link';

import { CircleCheckIcon, CircleHelpIcon, CircleIcon } from 'lucide-react';

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';

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
  {
    title: 'Scroll-area',
    href: '#',
    description: 'Separate and scroll long content.',
  },
  {
    title: 'Tabs',
    href: '#',
    description: 'Organize content in tab panels.',
  },
  {
    title: 'Tooltip',
    href: '#',
    description: 'Show info when hovering or focusing.',
  },
];

export function Navigation() {
  return (
    <nav className={`sticky top-0 z-100 w-full bg-white shadow-md`}>
      <div className="container flex items-center justify-between py-6">
        {/* Logo (Home button) */}
        <Link href="/" className="flex items-center gap-2 text-lg font-bold">
          <CircleCheckIcon className="h-6 w-6 text-blue-600" />
          <span>ResumeAI</span>
        </Link>

        {/* Navigation Menu */}
        <NavigationMenu>
          <NavigationMenuList>
            {/* Home */}
            <NavigationMenuItem>
              <NavigationMenuTrigger>Home</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid gap-2 p-4 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                  <li className="row-span-3">
                    <NavigationMenuLink asChild>
                      <Link
                        href="/"
                        className="flex h-full w-full flex-col justify-end rounded-md bg-gradient-to-b from-slate-50 to-slate-100 p-6 shadow-sm"
                      >
                        <div className="mb-2 text-lg font-medium">ResumeAI</div>
                        <p className="text-sm text-muted-foreground">
                          Beautifully designed SaaS app to build resumes with
                          AI.
                        </p>
                      </Link>
                    </NavigationMenuLink>
                  </li>
                  <ListItem href="#" title="Introduction">
                    Re-usable resume components with Tailwind CSS.
                  </ListItem>
                  <ListItem href="#" title="Installation">
                    Install dependencies & set up your workspace.
                  </ListItem>
                  <ListItem href="#" title="Typography">
                    Prebuilt styles for headings, paragraphs, lists...
                  </ListItem>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>

            {/* Components */}
            <NavigationMenuItem>
              <NavigationMenuTrigger>Components</NavigationMenuTrigger>
              <NavigationMenuContent className="z-50 bg-white shadow-lg rounded-md p-4">
                <ul className="grid w-[500px] gap-2 p-4 md:grid-cols-2">
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

            {/* Docs */}
            <NavigationMenuItem>
              <NavigationMenuLink
                asChild
                className={navigationMenuTriggerStyle()}
              >
                <Link href="#">Docs</Link>
              </NavigationMenuLink>
            </NavigationMenuItem>

            {/* List */}
            <NavigationMenuItem>
              <NavigationMenuTrigger>List</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-[300px] gap-4 p-4">
                  <ListItem href="#" title="Components">
                    Browse all components in the library.
                  </ListItem>
                  <ListItem href="#" title="Documentation">
                    Learn how to use the library.
                  </ListItem>
                  <ListItem href="#" title="Blog">
                    Read our latest blog posts.
                  </ListItem>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>

            {/* Simple */}
            <NavigationMenuItem>
              <NavigationMenuTrigger>Simple</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-[200px] gap-4 p-4">
                  <ListItem href="#" title="Components" />
                  <ListItem href="#" title="Documentation" />
                  <ListItem href="#" title="Blocks" />
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>

            {/* With Icon */}
            <NavigationMenuItem>
              <NavigationMenuTrigger>With Icon</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-[220px] gap-4 p-4">
                  <ListItem href="#" title="Backlog">
                    <CircleHelpIcon className="mr-2 inline h-4 w-4" />
                  </ListItem>
                  <ListItem href="#" title="To Do">
                    <CircleIcon className="mr-2 inline h-4 w-4" />
                  </ListItem>
                  <ListItem href="#" title="Done">
                    <CircleCheckIcon className="mr-2 inline h-4 w-4" />
                  </ListItem>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
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
          className="block select-none rounded-md p-2 leading-snug no-underline outline-none transition-colors hover:bg-slate-100 focus:bg-slate-100"
        >
          {title && <div className="text-sm font-medium">{title}</div>}
          {children && (
            <p className="line-clamp-2 text-sm text-muted-foreground">
              {children}
            </p>
          )}
        </Link>
      </NavigationMenuLink>
    </li>
  );
}
