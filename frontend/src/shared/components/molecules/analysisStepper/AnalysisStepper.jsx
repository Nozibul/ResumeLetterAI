/**
 * @file shared/components/molecules/analysisStepper/AnalysisStepper.jsx
 * @description Shows a staged "thinking" animation before the generated
 * cover letter appears. The first two steps loop indefinitely while the
 * real backend extraction call (Stage 1) is in flight — duration varies
 * 10-20s+ depending on the model, so this is NOT a fixed-duration fake
 * animation. It only advances to the final step and notifies the parent
 * once the backend actually signals Stage 2 ('writing') has started.
 * @author Nozibul Islam
 */

'use client';

import { useEffect, useRef, useState } from 'react';
import { Check, Loader2 } from 'lucide-react';

const STEPS = [
  { id: 'analyze', label: 'Analyzing job requirements' },
  { id: 'match', label: 'Matching with your experience' },
  { id: 'write', label: 'Writing your cover letter' },
];

// Duration per loop tick between the first two steps. Deliberately not
// tied to real backend timing — extraction takes ~10-20s and varies per
// request, so this just needs to feel alive, not accurate.
const LOOP_TICK_MS = 1800;

// Small pause so the user actually sees the final step light up before
// the parent swaps this component out for the streaming view.
const FINAL_STEP_HOLD_MS = 500;

/**
 * @param {string|null} backendPhase - 'analyzing' | 'writing' | null,
 *   forwarded from the SSE 'stage' events the backend sends. Anything
 *   other than 'writing' is treated as "still waiting."
 * @param {Function} onComplete - called exactly once, after the backend
 *   signals 'writing' has begun.
 */
function AnalysisStepper({ backendPhase, onComplete }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const hasCompletedRef = useRef(false);

  // Effect 1 — loops between step 0 and step 1 while waiting for the
  // backend. Stops looping (returns early, no new timer) once
  // backendPhase becomes 'writing'.
  useEffect(() => {
    if (backendPhase === 'writing') return;

    const timer = setTimeout(() => {
      setActiveIndex((prev) => (prev + 1) % (STEPS.length - 1));
    }, LOOP_TICK_MS);

    return () => clearTimeout(timer);
  }, [activeIndex, backendPhase]);

  // Effect 2 — fires exactly once when the backend actually starts
  // writing. Deliberately does NOT depend on activeIndex, so setting
  // activeIndex below doesn't cause this effect to re-run and cancel
  // its own timer before onComplete fires.
  useEffect(() => {
    if (backendPhase !== 'writing' || hasCompletedRef.current) return;

    hasCompletedRef.current = true;
    setActiveIndex(STEPS.length - 1);

    const timer = setTimeout(() => onComplete?.(), FINAL_STEP_HOLD_MS);
    return () => clearTimeout(timer);
  }, [backendPhase, onComplete]);

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
