/**
 * @file Header.jsx - File's purpose
 * @author Nozibul Islam
 *
 * @copyright (c) 2025 ResumeLetterAI. All rights reserved.
 * @license MIT
 */

import Image from "next/image";
import Link from "next/link";

const Header = () => {
  return (
    <header className="p-4 bg-white shadow-md">
      <nav className="container mx-auto flex justify-between items-center">
        <Link href="/" className="flex items-center space-x-2">
          <Image
            src="/logo.svg"
            alt="ResumeLetterAI Logo"
            width={40}
            height={40}
            priority // Add priority if the logo is in the LCP (Largest Contentful Paint)
          />
          <span className="text-xl font-bold">ResumeLetterAI</span>
        </Link>

        {/* Navigation links go here */}
        <div>
          <Link href="/login" className="mr-4">
            Login
          </Link>
          <Link
            href="/register"
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Sign Up
          </Link>
        </div>
        {/*  */}
      </nav>
    </header>
  );
};

export default Header;
