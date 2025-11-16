import React from 'react';

const Input = ({ 
  type = 'text', 
  name, 
  value, 
  onChange, 
  placeholder, 
  error,
  icon: Icon,
  className = '',
  ...props 
}) => {
  return (
    <div className="relative">
      {Icon && (
        <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
      )}
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full ${Icon ? 'pl-10' : 'pl-4'} pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
          error ? 'border-red-500 bg-red-50' : 'border-gray-300'
        } ${className}`}
        {...props}
      />
    </div>
  );
};

export default Input;