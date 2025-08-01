import { Button, Icon, Text, Row, TooltipTrigger, Tooltip } from '@umami/react-zen';
import {
  useNavigation,
  useMessages,
  useFormat,
  useFilters,
  useWebsiteSegmentQuery,
} from '@/components/hooks';
import { Close } from '@/components/icons';
import { isSearchOperator } from '@/lib/params';

export function FilterBar({ websiteId }: { websiteId: string }) {
  const { formatMessage, labels } = useMessages();
  const { formatValue } = useFormat();
  const {
    router,
    updateParams,
    replaceParams,
    query: { segment },
  } = useNavigation();
  const { filters, operatorLabels } = useFilters();
  const { data, isLoading } = useWebsiteSegmentQuery(websiteId, segment);

  const handleCloseFilter = (param: string) => {
    router.push(updateParams({ [param]: undefined }));
  };

  const handleResetFilter = () => {
    router.push(replaceParams());
  };

  const handleSegmentRemove = () => {
    router.push(updateParams({ segment: undefined }));
  };

  if (!filters.length && !segment) {
    return null;
  }

  return (
    <Row gap alignItems="center" justifyContent="space-between" padding="2" backgroundColor="3">
      <Row alignItems="center" gap="2" wrap="wrap">
        {segment && !isLoading && (
          <FilterItem
            name="segment"
            label={formatMessage(labels.segment)}
            value={data?.name || segment}
            operator={operatorLabels.eq}
            onRemove={handleSegmentRemove}
          />
        )}
        {filters.map(filter => {
          const { name, label, operator, value } = filter;
          const paramValue = isSearchOperator(operator) ? value : formatValue(value, name);

          return (
            <FilterItem
              key={name}
              name={name}
              label={label}
              operator={operatorLabels[operator]}
              value={paramValue}
              onRemove={name => handleCloseFilter(name)}
            />
          );
        })}
      </Row>
      <TooltipTrigger delay={0}>
        <Button variant="zero" onPress={handleResetFilter} style={{ alignSelf: 'flex-start' }}>
          <Icon>
            <Close />
          </Icon>
        </Button>
        <Tooltip>
          <Text>{formatMessage(labels.clearAll)}</Text>
        </Tooltip>
      </TooltipTrigger>
    </Row>
  );
}

const FilterItem = ({ name, label, operator, value, onRemove }) => {
  return (
    <Row
      border
      padding="2"
      color
      backgroundColor
      borderRadius
      alignItems="center"
      justifyContent="space-between"
      theme="dark"
    >
      <Row alignItems="center" gap="4">
        <Row alignItems="center" gap="2">
          <Text color="12" weight="bold">
            {label}
          </Text>
          <Text color="11">{operator}</Text>
          <Text color="12" weight="bold">
            {value}
          </Text>
        </Row>
        <Icon onClick={() => onRemove(name)} size="xs">
          <Close />
        </Icon>
      </Row>
    </Row>
  );
};
