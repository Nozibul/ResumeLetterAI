/**
 * @file widgets/cover-letter/PreviewPanel.jsx
 * @description Right panel — shows analysis animation, then streams
 * the generated cover letter, then shows action buttons.
 * @author Nozibul Islam
 */

'use client';

import { memo } from 'react';
import { FileText } from 'lucide-react';
import Button from '@/shared/components/atoms/buttons/Button';
import AnalysisStepper from '@/shared/components/molecules/analysisStepper/AnalysisStepper';

function PreviewPanel({
  stage, // 'idle' | 'analyzing' | 'generating' | 'complete'
  streamedContent,
  onStepperComplete,
  onCopy,
  onSave,
  onRegenerate,
  isSaved,
}) {
  return (
    <div className="flex flex-col h-full p-6 bg-gray-50 rounded-lg">
      {/* Empty state */}
      {stage === 'idle' && (
        <div className="flex flex-1 flex-col items-center justify-center text-center text-gray-400">
          <FileText className="w-12 h-12 mb-3" />
          <p className="text-sm">
            Your cover letter will appear here once generated.
          </p>
        </div>
      )}

      {/* Analysis animation */}
      {stage === 'analyzing' && (
        <AnalysisStepper onComplete={onStepperComplete} />
      )}

      {/* Streaming / complete — document style card */}
      {(stage === 'generating' || stage === 'complete') && (
        <div className="flex flex-col flex-1">
          <div
            className="
              flex-1 bg-white rounded-lg shadow-sm border border-gray-200
              p-8 overflow-y-auto animate-scaleIn
              whitespace-pre-wrap text-sm text-gray-800 leading-relaxed
            "
          >
            {streamedContent}
            {stage === 'generating' && (
              <span className="inline-block w-1.5 h-4 bg-teal-500 ml-0.5 animate-pulse" />
            )}
          </div>

          {stage === 'complete' && (
            <div className="flex gap-3 mt-4">
              <Button variant="secondary" size="sm" onClick={onCopy}>
                Copy
              </Button>
              <Button
                variant={isSaved ? 'outline' : 'primary'}
                size="sm"
                onClick={onSave}
                disabled={isSaved}
              >
                {isSaved ? 'Saved' : 'Save'}
              </Button>
              <Button variant="outline" size="sm" onClick={onRegenerate}>
                Regenerate
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default memo(PreviewPanel);
