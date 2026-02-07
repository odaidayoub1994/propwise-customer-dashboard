const SENSITIVE_FIELDS = ['national_id', 'internal_notes'];

export function stripSensitive<T extends Record<string, unknown>>(
  obj: T,
): Omit<T, 'national_id' | 'internal_notes'> {
  const copy = { ...obj };
  for (const field of SENSITIVE_FIELDS) {
    delete copy[field];
  }
  return copy;
}
