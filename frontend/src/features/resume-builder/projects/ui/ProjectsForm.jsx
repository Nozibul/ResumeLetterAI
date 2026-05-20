'use client';
/**
 * @file features/resume-builder/projects/ui/ProjectsForm.jsx
 * @description Projects form - Step 4
 * @author Nozibul Islam
 * @version 2.0.0
 *
 * - _tempId added to createEmptyProject for stable React keys
 * - alert → toast.error
 * - key={project._tempId || index}
 */

import { memo, useMemo, useCallback } from 'react';
import toast from 'react-hot-toast';
import { useCurrentResumeData } from '@/shared/store/hooks/useResume';
import { useResumeListForm } from '@/shared/hooks/useResumeListForm';
import ATSBanner from '@/shared/components/atoms/resume/ATSBanner';
import ProjectItem from './ProjectItem';
import AddProjectButton from './AddProjectButton';
import { validateProject } from '../model/validation';
import { LIMITS, SKILLS_SUGGESTIONS } from '@/shared/lib/constants';

// ── Constants ─────────────────────────────────────────────────────────────────

const ATS_TIPS = [
  'List your best 2-5 projects (quality > quantity)',
  'Include tech stack for ATS keyword matching',
  'Add live demo and GitHub links when possible',
  'Quantify impact (users, performance, scale)',
  'Highlight your specific contributions',
];

// ── Helpers — defined outside component for stable reference ──────────────────

function createEmptyProject() {
  return {
    _tempId: Date.now(),
    projectName: '',
    technologies: [],
    description: '',
    liveUrl: '',
    sourceCode: '',
    highlights: [''],
  };
}

function isNotEmpty(project) {
  return !!project.projectName?.trim();
}

// ── Component ─────────────────────────────────────────────────────────────────

function ProjectsForm() {
  const resumeData = useCurrentResumeData();

  const {
    items: projects,
    handleAdd,
    handleRemove,
    handleUpdate,
    handleReorder,
  } = useResumeListForm({
    field: 'projects',
    createItem: createEmptyProject,
    reduxData: resumeData?.projects,
    maxItems: LIMITS.MAX_PROJECTS,
    filterEmpty: isNotEmpty,
  });

  // Validation — UI feedback only, does not block saving
  const errors = useMemo(() => {
    const allErrors = {};
    projects.forEach((project, index) => {
      const projectErrors = validateProject(project);
      if (Object.keys(projectErrors).length > 0) {
        allErrors[index] = projectErrors;
      }
    });
    return allErrors;
  }, [projects]);

  // Tech suggestions — memoized, SKILLS_SUGGESTIONS never changes
  const allTechSuggestions = useMemo(
    () => [
      ...SKILLS_SUGGESTIONS.programmingLanguages,
      ...SKILLS_SUGGESTIONS.frontend,
      ...SKILLS_SUGGESTIONS.backend,
      ...SKILLS_SUGGESTIONS.database,
      ...SKILLS_SUGGESTIONS.devOps,
    ],
    []
  );

  const onAdd = useCallback(() => {
    const added = handleAdd();
    if (!added) {
      toast.error(`Maximum ${LIMITS.MAX_PROJECTS} projects allowed`);
    }
  }, [handleAdd]);

  return (
    <div className="space-y-4">
      <ATSBanner title="Project Tips for Developers" tips={ATS_TIPS} />

      {/* Validation summary */}
      {Object.keys(errors).length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            ⚠️ {Object.keys(errors).length} project(s) have validation errors.
            Please check highlighted fields.
          </p>
        </div>
      )}

      {/* Projects list */}
      <div className="space-y-4">
        {projects.map((project, index) => (
          <div key={project._tempId || index} className="relative">
            {errors[index] && (
              <div className="absolute -top-2 -right-2 z-10">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white text-xs font-bold">
                  !
                </span>
              </div>
            )}

            <ProjectItem
              index={index}
              project={project}
              techSuggestions={allTechSuggestions}
              onUpdate={handleUpdate}
              onRemove={handleRemove}
              errors={errors[index] || {}}
              onMoveUp={
                index > 0 ? () => handleReorder(index, index - 1) : null
              }
              onMoveDown={
                index < projects.length - 1
                  ? () => handleReorder(index, index + 1)
                  : null
              }
            />
          </div>
        ))}
      </div>

      <AddProjectButton currentCount={projects.length} onClick={onAdd} />
    </div>
  );
}

export default memo(ProjectsForm);
