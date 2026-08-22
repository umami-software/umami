import { FormButtons } from '@umami/react-zen';
import { Column, Text, LoadingButton } from '@umami/react-zen';
import { useState } from 'react';
import { useMessages, useApi, useTimezone, useDateRangeQuery } from '@/components/hooks';
import { DateFilter } from '@/components/input/DateFilter';
import { parseDateRange, getDateRangeValue } from '@/lib/date';

export function WebsiteExportForm({
  websiteId,
  onClose,
}: {
  websiteId: string;
  onClose: () => void;
}) {
  const { t, labels } = useMessages();
  const [dateRange, setDateRange] = useState('24hour');
  const [isLoading, setIsLoading] = useState(false);
  const { get } = useApi();
  const { localToUtc } = useTimezone();
  const websiteDateRange = useDateRangeQuery(websiteId);
  const hasData = !!(websiteDateRange?.startDate && websiteDateRange?.endDate);

  const handleDateChange = (value: string) => {
    if (value === 'all' && hasData) {
      setDateRange(`${getDateRangeValue(websiteDateRange.startDate, websiteDateRange.endDate)}:all`);
    } else {
      setDateRange(value);
    }
  };

  const handleExport = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const parsed = parseDateRange(dateRange);
      if (parsed) {
        const startAt = +localToUtc(parsed.startDate);
        const endAt = +localToUtc(parsed.endDate);

        const { zip } = await get(`/websites/${websiteId}/export`, {
          startAt,
          endAt,
          format: 'json',
        });

        await loadZip(zip);
      }
    } finally {
      setIsLoading(false);
      onClose();
    }
  };

  return (
    <form onSubmit={handleExport}>
      <Column gap="4" paddingBottom="4">
        <Text weight="bold">{t(labels.dateRange)}</Text>
        <DateFilter value={dateRange} onChange={handleDateChange} showAllTime={hasData} />
      </Column>
      <FormButtons>
        <LoadingButton onClick={handleExport} variant="primary" isLoading={isLoading}>
          {t(labels.export)}
        </LoadingButton>
        <LoadingButton onClick={onClose} variant="quiet">{t(labels.cancel)}</LoadingButton>
      </FormButtons>
    </form>
  );
}

async function loadZip(zip: string) {
  const binary = atob(zip);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  const blob = new Blob([bytes], { type: 'application/zip' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = 'download.zip';
  a.click();
  URL.revokeObjectURL(url);
}
