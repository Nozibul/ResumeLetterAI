'use client';
import React, { useEffect, useState, Children } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const slotBase = [
  'bg-white shadow-md text-gray-600 w-full max-w-[90%]',
  'z-10 bg-white shadow-md text-gray-600 w-full max-w-[95%]',
  'z-40 shadow-lg w-full text-white max-w-[100%]',
  'z-10 bg-white shadow-md text-gray-600 w-full max-w-[95%]',
  'bg-white shadow-md text-gray-600 w-full max-w-[90%]',
];

export function MotionCardContent({ children, className = '', ...props }) {
  return (
    <div className={className} {...props}>
      {children}
    </div>
  );
}

export default function MotionCards({ children, interval = 3000 }) {
  const contentArray = Children.toArray(children);
  const [cards, setCards] = useState([0, 1, 2, 3, 4]);
  const [nextId, setNextId] = useState(5);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCards((prev) => {
        const rest = prev.slice(1);
        const newCard = nextId;
        setNextId((id) => id + 1);
        return [...rest, newCard];
      });
    }, interval);
    return () => clearInterval(intervalId);
  }, [nextId, interval]);

  return (
    <div className="flex items-center justify-center relative lg:h-[520px] lg:w-[500px] md:h-[400px] md:w-[400px] sm:h-[300px] sm:w-[300px] overflow-hidden">
      <div className="flex flex-col space-y-2 relative z-10 items-center w-full justify-center h-full max-w-lg mx-auto">
        <AnimatePresence initial={false} mode="popLayout">
          {cards.map((cardId, i) => {
            const isMiddle = i === 2;
            const currentItem =
              contentArray[cardId % contentArray.length] ||
              `Item ${cardId + 1}`;
            return (
              <motion.div
                key={cardId}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{
                  duration: 0.8,
                  ease: 'easeInOut',
                  layout: { duration: 0.8 },
                }}
                className={`flex items-center rounded-2xl shadow-xl relative overflow-hidden ${slotBase[i]}`}
              >
                <motion.div
                  className="absolute inset-0 rounded-2xl -z-10"
                  initial={false}
                  animate={{
                    backgroundColor: isMiddle ? '#14b8a6' : '#ffffff',
                  }}
                  transition={{
                    duration: 1.8,
                    ease: 'easeInOut',
                  }}
                />
                <div
                  className={`w-full relative ${isMiddle ? 'text-white' : 'text-gray-600'}`}
                >
                  {currentItem}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
