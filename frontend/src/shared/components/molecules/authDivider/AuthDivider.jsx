/**
 * @file AuthDivider.jsx
 * @author Nozibul Islams
 */
import React from 'react';

const AuthDivider = ({ text = "Or continue with" }) => {
  return (
    <div className="relative mt-2">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-gray-300"></div>
      </div>
      <div className="relative flex justify-center text-sm">
        <span className="px-4 bg-white text-gray-500">{text}</span>
      </div>
    </div>
  );
};

export default AuthDivider;