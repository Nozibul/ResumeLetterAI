'use client';

import { memo, useState, useCallback, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useCurrentResumeData } from '@/shared/store/hooks/useResume';
import {
  updateCurrentResumeField,
  setIsSaving,
} from '@/shared/store/slices/resumeSlice';
import ATSBanner from '@/shared/components/atoms/resume/ATSBanner';
import SkillCategory from './SkillCategory';
import SuggestionsList from './SuggestionsList';
import { validateSkillsForm, getSkillsQualityScore } from '../model/validation';
import { SKILLS_SUGGESTIONS } from '@/shared/lib/constants';
import logger from '@/shared/lib/logger';

function SkillsForm() {
  const dispatch = useDispatch();
  const resumeData = useCurrentResumeData();

  const defaultFormData = {
    programmingLanguages: [],
    frontend: [],
    backend: [],
    database: [],
    devOps: [],
    tools: [],
    other: [],
  };

  const [formData, setFormData] = useState(defaultFormData);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState(false);
  const [qualityScore, setQualityScore] = useState(null);

  // ==========================================
  // INITIALIZE FROM REDUX (FIXED)
  // ==========================================
  useEffect(() => {
    if (resumeData?.skills) {
      // ✅ Merge with defaults to ensure all fields exist
      setFormData({
        ...defaultFormData,
        ...resumeData.skills,
      });
    }
  }, []);

  // ==========================================
  // VALIDATE & CALCULATE QUALITY
  // ==========================================
  const validateAndScore = useCallback((skills) => {
    const validationErrors = validateSkillsForm(skills);
    setErrors(validationErrors);

    const score = getSkillsQualityScore(skills);
    setQualityScore(score);

    return validationErrors;
  }, []);

  // ==========================================
  // DEBOUNCED SAVE
  // ==========================================
  useEffect(() => {
    if (!touched) return;

    const timer = setTimeout(() => {
      logger.info('Saving skills to Redux...');
      dispatch(setIsSaving(true));

      validateAndScore(formData);

      dispatch(updateCurrentResumeField({ field: 'skills', value: formData }));

      setTimeout(() => dispatch(setIsSaving(false)), 500);
    }, 500);

    return () => clearTimeout(timer);
  }, [formData, touched, dispatch, validateAndScore]);

  // ==========================================
  // HANDLE UPDATE (FIXED)
  // ==========================================
  const handleUpdateCategory = useCallback((category, skills) => {
    setFormData((prev) => ({
      ...prev,
      [category]: skills || [], // ✅ Ensure it's always an array
    }));
    setTouched(true);
  }, []);

  // ==========================================
  // ADD SKILL HELPER (NEW - REUSABLE)
  // ==========================================
  const handleAddSkill = useCallback((category, skill) => {
    setFormData((prev) => {
      const currentSkills = prev[category] || []; // ✅ Safe default

      // Check duplicate
      if (currentSkills.includes(skill)) {
        return prev; // No change
      }

      return {
        ...prev,
        [category]: [...currentSkills, skill],
      };
    });
    setTouched(true);
  }, []);

  // ==========================================
  // REMOVE SKILL HELPER (NEW - REUSABLE)
  // ==========================================
  const handleRemoveSkill = useCallback((category, skill) => {
    setFormData((prev) => {
      const currentSkills = prev[category] || []; // ✅ Safe default

      return {
        ...prev,
        [category]: currentSkills.filter((s) => s !== skill),
      };
    });
    setTouched(true);
  }, []);

  // ==========================================
  // TOTAL SKILLS COUNT
  // ==========================================
  const getTotalSkills = useCallback(() => {
    return Object.values(formData).reduce(
      (total, skills) => total + (skills?.length || 0),
      0
    );
  }, [formData]);

  const getCategoriesWithSkills = useCallback(() => {
    return Object.values(formData).filter((skills) => skills?.length > 0)
      .length;
  }, [formData]);

  // ==========================================
  // ATS TIPS
  // ==========================================
  const atsTips = [
    'Include both technical and soft skills',
    'Use industry-standard terminology (React, not React.js)',
    'List programming languages you actively use',
    'Separate frontend, backend, and DevOps skills',
    'Keep skill names consistent (PostgreSQL, not Postgres)',
  ];

  // ==========================================
  // RENDER
  // ==========================================
  return (
    <div className="space-y-6">
      {/* ATS GUIDELINES */}
      <ATSBanner title="Skills Section Best Practices" tips={atsTips} />

      {/* STATS */}
      <div className="bg-gradient-to-r from-teal-50 to-blue-50 border border-teal-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-900">
              {getTotalSkills()} skills across {getCategoriesWithSkills()}{' '}
              categories
            </p>
            <p className="text-xs text-gray-600 mt-1">
              Aim for 15-25 relevant skills for best results
            </p>
          </div>

          {qualityScore && (
            <div className="text-right">
              <div className="text-2xl font-bold text-teal-600">
                {qualityScore.score}%
              </div>
              <p className="text-xs text-gray-600">Quality Score</p>
            </div>
          )}
        </div>
      </div>

      {/* VALIDATION ERRORS */}
      {Object.keys(errors).length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm font-medium text-yellow-800 mb-2">
            ⚠️ Validation Issues:
          </p>
          <ul className="text-xs text-yellow-700 space-y-1 list-disc list-inside">
            {Object.entries(errors).map(([key, error]) => (
              <li key={key}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* QUALITY SUGGESTIONS */}
      {qualityScore?.suggestions && qualityScore.suggestions.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm font-medium text-teal-800 mb-2">
            💡 Suggestions to improve:
          </p>
          <ul className="text-xs text-teal-700 space-y-1 list-disc list-inside">
            {qualityScore.suggestions.map((suggestion, idx) => (
              <li key={idx}>{suggestion}</li>
            ))}
          </ul>
        </div>
      )}

      {/* POPULAR SKILLS SUGGESTIONS */}
      {Object.entries(SKILLS_SUGGESTIONS).map(([category, suggestions]) => {
        const currentSkills = formData[category] || [];
        return (
          <SuggestionsList
            key={category}
            category={category}
            suggestions={suggestions || []}
            currentSkills={currentSkills}
            onAdd={(skill) => handleAddSkill(category, skill)}
          />
        );
      })}

      {/* SKILL CATEGORIES */}
      <div className="space-y-4">
        {/* Programming Languages */}
        <SkillCategory
          name="programmingLanguages"
          label="Programming Languages"
          icon="💻"
          skills={formData.programmingLanguages || []} // Safe access
          onAdd={(skill) => handleAddSkill('programmingLanguages', skill)}
          onRemove={(skill) => handleRemoveSkill('programmingLanguages', skill)}
          suggestions={SKILLS_SUGGESTIONS.programmingLanguages || []}
        />

        {/* Frontend */}
        <SkillCategory
          name="frontend"
          label="Frontend Development"
          icon="🎨"
          skills={formData.frontend || []}
          onAdd={(skill) => handleAddSkill('frontend', skill)}
          onRemove={(skill) => handleRemoveSkill('frontend', skill)}
          suggestions={SKILLS_SUGGESTIONS.frontend || []}
        />

        {/* Backend */}
        <SkillCategory
          name="backend"
          label="Backend Development"
          icon="⚙️"
          skills={formData.backend || []}
          onAdd={(skill) => handleAddSkill('backend', skill)}
          onRemove={(skill) => handleRemoveSkill('backend', skill)}
          suggestions={SKILLS_SUGGESTIONS.backend || []}
        />

        {/* Database */}
        <SkillCategory
          name="database"
          label="Databases & Data"
          icon="🗄️"
          skills={formData.database || []}
          onAdd={(skill) => handleAddSkill('database', skill)}
          onRemove={(skill) => handleRemoveSkill('database', skill)}
          suggestions={SKILLS_SUGGESTIONS.database || []}
        />

        {/* DevOps */}
        <SkillCategory
          name="devOps"
          label="DevOps & Cloud"
          icon="☁️"
          skills={formData.devOps || []}
          onAdd={(skill) => handleAddSkill('devOps', skill)}
          onRemove={(skill) => handleRemoveSkill('devOps', skill)}
          suggestions={SKILLS_SUGGESTIONS.devOps || []}
        />

        {/* Tools */}
        <SkillCategory
          name="tools"
          label="Tools & Technologies"
          icon="🔧"
          skills={formData.tools || []}
          onAdd={(skill) => handleAddSkill('tools', skill)}
          onRemove={(skill) => handleRemoveSkill('tools', skill)}
          suggestions={SKILLS_SUGGESTIONS.tools || []}
        />

        {/* Other */}
        <SkillCategory
          name="other"
          label="Other Skills"
          icon="✨"
          skills={formData.other || []}
          onAdd={(skill) => handleAddSkill('other', skill)}
          onRemove={(skill) => handleRemoveSkill('other', skill)}
          suggestions={[]}
        />
      </div>
    </div>
  );
}

export default memo(SkillsForm);
