import { FormEvent, useCallback, useMemo, useState } from 'react';
import type { ValidationResult, Validator } from '../schemas/types';

type FieldValue = string | number | boolean;

export interface UseFormOptions<TValues extends Record<string, FieldValue>> {
  defaultValues: TValues;
  validator: Validator<TValues>;
}

export interface FormState<TValues extends Record<string, FieldValue>> {
  values: TValues;
  errors: Record<keyof TValues & string, string>;
  isSubmitting: boolean;
}

export interface RegisteredFieldProps {
  name: string;
  value: FieldValue;
  checked?: boolean;
  onChange: (event: { target: { value: FieldValue; checked?: boolean; type?: string } }) => void;
}

export function useForm<TValues extends Record<string, FieldValue>>({
  defaultValues,
  validator,
}: UseFormOptions<TValues>) {
  const [values, setValues] = useState<TValues>(defaultValues);
  const [errors, setErrors] = useState<Record<keyof TValues & string, string>>({} as Record<keyof TValues & string, string>);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const register = useCallback(
    (name: keyof TValues): RegisteredFieldProps => ({
      name: String(name),
      value: values[name as string],
      checked:
        typeof values[name as string] === 'boolean'
          ? Boolean(values[name as string])
          : undefined,
      onChange: (event) => {
        const targetType = event.target.type;
        const newValue = targetType === 'checkbox' ? Boolean(event.target.checked) : event.target.value;
        setValues((prev) => ({ ...prev, [name]: newValue }));
      },
    }),
    [values]
  );

  const handleSubmit = useCallback(
    (onValid: (values: TValues) => Promise<void> | void) =>
      async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsSubmitting(true);
        const result: ValidationResult<TValues> = validator(values);
        if (result.success && result.data) {
          setErrors({} as Record<keyof TValues & string, string>);
          await onValid(result.data);
        } else {
          const nextErrors = {} as Record<keyof TValues & string, string>;
          result.issues?.forEach((issue) => {
            nextErrors[issue.path as keyof TValues & string] = issue.message;
          });
          setErrors(nextErrors);
        }
        setIsSubmitting(false);
      },
    [validator, values]
  );

  const setValue = useCallback((name: keyof TValues, value: FieldValue) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  }, []);

  const reset = useCallback((nextValues?: TValues) => {
    setValues(nextValues ?? defaultValues);
    setErrors({} as Record<keyof TValues & string, string>);
  }, [defaultValues]);

  const formState: FormState<TValues> = useMemo(
    () => ({ values, errors, isSubmitting }),
    [values, errors, isSubmitting]
  );

  return { register, handleSubmit, setValue, reset, formState };
}
