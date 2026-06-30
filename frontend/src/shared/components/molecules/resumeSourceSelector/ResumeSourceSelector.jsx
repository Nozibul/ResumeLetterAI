/**
 * @file shared/components/molecules/resumeSourceSelector/ResumeSourceSelector.jsx
 * @description Lets user choose how to provide their resume —
 * from a saved resume, pasted text, or file upload.
 * @author Nozibul Islam
 */

'use client';

import { memo } from 'react';
import PropTypes from 'prop-types';
import { FileText, ClipboardPaste, Upload } from 'lucide-react';

const SOURCES = [
  { value: 'db', label: 'Saved Resume', icon: FileText },
  { value: 'paste', label: 'Paste Text', icon: ClipboardPaste },
  { value: 'upload', label: 'Upload File', icon: Upload },
];

function ResumeSourceSelector({ value, onChange, hasResumes }) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {SOURCES.map(({ value: srcValue, label, icon: Icon }) => {
        const isDisabled = srcValue === 'db' && !hasResumes;
        const isSelected = value === srcValue;

        return (
          <button
            key={srcValue}
            type="button"
            disabled={isDisabled}
            onClick={() => onChange(srcValue)}
            className={`
              flex flex-col items-center justify-center gap-1.5
              px-3 py-4 rounded-lg border-2 transition-all duration-200
              disabled:opacity-40 disabled:cursor-not-allowed
              ${
                isSelected
                  ? 'border-teal-500 bg-teal-50 text-teal-700'
                  : 'border-gray-200 text-gray-500 hover:border-gray-300'
              }
            `}
          >
            <Icon className="w-5 h-5" />
            <span className="text-xs font-medium">{label}</span>
          </button>
        );
      })}
    </div>
  );
}

ResumeSourceSelector.propTypes = {
  value: PropTypes.oneOf(['db', 'paste', 'upload']).isRequired,
  onChange: PropTypes.func.isRequired,
  hasResumes: PropTypes.bool,
};

ResumeSourceSelector.defaultProps = {
  hasResumes: false,
};

export default memo(ResumeSourceSelector);
