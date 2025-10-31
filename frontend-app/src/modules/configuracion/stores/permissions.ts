const permissions = new Set<string>([
  'catalogos.read',
  'catalogos.write',
  'catalogos.audit',
]);

export function hasPermission(permission: string) {
  return permissions.has(permission);
}

export function getPermissions() {
  return Array.from(permissions);
}

export function setPermissions(values: string[]) {
  permissions.clear();
  values.forEach((value) => permissions.add(value));
}
