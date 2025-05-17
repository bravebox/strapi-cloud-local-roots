import React from 'react';
import { useMonthlyStatus } from '../hooks/useMonthlyStatus';
import { MONTHS } from '../constants/months';
import { MonthStatus } from '../types';
import MonthCard from './MonthCard';
import JsonOutput from './JsonOutput';

const MonthlyStatusSelector: React.FC = () => {
  const { monthlyStatus, updateMonthStatus, setAllMonthsStatus } = useMonthlyStatus();

  const handleBulkAction = (status: MonthStatus) => {
    setAllMonthsStatus(status);
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-xl font-medium text-gray-800">Monthly Status</h2>
        <div className="flex gap-2">
          <button
            onClick={() => handleBulkAction('inactive')}
            className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded transition-colors"
          >
            All Inactive
          </button>
          <button
            onClick={() => handleBulkAction('low')}
            className="px-3 py-1 text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 rounded transition-colors"
          >
            All Low
          </button>
          <button
            onClick={() => handleBulkAction('high')}
            className="px-3 py-1 text-sm bg-red-100 hover:bg-red-200 text-red-700 rounded transition-colors"
          >
            All High
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-2 mb-8">
        {MONTHS.map(month => (
          <MonthCard
            key={month.id}
            month={month}
            status={monthlyStatus[month.id]}
            onStatusChange={updateMonthStatus}
          />
        ))}
      </div>

      <JsonOutput data={monthlyStatus} />
    </div>
  );
};

export default MonthlyStatusSelector;