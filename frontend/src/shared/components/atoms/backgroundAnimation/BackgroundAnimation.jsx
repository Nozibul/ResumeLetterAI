/**
 * @file BackgroundAnimation.jsx
 * @author Nozibul Islam
 *
 * @copyright (c) 2025 ResumeLetterAI. All rights reserved.
 * @license MIT
 */

const BackgroundAnimation = ({ children }) => {
  return (
    <div className="relative min-h-screen  flex items-center justify-center overflow-hidden">
      {/* Grid Pattern Background */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px',
        }}
      ></div>

      {/* Animated Blob Elements - Using inline styles for guaranteed animation */}
      <div
        className="absolute top-20 right-10 w-64 h-64 bg-teal-200 rounded-full mix-blend-multiply filter blur-xl opacity-70"
        style={{
          animation: 'blob 7s infinite ease-in-out',
        }}
      ></div>

      <div
        className="absolute bottom-20 left-20 w-64 h-64 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-70"
        style={{
          animation: 'blob 7s infinite ease-in-out',
          animationDelay: '4s',
        }}
      ></div>

      {/* Content from props or default */}
      {children ? (
        <div className="relative z-10 w-full h-full flex items-center justify-center">
          {children}
        </div>
      ) : null}

      {/* CSS Animations - Inline for guaranteed working */}
      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
      `}</style>
    </div>
  );
};

export default BackgroundAnimation;
