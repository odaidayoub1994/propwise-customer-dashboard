export function internalHeaders(
  isInternal: boolean,
): Record<string, string> {
  return isInternal ? { 'x-internal': 'true' } : {};
}
