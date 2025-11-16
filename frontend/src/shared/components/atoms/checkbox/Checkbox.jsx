import React from 'react';

const Checkbox = ({ 
  name, 
  checked, 
  onChange, 
  label,
  error,
  ...props 
}) => {
  return (
    <div className="space-y-2">
      <label className="flex items-start gap-3 cursor-pointer group">
        <input
          type="checkbox"
          name={name}
          checked={checked}
          onChange={onChange}
          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
          {...props}
        />
        <span className="text-sm text-gray-600 group-hover:text-gray-800 transition-colors">
          {label}
        </span>
      </label>
      {error && (
        <p className="text-red-500 text-sm flex items-center gap-1">
          {error}
        </p>
      )}
    </div>
  );
};

export default Checkbox;