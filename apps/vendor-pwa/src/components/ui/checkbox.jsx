import React from 'react';
import { Check } from 'lucide-react';

const Checkbox = ({ 
  checked, 
  onChange, 
  label, 
  id, 
  className = "",
  disabled = false 
}) => {
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <button
        type="button"
        id={id}
        onClick={() => !disabled && onChange(!checked)}
        disabled={disabled}
        className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
          checked 
            ? 'bg-purple-600 border-purple-600' 
            : 'border-gray-300 hover:border-purple-400'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        {checked && <Check className="w-3 h-3 text-white" />}
      </button>
      {label && (
        <label 
          htmlFor={id}
          className={`text-sm text-gray-600 ${disabled ? 'opacity-50' : 'cursor-pointer'}`}
          onClick={() => !disabled && onChange(!checked)}
        >
          {label}
        </label>
      )}
    </div>
  );
};

export default Checkbox;
