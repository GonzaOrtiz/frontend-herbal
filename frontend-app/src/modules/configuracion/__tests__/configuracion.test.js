import assert from 'node:assert/strict';
import test from 'node:test';
import { createQueryClient } from '../../../lib/query/queryClientCore.js';
import { filterRoutesByFeatureFlags, getSyncStatus } from '../utils/moduleState.js';
import { setPermissions } from '../stores/permissions.js';
import { actividadValidator } from '../schemas/actividadSchema.js';

const baseFlags = {
  catalogoActividades: true,
  catalogoEmpleados: true,
  catalogoCentros: true,
  parametrosGenerales: true,
};

test('filterRoutesByFeatureFlags respeta permisos y feature flags', () => {
  const routes = [
    {
      id: 'actividades',
      path: 'actividades',
      meta: {
        title: 'Actividades',
        description: '',
        breadcrumb: ['Configuración', 'Actividades'],
        permissions: { read: 'catalogos.read' },
        featureFlag: 'catalogoActividades',
      },
      element: null,
    },
    {
      id: 'empleados',
      path: 'empleados',
      meta: {
        title: 'Empleados',
        description: '',
        breadcrumb: ['Configuración', 'Empleados'],
        permissions: { read: 'catalogos.write' },
        featureFlag: 'catalogoEmpleados',
      },
      element: null,
    },
  ];

  setPermissions(['catalogos.read']);
  const result = filterRoutesByFeatureFlags(routes, baseFlags);

  assert.equal(result.length, 1);
  assert.equal(result[0].id, 'actividades');
  setPermissions(['catalogos.read', 'catalogos.write', 'catalogos.audit']);
});

test('getSyncStatus detecta bandera en sessionStorage', () => {
  const storage = new Map();
  globalThis.sessionStorage = {
    getItem: (key) => storage.get(key) ?? null,
    setItem: (key, value) => {
      storage.set(key, value);
    },
  };

  const route = {
    id: 'actividades',
    path: 'actividades',
    meta: {
      title: 'Actividades',
      description: '',
      breadcrumb: ['Configuración', 'Actividades'],
      permissions: { read: 'catalogos.read' },
    },
    element: null,
  };

  globalThis.sessionStorage.setItem('sync:actividades', '1');
  const status = getSyncStatus(route);
  assert.equal(status.inProgress, true);
  assert.equal(status.etaMinutes, 3);
});

test('actividadValidator devuelve errores de validación', () => {
  const result = actividadValidator({ nombre: 'a', descripcion: 'corta' });
  assert.equal(result.success, false);
  assert.ok(result.issues?.some((issue) => issue.path === 'nombre'));
  assert.ok(result.issues?.some((issue) => issue.path === 'descripcion'));
});

test('QueryClient cachea y permite invalidar', async () => {
  const client = createQueryClient({ staleTime: 10_000 });
  let fetchCount = 0;

  const queryFn = async () => {
    fetchCount += 1;
    return 'ok';
  };

  await client.fetchQuery(['catalogo', 'test'], queryFn);
  await client.fetchQuery(['catalogo', 'test'], queryFn);

  assert.equal(fetchCount, 1);

  client.invalidateQueries(['catalogo', 'test']);
  await client.fetchQuery(['catalogo', 'test'], queryFn);

  assert.equal(fetchCount, 2);
});
