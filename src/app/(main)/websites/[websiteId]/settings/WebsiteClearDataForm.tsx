import { useEffect, useState } from 'react';
import { useApi, useDateRangeQuery, useLocale, useMessages } from '@/components/hooks';
import { formatDate } from '@/lib/date';
import { ClearDataConfirmStep } from './ClearDataConfirmStep';
import { ClearDataProgressStep } from './ClearDataProgressStep';
import { type ClearDataMode, ClearDataRangeStep } from './ClearDataRangeStep';
import {
  DEFAULT_OLDER_THAN_AMOUNT,
  DEFAULT_OLDER_THAN_UNIT,
  getDisplayDates,
  getOlderThanCutoff,
  getOlderThanRange,
  type OlderThanUnit,
  type Period,
  parseOlderThanAmount,
} from './clearDataHelpers';
import { splitRangeByMonth, toDayRange } from './splitRangeByMonth';
import { type ClearCounts, EMPTY_COUNTS, useBatchedClear } from './useBatchedClear';

type Step = 'pick' | 'confirm' | 'run';

export function WebsiteClearDataForm({
  websiteId,
  defaultMode = 'olderThan',
  defaultRange,
  onSave,
  onClose,
  onBusyChange,
}: {
  websiteId: string;
  defaultMode?: ClearDataMode;
  defaultRange?: Period;
  onSave?: () => void;
  onClose?: () => void;
  onBusyChange?: (busy: boolean) => void;
}) {
  const { t, messages, getErrorMessage } = useMessages();
  const { locale } = useLocale();
  const { get, useQuery } = useApi();
  const [today] = useState(() => new Date());
  const [step, setStep] = useState<Step>('pick');
  const [mode, setMode] = useState<ClearDataMode>(defaultMode);
  const [amountText, setAmountText] = useState(String(DEFAULT_OLDER_THAN_AMOUNT));
  const [unit, setUnit] = useState<OlderThanUnit>(DEFAULT_OLDER_THAN_UNIT);
  const [period, setPeriod] = useState<Period>(() => defaultRange ?? { from: today, to: today });
  const { startDate: firstDataDate, isLoading: isDateRangeLoading } = useDateRangeQuery(websiteId);
  const batch = useBatchedClear(websiteId);

  const amount = parseOlderThanAmount(amountText);
  const cutoff = amount ? getOlderThanCutoff(amount, unit, today) : undefined;
  const range =
    mode === 'olderThan'
      ? getOlderThanRange(amount, unit, firstDataDate, today)
      : toDayRange(period.from, period.to);

  const preview = useQuery<ClearCounts>({
    queryKey: ['website:clear-preview', websiteId, range],
    queryFn: () => get(`/websites/${websiteId}/clear`, range),
    enabled: step === 'confirm' && !!range,
    staleTime: 0,
    gcTime: 0,
  });

  useEffect(() => {
    onBusyChange?.(batch.isBusy);
  }, [batch.isBusy, onBusyChange]);

  const formatDay = (value: Date) => formatDate(value, 'PP', locale);

  const handleConfirm = () => {
    if (range) {
      setStep('run');
      batch.start(splitRangeByMonth(range.startAt, range.endAt));
    }
  };

  const handleDone = () => {
    if (batch.completed > 0) {
      onSave?.();
    }
    onClose?.();
  };

  if (step === 'pick') {
    return (
      <ClearDataRangeStep
        mode={mode}
        amount={amountText}
        unit={unit}
        period={period}
        cutoff={cutoff}
        today={today}
        canContinue={mode === 'period' || (!!cutoff && !isDateRangeLoading)}
        onModeChange={setMode}
        onAmountChange={setAmountText}
        onUnitChange={setUnit}
        onPeriodChange={setPeriod}
        onContinue={() => setStep('confirm')}
        onCancel={onClose}
      />
    );
  }

  if (step === 'confirm') {
    const isOlderThan = mode === 'olderThan';
    const cutoffDate = cutoff ? formatDay(cutoff) : '';
    const dates = range && getDisplayDates(range);

    return (
      <ClearDataConfirmStep
        summary={
          isOlderThan
            ? t(messages.deleteDataOlderThanConfirm, { date: cutoffDate })
            : t(messages.deleteDataConfirm, {
                startDate: dates ? formatDay(dates.startDate) : '',
                endDate: dates ? formatDay(dates.endDate) : '',
              })
        }
        emptyMessage={
          isOlderThan
            ? t(messages.deleteDataOlderThanEmpty, { date: cutoffDate })
            : t(messages.deleteDataEmpty)
        }
        counts={range ? preview.data : EMPTY_COUNTS}
        isLoading={!!range && !preview.data && !preview.error}
        error={preview.error ? getErrorMessage(preview.error as Error) : undefined}
        onBack={() => setStep('pick')}
        onCancel={onClose}
        onConfirm={handleConfirm}
      />
    );
  }

  return <ClearDataProgressStep batch={batch} onClose={handleDone} />;
}
