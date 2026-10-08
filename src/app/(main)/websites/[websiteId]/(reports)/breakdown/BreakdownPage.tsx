'use client';
import { Column, ListItem, Row, Select } from '@umami/react-zen';
import { useState } from 'react';
import { FieldSelectForm } from '@/app/(main)/websites/[websiteId]/(reports)/breakdown/FieldSelectForm';
import { WebsiteControls } from '@/app/(main)/websites/[websiteId]/WebsiteControls';
import { Panel } from '@/components/common/Panel';
import {
  useBreakdownQuery,
  useCommerceCurrenciesQuery,
  useDateRange,
  useFlag,
  useMessages,
  useNavigation,
  useTimezone,
} from '@/components/hooks';
import { ListCheck } from '@/components/icons';
import { DialogButton } from '@/components/input/DialogButton';
import { DownloadButton } from '@/components/input/DownloadButton';
import { Breakdown } from './Breakdown';

export function BreakdownPage({ websiteId }: { websiteId: string }) {
  const { timezone } = useTimezone();
  const {
    dateRange: { startDate, endDate },
  } = useDateRange({ timezone });
  const [fields, setFields] = useState(['path']);
  const {
    router,
    updateParams,
    query: { currency: currencyParam },
  } = useNavigation();
  const commerceEnabled = useFlag('commerce');
  // Revenue columns are commerce UI; ignore a currency in the URL while the flag is off.
  const currency = commerceEnabled ? currencyParam : undefined;
  const { data } = useBreakdownQuery(
    { websiteId, startDate, endDate, fields, currency },
    { enabled: !!fields.length },
  );
  return (
    <Column gap>
      <WebsiteControls websiteId={websiteId} />
      <Row alignItems="center" justifyContent="flex-start" gap>
        <FieldsButton value={fields} onChange={setFields} />
        {commerceEnabled && (
          <RevenueCurrencySelect
            websiteId={websiteId}
            value={currency}
            onChange={value => router.replace(updateParams({ currency: value }), { scroll: false })}
          />
        )}
      </Row>
      <Panel
        height="900px"
        overflow="auto"
        allowFullscreen
        toolbar={<DownloadButton filename="breakdown" data={data} />}
      >
        <Breakdown
          websiteId={websiteId}
          startDate={startDate}
          endDate={endDate}
          selectedFields={fields}
          currency={currency}
        />
      </Panel>
    </Column>
  );
}

const NO_CURRENCY = '__none__';

/** Adds orders and revenue in one currency to every row; shown when the site has orders. */
function RevenueCurrencySelect({
  websiteId,
  value,
  onChange,
}: {
  websiteId: string;
  value?: string;
  onChange: (value?: string) => void;
}) {
  const { t } = useMessages();
  const { data } = useCommerceCurrenciesQuery(websiteId, { retry: false });
  const currencies = data?.filter(({ orders }) => orders > 0);

  if (!currencies?.length && !value) {
    return null;
  }

  const ids = [...new Set([...(value ? [value] : []), ...(currencies || []).map(c => c.currency)])];

  return (
    <Select
      aria-label={t('commerce.breakdownCurrency')}
      value={value || NO_CURRENCY}
      onChange={next => onChange(next === NO_CURRENCY ? undefined : String(next))}
      buttonProps={{ style: { width: 180 } }}
    >
      {[NO_CURRENCY, ...ids].map(id => (
        <ListItem key={id} id={id}>
          {id === NO_CURRENCY
            ? t('commerce.breakdownCurrencyNone')
            : `${t('commerce.breakdownCurrency')}: ${id}`}
        </ListItem>
      ))}
    </Select>
  );
}

const FieldsButton = ({ value, onChange }) => {
  const { t, labels } = useMessages();

  return (
    <DialogButton
      icon={<ListCheck />}
      label={t(labels.fields)}
      width="400px"
      minHeight="300px"
      variant="outline"
    >
      {({ close }) => {
        return <FieldSelectForm selectedFields={value} onChange={onChange} onClose={close} />;
      }}
    </DialogButton>
  );
};
