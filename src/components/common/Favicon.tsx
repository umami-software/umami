import { useEffect, useState } from 'react';
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
  const primaryUrl = hostName
    ? config?.faviconUrl
        ? config.faviconUrl.replace(/\{\{\s*domain\s*}}/, domainName)
        : `https://${domainName}/favicon.ico`
    : null;
  const fallbackUrl = hostName
    ? FAVICON_URL.replace(/\{\{\s*domain\s*}}/, domainName)
    : null;
  const [src, setSrc] = useState(primaryUrl);

  useEffect(() => {
    setSrc(primaryUrl);
  }, [primaryUrl]);

  function handleError() {
    if (src && fallbackUrl && src !== fallbackUrl) {
      setSrc(fallbackUrl);
    }
  }

  return hostName && src ? (
    <img src={src} width={16} height={16} alt="" onError={handleError} {...props} />
  ) : null;
}
