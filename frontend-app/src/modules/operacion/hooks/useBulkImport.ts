import { useState } from 'react';
import { useQueryClient } from '@/lib/query/QueryClient';
import type { Schema } from '../schemas/baseSchema';
import type {
  BitacoraImportacion,
  ImportacionError,
  OperacionModulo,
  OperacionRegistro,
} from '../types';
import { useImportacionStatus } from './useOperacionData';
import { dataset } from '../utils/sampleData';
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

    dataset[modulo] = [...dataset[modulo], ...result.data];
    queryClient.invalidateQueries(['operacion', modulo]);

    const durationMs = performance.now() - start;
    const resumen = {
      modulo,
      status: 'completed' as const,
      resumen: {
        total: rows.length,
        exitosos: result.data.length,
        fallidos: rows.length - result.data.length,
        omitidos: 0,
      },
      errores: [],
      archivoOriginal: archivo,
      resumeToken: `${modulo}-${Date.now()}`,
    } satisfies BitacoraImportacion;

    setBitacora(resumen);
    setStatus('completed');

    result.data.forEach((registro) => {
      emitOperacionEvent({ type: 'registro:creado', modulo, registro });
    });

    emitOperacionEvent({
      type: 'importacion:finalizada',
      modulo,
      resumen: {
        accion: 'aprobar',
        registrosProcesados: result.data.length,
        impactoExistencias: result.data.reduce((acc, registro) => {
          if ('cantidad' in registro) return acc + registro.cantidad;
          if ('cantidadProducida' in registro) return acc + registro.cantidadProducida;
          return acc;
        }, 0),
        impactoCostos: Math.round(durationMs / 10),
        mensaje: `Importación completada en ${durationMs.toFixed(0)}ms`,
      },
    });

    return { success: true, registros: result.data } as const;
  };

  const reset = () => {
    setBitacora(null);
    setStatus('idle');
  };

  return { importar, status, bitacora, reset };
}
