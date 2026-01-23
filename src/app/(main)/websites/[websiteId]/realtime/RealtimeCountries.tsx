import { IconLabel } from '@umami/react-zen';
import { useCallback } from 'react';
import { TypeIcon } from '@/components/common/TypeIcon';
import { useCountryNames, useLocale, useMessages } from '@/components/hooks';
import { ListTable } from '@/components/metrics/ListTable';

export function RealtimeCountries({ data }) {
  const { formatMessage, labels } = useMessages();
  const { locale } = useLocale();
  const { countryNames } = useCountryNames(locale);

  const renderCountryName = useCallback(
    ({ label: code }) => (
      <IconLabel icon={<TypeIcon type="country" value={code} />} label={countryNames[code]} />
    ),
    [countryNames, locale],
  );

  return (
    <ListTable
      title={formatMessage(labels.countries)}
      metric={formatMessage(labels.visitors)}
      data={data.map(({ x, y, z }: { x: string; y: number; z: number }) => ({
        label: x,
        count: y,
        percent: z,
      }))}
      renderLabel={renderCountryName}
    />
  );
}
