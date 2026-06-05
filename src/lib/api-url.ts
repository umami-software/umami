type ApiUrlOptions = {
  apiUrl?: string;
  basePath?: string;
};

const APP_ROUTE_PATTERNS: RegExp[] = [/^\/auth(\/|$)/, /^\/config(\/|$)/];

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, '');
}

function trimLeadingSlash(value: string) {
  return value.replace(/^\/+/, '');
}

function joinPath(base: string, path: string) {
  if (!base) {
    return `/${trimLeadingSlash(path)}`;
  }

  return `${trimTrailingSlash(base)}/${trimLeadingSlash(path)}`;
}

function isAbsoluteUrl(url: string) {
  return /^https?:\/\//i.test(url);
}

function isAppRoute(url: string) {
  const path = `/${trimLeadingSlash(url.split('?')[0])}`;
  return APP_ROUTE_PATTERNS.some(re => re.test(path));
}

export function getApiUrl(url: string, options: ApiUrlOptions = {}) {
  if (isAbsoluteUrl(url)) {
    return url;
  }

  const { apiUrl = process.env.apiUrl || '', basePath = process.env.basePath || '' } = options;
  const useApiUrl = apiUrl && !isAppRoute(url);
  const baseUrl = useApiUrl
    ? isAbsoluteUrl(apiUrl)
      ? apiUrl
      : joinPath(basePath, apiUrl)
    : joinPath(basePath, '/api');

  return joinPath(baseUrl, url);
}
