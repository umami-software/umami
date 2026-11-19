import {
  Button,
  Column,
  DatePicker,
  ListItem,
  Row,
  Select,
  Tab,
  TabList,
  TabPanel,
  Tabs,
  Text,
  TextField,
} from '@umami/react-zen';
import { useLocale, useMessages } from '@/components/hooks';
import { formatDate } from '@/lib/date';
import { ClearDataFrame } from './ClearDataFrame';
import {
  OLDER_THAN_UNITS,
  type OlderThanUnit,
  type Period,
  updatePeriod,
} from './clearDataHelpers';

export type ClearDataMode = 'olderThan' | 'period';

export function ClearDataRangeStep({
  mode,
  amount,
  unit,
  period,
  cutoff,
  today,
  canContinue,
  onModeChange,
  onAmountChange,
  onUnitChange,
  onPeriodChange,
  onContinue,
  onCancel,
}: {
  mode: ClearDataMode;
  /** Raw text of the amount field. */
  amount: string;
  unit: OlderThanUnit;
  period: Period;
  /** Undefined while the amount is invalid. */
  cutoff?: Date;
  today: Date;
  canContinue: boolean;
  onModeChange: (mode: ClearDataMode) => void;
  onAmountChange: (amount: string) => void;
  onUnitChange: (unit: OlderThanUnit) => void;
  onPeriodChange: (period: Period) => void;
  onContinue: () => void;
  onCancel?: () => void;
}) {
  const { t, labels, messages } = useMessages();
  const { locale } = useLocale();

  const handleDateChange = (field: keyof Period) => (value: Date | undefined) => {
    if (value) {
      onPeriodChange(updatePeriod(period, field, value));
    }
  };

  return (
    <ClearDataFrame
      actions={
        <>
          <Button onPress={onCancel}>{t(labels.cancel)}</Button>
          <Button variant="primary" isDisabled={!canContinue} onPress={onContinue}>
            {t(labels.continue)}
          </Button>
        </>
      }
    >
      <Tabs selectedKey={mode} onSelectionChange={key => onModeChange(key as ClearDataMode)}>
        <TabList>
          <Tab id="olderThan">{t(labels.olderThan)}</Tab>
          <Tab id="period">{t(labels.period)}</Tab>
        </TabList>
        <TabPanel id="olderThan">
          <Column gap paddingTop="4">
            <Row gap>
              <TextField
                type="number"
                min={1}
                step={1}
                inputMode="numeric"
                aria-label={t(labels.amount)}
                value={amount}
                onChange={onAmountChange}
                style={{ width: 96 }}
              />
              <Select
                value={unit}
                onChange={value => onUnitChange(value as OlderThanUnit)}
                triggerProps={{ 'aria-label': t(labels.unit) }}
              >
                {OLDER_THAN_UNITS.map(value => (
                  <ListItem key={value} id={value}>
                    {t(labels[value])}
                  </ListItem>
                ))}
              </Select>
            </Row>
            <Text color="muted">
              {cutoff
                ? t(messages.deleteDataOlderThan, { date: formatDate(cutoff, 'PP', locale) })
                : t(messages.deleteDataOlderThanInvalid)}
            </Text>
          </Column>
        </TabPanel>
        <TabPanel id="period">
          <Column gap paddingTop="4">
            <DatePicker
              label={t(labels.from)}
              value={period.from}
              maxValue={today}
              locale={locale}
              onChange={handleDateChange('from')}
            />
            <DatePicker
              label={t(labels.to)}
              value={period.to}
              minValue={period.from}
              maxValue={today}
              locale={locale}
              onChange={handleDateChange('to')}
            />
          </Column>
        </TabPanel>
      </Tabs>
    </ClearDataFrame>
  );
}
