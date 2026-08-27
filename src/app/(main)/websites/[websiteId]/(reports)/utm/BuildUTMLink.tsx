import { useWebsite } from '@/components/hooks';
import { Column, Label, TextField } from '@umami/react-zen';
import { useMemo, useState } from 'react';

export function BuildUTMLink() {
  const website = useWebsite();

  const [path, setPath] = useState('');
  const [source, setSource] = useState('');
  const [medium, setMedium] = useState('');
  const [campaign, setCampaign] = useState('');

  const builtUrl = useMemo(() => {
    if (!website.domain) return '';

    const domain = website.domain.replace(/\/+$/, '');
    const value = path.trim();

    let baseUrl = domain;

    if (value) {
      if (value.startsWith('http://') || value.startsWith('https://')) {
        baseUrl = value.startsWith(domain + '/') || value === domain ? value : value;
      } else {
        baseUrl = `${domain}/${value.replace(/^\/+/, '')}`;
      }
    }

    const params = new URLSearchParams();

    if (source) params.set('utm_source', source);
    if (medium) params.set('utm_medium', medium);
    if (campaign) params.set('utm_campaign', campaign);

    const query = params.toString();

    return query ? `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}${query}` : baseUrl;
  }, [website.domain, path, source, medium, campaign]);

  return (
    <Column gap>
      <Column>
        <Label>Path / Link</Label>
        <TextField value={path} onChange={setPath} placeholder="/blog/article" />
      </Column>

      <Column>
        <Label>Source</Label>
        <TextField value={source} onChange={setSource} placeholder="google" />
      </Column>

      <Column>
        <Label>Medium</Label>
        <TextField value={medium} onChange={setMedium} placeholder="cpc" />
      </Column>

      <Column>
        <Label>Campaign</Label>
        <TextField value={campaign} onChange={setCampaign} placeholder="summer-sale" />
      </Column>

      <Column>
        <Label>URL generada</Label>
        <TextField value={builtUrl} isReadOnly />
      </Column>
    </Column>
  );
}
