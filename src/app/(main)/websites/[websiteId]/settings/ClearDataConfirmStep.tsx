import { Button, Loading, Text, TextField } from '@umami/react-zen';
import { type FormEvent, useState } from 'react';
import { useLocale, useMessages } from '@/components/hooks';
import styles from './ClearData.module.css';
import { ClearDataFrame } from './ClearDataFrame';
import { getCountItems } from './clearDataHelpers';
import type { ClearCounts } from './useBatchedClear';

export const CONFIRM_VALUE = 'DELETE';

export function ClearDataConfirmStep({
  summary,
  emptyMessage,
  counts,
  isLoading,
  error,
  onBack,
  onCancel,
  onConfirm,
}: {
  summary: string;
  emptyMessage: string;
  counts?: ClearCounts;
  isLoading?: boolean;
  error?: string;
  onBack: () => void;
  onCancel?: () => void;
  onConfirm: () => void;
}) {
  const { t, labels, messages } = useMessages();
  const { locale } = useLocale();
  const [confirmation, setConfirmation] = useState('');
  const items = counts ? getCountItems(counts) : [];
  const canDelete = !isLoading && !error && items.length > 0 && confirmation === CONFIRM_VALUE;
  const number = new Intl.NumberFormat(locale);

  const back = (
    <Button variant="quiet" onPress={onBack}>
      {t(labels.back)}
    </Button>
  );

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (canDelete) {
      onConfirm();
    }
  };

  if (isLoading || error || !items.length) {
    return (
      <ClearDataFrame start={back} actions={<Button onPress={onCancel}>{t(labels.close)}</Button>}>
        {isLoading ? <Loading placement="center" /> : <Text>{error ?? emptyMessage}</Text>}
      </ClearDataFrame>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <ClearDataFrame
        start={back}
        actions={
          <>
            <Button onPress={onCancel}>{t(labels.cancel)}</Button>
            <Button type="submit" variant="danger" isDisabled={!canDelete}>
              {t(labels.delete)}
            </Button>
          </>
        }
      >
        <Text>{summary}</Text>
        <div className={styles.counts}>
          {items.map(({ key, value }) => (
            <div key={key} className={styles.countRow} data-test={`clear-data-count-${key}`}>
              <Text>{t(labels[key])}</Text>
              <Text className={styles.countValue}>{number.format(value)}</Text>
            </div>
          ))}
        </div>
        <Text className={styles.danger}>{t(messages.deleteDataIrreversible)}</Text>
        <Text>{t(messages.actionConfirmation, { confirmation: CONFIRM_VALUE })}</Text>
        <TextField
          label={t(labels.confirm)}
          value={confirmation}
          onChange={setConfirmation}
          autoComplete="off"
        />
      </ClearDataFrame>
    </form>
  );
}
