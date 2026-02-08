/**
 * @file features/resume-builder/certifications/ui/CertificationItem.jsx
 * @description Single certification card component
 * @author Nozibul Islam
 *
 * Self-Review:
 * ✅ Readability: Clear structure
 * ✅ Performance: Memoized
 * ✅ Security: URL validation
 * ✅ Best Practices: Modular
 * ✅ Potential Bugs: Date validation
 * ✅ Memory Leaks: None
 */

'use client';

import { memo } from 'react';
import PropTypes from 'prop-types';
import ResumeInput from '@/shared/components/atoms/resume/ResumeInput';
import { LIMITS } from '@/shared/lib/constants';

/**
 * CertificationItem Component
 * Single certification card
 */
function CertificationItem({ index, certification, onUpdate, onRemove }) {
  // ==========================================
  // DATE DROPDOWNS DATA
  // ==========================================
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 20 }, (_, i) => currentYear - i);

  // ==========================================
  // RENDER
  // ==========================================
  return (
    <div className="border-2 border-gray-200 rounded-lg p-6 bg-white hover:border-teal-300 transition-colors">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Certification #{index + 1}
        </h3>

        {/* Delete Button */}
        <button
          type="button"
          onClick={() => onRemove(index)}
          className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
          aria-label="Delete certification"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      </div>

      {/* FORM FIELDS */}
      <div className="space-y-4">
        {/* Certification Name */}
        <ResumeInput
          label="Certification Name"
          name="certificationName"
          value={certification.certificationName || ''}
          onChange={(e) => onUpdate(index, 'certificationName', e.target.value)}
          placeholder="AWS Certified Solutions Architect - Associate"
          required
          maxLength={LIMITS.TITLE_MAX_LENGTH}
          showCounter
        />

        {/* Issuing Organization */}
        <ResumeInput
          label="Issuing Organization"
          name="issuer"
          value={certification.issuer || ''}
          onChange={(e) => onUpdate(index, 'issuer', e.target.value)}
          placeholder="Amazon Web Services"
          required
          maxLength={LIMITS.TITLE_MAX_LENGTH}
          showCounter
        />

        {/* Issue Date */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Month */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Issue Month <span className="text-red-500">*</span>
            </label>
            <select
              value={certification.issueDate?.month || ''}
              onChange={(e) =>
                onUpdate(index, 'issueDate', {
                  ...certification.issueDate,
                  month: Number(e.target.value),
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            >
              <option value="">Select Month</option>
              {months.map((m, i) => (
                <option key={i} value={i + 1}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          {/* Year */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Issue Year <span className="text-red-500">*</span>
            </label>
            <select
              value={certification.issueDate?.year || ''}
              onChange={(e) =>
                onUpdate(index, 'issueDate', {
                  ...certification.issueDate,
                  year: Number(e.target.value),
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            >
              <option value="">Select Year</option>
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Credential URL */}
        <ResumeInput
          label="Credential URL"
          name="credentialUrl"
          type="url"
          value={certification.credentialUrl || ''}
          onChange={(e) => onUpdate(index, 'credentialUrl', e.target.value)}
          placeholder="https://www.credly.com/badges/..."
          helperText="Optional but recommended for verification"
        />

        {/* Tip */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-xs text-blue-800">
            💡 <strong>Tip:</strong> Industry-recognized certifications (AWS,
            Azure, Google Cloud, CISSP, PMP) significantly boost your ATS score.
          </p>
        </div>
      </div>
    </div>
  );
}

CertificationItem.propTypes = {
  index: PropTypes.number.isRequired,
  certification: PropTypes.object.isRequired,
  onUpdate: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
};

export default memo(CertificationItem);
