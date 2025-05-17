import React from 'react';
import { MonthInfo, MonthStatus } from '../types';
import TriStateCheckbox from './TriStateCheckbox';

interface MonthCardProps {
  month: MonthInfo;
  status: MonthStatus;
  onStatusChange: (monthId: string) => void;
}

const MonthCard: React.FC<MonthCardProps> = ({ month, status, onStatusChange }) => {
  return (
    <div className="flex flex-col items-center p-2 transition-all duration-200 hover:bg-gray-50 rounded-lg">
      <div className="text-lg font-medium mb-2 text-gray-800">{month.shortName}</div>
      <TriStateCheckbox
        id={`month-${month.id}`}
        value={status}
        onChange={() => onStatusChange(month.id)}
        label={month.name}
      />
    </div>
  );
};

export default MonthCard;