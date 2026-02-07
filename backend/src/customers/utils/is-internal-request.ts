export function isInternalRequest(headerValue: string | undefined): boolean {
  return String(headerValue ?? '').toLowerCase() === 'true';
}
