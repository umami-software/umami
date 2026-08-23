import { FormButtons } from '@umami/react-zen';
import { Column, Text, LoadingButton, useToast } from '@umami/react-zen';
import { useState } from 'react';
import { useMessages, useApi, useTimezone, useDateRangeQuery } from '@/components/hooks';
import { DateFilter } from '@/components/input/DateFilter';
import { parseDateRange, getDateRangeValue } from '@/lib/date';
import { getApiUrl } from '@/lib/api-url';
import { getClientAuthToken } from '@/lib/client';
import { SHARE_CONTEXT_HEADER, SHARE_TOKEN_HEADER } from '@/lib/constants';
import { useApp } from '@/store/app';

export function WebsiteExportForm({
  websiteId,
  onClose,
}: {
  websiteId: string;
  onClose: () => void;
}) {
  const { t, labels, messages } = useMessages();
  const { toast } = useToast();
  const [dateRange, setDateRange] = useState('24hour');
  const [isLoading, setIsLoading] = useState(false);
  const { get } = useApi();
  const { localToUtc } = useTimezone();
  const websiteDateRange = useDateRangeQuery(websiteId);
  const hasData = !!(websiteDateRange?.startDate && websiteDateRange?.endDate);
  const shareId = useApp(state => state.share?.shareId);
  const shareToken = useApp(state => state.shareToken?.token);

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

        const shareHeaders = shareId && shareToken
          ? { [SHARE_TOKEN_HEADER]: shareToken, [SHARE_CONTEXT_HEADER]: '1' }
          : {};

        const headers = {
          authorization: `Bearer ${getClientAuthToken()}`,
          ...shareHeaders,
        };

        const response = await fetch(
          getApiUrl(`/websites/${websiteId}/export?startAt=${startAt}&endAt=${endAt}`),
          { method: 'GET', headers }
        );

        if (!response.ok) {
          throw new Error('Export failed');
        }

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `export-${websiteId}.zip`;
        a.click();
        URL.revokeObjectURL(url);
        
        onClose();
      }
    } catch (error: any) {
      toast(error?.message || t(messages.error));
    } finally {
      setIsLoading(false);
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

