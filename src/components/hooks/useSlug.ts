import { useConfig } from '@/components/hooks/useConfig';
import { LINKS_URL, PIXELS_URL } from '@/lib/constants';

export function useSlug(type: 'link' | 'pixel') {
  const config = useConfig();
  const linksUrls = config?.linksUrls?.length ? config.linksUrls : [config?.linksUrl || LINKS_URL];
  const pixelsUrl = config?.pixelsUrl;

  const hostUrls = type === 'link' ? linksUrls : [pixelsUrl || PIXELS_URL];
  const hostUrl = hostUrls[0];

  // A saved base url that is no longer configured falls back to the default.
  const getHostUrl = (baseUrl?: string | null) => {
    return baseUrl && hostUrls.includes(baseUrl) ? baseUrl : hostUrl;
  };

  const getSlugUrl = (slug: string, baseUrl?: string | null) => {
    return `${getHostUrl(baseUrl)}/${slug}`;
  };

  return { getSlugUrl, getHostUrl, hostUrl, hostUrls };
}
