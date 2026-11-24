import {
  Field,
  FieldLabel,
  Grid,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@umami/react-zen';
import { useTranslations } from 'next-intl';
import { useEffect } from 'react';
import { type AdsConnection, useAdsConnectionsQuery, useNavigation } from '@/components/hooks';

// Google shows customer IDs as 123-456-7890.
function formatAccountId(id: string) {
  return /^\d{10}$/.test(id) ? `${id.slice(0, 3)}-${id.slice(3, 6)}-${id.slice(6)}` : id;
}

function getLabel({ name, accountId }: AdsConnection) {
  return name ? `${name} · ${formatAccountId(accountId)}` : formatAccountId(accountId);
}

/**
 * Chooses which of the website's ad accounts the page reports on, kept in the URL as
 * `connection`. Hidden when there is only one to choose from.
 */
export function AdsConnectionSelect({ websiteId }: { websiteId: string }) {
  const t = useTranslations('ads');
  const {
    router,
    query: { connection },
    updateParams,
  } = useNavigation();
  const { data: connections } = useAdsConnectionsQuery(websiteId);
  const isKnown = !connection || !!connections?.some(({ id }) => id === connection);

  // A removed connection, or a link from before it was removed, falls back to the newest.
  useEffect(() => {
    if (connections && !isKnown) {
      router.replace(updateParams({ connection: undefined }));
    }
  }, [connections, isKnown]);

  if (!connections || connections.length < 2) {
    return null;
  }

  return (
    <Grid columns="280px" gap>
      <Field>
        <FieldLabel>{t('adAccount')}</FieldLabel>
        <Select
          items={connections.map(item => ({ value: item.id, label: getLabel(item) }))}
          value={isKnown && connection ? connection : connections[0].id}
          onValueChange={id => router.push(updateParams({ connection: id }))}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent alignItemWithTrigger={false}>
            <SelectGroup>
              {connections.map(item => (
                <SelectItem key={item.id} value={item.id}>
                  {getLabel(item)}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </Field>
    </Grid>
  );
}
