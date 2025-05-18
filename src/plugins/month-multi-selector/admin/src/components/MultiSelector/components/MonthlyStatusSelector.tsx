import React from 'react';
import styled from 'styled-components';
import { MONTHS } from '../constants/months';
import { MonthStatus, MonthlyStatusData } from '../types';

const colors = {
  text: {
    high: '#212112',
    low: '#212121',
    inactive: '#919cab',
  },
  bg: {
    high: '#7b79ff',
    low: '#c4c4ec',
    inactive: '#212121',
  },
  border: {
    hover: '#ececec',
  }
}

const Tools = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const Button = styled.button<{ variant: 'inactive' | 'low' | 'high' }>`
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  border-radius: 0.375rem;
  transition: all 0.2s;
  
  ${({ variant }) => {
    switch (variant) {
      case 'high':
        return `
          color: ${colors.text.high};
          border: solid 1px ${colors.text.high};
          background-color: ${colors.bg.high};
          &:hover { border-color:${colors.border.hover}; }
        `;
      case 'low':
        return `
          color: ${colors.text.low};
          border: solid 1px ${colors.text.low};
          background-color: ${colors.bg.low};
          &:hover { border-color: ${colors.border.hover} }
        `;
      default:
        return `
          color: ${colors.text.inactive};
          border: solid 1px ${colors.text.inactive};
          background-color: ${colors.bg.inactive};
          &:hover { border-color: ${colors.border.hover} }
        `;
    }
  }}
`;

const MonthsContainer = styled.div`
  display: flex;
  justify-content: space-evenly;
  gap: 0.5rem;
  margin-bottom: 2rem;
`;

const MonthCard = styled.div<{ status: MonthStatus }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  border-radius: 0.25rem;
  cursor: pointer;
  min-height: 2rem;
  transition: all 0.2s;
  
  ${({ status }) => {
    switch (status) {
      case 'high':
        return `
          color: ${colors.text.high};
          border: solid 1px ${colors.text.high};
          background-color: ${colors.bg.high};
          &:hover { border-color:${colors.border.hover}; }
        `;
      case 'low':
        return `
          color: ${colors.text.low};
          border: solid 1px ${colors.text.low};
          background-color: ${colors.bg.low};
          &:hover { border-color:${colors.border.hover}; }
        `;
      default:
        return `
          color: ${colors.text.inactive};
          border: solid 1px ${colors.text.inactive};
          background-color: ${colors.bg.inactive};
          &:hover { border-color:${colors.border.hover}; }
        `;
    }
  }}
  
  &:hover {
    filter: brightness(0.95);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const MonthName = styled.span`
  font-size: 1rem;
  font-weight: 600;
  padding: 12px 0;
`;

interface MonthlyStatusSelectorProps {
  value: MonthlyStatusData;
  onChange: (value: MonthlyStatusData) => void;
  disabled?: boolean;
}

const MonthlyStatusSelector: React.FC<MonthlyStatusSelectorProps> = ({ value, onChange, disabled }) => {

  const handleBulkAction = (status: MonthStatus) => {
    if (disabled) return;

    const newStatus = MONTHS.reduce((acc: MonthlyStatusData, month) => {
      acc[month.id] = status;
      return acc;
    }, {} as MonthlyStatusData);

    onChange(newStatus);
  };

  const handleMonthClick = (monthId: string) => {
    if (disabled) return;

    const newStatus = { ...value };
    const currentStatus = value[monthId] || 'inactive';
    newStatus[monthId] = currentStatus === 'inactive' ? 'low' : currentStatus === 'low' ? 'high' : 'inactive';

    onChange(newStatus);
  };

  return (
    <>

      <MonthsContainer>
        {MONTHS.map(month => (
          <MonthCard
            key={month.id}
            status={value[month.id] || 'inactive'}
            onClick={() => handleMonthClick(month.id)}
            style={{ cursor: disabled ? 'not-allowed' : 'pointer' }}
          >
            <MonthName>{month.shortName}</MonthName>
          </MonthCard>
        ))}
      </MonthsContainer>

      <Tools>
        <ButtonGroup>
          <Button
            variant="inactive"
            onClick={() => handleBulkAction('inactive')}
            disabled={disabled}
          >
            All Inactive
          </Button>
          <Button
            variant="low"
            onClick={() => handleBulkAction('low')}
            disabled={disabled}
          >
            All Low
          </Button>
          <Button
            variant="high"
            onClick={() => handleBulkAction('high')}
            disabled={disabled}
          >
            All High
          </Button>
        </ButtonGroup>
      </Tools>

    </>
  );
};

export default MonthlyStatusSelector;