import { Button, Calendar, Column, ListItem, Row, Select } from '@umami/react-zen';
import { setHours, setMinutes, startOfDay } from 'date-fns';
import { type Key, useState } from 'react';
import { useMessages } from '@/components/hooks';

// Generate hour options (00:00 to 23:00)
const HOUR_OPTIONS = Array.from({ length: 24 }, (_, i) => ({
  id: i.toString(),
  label: `${i.toString().padStart(2, '0')}:00`,
  value: i,
}));

interface TimeRangePickerFormProps {
  startDate?: Date;
  endDate?: Date;
  minDate?: Date;
  maxDate?: Date;
  onChange: (value: string) => void;
  onClose: () => void;
}

export function TimeRangePickerForm({
  startDate: defaultStartDate,
  endDate: defaultEndDate,
  minDate,
  maxDate,
  onChange,
  onClose,
}: TimeRangePickerFormProps) {
  const [date, setDate] = useState(defaultStartDate || new Date());
  const [startHour, setStartHour] = useState(defaultStartDate?.getHours() || 0);
  const [endHour, setEndHour] = useState(defaultEndDate?.getHours() || 23);
  const { formatMessage, labels } = useMessages();

  const disabled = startHour > endHour;

  const handleSave = () => {
    const start = setMinutes(setHours(startOfDay(date), startHour), 0);
    const end = setMinutes(setHours(startOfDay(date), endHour + 1), 0);
    onChange(`range:${start.getTime()}:${end.getTime()}`);
  };

  const handleStartHourChange = (value: Key) => {
    setStartHour(Number(value));
  };

  const handleEndHourChange = (value: Key) => {
    setEndHour(Number(value));
  };

  return (
    <Column gap>
      <Row justifyContent="center">
        <Calendar value={date} minValue={minDate} maxValue={maxDate} onChange={setDate} />
      </Row>
      <Row gap justifyContent="center" alignItems="center">
        <Column>
          <label style={{ fontSize: '0.875rem', marginBottom: '0.25rem' }}>
            {formatMessage(labels.startTime)}
          </label>
          <Select
            value={startHour.toString()}
            onChange={handleStartHourChange}
            style={{ minWidth: '100px' }}
          >
            {HOUR_OPTIONS.map(({ id, label }) => (
              <ListItem key={id} id={id}>
                {label}
              </ListItem>
            ))}
          </Select>
        </Column>
        <span style={{ marginTop: '1.5rem' }}>—</span>
        <Column>
          <label style={{ fontSize: '0.875rem', marginBottom: '0.25rem' }}>
            {formatMessage(labels.endTime)}
          </label>
          <Select
            value={endHour.toString()}
            onChange={handleEndHourChange}
            style={{ minWidth: '100px' }}
          >
            {HOUR_OPTIONS.map(({ id, label }) => (
              <ListItem key={id} id={id}>
                {label}
              </ListItem>
            ))}
          </Select>
        </Column>
      </Row>
      <Row justifyContent="end" gap>
        <Button onPress={onClose}>{formatMessage(labels.cancel)}</Button>
        <Button variant="primary" onPress={handleSave} isDisabled={disabled}>
          {formatMessage(labels.apply)}
        </Button>
      </Row>
    </Column>
  );
}
