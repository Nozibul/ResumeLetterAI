/**
 * @file features/resume-builder/finalize/ui/SectionReorder.jsx
 * @description Drag-and-drop section reordering component
 * @author Nozibul Islam
 *
 * Features:
 * - Drag-and-drop reordering
 * - Visual feedback
 * - Reset to default
 * - PersonalInfo locked (always first)
 *
 * Libraries:
 * - @dnd-kit/core
 * - @dnd-kit/sortable
 */

'use client';

import { memo } from 'react';
import PropTypes from 'prop-types';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

/**
 * Sortable Item Component
 */
function SortableItem({ id, section, isLocked }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled: isLocked });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`
        flex items-center gap-3 p-4 border border-gray-200 rounded-lg 
        ${isLocked ? 'bg-gray-50 cursor-not-allowed opacity-60' : 'bg-white cursor-move hover:bg-gray-50'}
        ${isDragging ? 'shadow-lg ring-2 ring-teal-500' : ''}
        transition-all duration-200
      `}
    >
      {/* Drag Handle */}
      <div className={`text-gray-400 ${isLocked ? '' : 'hover:text-gray-600'}`}>
        {isLocked ? '🔒' : '☰'}
      </div>

      {/* Section Info */}
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="text-xl">{section.icon}</span>
          <span className="text-sm font-medium text-gray-900">
            {section.label}
          </span>
          {isLocked && (
            <span className="text-xs text-gray-500 ml-2">(Required First)</span>
          )}
        </div>
      </div>

      {/* Order Number */}
      <div className="text-xs text-gray-500 font-mono">#{section.order}</div>
    </div>
  );
}

SortableItem.propTypes = {
  id: PropTypes.string.isRequired,
  section: PropTypes.object.isRequired,
  isLocked: PropTypes.bool,
};

/**
 * SectionReorder Component
 */
function SectionReorder({ sectionOrder, onReorder, onReset }) {
  // ==========================================
  // SECTION METADATA
  // ==========================================
  const sectionMetadata = {
    personalInfo: { label: 'Personal Information', icon: '👤', locked: true },
    summary: { label: 'Professional Summary', icon: '📝', locked: false },
    skills: { label: 'Technical Skills', icon: '⚡', locked: false },
    workExperience: { label: 'Work Experience', icon: '💼', locked: false },
    projects: { label: 'Projects', icon: '🚀', locked: false },
    education: { label: 'Education', icon: '🎓', locked: false },
    competitiveProgramming: {
      label: 'Competitive Programming',
      icon: '🏆',
      locked: false,
    },
    certifications: { label: 'Certifications', icon: '📜', locked: false },
  };

  // ==========================================
  // DND SENSORS
  // ==========================================
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // ==========================================
  // DRAG END HANDLER
  // ==========================================
  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    // Don't allow moving personalInfo
    if (active.id === 'personalInfo' || over.id === 'personalInfo') return;

    const oldIndex = sectionOrder.indexOf(active.id);
    const newIndex = sectionOrder.indexOf(over.id);

    // Don't allow moving above personalInfo
    if (newIndex === 0) return;

    const newOrder = arrayMove(sectionOrder, oldIndex, newIndex);
    onReorder(newOrder);
  };

  // ==========================================
  // PREPARE SECTIONS WITH METADATA
  // ==========================================
  const sections = sectionOrder.map((key, index) => ({
    id: key,
    ...sectionMetadata[key],
    order: index + 1,
  }));

  // ==========================================
  // RENDER
  // ==========================================
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Section Order</h3>
          <p className="text-[13px] text-gray-600 mt-1">
            Drag to reorder sections (Personal Info always first)
          </p>
        </div>

        {/* Reset Button */}
        <button
          onClick={onReset}
          className="cursor-pointer px-2 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Reset to Default
        </button>
      </div>

      {/* Sortable List */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={sectionOrder}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {sections.map((section) => (
              <SortableItem
                key={section.id}
                id={section.id}
                section={section}
                isLocked={section.locked}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* Help Text */}
      <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
        <p className="text-xs text-yellow-800">
          💡 <strong>Tip:</strong> Sections will appear in this order on your
          resume. Personal Information must always be first for ATS
          compatibility.
        </p>
      </div>
    </div>
  );
}

SectionReorder.propTypes = {
  sectionOrder: PropTypes.arrayOf(PropTypes.string).isRequired,
  onReorder: PropTypes.func.isRequired,
  onReset: PropTypes.func.isRequired,
};

export default memo(SectionReorder);
