import { useState } from 'react';
import { useQueryClient } from '@/lib/query/QueryClient';
import type { Schema } from '../schemas/baseSchema';
import { createOperacionRegistro } from '../api';
import type {
  BitacoraImportacion,
  ImportacionError,
  OperacionModulo,
  OperacionRegistro,
} from '../types';
import { useImportacionStatus } from './useOperacionData';
import { emitOperacionEvent } from '../utils/eventBus';

interface ImportPayload {
  rows: Record<string, unknown>[];
  usuario: string;
  archivo?: string;
}

function buildErrors(errors: ReturnType<Schema<OperacionRegistro>['parseMany']>['errors'], usuario: string): ImportacionError[] {
  return errors.map((error) => ({
    row: Number(error.field.replace(/[^0-9]/g, '')) || 0,
    field: error.field,
    message: error.message,
    type: error.message.includes('negativo') ? 'business' : 'validation',
    usuario,
    timestamp: new Date().toISOString(),
  }));
}

export function useBulkImport(modulo: OperacionModulo, schema: Schema<OperacionRegistro>) {
  const { status, setStatus } = useImportacionStatus(modulo);
  const queryClient = useQueryClient();
  const [bitacora, setBitacora] = useState<BitacoraImportacion | null>(null);

  const importar = async ({ rows, usuario, archivo }: ImportPayload) => {
    setStatus('processing');
    const start = performance.now();

    await new Promise((resolve) => setTimeout(resolve, 120));

    const result = schema.parseMany(rows);

    if (!result.success) {
      const errores = buildErrors(result.errors, usuario);
      setBitacora({
        modulo,
        status: 'failed',
        resumen: {
          total: rows.length,
          exitosos: rows.length - errores.length,
          fallidos: errores.length,
          omitidos: 0,
        },
        errores,
        archivoOriginal: archivo,
        resumeToken: `${modulo}-${Date.now()}`,
      });
      setStatus('failed');
      return { success: false, errores } as const;
    }

    try {
      const registrosValidados = result.data ?? [];
      const registrosCreados: OperacionRegistro[] = [];
      const erroresRemotos: ImportacionError[] = [];

      for (const [index, registro] of registrosValidados.entries()) {
        try {
          const creado = await createOperacionRegistro(modulo, registro, usuario);
          registrosCreados.push(creado);
        } catch (error) {
          erroresRemotos.push({
            row: index + 1,
            field: '_base',
            message:
              error instanceof Error ? error.message : 'Error desconocido al crear el registro en el servidor.',
            type: 'business',
            usuario,
            timestamp: new Date().toISOString(),
          });
        }
      }

      const resumen = {
        total: registrosValidados.length,
        exitosos: registrosCreados.length,
        fallidos: erroresRemotos.length,
        omitidos: 0,
      };

      const bitacoraLocal: BitacoraImportacion = {
        modulo,
        status: erroresRemotos.length ? 'failed' : 'completed',
        resumen,
        errores: erroresRemotos,
        archivoOriginal: archivo,
        resumeToken: `${modulo}-${Date.now()}`,
      };

      queryClient.invalidateQueries(['operacion', modulo]);

      setBitacora(bitacoraLocal);
      setStatus(bitacoraLocal.status);

      registrosCreados.forEach((registro) => {
        emitOperacionEvent({ type: 'registro:creado', modulo, registro });
      });

      const durationMs = performance.now() - start;
      emitOperacionEvent({
        type: 'importacion:finalizada',
        modulo,
        resumen: {
          accion: 'aprobar',
          registrosProcesados: registrosCreados.length,
          impactoExistencias: registrosCreados.reduce((acc, registro) => {
            if ('cantidad' in registro && typeof registro.cantidad === 'number') {
              return acc + registro.cantidad;
            }
            if ('litros' in registro && typeof registro.litros === 'number') {
              return acc + registro.litros;
            }
            return acc;
          }, 0),
          impactoCostos: Math.round(durationMs / 10),
          mensaje:
            bitacoraLocal.status === 'completed'
              ? `Importación completada en ${durationMs.toFixed(0)}ms`
              : 'Importación con incidencias',
        },
      });

      return { success: bitacoraLocal.status !== 'failed', registros: registrosCreados } as const;
    } catch (error) {
      const errores: ImportacionError[] = [
        {
          row: 0,
          field: '_base',
          message:
            error instanceof Error
              ? error.message
              : 'Error desconocido al ejecutar la importación.',
          type: 'conflict',
          usuario,
          timestamp: new Date().toISOString(),
        },
      ];

      const fallback: BitacoraImportacion = {
        modulo,
        status: 'failed',
        resumen: {
          total: rows.length,
          exitosos: 0,
          fallidos: rows.length,
          omitidos: 0,
        },
        errores,
        archivoOriginal: archivo,
        resumeToken: `${modulo}-${Date.now()}`,
      };

      setBitacora(fallback);
      setStatus('failed');
      return { success: false, errores } as const;
    }
  };

  const reset = () => {
    setBitacora(null);
    setStatus('idle');
  };

  return { importar, status, bitacora, reset };
}
