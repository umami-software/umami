function normalizePathname(pathname?: string) {
  if (!pathname) {
    return '';
  }

  return `/${pathname.replace(/^\/+/, '')}`;
}

function normalizeBasePath(basePath?: string) {
  if (!basePath) {
    return '';
  }

  return `/${basePath.replace(/^\/+|\/+$/g, '')}`;
}

export function matchesConfiguredPath(
  pathname: string,
  configuredPath?: string,
  basePath?: string,
) {
  const normalizedPathname = normalizePathname(pathname);
  const normalizedConfiguredPath = normalizePathname(configuredPath);

  if (!normalizedConfiguredPath) {
    return false;
  }

  if (normalizedPathname === normalizedConfiguredPath) {
    return true;
  }

  const normalizedBasePath = normalizeBasePath(basePath);

  return normalizedBasePath
    ? normalizedPathname === `${normalizedBasePath}${normalizedConfiguredPath}`
    : false;
}
