import React from 'react';
import { MonthStatus } from '../types';
import { CheckCircle, Circle, AlertCircle } from 'lucide-react';

interface TriStateCheckboxProps {
  value: MonthStatus;
  onChange: () => void;
  label: string;
  id: string;
}

const TriStateCheckbox: React.FC<TriStateCheckboxProps> = ({ value, onChange, label, id }) => {
  const getIcon = () => {
    switch (value) {
      case 'inactive':
        return <Circle className="w-5 h-5 text-gray-400 transition-colors" />;
      case 'low':
        return <CheckCircle className="w-5 h-5 text-blue-500 transition-colors" />;
      case 'high':
        return <AlertCircle className="w-5 h-5 text-red-500 transition-colors" />;
    }
  };

  const getLabelText = () => {
    switch (value) {
      case 'inactive':
        return 'Inactive';
      case 'low':
        return 'Low';
      case 'high':
        return 'High';
    }
  };

  const getStatusClass = () => {
    switch (value) {
      case 'inactive':
        return 'text-gray-400 border-gray-200';
      case 'low':
        return 'text-blue-600 border-blue-200 bg-blue-50';
      case 'high':
        return 'text-red-600 border-red-200 bg-red-50';
    }
  };

  return (
    <div className="relative">
      <button
        id={id}
        type="button"
        onClick={onChange}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-200 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200 ${getStatusClass()}`}
        aria-label={`${label}: ${getLabelText()}`}
      >
        {getIcon()}
        {/* <span className="font-medium text-sm transition-colors">{getLabelText()}</span> */}
      </button>
    </div>
  );
};

export default TriStateCheckbox;