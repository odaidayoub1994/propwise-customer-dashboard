// Postgres treats \ as implicit LIKE escape character
export function escapeILike(str: string): string {
  return str.replace(/[%_\\]/g, '\\$&');
}
