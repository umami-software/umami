import { FAVICON_URL, GROUPED_DOMAINS } from '@/lib/constants';

function getHostName(url: string) {
  const match = url.match(/^(?:https?:\/\/)?(?:[^@\n]+@)?([^:/\n?=]+)/im);
  return match && match.length > 1 ? match[1] : null;
}

export function Favicon({ domain, ...props }) {
  if (process.env.privateMode) {
    return null;
  }

  const url = process.env.faviconURL || FAVICON_URL;
  const hostName = domain ? getHostName(domain) : null;
  const domainName = GROUPED_DOMAINS[hostName]?.domain || hostName;
  const src = hostName ? url.replace(/\{\{\s*domain\s*}}/, domainName) : null;

  return hostName ? <img src={src} width={16} height={16} alt="" {...props} /> : null;
}

export default Favicon;
