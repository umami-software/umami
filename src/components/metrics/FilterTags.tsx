import { MouseEvent } from 'react';
import { Button, Icon, Icons, Popover, MenuTrigger, Text, Row } from '@umami/react-zen';
import {
  useDateRange,
  useFields,
  useNavigation,
  useMessages,
  useFormat,
  useFilters,
} from '@/components/hooks';
import { FieldFilterEditForm } from '@/app/(main)/reports/[reportId]/FieldFilterEditForm';
import { FILTER_COLUMNS, OPERATOR_PREFIXES } from '@/lib/constants';
import { isSearchOperator, parseParameterValue } from '@/lib/params';
import styles from './FilterTags.module.css';
import { WebsiteFilterButton } from '@/app/(main)/websites/[websiteId]/WebsiteFilterButton';

export function FilterTags({ websiteId }: { websiteId: string }) {
  const { formatMessage, labels } = useMessages();
  const { formatValue } = useFormat();
  const { dateRange } = useDateRange(websiteId);
  const {
    router,
    renderUrl,
    query: { view },
  } = useNavigation();
  const { fields } = useFields();
  const { operatorLabels } = useFilters();
  const { startDate, endDate } = dateRange;
  const { query } = useNavigation();

  const params = Object.keys(query).reduce((obj, key) => {
    if (FILTER_COLUMNS[key]) {
      obj[key] = query[key];
    }
    return obj;
  }, {});

  if (Object.keys(params).filter(key => params[key]).length === 0) {
    return null;
  }

  const handleCloseFilter = (param: string, e: MouseEvent) => {
    e.stopPropagation();
    router.push(renderUrl({ [param]: undefined }));
  };

  const handleResetFilter = () => {
    router.push(renderUrl({ view }, true));
  };

  const handleChangeFilter = (
    values: { name: string; operator: string; value: string },
    close: () => void,
  ) => {
    const { name, operator, value } = values;
    const prefix = OPERATOR_PREFIXES[operator];

    router.push(renderUrl({ [name]: prefix + value }));
    close();
  };

  return (
    <Row
      gap="3"
      backgroundColor="2"
      alignItems="center"
      paddingX="5"
      paddingY="3"
      border
      borderRadius="2"
      wrap="wrap"
    >
      <Text weight="bold">{formatMessage(labels.filters)}</Text>
      {Object.keys(params).map(key => {
        if (!params[key]) {
          return null;
        }
        const label = fields.find(f => f.name === key)?.label;
        const { operator, value } = parseParameterValue(params[key]);
        const paramValue = isSearchOperator(operator) ? value : formatValue(value, key);

        return (
          <MenuTrigger key={key}>
            <Button variant="outline">
              <Row alignItems="center" gap="3">
                <Text weight="bold">{label}</Text>
                <Text>{operatorLabels[operator]}</Text>
                <Text weight="bold">{paramValue}</Text>
                <Icon onClick={e => handleCloseFilter(key, e)}>
                  <Icons.Close />
                </Icon>
              </Row>
            </Button>
            <Popover placement="start">
              {({ close }: any) => {
                return (
                  <FieldFilterEditForm
                    label={label}
                    type="string"
                    websiteId={websiteId}
                    name={key}
                    operator={operator}
                    defaultValue={value}
                    startDate={startDate}
                    endDate={endDate}
                    onChange={values => handleChangeFilter(values, close)}
                  />
                );
              }}
            </Popover>
          </MenuTrigger>
        );
      })}
      <WebsiteFilterButton websiteId={websiteId} alignment="center" showText={false} />
      <Button className={styles.close} variant="quiet" onPress={handleResetFilter}>
        <Icon>
          <Icons.Close />
        </Icon>
        <Text>{formatMessage(labels.clearAll)}</Text>
      </Button>
    </Row>
  );
}
