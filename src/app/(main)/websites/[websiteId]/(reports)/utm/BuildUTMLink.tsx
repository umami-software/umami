import { useMessages, useWebsite } from '@/components/hooks';
import { Button, Column, Label, Row, TextField } from '@umami/react-zen';
import { useMemo, useState } from 'react';

export function BuildUTMLink({ onClose }: { onClose: () => void }) {
  const { t, labels } = useMessages();
  const website = useWebsite();

  const [path, setPath] = useState('');
  const [source, setSource] = useState('');
  const [medium, setMedium] = useState('');
  const [campaign, setCampaign] = useState('');
  const [content, setContent] = useState('');
  const [term, setTerm] = useState('');

  const builtUrl = useMemo(() => {
    if (!website.domain) return '';

    let domain = website.domain.replace(/\/+$/, '');

    if (!domain.startsWith('http://') && !domain.startsWith('https://')) {
      domain = `https://${domain}`;
    }

    const value = path.trim();

    let baseUrl = domain;

    if (value) {
      if (value.startsWith('http://') || value.startsWith('https://')) {
        baseUrl = value;
      } else {
        baseUrl = `${domain}/${value.replace(/^\/+/, '')}`;
      }
    }

    const params = new URLSearchParams();

    if (source) params.set('utm_source', source);
    if (medium) params.set('utm_medium', medium);
    if (campaign) params.set('utm_campaign', campaign);
    if (content) params.set('utm_content', content);
    if (term) params.set('utm_term', term);

    const query = params.toString();

    if (!query) return baseUrl;

    const url = new URL(baseUrl);

    params.forEach((value, key) => url.searchParams.set(key, value));

    return url.toString();
  }, [website.domain, path, source, medium, campaign, content, term]);

  return (
    <Column gap>
      <Column>
        <Label>{t(labels.utmUrlPath)}</Label>
        <TextField
          value={path}
          onChange={setPath}
          placeholder={`/blog/article, ${website.domain}/blog/article`}
        />
      </Column>

      <Column>
        <Label>{t(labels.utmCampaign)}</Label>
        <TextField value={campaign} onChange={setCampaign} placeholder="promotion, sale, etc." />
      </Column>

      <Column>
        <Label>{t(labels.utmContent)}</Label>
        <TextField value={content} onChange={setContent} placeholder="buy-now" />
      </Column>

      <Column>
        <Label>{t(labels.utmMedium)}</Label>
        <TextField value={medium} onChange={setMedium} placeholder="email, social, cpc, etc." />
      </Column>

      <Column>
        <Label>{t(labels.utmSource)}</Label>
        <TextField
          value={source}
          onChange={setSource}
          placeholder="newsletter, twitter, google, etc."
        />
      </Column>

      <Column>
        <Label>{t(labels.utmTerm)}</Label>
        <TextField value={term} onChange={setTerm} placeholder="running-shoes" />
      </Column>

      <Column>
        <Label>{t(labels.utmGeneratedUrl)}</Label>
        <TextField value={builtUrl} isReadOnly allowCopy />
      </Column>

      <Row justifyContent="flex-end" paddingTop="3" gap="3">
        <Button onPress={onClose}>{t(labels.close)}</Button>
      </Row>
    </Column>
  );
}
