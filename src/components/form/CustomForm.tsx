/* eslint-disable @typescript-eslint/no-explicit-any */
import { zodResolver } from '@hookform/resolvers/zod';
import { FC, useMemo } from 'react';
import {
  SubmitHandler,
  useForm,
  UseFormReset,
  UseFormSetError,
} from 'react-hook-form';
import { getInitialValues } from 'utils/form';
import { z, ZodTypeAny } from 'zod';
import {
  BaseFieldProps,
  CustomDateField,
  CustomDateTimeField,
  CustomPasswordField,
  CustomSelectField,
  CustomSwitchField,
  CustomTextAreaField,
  CustomTextField,
  CustomTimeField,
  SubmitButton,
} from './CustomFormFields';

export interface FormField extends BaseFieldProps {
  validation: ZodTypeAny;
  initValue: unknown;
  fieldType:
  | 'Text'
  | 'Password'
  | 'Paragraph'
  | 'Boolean'
  | 'Choice'
  | 'Date'
  | 'Time'
  | 'DateTime';
}

export interface OnSubmitProps {
  values: any;
  reset: UseFormReset<{ [key: string]: any }>;
  setError: UseFormSetError<{ [key: string]: any }>;
}

interface Props {
  fields: FormField[];
  onSubmit: SubmitHandler<OnSubmitProps>;
  isLoading: boolean;
  schemaRefinements?: {
    cb: (arg: { [x: string]: any }) => unknown;
    info: any;
  }[];
}

const CustomForm: FC<Props> = ({
  fields,
  onSubmit,
  isLoading,
  schemaRefinements,
}) => {
  const validationSchema = useMemo(() => {
    // Get validation schema dynamically from fields
    const v = fields.reduce<{ [key: string]: ZodTypeAny }>((acc, cur) => {
      // Call validate on every field with the field name
      // This will return a zod schema
      acc[cur.name] = cur.validation;
      return acc;
    }, {});

    if (schemaRefinements !== undefined && schemaRefinements.length > 0) {
      return z
        .object(v)
        .refine(schemaRefinements[0].cb, schemaRefinements[0].info);
    }
    return z.object(v);
  }, [fields, schemaRefinements]);

  const { control, handleSubmit, reset, setError } = useForm({
    defaultValues: getInitialValues(fields),
    resolver: zodResolver(validationSchema),
  });

  return (
    <form
      data-testid="form-handler"
      onSubmit={handleSubmit((values) => onSubmit({ values, reset, setError }))}
    >
      {fields.map((field) => {
        // Render fields dynamically
        // this will help in minimizing validation errors and missing values
        const { fieldType, initValue, validation, ...rest } = field;
        const commonProps = {
          key: field.name,
          control,
          ...rest,
        };
        switch (fieldType) {
          case 'Text':
            return <CustomTextField {...commonProps} />;
          case 'Password':
            return <CustomPasswordField {...commonProps} />;
          case 'Paragraph':
            return <CustomTextAreaField {...commonProps} />;
          case 'Boolean':
            return <CustomSwitchField {...commonProps} />;
          case 'Choice':
            return <CustomSelectField {...commonProps} />;
          case 'Date':
            return <CustomDateField {...commonProps} />;
          case 'Time':
            return <CustomTimeField {...commonProps} />;
          case 'DateTime':
            return <CustomDateTimeField {...commonProps} />;
          default:
            return null;
        }
      })}
      <SubmitButton text="Submit" isSubmitting={isLoading} />
    </form>
  );
};

CustomForm.defaultProps = {
  schemaRefinements: [],
};

export default CustomForm;
