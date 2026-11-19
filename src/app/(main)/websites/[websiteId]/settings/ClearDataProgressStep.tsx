import { Button, ProgressBar, Text } from '@umami/react-zen';
import { useLocale, useMessages } from '@/components/hooks';
import { formatDate } from '@/lib/date';
import { ClearDataAnimation } from './ClearDataAnimation';
import { ClearDataFrame } from './ClearDataFrame';
import { getProgressPercent, getRunView } from './clearDataHelpers';
import type { MonthRange } from './splitRangeByMonth';
import type { useBatchedClear } from './useBatchedClear';

export function ClearDataProgressStep({
  batch,
  onClose,
}: {
  batch: ReturnType<typeof useBatchedClear>;
  onClose: () => void;
}) {
  const { t, labels, messages, getErrorMessage } = useMessages();
  const { locale } = useLocale();
  const view = getRunView(batch.status);
  const total = batch.months.length;
  const totals = { events: batch.totals.events, sessions: batch.totals.sessions };

  const formatMonth = (month?: MonthRange) =>
    month ? formatDate(month.startAt, 'LLLL yyyy', locale) : '';

  const actions = (
    <>
      {view.canStop && (
        <Button isDisabled={view.isStopping} onPress={batch.stop}>
          {t(labels.stop)}
        </Button>
      )}
      {view.canClose && (
        <Button variant={view.canRetry ? undefined : 'primary'} onPress={onClose}>
          {t(labels.close)}
        </Button>
      )}
      {view.canRetry && (
        <Button variant="primary" onPress={batch.retry}>
          {t(labels.retry)}
        </Button>
      )}
    </>
  );

  if (view.kind === 'done') {
    return (
      <ClearDataFrame actions={actions}>
        <ClearDataAnimation variant="done" />
        <Text align="center">{t(messages.deleteDataDone, totals)}</Text>
      </ClearDataFrame>
    );
  }

  return (
    <ClearDataFrame actions={actions}>
      {view.kind === 'progress' && <ClearDataAnimation />}
      <ProgressBar value={getProgressPercent(batch.completed, total)} />
      {view.kind === 'progress' && (
        <Text>
          {t(messages.deleteDataProgress, {
            month: formatMonth(batch.current),
            current: Math.min(batch.completed + 1, total),
            total,
          })}
        </Text>
      )}
      {view.kind === 'error' && (
        <>
          <Text>{t(messages.deleteDataError, { month: formatMonth(batch.current) })}</Text>
          <Text color="muted">{getErrorMessage(batch.error)}</Text>
        </>
      )}
      {view.kind === 'stopped' && (
        <Text>
          {t(messages.deleteDataStopped, {
            month: formatMonth(batch.months[batch.completed - 1]),
          })}
        </Text>
      )}
      <Text color="muted">{t(messages.deleteDataTotals, totals)}</Text>
    </ClearDataFrame>
  );
}
