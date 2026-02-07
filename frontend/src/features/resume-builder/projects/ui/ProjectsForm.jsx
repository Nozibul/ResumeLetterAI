/**
 * @file features/resume-builder/projects/ui/ProjectsForm.jsx
 * @description Projects form - Step 4 (Reusable Pattern)
 * @author Nozibul Islam
 *
 * Backend Schema:
 * projects: [{
 *   projectName: String (required, max 100),
 *   technologies: [String] (max 30),
 *   description: String (optional, max 500),
 *   liveUrl: String (optional),
 *   sourceCode: String (optional),
 *   highlights: [String] (max 10, max 300 each)
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
import ResumeTextarea from '@/shared/components/atoms/resume/ResumeTextarea';
import TagInput from '@/shared/components/atoms/resume/TagInput';
import ATSBanner from '@/shared/components/atoms/resume/ATSBanner';
import { LIMITS, SKILLS_SUGGESTIONS } from '@/shared/lib/constants';
import { reorderArray } from '@/shared/lib/utils';
import logger from '@/shared/lib/logger';

function ProjectsForm() {
  const dispatch = useDispatch();
  const resumeData = useCurrentResumeData();
  const [projects, setProjects] = useState([createEmpty()]);
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (resumeData?.projects?.length > 0) {
      setProjects(resumeData.projects);
    }
  }, []);

  useEffect(() => {
    if (!touched) return;
    const timer = setTimeout(() => {
      dispatch(setIsSaving(true));
      const valid = projects.filter((p) => p.projectName?.trim());
      dispatch(updateCurrentResumeField({ field: 'projects', value: valid }));
      setTimeout(() => dispatch(setIsSaving(false)), 500);
    }, 500);
    return () => clearTimeout(timer);
  }, [projects, touched, dispatch]);

  const handleAdd = useCallback(() => {
    if (projects.length >= LIMITS.MAX_PROJECTS) {
      alert(`Max ${LIMITS.MAX_PROJECTS} projects`);
      return;
    }
    setProjects((prev) => [...prev, createEmpty()]);
    setTouched(true);
  }, [projects.length]);

  const handleRemove = useCallback(
    (idx) => {
      if (projects.length === 1) {
        setProjects([createEmpty()]);
      } else {
        setProjects((prev) => prev.filter((_, i) => i !== idx));
      }
      setTouched(true);
    },
    [projects.length]
  );

  const handleUpdate = useCallback((idx, field, value) => {
    setProjects((prev) => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], [field]: value };
      return updated;
    });
    setTouched(true);
  }, []);

  const handleReorder = useCallback((from, to) => {
    setProjects((prev) => reorderArray(prev, from, to));
    setTouched(true);
  }, []);

  const atsTips = [
    'List your best 3-5 projects (quality > quantity)',
    'Include tech stack for ATS keyword matching',
    'Add live demo and GitHub links',
    'Quantify impact (users, performance, scale)',
    'Highlight your specific contributions',
  ];

  // Combine tech suggestions
  const allTechSuggestions = [
    ...SKILLS_SUGGESTIONS.programmingLanguages,
    ...SKILLS_SUGGESTIONS.frontend,
    ...SKILLS_SUGGESTIONS.backend,
    ...SKILLS_SUGGESTIONS.database,
    ...SKILLS_SUGGESTIONS.devOps,
  ];

  return (
    <div className="space-y-6">
      <ATSBanner title="Project Tips for Developers" tips={atsTips} />

      <div className="space-y-6">
        {projects.map((proj, idx) => (
          <ProjectItem
            key={idx}
            index={idx}
            project={proj}
            techSuggestions={allTechSuggestions}
            onUpdate={handleUpdate}
            onRemove={handleRemove}
            onMoveUp={idx > 0 ? () => handleReorder(idx, idx - 1) : null}
            onMoveDown={
              idx < projects.length - 1
                ? () => handleReorder(idx, idx + 1)
                : null
            }
          />
        ))}
      </div>

      <button
        type="button"
        onClick={handleAdd}
        disabled={projects.length >= LIMITS.MAX_PROJECTS}
        className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-teal-400 hover:text-teal-600 hover:bg-teal-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
          Add Project ({projects.length}/{LIMITS.MAX_PROJECTS})
        </span>
      </button>
    </div>
  );
}

const ProjectItem = memo(
  ({
    index,
    project,
    techSuggestions,
    onUpdate,
    onRemove,
    onMoveUp,
    onMoveDown,
  }) => {
    const handleHighlightChange = useCallback(
      (hIdx, value) => {
        const updated = [...(project.highlights || [])];
        updated[hIdx] = value;
        onUpdate(index, 'highlights', updated);
      },
      [project.highlights, index, onUpdate]
    );

    const handleAddHighlight = useCallback(() => {
      const current = project.highlights || [];
      if (current.length >= LIMITS.MAX_HIGHLIGHTS) {
        alert(`Max ${LIMITS.MAX_HIGHLIGHTS} highlights`);
        return;
      }
      onUpdate(index, 'highlights', [...current, '']);
    }, [project.highlights, index, onUpdate]);

    const handleRemoveHighlight = useCallback(
      (hIdx) => {
        const updated = (project.highlights || []).filter((_, i) => i !== hIdx);
        onUpdate(index, 'highlights', updated);
      },
      [project.highlights, index, onUpdate]
    );

    return (
      <div className="border-2 border-gray-200 rounded-lg p-6 bg-white">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Project #{index + 1}</h3>
          <div className="flex gap-2">
            {onMoveUp && (
              <button
                type="button"
                onClick={onMoveUp}
                className="p-1.5 hover:bg-teal-50 rounded"
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
                    d="M5 15l7-7 7 7"
                  />
                </svg>
              </button>
            )}
            {onMoveDown && (
              <button
                type="button"
                onClick={onMoveDown}
                className="p-1.5 hover:bg-teal-50 rounded"
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
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
            )}
            <button
              type="button"
              onClick={() => onRemove(index)}
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
        </div>

        <div className="space-y-4">
          <ResumeInput
            label="Project Name"
            name="projectName"
            value={project.projectName || ''}
            onChange={(e) => onUpdate(index, 'projectName', e.target.value)}
            placeholder="E-commerce Platform"
            required
            maxLength={LIMITS.TITLE_MAX_LENGTH}
            showCounter
          />

          <TagInput
            label="Tech Stack"
            name="technologies"
            tags={project.technologies || []}
            onAdd={(tech) =>
              onUpdate(index, 'technologies', [
                ...(project.technologies || []),
                tech,
              ])
            }
            onRemove={(tech) =>
              onUpdate(
                index,
                'technologies',
                (project.technologies || []).filter((t) => t !== tech)
              )
            }
            suggestions={techSuggestions}
            maxTags={LIMITS.MAX_TECHNOLOGIES}
            placeholder="React, Node.js, MongoDB (press Enter)"
          />

          <ResumeTextarea
            label="Description"
            name="description"
            value={project.description || ''}
            onChange={(e) => onUpdate(index, 'description', e.target.value)}
            placeholder="Full-stack e-commerce platform with real-time inventory management..."
            rows={3}
            maxLength={500}
            helperText="Optional"
          />

          <div className="grid grid-cols-2 gap-4">
            <ResumeInput
              label="Live URL"
              name="liveUrl"
              type="url"
              value={project.liveUrl || ''}
              onChange={(e) => onUpdate(index, 'liveUrl', e.target.value)}
              placeholder="https://myproject.com"
              helperText="Optional"
            />
            <ResumeInput
              label="Source Code"
              name="sourceCode"
              type="url"
              value={project.sourceCode || ''}
              onChange={(e) => onUpdate(index, 'sourceCode', e.target.value)}
              placeholder="https://github.com/user/repo"
              helperText="Optional"
            />
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Key Highlights
            </label>
            {(project.highlights || ['']).map((h, hIdx) => (
              <div key={hIdx} className="flex gap-2">
                <span className="text-gray-400 mt-3">•</span>
                <ResumeTextarea
                  label=""
                  name={`highlight-${hIdx}`}
                  value={h}
                  onChange={(e) => handleHighlightChange(hIdx, e.target.value)}
                  placeholder="Served 100K+ users with 99.9% uptime"
                  rows={2}
                  maxLength={300}
                  className="flex-1"
                />
                {(project.highlights || []).length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveHighlight(hIdx)}
                    className="p-2 text-red-600"
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
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={handleAddHighlight}
              disabled={
                (project.highlights || []).length >= LIMITS.MAX_HIGHLIGHTS
              }
              className="text-sm text-teal-600 font-medium disabled:opacity-50"
            >
              + Add Highlight ({(project.highlights || []).length}/
              {LIMITS.MAX_HIGHLIGHTS})
            </button>
          </div>
        </div>
      </div>
    );
  }
);

ProjectItem.displayName = 'ProjectItem';

function createEmpty() {
  return {
    projectName: '',
    technologies: [],
    description: '',
    liveUrl: '',
    sourceCode: '',
    highlights: [''],
  };
}

export default memo(ProjectsForm);
