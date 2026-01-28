import { ListItem, Row, Select } from '@umami/react-zen';
import { useMessages, useNavigation } from '@/components/hooks';
import { DATE_RANGE_CONFIG, DEFAULT_DATE_RANGE_VALUE } from '@/lib/constants';
import { getItem } from '@/lib/storage';

export function UnitFilter() {
  const { formatMessage, labels } = useMessages();
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
    id: unit,
    label: formatMessage(labels[unit]),
  }));

  const selectedUnit = query.unit ?? unitConfig.defaultUnit;

  return (
    <Row>
      <Select
        value={selectedUnit}
        onChange={handleChange}
        popoverProps={{ placement: 'bottom right' }}
        style={{ width: 100 }}
      >
        {options.map(({ id, label }) => (
          <ListItem key={id} id={id}>
            {label}
          </ListItem>
        ))}
      </Select>
    </Row>
  );
}
