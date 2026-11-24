import {
  Row,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@umami/react-zen';
import { useMessages, useNavigation } from '@/components/hooks';
import { DATE_RANGE_CONFIG, DEFAULT_DATE_RANGE_VALUE } from '@/lib/constants';
import { getItem } from '@/lib/storage';

export function UnitFilter() {
  const { t, labels } = useMessages();
  const { router, query, updateParams } = useNavigation();

  const DATE_RANGE_UNIT_CONFIG = {
    '0week': {
      defaultUnit: 'day',
      availableUnits: ['day', 'hour'],
    },
    '7day': {
      defaultUnit: 'day',
      availableUnits: ['day', 'hour'],
    },
    '0month': {
      defaultUnit: 'day',
      availableUnits: ['day', 'hour'],
    },
    '30day': {
      defaultUnit: 'day',
      availableUnits: ['day', 'hour'],
    },
    '90day': {
      defaultUnit: 'day',
      availableUnits: ['day', 'month'],
    },
    '6month': {
      defaultUnit: 'month',
      availableUnits: ['month', 'day'],
    },
  };

  const unitConfig =
    DATE_RANGE_UNIT_CONFIG[query.date || getItem(DATE_RANGE_CONFIG) || DEFAULT_DATE_RANGE_VALUE];

  if (!unitConfig) {
    return null;
  }

  const handleChange = (value: string) => {
    router.push(updateParams({ unit: value }));
  };

  const options = unitConfig.availableUnits.map(unit => ({
    value: unit,
    label: t(labels[unit]),
  }));

  const selectedUnit = query.unit ?? unitConfig.defaultUnit;

  return (
    <Row>
      <Select
        items={options}
        value={selectedUnit}
        onValueChange={value => handleChange(value as string)}
      >
        <SelectTrigger style={{ width: 100 }}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent side="bottom" align="end" alignItemWithTrigger={false}>
          <SelectGroup>
            {options.map(({ value, label }) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </Row>
  );
}
