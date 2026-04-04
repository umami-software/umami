import { useConfig } from '@/components/hooks/useConfig';
import { LINKS_URL, PIXELS_URL } from '@/lib/constants';

export function useSlug(type: 'link' | 'pixel') {
  const config = useConfig();
  const linksUrl = config?.linksUrl;
  const pixelsUrl = config?.pixelsUrl;

  const hostUrl = type === 'link' ? linksUrl || LINKS_URL : pixelsUrl || PIXELS_URL;

  const getSlugUrl = (slug: string) => {
    return `${hostUrl}/${slug}`;
  };

  return { getSlugUrl, hostUrl };
}
