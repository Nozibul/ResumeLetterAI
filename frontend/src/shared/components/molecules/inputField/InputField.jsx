import React from 'react';

import { AlertCircle } from 'lucide-react';
import Input from '../../atoms/input/Input';

const InputField = ({ 
  label, 
  error, 
  ...inputProps 
}) => {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <Input error={error} {...inputProps} />
      {error && (
        <p className="text-red-500 text-sm flex items-center gap-1">
          <AlertCircle className="w-4 h-4" />
          {error}
        </p>
      )}
    </div>
  );
};

export default InputField;