import { MouseEvent } from 'react';
import {
  Button,
  Icon,
  Icons,
  Popover,
  MenuTrigger,
  Text,
  Row,
  TooltipTrigger,
  Tooltip,
} from '@umami/react-zen';
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
import { WebsiteFilterButton } from '@/app/(main)/websites/[websiteId]/WebsiteFilterButton';

export function FilterBar({ websiteId }: { websiteId: string }) {
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
      className="dark-theme"
      gap="3"
      backgroundColor="3"
      alignItems="center"
      justifyContent="space-between"
      paddingY="3"
      paddingLeft="5"
      paddingRight="2"
      border
      borderRadius="2"
    >
      <Row alignItems="center" gap="3" wrap="wrap">
        <Text color="11" weight="bold">
          {formatMessage(labels.filters)}
        </Text>
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
                <Row alignItems="center" gap="2">
                  <Text weight="bold">{label}</Text>
                  <Text transform="uppercase" color="muted">
                    {operatorLabels[operator]}
                  </Text>
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
      </Row>
      <TooltipTrigger delay={0}>
        <Button variant="quiet" onPress={handleResetFilter}>
          <Icon>
            <Icons.Close />
          </Icon>
        </Button>
        <Tooltip>
          <Text>{formatMessage(labels.clearAll)}</Text>
        </Tooltip>
      </TooltipTrigger>
    </Row>
  );
}
