/**
 * @file shared/components/molecules/analysisStepper/AnalysisStepper.jsx
 * @description Shows a staged "thinking" animation before the generated
 * cover letter appears. Purely presentational — the backend makes a
 * single API call; this creates the perception of multi-step reasoning
 * (analyze → match → write) without extra cost or latency.
 * @author Nozibul Islam
 */

'use client';

import { useEffect, useState } from 'react';
import { Check, Loader2 } from 'lucide-react';

const STEPS = [
  { id: 'analyze', label: 'Analyzing job requirements' },
  { id: 'match', label: 'Matching with your experience' },
  { id: 'write', label: 'Writing your cover letter' },
];

const STEP_DURATION_MS = 1200;

function AnalysisStepper({ onComplete }) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    // Last step stays visible — parent decides when to actually
    // switch to streaming output via onComplete.
    if (activeIndex >= STEPS.length - 1) {
      onComplete?.();
      return;
    }

    const timer = setTimeout(() => {
      setActiveIndex((prev) => prev + 1);
    }, STEP_DURATION_MS);

    return () => clearTimeout(timer);
  }, [activeIndex, onComplete]);

  return (
    <div className="flex flex-col gap-3 py-8">
      {STEPS.map((step, index) => {
        const isDone = index < activeIndex;
        const isActive = index === activeIndex;
        const isPending = index > activeIndex;

        return (
          <div
            key={step.id}
            className="flex items-center gap-3 animate-fadeInUp"
            style={{ animationDelay: `${index * 150}ms` }}
          >
            <span
              className={`
                flex items-center justify-center w-6 h-6 rounded-full shrink-0
                ${isDone ? 'bg-teal-500 text-white' : ''}
                ${isActive ? 'bg-teal-100 text-teal-600' : ''}
                ${isPending ? 'bg-gray-100 text-gray-300' : ''}
              `}
            >
              {isDone && <Check className="w-3.5 h-3.5" />}
              {isActive && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            </span>

            <span
              className={`
                text-sm
                ${isDone ? 'text-gray-500' : ''}
                ${isActive ? 'text-gray-900 font-medium' : ''}
                ${isPending ? 'text-gray-300' : ''}
              `}
            >
              {step.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default AnalysisStepper;
