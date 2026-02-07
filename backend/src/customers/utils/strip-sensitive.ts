const SENSITIVE_FIELDS = new Set(['national_id', 'internal_notes']);

export function stripSensitive(
  obj: Record<string, unknown>,
): Record<string, unknown> {
  const copy: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (SENSITIVE_FIELDS.has(key)) continue;
    if (Array.isArray(value)) {
      copy[key] = value.map((item: unknown) =>
        item !== null && typeof item === 'object' && !Array.isArray(item)
          ? stripSensitive(item as Record<string, unknown>)
          : item,
      );
    } else if (
      value !== null &&
      typeof value === 'object' &&
      !(value instanceof Date)
    ) {
      copy[key] = stripSensitive(value as Record<string, unknown>);
    } else {
      copy[key] = value;
    }
  }
  return copy;
}
