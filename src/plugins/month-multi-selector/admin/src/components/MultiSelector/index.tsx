import * as React from "react";
import { useIntl } from "react-intl";
import styled from 'styled-components';
import MonthlyStatusSelector from "./components/MonthlyStatusSelector";
import { MonthlyStatusData } from "./types";

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
`;

interface MultiSelectorProps {
  attribute: {
    type: string;
  };
  disabled?: boolean;
  intlLabel: {
    id: string;
    defaultMessage: string;
  };
  name: string;
  onChange: (value: { target: { name: string; type: string; value: string } }) => void;
  required?: boolean;
  value?: string;
}

const MultiSelector = React.forwardRef<HTMLInputElement, MultiSelectorProps>((props, ref) => {
  const { attribute, disabled, intlLabel, name, onChange, required, value } =
    props; // these are just some of the props passed by the content-manager

  const { formatMessage } = useIntl();

  const handleChange = (newValue: MonthlyStatusData) => {
    // Ensure we always save a valid object, even if empty
    const valueToSave = Object.keys(newValue).length > 0 ? newValue : {};
    onChange({
      target: { name, type: attribute.type, value: JSON.stringify(valueToSave) },
    });
  };

  const parsedValue = React.useMemo(() => {
    if (!value) return {};
    try {
      const parsed = typeof value === 'string' ? JSON.parse(value) : value;
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch (e) {
      console.error('Failed to parse month selector value:', e);
      return {};
    }
  }, [value]);

  return (
    <div>
      <Label>
        {intlLabel?.id ? formatMessage({
          id: intlLabel.id,
          defaultMessage: intlLabel.defaultMessage
        }) : name}
      </Label>
      <MonthlyStatusSelector
        value={parsedValue}
        onChange={handleChange}
        disabled={disabled}
      />
    </div>
  );
});

export default MultiSelector;