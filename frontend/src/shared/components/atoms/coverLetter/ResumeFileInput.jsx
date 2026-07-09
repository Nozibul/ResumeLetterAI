/**
 * @file shared/components/atoms/coverLetter/ResumeFileInput.jsx
 * @description File picker for resume upload — client-side size check for
 * instant feedback; actual type/content validation happens server-side.
 * @author Nozibul Islam
 */

'use client';

import { useState } from 'react';
import { Upload, X, FileText } from 'lucide-react';

const ACCEPTED_TYPES = '.pdf,.docx,.txt';
const MAX_SIZE_MB = 5;

function ResumeFileInput({ file, onFileChange, error }) {
  const [localError, setLocalError] = useState(null);

  const handleChange = (e) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    if (selected.size > MAX_SIZE_MB * 1024 * 1024) {
      setLocalError(`File must be under ${MAX_SIZE_MB}MB`);
      e.target.value = ''; // allow re-selecting the same file after fixing
      return;
    }

    setLocalError(null);
    onFileChange(selected);
  };

  const handleRemove = () => {
    setLocalError(null);
    onFileChange(null);
  };

  const displayError = localError || error;

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Upload Resume
      </label>

      {!file ? (
        <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-300 rounded-lg py-6 cursor-pointer hover:border-teal-400 transition-colors">
          <Upload className="w-6 h-6 text-gray-400" />
          <span className="text-sm text-gray-500">
            Click to upload PDF, DOCX, or TXT
          </span>
          <span className="text-xs text-gray-400">Max {MAX_SIZE_MB}MB</span>
          <input
            type="file"
            accept={ACCEPTED_TYPES}
            onChange={handleChange}
            className="hidden"
          />
        </label>
      ) : (
        <div className="flex items-center justify-between border border-gray-200 rounded-lg px-4 py-3 bg-gray-50">
          <div className="flex items-center gap-2 min-w-0">
            <FileText className="w-4 h-4 text-teal-600 shrink-0" />
            <span className="text-sm text-gray-700 truncate">{file.name}</span>
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="text-gray-400 hover:text-red-500 shrink-0"
            aria-label="Remove file"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {displayError && (
        <p className="text-xs text-red-500 mt-1">{displayError}</p>
      )}
    </div>
  );
}

export default ResumeFileInput;
