/** Reads an env variable. Throws if required and missing. */
export function parseFromEnvVar(
  name: string,
  required: boolean = true,
  defaultValue?: string,
): string {
  const value = process.env[name];
  if (!value) {
    if (defaultValue !== undefined) {
      return defaultValue;
    }
    if (!required) {
      return '';
    }
    throw new Error(`${name} env variable is required`);
  }
  return value;
}

// ─── Server ──────────────────────────────────────────────────────────────────

/** Port the NestJS application listens on */
export const PORT: number = parseInt(parseFromEnvVar('PORT', false, '3000'));

/** Allowed CORS origin — '*' allows all origins (development only) */
export const CORS_ORIGIN: string = parseFromEnvVar('CORS_ORIGIN', false, '*');

// ─── PostgreSQL ──────────────────────────────────────────────────────────────

/** PostgreSQL host — 'localhost' on host, 'postgres' in Docker */
export const DB_HOST: string = parseFromEnvVar('DB_HOST');

/** PostgreSQL port */
export const DB_PORT: number = parseInt(
  parseFromEnvVar('DB_PORT', false, '5432'),
);

/** PostgreSQL username */
export const DB_USERNAME: string = parseFromEnvVar('DB_USERNAME');

/** PostgreSQL password */
export const DB_PASSWORD: string = parseFromEnvVar('DB_PASSWORD');

/** PostgreSQL database name */
export const DB_NAME: string = parseFromEnvVar('DB_NAME');

// ─── Redis ───────────────────────────────────────────────────────────────────

/** Redis host — 'localhost' on host, 'redis' in Docker */
export const REDIS_HOST: string = parseFromEnvVar(
  'REDIS_HOST',
  false,
  'localhost',
);

/** Redis port */
export const REDIS_PORT: number = parseInt(
  parseFromEnvVar('REDIS_PORT', false, '6379'),
);
