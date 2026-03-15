/**
 * @file features/resume-builder/certifications/ui/CertificationsForm.jsx
 * @description Certifications form - Step 8
 * @author Nozibul Islam
 *
 * Refactored to use shared useResumeListForm hook.
 * All init, save, add/remove/update logic lives in the hook.
 * Component is responsible for UI only.
 */

'use client';

import { memo, useCallback, useMemo } from 'react';
import { useCurrentResumeData } from '@/shared/store/hooks/useResume';
import { useResumeListForm } from '@/shared/hooks/useResumeListForm';
import ATSBanner from '@/shared/components/atoms/resume/ATSBanner';
import CertificationItem from './CertificationItem';
import AddCertButton from './AddCertButton';
import {
  validateCertificationsForm,
  getCertificationQualityScore,
} from '../model/validation';
import { LIMITS } from '@/shared/lib/constants';

// ==========================================
// CONSTANTS
// ==========================================
const ATS_TIPS = [
  'List relevant certifications only (AWS, Azure, Google Cloud, etc.)',
  'Include credential URLs for verification',
  'Mention expiration dates if still valid',
  'Prioritize industry-recognized certifications',
];

// ==========================================
// HELPERS
// Defined outside component — stable reference, no re-creation on render
// createEmptyCertification passed to hook as createItem
// isNotEmpty passed as filterEmpty — blank entries excluded from Redux save
// ==========================================
function createEmptyCertification() {
  return {
    certificationName: '',
    issuer: '',
    issueDate: null,
    credentialUrl: '',
  };
}

function isNotEmpty(certification) {
  return certification.certificationName?.trim();
}

/**
 * CertificationsForm Component
 * Step 8: Certifications
 */
function CertificationsForm() {
  const resumeData = useCurrentResumeData();

  // ==========================================
  // LIST FORM HOOK
  // All init, save, add/remove/update logic lives in useResumeListForm.
  // handleAdd returns false if max limit reached — show alert in UI.
  // No reorder — certifications don't need ordering.
  // ==========================================
  const {
    items: certifications,
    handleAdd,
    handleRemove,
    handleUpdate,
  } = useResumeListForm({
    field: 'certifications',
    createItem: createEmptyCertification,
    reduxData: resumeData?.certifications,
    maxItems: LIMITS.MAX_CERTIFICATIONS,
    filterEmpty: isNotEmpty,
  });

  // ==========================================
  // VALIDATION
  // Run on current certifications for UI feedback only
  // ==========================================
  const errors = useMemo(
    () => validateCertificationsForm(certifications),
    [certifications]
  );

  const hasValidationErrors =
    Object.keys(errors).length > 0 && errors._form === undefined;

  // ==========================================
  // DERIVED STATE
  // Single source of truth — avoids mirrored/brittle conditions
  // isEmpty: no certification filled yet — show empty state UI
  // hasAnyCert: at least one certification filled — show list + add button
  // ==========================================
  const isEmpty =
    certifications.length === 1 &&
    !certifications[0]?.certificationName?.trim();
  const hasAnyCert = certifications.some((c) => c.certificationName?.trim());

  // ==========================================
  // HANDLERS
  // ==========================================
  const onAdd = useCallback(() => {
    const added = handleAdd();
    if (!added) {
      alert(`Maximum ${LIMITS.MAX_CERTIFICATIONS} certifications allowed`);
    }
  }, [handleAdd]);

  // ==========================================
  // RENDER
  // ==========================================
  return (
    <div className="space-y-6">
      {/* ATS GUIDELINES */}
      <ATSBanner title="Certifications Tips" tips={ATS_TIPS} />

      {/* VALIDATION ERRORS SUMMARY */}
      {hasValidationErrors && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm font-medium text-yellow-800 mb-2">
            ⚠️ Validation Issues:
          </p>
          <ul className="text-xs text-yellow-700 space-y-1 list-disc list-inside">
            {Object.entries(errors).map(([key, value]) => {
              if (key === '_form') return null;
              return (
                <li key={key}>
                  Certification #{parseInt(key) + 1}:{' '}
                  {typeof value === 'object' ? 'Check fields' : value}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* EMPTY STATE */}
      {isEmpty && (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <div className="max-w-sm mx-auto">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No Certifications Added
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Add professional certifications to boost your credibility
            </p>
            <div className="mt-6">
              <button
                type="button"
                onClick={onAdd}
                className="inline-flex items-center px-6 py-2.5 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
              >
                <svg
                  className="h-5 w-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Add Certification
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CERTIFICATIONS LIST */}
      {!isEmpty && (
        <div className="space-y-6">
          {certifications.map((certification, index) => {
            const qualityScore = getCertificationQualityScore(certification);
            const hasErrors =
              errors[index] && Object.keys(errors[index]).length > 0;

            return (
              <div key={index} className="relative">
                {/* Error Indicator */}
                {hasErrors && (
                  <div className="absolute -top-2 -right-2 z-10">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white text-xs font-bold">
                      !
                    </span>
                  </div>
                )}

                {/* Quality Score Badge */}
                {!hasErrors && qualityScore.score === 100 && (
                  <div className="absolute -top-2 -right-2 z-10">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500 text-white text-xs font-bold">
                      ✓
                    </span>
                  </div>
                )}

                <CertificationItem
                  index={index}
                  certification={certification}
                  onUpdate={handleUpdate}
                  onRemove={handleRemove}
                />

                {/* Quality Suggestions */}
                {qualityScore.suggestions.length > 0 && (
                  <div className="mt-2 bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-xs font-medium text-blue-800 mb-1">
                      💡 Suggestions (Score: {qualityScore.score}/100):
                    </p>
                    <ul className="text-xs text-blue-700 space-y-0.5 list-disc list-inside">
                      {qualityScore.suggestions.map((suggestion, idx) => (
                        <li key={idx}>{suggestion}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ADD BUTTON */}
      {hasAnyCert && certifications.length < LIMITS.MAX_CERTIFICATIONS && (
        <AddCertButton currentCount={certifications.length} onClick={onAdd} />
      )}
    </div>
  );
}

export default memo(CertificationsForm);
