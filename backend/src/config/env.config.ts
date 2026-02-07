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

// Server
export const PORT: number = parseInt(parseFromEnvVar('PORT', false, '3000'));
export const CORS_ORIGIN: string = parseFromEnvVar('CORS_ORIGIN', false, '*');

// PostgreSQL
export const DB_HOST: string = parseFromEnvVar('DB_HOST');
export const DB_PORT: number = parseInt(
  parseFromEnvVar('DB_PORT', false, '5432'),
);
export const DB_USERNAME: string = parseFromEnvVar('DB_USERNAME');
export const DB_PASSWORD: string = parseFromEnvVar('DB_PASSWORD');
export const DB_NAME: string = parseFromEnvVar('DB_NAME');

// Redis
export const REDIS_HOST: string = parseFromEnvVar(
  'REDIS_HOST',
  false,
  'localhost',
);
export const REDIS_PORT: number = parseInt(
  parseFromEnvVar('REDIS_PORT', false, '6379'),
);

// Cache
export const CACHE_TTL: number = parseInt(
  parseFromEnvVar('CACHE_TTL', false, '60'),
);
