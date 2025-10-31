import { useCallback, useMemo, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import type { ValidationResult, Validator } from '../schemas/types';

type FieldValue = string | number | boolean | undefined;

type FormValuesConstraint<TValues> = { [K in keyof TValues]: FieldValue };

export interface UseFormOptions<TValues extends FormValuesConstraint<TValues>> {
  defaultValues: TValues;
  validator: Validator<TValues>;
}

export interface FormState<TValues extends FormValuesConstraint<TValues>> {
  values: TValues;
  errors: Record<keyof TValues & string, string>;
  isSubmitting: boolean;
}

export interface RegisteredFieldProps {
  name: string;
  value?: string | number;
  checked?: boolean;
  onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
}

export function useForm<TValues extends FormValuesConstraint<TValues>>({
  defaultValues,
  validator,
}: UseFormOptions<TValues>) {
  const [values, setValues] = useState<TValues>(defaultValues);
  const [errors, setErrors] = useState<Record<keyof TValues & string, string>>({} as Record<keyof TValues & string, string>);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const register = useCallback(
    (name: keyof TValues): RegisteredFieldProps => {
      const currentValue = values[name];
      const isBoolean = typeof currentValue === 'boolean';

      return {
        name: String(name),
        value: isBoolean ? undefined : (currentValue as string | number | undefined),
        checked: isBoolean ? Boolean(currentValue) : undefined,
        onChange: (event) => {
          const target = event.target;
          const nextValue =
            target.type === 'checkbox' ? Boolean((target as HTMLInputElement).checked) : target.value;
          setValues((prev) => ({
            ...prev,
            [name]: nextValue as TValues[keyof TValues],
          }));
        },
      };
    },
    [values],
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
    setValues((prev) => ({ ...prev, [name]: value as TValues[keyof TValues] }));
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
