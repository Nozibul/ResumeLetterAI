'use client';
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function BackgroundMeteors({
  children,
  className = '',
  minHeight = 'auto', // auto, screen, or custom value
  gridSizes = 45,
}) {
  const [beams, setBeams] = useState([]);
  const gridSize = gridSizes;
  const totalLines = 45;

  const generateSafeGridPositions = (count) => {
    const available = [];
    for (let i = 0; i < totalLines - 1; i++) {
      available.push(i);
    }

    const selected = [];
    while (available.length > 0 && selected.length < count) {
      const idx = Math.floor(Math.random() * available.length);
      const value = available[idx];
      selected.push(value);
      available.splice(
        0,
        available.length,
        ...available.filter((v) => Math.abs(v - value) > 1)
      );
    }

    return selected.map((line) => line * gridSize);
  };

  useEffect(() => {
    const generateBeams = () => {
      const count = Math.floor(Math.random() * 2) + 4;
      const xPositions = generateSafeGridPositions(count);

      const newBeams = xPositions.map((x) => ({
        id: Math.random(),
        x,
        duration: 4 + Math.random() * 1.5,
      }));

      setBeams(newBeams);

      const maxDuration = Math.max(...newBeams.map((b) => b.duration));
      setTimeout(generateBeams, (maxDuration - 0.5) * 1000);
    };

    generateBeams();
  }, []);

  const heightClass =
    minHeight === 'screen'
      ? 'min-h-screen'
      : minHeight === 'auto'
        ? 'min-h-fit'
        : minHeight;

  return (
    <section
      className={`relative w-full overflow-hidden bg-white dark:bg-black ${heightClass} ${className}`}
    >
      {/* Grid Background */}
      <div
        className="absolute inset-0"
        style={{
          backgroundSize: `${gridSize}px ${gridSize}px`,
          backgroundImage: `
      linear-gradient(30deg, transparent 40%, rgba(75, 85, 99, 0.3) 41%, rgba(75, 85, 99, 0.3) 12%, transparent 10%),
      linear-gradient(-30deg, transparent 40%, rgba(20, 184, 166, 0.3) 41%, rgba(20, 184, 166, 0.3) 12%, transparent 10%),
      linear-gradient(150deg, transparent 40%, rgba(20, 184, 166, 0.3) 41%, rgba(20, 184, 166, 0.3) 12%, transparent 10%)
    `,
        }}
      />

      {/* Dark Mode Grid */}
      <div
        className="absolute inset-0 dark:block hidden"
        style={{
          backgroundSize: `${gridSize}px ${gridSize}px`,
          backgroundImage:
            'linear-gradient(to right, #262626 1px, transparent 1px), linear-gradient(to bottom, #024e6b 1px, transparent 1px)',
        }}
      />

      {/* Radial Mask */}
      <div
        className="pointer-events-none absolute inset-0 flex items-center justify-center bg-white dark:bg-black 
        [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"
      />

      {/* Animated Beams */}
      {beams.map((b) => (
        <motion.div
          key={b.id}
          className="absolute top-0 pointer-events-none"
          style={{ left: b.x, zIndex: 2 }}
          initial={{ y: -150 }}
          animate={{ y: 'calc(100% + 250px)' }}
          transition={{
            duration: b.duration,
            ease: 'linear',
          }}
        >
          <div
            className="h-14 w-px rounded-full
              bg-gradient-to-t from-black to-transparent
              dark:from-indigo-500 dark:via-teal-500 dark:to-transparent"
            style={{ margin: '0 auto' }}
          />
        </motion.div>
      ))}

      {/* Content Container */}
      <div className="relative z-10 w-full">
        <div className="container mx-auto px-4 py-12">{children}</div>
      </div>
    </section>
  );
}
