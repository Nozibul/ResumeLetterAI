import { memo } from 'react';

const FloatingElement = memo(
  ({ children, animation = 'bounce', className = '' }) => {
    const animations = {
      bounce: 'animate-bounce [animation-duration:1.5s]',
      pulse: 'animate-pulse [animation-duration:1s]',
    };

    return (
      <div
        className={`space-x-2 px-3 py-1 rounded-full bg-teal-500 text-white absolute ${animations[animation]} ${className}`}
      >
        {children}
      </div>
    );
  }
);
export default FloatingElement;
