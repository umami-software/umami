import { MouseEvent } from 'react';
import { Button, Icon, Text, Row, TooltipTrigger, Tooltip } from '@umami/react-zen';
import { useNavigation, useMessages, useFormat, useFilters } from '@/components/hooks';
import { Close } from '@/components/icons';
import { isSearchOperator } from '@/lib/params';

export function FilterBar() {
  const { formatMessage, labels } = useMessages();
  const { formatValue } = useFormat();
  const { router, renderUrl } = useNavigation();
  const { filters, operatorLabels } = useFilters();

  const handleCloseFilter = (param: string, e: MouseEvent) => {
    e.stopPropagation();
    router.push(renderUrl({ [param]: undefined }));
  };

  const handleResetFilter = () => {
    router.push(renderUrl(false));
  };

  if (!filters.length) {
    return null;
  }

  return (
    <Row gap alignItems="center" justifyContent="space-between" paddingY="3">
      <Row alignItems="center" gap="3" wrap="wrap">
        {Object.keys(filters).map(key => {
          const filter = filters[key];
          const { name, label, operator, value } = filter;
          const paramValue = isSearchOperator(operator) ? value : formatValue(value, key);

          return (
            <Row
              key={name}
              border
              padding
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
                  <Text color="11">{operatorLabels[operator]}</Text>
                  <Text color="12" weight="bold">
                    {paramValue}
                  </Text>
                </Row>
                <Icon onClick={e => handleCloseFilter(name, e)} size="xs">
                  <Close />
                </Icon>
              </Row>
            </Row>
          );
        })}
      </Row>
      <TooltipTrigger delay={0}>
        <Button variant="quiet" onPress={handleResetFilter}>
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
