/**
 * @file features/templates/components/TemplateGrid.jsx
 * @description Template grid container component
 * @author Nozibul Islam
 * 
 * Features:
 * - Responsive grid layout
 * - Maps templates to TemplateCard components
 * - Handles click events
 */

import React from 'react';
import TemplateCard from './TemplateCard';

const TemplateGrid = ({ templates, onUseTemplate }) => {
  if (!templates || templates.length === 0) {
    return null;
  }

  return (
    <div className=" p-10 grid xl:grid-cols-4 lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 xs:grid-cols-1 gap-6 place-items-center">
      {templates?.map((template) => (
        <TemplateCard
          key={template._id}
          template={template}
          onUseTemplate={onUseTemplate}
        />
      ))}
    </div>
  );
};

export default TemplateGrid;