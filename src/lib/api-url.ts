type ApiUrlOptions = {
  apiUrl?: string;
  basePath?: string;
};

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

export function getApiUrl(url: string, options: ApiUrlOptions = {}) {
  if (isAbsoluteUrl(url)) {
    return url;
  }

  const { apiUrl = process.env.apiUrl || '', basePath = process.env.basePath || '' } = options;
  const baseUrl = apiUrl
    ? isAbsoluteUrl(apiUrl)
      ? apiUrl
      : joinPath(basePath, apiUrl)
    : joinPath(basePath, '/api');

  return joinPath(baseUrl, url);
}
