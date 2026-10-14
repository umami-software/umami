'use client';

import { Button, Column, Label, Row, Text, TextField } from '@umami/react-zen';
import { useState } from 'react';
import { useMessages, useNavigation } from '@/components/hooks';
import { ListFilter } from '@/components/icons';
import { DialogButton } from '@/components/input/DialogButton';

function getMinDurationValue(value: unknown) {
  if (typeof value !== 'string' || !/^\d+$/.test(value) || Number(value) <= 0) {
    return '';
  }

  return value;
}

function SessionFilterForm({
  minDuration,
  onClose,
}: {
  minDuration: string;
  onClose?: () => void;
}) {
  const { t, labels, messages } = useMessages();
  const { router, updateParams } = useNavigation();
  const [value, setValue] = useState(minDuration);

  const handleChange = (nextValue: string) => {
    if (/^\d*$/.test(nextValue)) {
      setValue(nextValue);
    }
  };

  const handleReset = () => {
    setValue('');
  };

  const handleApply = () => {
    const nextValue = value ? Number(value) : 0;

    router.push(
      updateParams({
        minDuration: nextValue > 0 ? nextValue : 0,
        page: 1,
      }),
    );

    onClose?.();
  };

  return (
    <Column width="320px" gap="4">
      <Column gap="2">
        <Label>{t(labels.minDurationSeconds)}</Label>
        <Text color="muted">{t(messages.sessionMinDurationDescription)}</Text>
        <TextField
          value={value}
          onChange={handleChange}
          autoFocus
          autoComplete="off"
          inputMode="numeric"
          placeholder="60"
        />
      </Column>
      <Row alignItems="center" justifyContent="space-between" gap>
        <Button onPress={handleReset}>{t(labels.reset)}</Button>
        <Row alignItems="center" justifyContent="flex-end" gap>
          <Button onPress={onClose}>{t(labels.cancel)}</Button>
          <Button variant="primary" onPress={handleApply}>
            {t(labels.apply)}
          </Button>
        </Row>
      </Row>
    </Column>
  );
}

export function SessionFilterButton() {
  const { t, labels } = useMessages();
  const { query } = useNavigation();
  const minDuration = getMinDurationValue(query.minDuration);
  const title = `${t(labels.session)} ${t(labels.filter)}`;
  const label = minDuration ? `${title} (${minDuration}s+)` : title;

  return (
    <DialogButton icon={<ListFilter />} label={label} title={title} variant="outline">
      {({ close }) => <SessionFilterForm minDuration={minDuration} onClose={close} />}
    </DialogButton>
  );
}
