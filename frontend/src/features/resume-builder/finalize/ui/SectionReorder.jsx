/**
 * @file features/resume-builder/finalize/ui/SectionReorder.jsx
 * @description Drag-and-drop section reordering
 * @author Nozibul Islam
 *
 * FIXES:
 * ✅ onReorder এ { fromIndex, toIndex } pass করছে — Redux reorderSections এর জন্য
 * ✅ personalInfo lock — drag করা যাবে না, উপরে নেওয়া যাবে না
 * ✅ Edge cases: same position, invalid index handle করা হয়েছে
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
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// ==========================================
// SECTION METADATA
// Defined outside component — stable reference
// ==========================================
const SECTION_METADATA = {
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
// SORTABLE ITEM
// ==========================================
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
        flex items-center gap-3 p-4 border rounded-lg
        ${
          isLocked
            ? 'bg-gray-50 border-gray-200 cursor-not-allowed opacity-60'
            : 'bg-white border-gray-200 cursor-move hover:bg-gray-50 hover:border-teal-300'
        }
        ${isDragging ? 'shadow-lg ring-2 ring-teal-500' : ''}
        transition-all duration-200
      `}
    >
      <div className={`text-gray-400 ${isLocked ? '' : 'hover:text-gray-600'}`}>
        {isLocked ? '🔒' : '☰'}
      </div>

      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="text-xl">{section.icon}</span>
          <span className="text-sm font-medium text-gray-900">
            {section.label}
          </span>
          {isLocked && (
            <span className="text-xs text-gray-500 ml-1">(Required First)</span>
          )}
        </div>
      </div>

      <div className="text-xs text-gray-400 font-mono">#{section.order}</div>
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
 *
 * onReorder receives { fromIndex, toIndex } — for Redux reorderSections
 */
function SectionReorder({ sectionOrder, onReorder, onReset }) {
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
  // DRAG END — pass { fromIndex, toIndex } to Redux
  // ==========================================
  const handleDragEnd = (event) => {
    const { active, over } = event;

    // Edge case: no target or same position
    if (!over || active.id === over.id) return;

    // Edge case: personalInfo cannot be moved
    if (active.id === 'personalInfo') return;

    // Edge case: nothing can be moved to personalInfo's position
    if (over.id === 'personalInfo') return;

    const fromIndex = sectionOrder.indexOf(active.id);
    const toIndex = sectionOrder.indexOf(over.id);

    // Edge case: invalid indices
    if (fromIndex === -1 || toIndex === -1) return;

    // Edge case: toIndex === 0 means moving above personalInfo
    if (toIndex === 0) return;

    onReorder({ fromIndex, toIndex });
  };

  // ==========================================
  // PREPARE SECTIONS
  // ==========================================
  const sections = sectionOrder.map((key, index) => ({
    id: key,
    ...(SECTION_METADATA[key] || { label: key, icon: '📄', locked: false }),
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
          <p className="text-sm text-gray-600 mt-1">
            Drag to reorder sections (Personal Info always first)
          </p>
        </div>

        <button
          type="button"
          onClick={onReset}
          className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Reset to Default
        </button>
      </div>

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
