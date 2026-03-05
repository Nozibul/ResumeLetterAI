/**
 * @file features/resume-builder/projects/ui/ProjectsForm.jsx
 * @description Projects form - Step 4
 * @author Nozibul Islam
 *
 * Refactored to use shared useResumeListForm hook.
 * All init, save, add/remove/update/reorder logic lives in the hook.
 * Component is responsible for UI only.
 */

'use client';

import { memo, useMemo, useCallback } from 'react';
import { useCurrentResumeData } from '@/shared/store/hooks/useResume';
import { useResumeListForm } from '@/shared/hooks/useResumeListForm';
import ATSBanner from '@/shared/components/atoms/resume/ATSBanner';
import ProjectItem from './ProjectItem';
import AddProjectButton from './AddProjectButton';
import { validateProject } from '../model/validation';
import { LIMITS, SKILLS_SUGGESTIONS } from '@/shared/lib/constants';

// ==========================================
// CONSTANTS
// ==========================================
const ATS_TIPS = [
  'List your best 2-5 projects (quality > quantity)',
  'Include tech stack for ATS keyword matching',
  'Add live demo and GitHub links when possible',
  'Quantify impact (users, performance, scale)',
  'Highlight your specific contributions',
];

// ==========================================
// HELPERS
// Defined outside component — stable reference, no re-creation on render
// createEmptyProject passed to hook as createItem — no useCallback needed
// isNotEmpty passed as filterEmpty — blank entries excluded from Redux save
// ==========================================
function createEmptyProject() {
  return {
    projectName: '',
    technologies: [],
    description: '',
    liveUrl: '',
    sourceCode: '',
    highlights: [''],
  };
}

function isNotEmpty(project) {
  return project.projectName?.trim();
}

/**
 * ProjectsForm Component
 * Step 4: Projects
 */
function ProjectsForm() {
  const resumeData = useCurrentResumeData();

  // ==========================================
  // LIST FORM HOOK
  // All init, save, add/remove/update/reorder logic lives in useResumeListForm.
  // handleAdd returns false if max limit reached — show alert in UI.
  // ==========================================
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

  // ==========================================
  // VALIDATION
  // Run on current projects for UI feedback only
  // Does not block saving — partial data is allowed
  // ==========================================
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

  // ==========================================
  // TECH SUGGESTIONS
  // Memoized — only recomputed if SKILLS_SUGGESTIONS changes (never)
  // ==========================================
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

  // ==========================================
  // HANDLERS
  // ==========================================
  const onAdd = useCallback(() => {
    const added = handleAdd();
    if (!added) {
      alert(`Maximum ${LIMITS.MAX_PROJECTS} projects allowed`);
    }
  }, [handleAdd]);

  // ==========================================
  // RENDER
  // ==========================================
  return (
    <div className="space-y-4">
      {/* ATS GUIDELINES */}
      <ATSBanner title="Project Tips for Developers" tips={ATS_TIPS} />

      {/* VALIDATION ERRORS SUMMARY */}
      {Object.keys(errors).length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            ⚠️ {Object.keys(errors).length} project(s) have validation errors.
            Please check highlighted fields.
          </p>
        </div>
      )}

      {/* PROJECTS LIST */}
      <div className="space-y-4">
        {projects.map((project, index) => (
          <div key={index} className="relative">
            {/* Error Indicator */}
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

      {/* ADD PROJECT BUTTON */}
      <AddProjectButton currentCount={projects.length} onClick={onAdd} />
    </div>
  );
}

export default memo(ProjectsForm);
