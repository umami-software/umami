const PLACEHOLDER_APP_SECRET = 'replace-me-with-a-random-string';
const TWO_FACTOR_KEY_REGEX = /^[0-9a-fA-F]{64}$/;

export function getMissingEnvVars(env, vars) {
  return vars.filter(key => !env[key]);
}

export function getAppSecretError(env) {
  const value = env.APP_SECRET?.trim();

  if (!value) {
    return (
      'APP_SECRET is not defined. Generate one with "openssl rand -hex 32" ' +
      'and set APP_SECRET in your environment or .env file.'
    );
  }

  if (value === PLACEHOLDER_APP_SECRET) {
    return (
      'APP_SECRET cannot use the default placeholder value. ' +
      'Generate one with "openssl rand -hex 32" and set APP_SECRET in your environment or .env file.'
    );
  }

  return null;
}

export function getTwoFactorEncryptionKeyError(env) {
  const value = env.TWO_FACTOR_ENCRYPTION_KEY;

  if (value == null || value === '') {
    return null;
  }

  if (!TWO_FACTOR_KEY_REGEX.test(value)) {
    return (
      'TWO_FACTOR_ENCRYPTION_KEY must be a 64-character hex string when set. ' +
      'Generate one with "openssl rand -hex 32", or leave it unset to disable two-factor authentication.'
    );
  }

  return null;
}

export function collectEnvErrors(env = process.env) {
  const errors = [];

  if (!env.SKIP_DB_CHECK && !env.DATABASE_TYPE) {
    for (const key of getMissingEnvVars(env, ['DATABASE_URL'])) {
      errors.push(`${key} is not defined.`);
    }
  }

  if (env.CLOUD_URL) {
    for (const key of getMissingEnvVars(env, ['CLICKHOUSE_URL', 'REDIS_URL'])) {
      errors.push(`${key} is not defined.`);
    }
  }

  if (!env.SKIP_APP_SECRET_CHECK) {
    const appSecretError = getAppSecretError(env);
    if (appSecretError) {
      errors.push(appSecretError);
    }
  }

  const twoFactorError = getTwoFactorEncryptionKeyError(env);
  if (twoFactorError) {
    errors.push(twoFactorError);
  }

  return errors;
}
