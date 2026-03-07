import { useEffect, useMemo, useState } from 'react';
import { useConfig } from '@/components/hooks';
import { FAVICON_URL, GROUPED_DOMAINS } from '@/lib/constants';

function getHostName(url: string) {
  const match = url.match(/^(?:https?:\/\/)?(?:[^@\n]+@)?([^:/\n?=]+)/im);
  return match && match.length > 1 ? match[1] : null;
}

export function Favicon({ domain, ...props }) {
  const config = useConfig();

  if (config?.privateMode) {
    return null;
  }

  const hostName = domain ? getHostName(domain) : null;
  const domainName = hostName ? GROUPED_DOMAINS[hostName]?.domain || hostName : null;
  const candidates = useMemo(() => {
    if (!domainName) {
      return [];
    }

    const urls = [`https://${domainName}/favicon.ico`];

    if (globalThis?.location?.protocol !== 'https:') {
      urls.push(`http://${domainName}/favicon.ico`);
    }

    if (config?.faviconUrl) {
      urls.push(config.faviconUrl.replace(/\{\{\s*domain\s*}}/, domainName));
    }

    urls.push(FAVICON_URL.replace(/\{\{\s*domain\s*}}/, domainName));

    return urls;
  }, [config?.faviconUrl, domainName]);
  const [index, setIndex] = useState(0);
  const src = candidates[index] || null;

  useEffect(() => {
    setIndex(0);
  }, [candidates.join('|')]);

  function handleError() {
    setIndex(current => (current + 1 < candidates.length ? current + 1 : current));
  }

  return hostName && src ? (
    <img src={src} width={16} height={16} alt="" onError={handleError} {...props} />
  ) : null;
}
