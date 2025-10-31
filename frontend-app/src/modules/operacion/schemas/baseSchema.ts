export type SchemaPrimitive = 'string' | 'number' | 'date' | 'enum';

export interface SchemaField {
  key: string;
  label: string;
  type: SchemaPrimitive;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  enumValues?: string[];
  refine?: (value: unknown, record: Record<string, unknown>) => string | null;
}

export interface SchemaDefinition<TOutput> {
  name: string;
  fields: SchemaField[];
  transform: (record: Record<string, unknown>) => TOutput;
}

export interface SchemaValidationError {
  field: string;
  message: string;
}

export interface SchemaValidationResult<TOutput> {
  success: boolean;
  data?: TOutput;
  errors?: SchemaValidationError[];
}

export interface Schema<TOutput> {
  name: string;
  fields: SchemaField[];
  parse(record: Record<string, unknown>): SchemaValidationResult<TOutput>;
  parseMany(records: Record<string, unknown>[]): {
    success: boolean;
    data: TOutput[];
    errors: SchemaValidationError[];
  };
}

function isDateString(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  return !Number.isNaN(Date.parse(value));
}

export function createSchema<TOutput>(definition: SchemaDefinition<TOutput>): Schema<TOutput> {
  const parse = (record: Record<string, unknown>): SchemaValidationResult<TOutput> => {
    const errors: SchemaValidationError[] = [];

    for (const field of definition.fields) {
      const raw = record[field.key];
      const exists = raw !== undefined && raw !== null && raw !== '';

      if (!exists) {
        if (field.required) {
          errors.push({ field: field.key, message: `${field.label} es obligatorio.` });
        }
        continue;
      }

      switch (field.type) {
        case 'string': {
          if (typeof raw !== 'string') {
            errors.push({ field: field.key, message: `${field.label} debe ser una cadena.` });
            break;
          }
          if (field.minLength && raw.length < field.minLength) {
            errors.push({ field: field.key, message: `${field.label} debe tener al menos ${field.minLength} caracteres.` });
          }
          if (field.maxLength && raw.length > field.maxLength) {
            errors.push({ field: field.key, message: `${field.label} no puede exceder ${field.maxLength} caracteres.` });
          }
          break;
        }
        case 'number': {
          const value = typeof raw === 'number' ? raw : Number(raw);
          if (Number.isNaN(value)) {
            errors.push({ field: field.key, message: `${field.label} debe ser numérico.` });
            break;
          }
          if (field.min !== undefined && value < field.min) {
            errors.push({ field: field.key, message: `${field.label} no puede ser menor a ${field.min}.` });
          }
          if (field.max !== undefined && value > field.max) {
            errors.push({ field: field.key, message: `${field.label} no puede ser mayor a ${field.max}.` });
          }
          break;
        }
        case 'date': {
          if (!isDateString(raw)) {
            errors.push({ field: field.key, message: `${field.label} debe ser una fecha válida.` });
          }
          break;
        }
        case 'enum': {
          if (typeof raw !== 'string' || !field.enumValues?.includes(raw)) {
            errors.push({ field: field.key, message: `${field.label} tiene un valor no permitido.` });
          }
          break;
        }
        default:
          break;
      }

      if (field.refine) {
        const message = field.refine(raw, record);
        if (message) {
          errors.push({ field: field.key, message });
        }
      }
    }

    if (errors.length) {
      return { success: false, errors };
    }

    try {
      const data = definition.transform(record);
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        errors: [
          {
            field: '_base',
            message: error instanceof Error ? error.message : 'Error al transformar el registro.',
          },
        ],
      };
    }
  };

  const parseMany = (records: Record<string, unknown>[]) => {
    const data: TOutput[] = [];
    const errors: SchemaValidationError[] = [];

    records.forEach((record, index) => {
      const result = parse(record);
      if (result.success && result.data) {
        data.push(result.data);
      } else if (result.errors) {
        result.errors.forEach((error) => {
          errors.push({ ...error, field: `${error.field}`, message: `Fila ${index + 1}: ${error.message}` });
        });
      }
    });

    return {
      success: errors.length === 0,
      data,
      errors,
    };
  };

  return {
    name: definition.name,
    fields: definition.fields,
    parse,
    parseMany,
  };
}
