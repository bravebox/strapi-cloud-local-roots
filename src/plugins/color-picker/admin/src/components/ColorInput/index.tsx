import * as React from "react";
import { useIntl } from "react-intl";
import { Field, Flex } from '@strapi/design-system';

interface ColorInputProps {
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

const ColorInput = React.forwardRef<HTMLInputElement, ColorInputProps>((props, ref) => {
  const { attribute, disabled, intlLabel, name, onChange, required, value } =
    props; // these are just some of the props passed by the content-manager

  const { formatMessage } = useIntl();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      target: { name, type: attribute.type, value: e.currentTarget.value },
    });
  };

  return (
    <Field.Root>
       <Flex direction="column" alignItems="stretch" gap={1}>

        <Field.Label>
          {intlLabel?.id ? formatMessage({
            id: intlLabel.id,
            defaultMessage: intlLabel.defaultMessage
          }) : name}
        </Field.Label>

        <input
          ref={ref}
          type="color"
          name={name}
          disabled={disabled}
          value={value}
          required={required}
          onChange={handleChange}
        />

        <Field.Hint />
        <Field.Error />
      </Flex>
    </Field.Root>
  );
});

export default ColorInput;