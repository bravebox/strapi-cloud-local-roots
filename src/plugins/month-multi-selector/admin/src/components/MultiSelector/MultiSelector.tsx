import React from 'react';
import styled from 'styled-components';
import { useIntl } from 'react-intl';
import { MonthlyStatusData, MonthStatus } from './types';
import { MONTHS } from './constants/months';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
`;

const MonthCard = styled.div<{ status: MonthStatus }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  transition: all 0.2s;
  cursor: pointer;
  background-color: ${({ status }) => {
    switch (status) {
      case 'high': return '#fee2e2';
      case 'low': return '#e0f2fe';
      default: return '#ffffff';
    }
  }};
  
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
  color: #374151;
`;

interface MultiSelectorProps {
  name: string;
  onChange: (value: { target: { name: string; type: string; value: string } }) => void;
  value?: string;
  disabled?: boolean;
}

const MultiSelector: React.FC<MultiSelectorProps> = ({ name, onChange, value, disabled }) => {
  const { formatMessage } = useIntl();
  const [monthlyStatus, setMonthlyStatus] = React.useState<MonthlyStatusData>(
    MONTHS.reduce((acc, month) => {
      acc[month.id] = 'inactive';
      return acc;
    }, {} as MonthlyStatusData)
  );

  React.useEffect(() => {
    if (value) {
      try {
        const parsed = JSON.parse(value);
        setMonthlyStatus(parsed);
      } catch (e) {
        console.error('Failed to parse month selector value:', e);
      }
    }
  }, [value]);

  const handleMonthClick = (monthId: string) => {
    if (disabled) return;

    const newStatus = { ...monthlyStatus };
    const currentStatus = monthlyStatus[monthId] || 'inactive';
    newStatus[monthId] = currentStatus === 'inactive' ? 'low' : currentStatus === 'low' ? 'high' : 'inactive';

    setMonthlyStatus(newStatus);
    onChange({
      target: { name, type: 'json', value: JSON.stringify(newStatus) },
    });
  };

  return (
    <Container>
      <Grid>
        {MONTHS.map(month => (
          <MonthCard
            key={month.id}
            status={monthlyStatus[month.id] || 'inactive'}
            onClick={() => handleMonthClick(month.id)}
            style={{ cursor: disabled ? 'not-allowed' : 'pointer' }}
          >
            <MonthName>{month.name}</MonthName>
          </MonthCard>
        ))}
      </Grid>
    </Container>
  );
};

export default MultiSelector;