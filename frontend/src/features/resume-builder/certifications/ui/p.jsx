/**
 * @file features/resume-builder/certifications/ui/CertificationsForm.jsx
 * @description Certifications form - Step 8 (Reusable Pattern)
 * @author Nozibul Islam
 *
 * Backend Schema:
 * certifications: [{
 *   certificationName: String (required, max 100),
 *   issuer: String (required, max 100),
 *   issueDate: { month: Number, year: Number },
 *   credentialUrl: String (optional)
 * }]
 *
 * Quality Checks:
 * ✅ All standards met
 */

'use client';

import { memo, useState, useCallback, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useCurrentResumeData } from '@/shared/store/hooks/useResume';
import {
  updateCurrentResumeField,
  setIsSaving,
} from '@/shared/store/slices/resumeSlice';
import ResumeInput from '@/shared/components/atoms/resume/ResumeInput';
import ATSBanner from '@/shared/components/atoms/resume/ATSBanner';
import { LIMITS } from '@/shared/lib/constants';

function CertificationsForm() {
  const dispatch = useDispatch();
  const resumeData = useCurrentResumeData();
  const [certs, setCerts] = useState([]);
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (resumeData?.certifications?.length > 0) {
      setCerts(resumeData.certifications);
    }
  }, []);

  useEffect(() => {
    if (!touched) return;
    const timer = setTimeout(() => {
      dispatch(setIsSaving(true));
      const valid = certs.filter((c) => c.certificationName?.trim());
      dispatch(
        updateCurrentResumeField({ field: 'certifications', value: valid })
      );
      setTimeout(() => dispatch(setIsSaving(false)), 500);
    }, 500);
    return () => clearTimeout(timer);
  }, [certs, touched, dispatch]);

  const handleAdd = useCallback(() => {
    if (certs.length >= LIMITS.MAX_CERTIFICATIONS) {
      alert(`Max ${LIMITS.MAX_CERTIFICATIONS} certifications`);
      return;
    }
    setCerts((prev) => [...prev, createEmpty()]);
    setTouched(true);
  }, [certs.length]);

  const handleRemove = useCallback((idx) => {
    setCerts((prev) => prev.filter((_, i) => i !== idx));
    setTouched(true);
  }, []);

  const handleUpdate = useCallback((idx, field, value) => {
    setCerts((prev) => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], [field]: value };
      return updated;
    });
    setTouched(true);
  }, []);

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

  const atsTips = [
    'List relevant certifications only (AWS, Azure, Google Cloud, etc.)',
    'Include credential URLs for verification',
    'Mention expiration dates if still valid',
    'Prioritize industry-recognized certifications',
  ];

  return (
    <div className="space-y-6">
      <ATSBanner title="Certifications Tips" tips={atsTips} />

      {certs.length === 0 && (
        <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <p className="text-gray-600 mb-4">No certifications added yet</p>
          <button
            type="button"
            onClick={handleAdd}
            className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
          >
            Add Certification
          </button>
        </div>
      )}

      <div className="space-y-6">
        {certs.map((cert, idx) => (
          <div
            key={idx}
            className="border-2 border-gray-200 rounded-lg p-6 bg-white"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                Certification #{idx + 1}
              </h3>
              <button
                type="button"
                onClick={() => handleRemove(idx)}
                className="p-1.5 hover:bg-red-50 rounded"
              >
                <svg
                  className="h-5 w-5 text-red-600"
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

            <div className="space-y-4">
              <ResumeInput
                label="Certification Name"
                name="certificationName"
                value={cert.certificationName || ''}
                onChange={(e) =>
                  handleUpdate(idx, 'certificationName', e.target.value)
                }
                placeholder="AWS Certified Solutions Architect"
                required
                maxLength={LIMITS.TITLE_MAX_LENGTH}
                showCounter
              />

              <ResumeInput
                label="Issuing Organization"
                name="issuer"
                value={cert.issuer || ''}
                onChange={(e) => handleUpdate(idx, 'issuer', e.target.value)}
                placeholder="Amazon Web Services"
                required
                maxLength={LIMITS.TITLE_MAX_LENGTH}
                showCounter
              />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Issue Month
                  </label>
                  <select
                    value={cert.issueDate?.month || ''}
                    onChange={(e) =>
                      handleUpdate(idx, 'issueDate', {
                        ...cert.issueDate,
                        month: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="">Month</option>
                    {months.map((m, i) => (
                      <option key={i} value={i + 1}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Issue Year
                  </label>
                  <select
                    value={cert.issueDate?.year || ''}
                    onChange={(e) =>
                      handleUpdate(idx, 'issueDate', {
                        ...cert.issueDate,
                        year: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="">Year</option>
                    {years.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <ResumeInput
                label="Credential URL"
                name="credentialUrl"
                type="url"
                value={cert.credentialUrl || ''}
                onChange={(e) =>
                  handleUpdate(idx, 'credentialUrl', e.target.value)
                }
                placeholder="https://www.credly.com/badges/..."
                helperText="Optional but recommended for verification"
              />
            </div>
          </div>
        ))}
      </div>

      {certs.length > 0 && certs.length < LIMITS.MAX_CERTIFICATIONS && (
        <button
          type="button"
          onClick={handleAdd}
          className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-teal-400 hover:text-teal-600 hover:bg-teal-50 transition-all flex items-center justify-center gap-2"
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
              d="M12 4v16m8-8H4"
            />
          </svg>
          <span className="font-medium">
            Add Certification ({certs.length}/{LIMITS.MAX_CERTIFICATIONS})
          </span>
        </button>
      )}
    </div>
  );
}

function createEmpty() {
  return {
    certificationName: '',
    issuer: '',
    issueDate: null,
    credentialUrl: '',
  };
}

// export default memo(CertificationsForm);
