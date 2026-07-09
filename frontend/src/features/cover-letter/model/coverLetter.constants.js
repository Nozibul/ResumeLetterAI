/**
 * @file features/cover-letter/model/coverLetter.constants.js
 * @description Constants for cover letter feature
 * @author Nozibul Islam
 */

export const TONE_OPTIONS = [
  { value: 'professional', label: 'Professional' },
  { value: 'creative', label: 'Creative' },
  { value: 'concise', label: 'Concise' },
  { value: 'enthusiastic', label: 'Enthusiastic' },
  { value: 'formal', label: 'Formal' },
];

// Empty string = let the AI infer seniority from the resume itself
export const SENIORITY_OPTIONS = [
  { value: '', label: 'Auto-detect from resume' },
  { value: 'entry', label: 'Entry-level' },
  { value: 'mid', label: 'Mid-level' },
  { value: 'senior', label: 'Senior' },
  { value: 'lead', label: 'Lead / Staff' },
];

export const RESUME_SOURCES = [
  { value: 'db', label: 'Saved Resume' },
  { value: 'paste', label: 'Paste Text' },
  { value: 'upload', label: 'Upload File' },
];

export const GENERATION_STAGES = {
  IDLE: 'idle',
  ANALYZING: 'analyzing',
  GENERATING: 'generating',
  COMPLETE: 'complete',
};
