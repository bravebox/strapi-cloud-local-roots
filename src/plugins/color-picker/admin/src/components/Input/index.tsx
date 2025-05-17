import { Field, Flex } from '@strapi/design-system';
import { useField } from '@strapi/strapi/admin';
import { useIntl } from 'react-intl';

interface MessageDescriptor {
    id: string;
    defaultMessage: string;
}

const ColorPickerInput = ({ 
    name, 
    description, 
    hint, 
    intlLabel, 
    label, 
    required 
}: { 
    name: string, 
    description?: MessageDescriptor, 
    hint?: string, 
    intlLabel?: MessageDescriptor, 
    label?: string, 
    required?: boolean 
}) => {
    const { formatMessage } = useIntl();
    const { onChange, value, error } = useField(name);

    return (
        <Field.Root
            hint={description?.id ? formatMessage(description) : hint}
            error={error as string}
            name={name}
            required={required}
        >
            <Flex direction="column" alignItems="stretch" gap={1}>
                <Field.Label>{intlLabel?.id ? formatMessage(intlLabel) : label}</Field.Label>
                <input
                    type="color"
                    value={value as string}
                    onChange={(e) => onChange(e.target.value)}
                />
                <Field.Hint />
                <Field.Error />
            </Flex>
        </Field.Root>
    );
};

export default ColorPickerInput;