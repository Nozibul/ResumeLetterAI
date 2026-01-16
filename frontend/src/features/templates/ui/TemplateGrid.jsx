/**
 * @file features/templates/components/TemplateGrid.jsx
 * @description Template grid container component
 * @author Nozibul Islam
 */

import React from 'react';
import TemplateCard from './TemplateCard';

const TemplateGrid = ({ templates }) => {
  if (!templates || templates.length === 0) {
    return null;
  }

  return (
    <div className="p-10 grid xl:grid-cols-4 lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 xs:grid-cols-1 gap-6 place-items-center">
      {templates?.map((template) => (
        <TemplateCard key={template._id} template={template} />
      ))}
    </div>
  );
};

export default TemplateGrid;
