/**
 * @file widgets/cover-letter/InputPanel.jsx
 * @description Left panel — collects resume, job description, and tone
 * @author Nozibul Islam
 */

'use client';

import { memo } from 'react';
import Button from '@/shared/components/atoms/buttons/Button';
import CoverLetterTextarea from '@/shared/components/atoms/coverLetter/CoverLetterTextarea';
import CoverLetterDropdown from '@/shared/components/atoms/coverLetter/CoverLetterDropdown';
import ResumeSourceSelector from '@/shared/components/molecules/resumeSourceSelector/ResumeSourceSelector';

const TONE_OPTIONS = [
  { value: 'professional', label: 'Professional' },
  { value: 'creative', label: 'Creative' },
  { value: 'concise', label: 'Concise' },
  { value: 'enthusiastic', label: 'Enthusiastic' },
  { value: 'formal', label: 'Formal' },
];

function InputPanel({
  resumeSource,
  onResumeSourceChange,
  hasResumes,
  selectedResumeId,
  onSelectedResumeChange,
  savedResumes,
  resumeText,
  onResumeTextChange,
  jobDescription,
  onJobDescriptionChange,
  tone,
  onToneChange,
  onGenerate,
  isGenerating,
  errors,
}) {
  const canGenerate =
    jobDescription.trim().length >= 50 &&
    (resumeSource === 'db'
      ? !!selectedResumeId
      : resumeText.trim().length >= 100);

  return (
    <div className="flex flex-col gap-5 p-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Resume Source
        </label>
        <ResumeSourceSelector
          value={resumeSource}
          onChange={onResumeSourceChange}
          hasResumes={hasResumes}
        />
      </div>

      {resumeSource === 'db' && hasResumes && (
        <CoverLetterDropdown
          label="Select Resume"
          name="resumeId"
          value={selectedResumeId || ''}
          onChange={(e) => onSelectedResumeChange(e.target.value)}
          options={savedResumes.map((r) => ({
            value: r._id,
            label: r.title,
          }))}
        />
      )}

      {resumeSource !== 'db' && (
        <CoverLetterTextarea
          label={
            resumeSource === 'upload' ? 'Or Paste Resume Text' : 'Resume Text'
          }
          name="resumeText"
          value={resumeText}
          onChange={(e) => onResumeTextChange(e.target.value)}
          placeholder="Paste your resume content here..."
          rows={6}
          maxLength={8000}
          required
          error={errors.resumeText}
          touched
          helperText="Minimum 100 characters"
        />
      )}

      <CoverLetterTextarea
        label="Job Description"
        name="jobDescription"
        value={jobDescription}
        onChange={(e) => onJobDescriptionChange(e.target.value)}
        placeholder="Paste the job description you're applying for..."
        rows={8}
        maxLength={5000}
        required
        error={errors.jobDescription}
        touched
        helperText="Minimum 50 characters — the more detail, the better the match"
      />

      <CoverLetterDropdown
        label="Tone"
        name="tone"
        value={tone}
        onChange={(e) => onToneChange(e.target.value)}
        options={TONE_OPTIONS}
      />

      <Button
        variant="primary"
        size="md"
        onClick={onGenerate}
        disabled={!canGenerate}
        loading={isGenerating}
        className="w-full mt-2"
      >
        {isGenerating ? 'Generating...' : 'Generate Cover Letter'}
      </Button>
    </div>
  );
}

export default memo(InputPanel);
