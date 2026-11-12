export function getAppSecret(): string {
  const value = process.env.APP_SECRET;

  if (!value?.trim() || value.trim() === 'replace-me-with-a-random-string') {
    throw new Error(
      'APP_SECRET must be set to a non-empty secret and cannot use the default placeholder. ' +
        'Generate one with "openssl rand -hex 32" and set APP_SECRET in your environment or .env file.',
    );
  }

  return value;
}
