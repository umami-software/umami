import { FormButtons } from '@umami/react-zen';
import { Column, Text, LoadingButton, useToast } from '@umami/react-zen';
import { useState } from 'react';
import { useMessages, useTimezone, useDateRangeQuery } from '@/components/hooks';
import { DateFilter } from '@/components/input/DateFilter';
import { parseDateRange, getDateRangeValue } from '@/lib/date';
import { getApiUrl } from '@/lib/api-url';
import { getClientAuthToken } from '@/lib/client';
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

        let url = getApiUrl(`/websites/${websiteId}/export?startAt=${startAt}&endAt=${endAt}`);

        const token = getClientAuthToken();
        if (token) url += `&token=${encodeURIComponent(token)}`;
        if (shareId && shareToken) url += `&shareToken=${encodeURIComponent(shareToken)}`;

        const tokenRes = await fetch(
          getApiUrl(`/websites/${websiteId}/export/token?startAt=${startAt}&endAt=${endAt}`) +
          (token ? `&token=${encodeURIComponent(token)}` : '') +
          (shareId && shareToken ? `&shareToken=${encodeURIComponent(shareToken)}` : ''),
          { method: 'POST' },
        );

        if (!tokenRes.ok) {
          const text = await tokenRes.text();
          let msg = 'Export failed';
          try { msg = JSON.parse(text).error?.message || msg; } catch { /* ignore */ }
          throw new Error(msg);
        }

        const { downloadToken } = await tokenRes.json();
        
        // Let the browser handle the streamed response directly. Fetching the
        // response and converting it to a Blob would retain the entire archive
        // in tab memory before the download starts.
        const a = document.createElement('a');
        a.href = `${url}&downloadToken=${encodeURIComponent(downloadToken)}`;
        a.download = `umami_export_${websiteId}.zip`;
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        a.remove();

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

