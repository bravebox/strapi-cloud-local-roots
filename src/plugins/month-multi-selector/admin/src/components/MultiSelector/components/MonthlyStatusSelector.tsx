import React from 'react';
import styled from 'styled-components';
import { MONTHS } from '../constants/months';
import { MonthStatus, MonthlyStatusData } from '../types';

const Container = styled.div`
  padding: 1.5rem;
`;

const Header = styled.div`
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
          background-color: #fee2e2;
          color: #dc2626;
          &:hover { background-color: #fecaca; }
        `;
      case 'low':
        return `
          background-color: #e0f2fe;
          color: #0284c7;
          &:hover { background-color: #bae6fd; }
        `;
      default:
        return `
          background-color: #f3f4f6;
          color: #4b5563;
          &:hover { background-color: #e5e7eb; }
        `;
    }
  }}
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 0.5rem;
  margin-bottom: 2rem;
`;

const MonthCard = styled.div<{ status: MonthStatus }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
  
  ${({ status }) => {
    switch (status) {
      case 'high':
        return `
          background-color: #fee2e2;
          color: #dc2626;
        `;
      case 'low':
        return `
          background-color: #e0f2fe;
          color: #0284c7;
        `;
      default:
        return `
          background-color: #f3f4f6;
          color: #4b5563;
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
  font-weight: 500;
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
    <Container>
      <Header>
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
      </Header>

      <Grid>
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
      </Grid>

    </Container>
  );
};

export default MonthlyStatusSelector;