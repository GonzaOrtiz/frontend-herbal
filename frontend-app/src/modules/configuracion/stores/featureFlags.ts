import type { FeatureFlagKey } from '../types';

type FeatureFlagsState = Record<FeatureFlagKey, boolean>;

const state: FeatureFlagsState = {
  catalogoActividades: true,
  catalogoEmpleados: true,
  catalogoCentros: true,
  parametrosGenerales: false,
};

const listeners = new Set<(flags: FeatureFlagsState) => void>();

export function setFeatureFlag(flag: FeatureFlagKey, value: boolean) {
  state[flag] = value;
  listeners.forEach((listener) => listener({ ...state }));
}

export function useFeatureFlags(): FeatureFlagsState {
  return { ...state };
}

export function subscribeToFeatureFlags(listener: (flags: FeatureFlagsState) => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
