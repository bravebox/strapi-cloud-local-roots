import { useState } from 'react';
import { MonthStatus, MonthlyStatusData } from '../types';
import { MONTHS } from '../constants/months';

export const useMonthlyStatus = () => {
  // Initialize with all months set to 'inactive'
  const initialState = MONTHS.reduce((acc, month) => {
    acc[month.id] = 'inactive';
    return acc;
  }, {} as MonthlyStatusData);

  const [monthlyStatus, setMonthlyStatus] = useState<MonthlyStatusData>(initialState);

  const updateMonthStatus = (monthId: string) => {
    setMonthlyStatus(prev => {
      const currentStatus = prev[monthId];
      const nextStatus: MonthStatus = 
        currentStatus === 'inactive' ? 'low' :
        currentStatus === 'low' ? 'high' : 'inactive';
      
      return {
        ...prev,
        [monthId]: nextStatus
      };
    });
  };

  const setAllMonthsStatus = (status: MonthStatus) => {
    const newState = MONTHS.reduce((acc, month) => {
      acc[month.id] = status;
      return acc;
    }, {} as MonthlyStatusData);
    
    setMonthlyStatus(newState);
  };

  return {
    monthlyStatus,
    updateMonthStatus,
    setAllMonthsStatus
  };
};