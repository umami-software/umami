import { MouseEvent } from 'react';
import { Button, Icon, Icons, Text, Row, TooltipTrigger, Tooltip } from '@umami/react-zen';
import { useNavigation, useMessages, useFormat, useFilters } from '@/components/hooks';
import { isSearchOperator } from '@/lib/params';
import { WebsiteFilterButton } from '@/app/(main)/websites/[websiteId]/WebsiteFilterButton';

export function FilterBar({ websiteId }: { websiteId: string }) {
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
    <Row
      gap="3"
      backgroundColor="2"
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
        {Object.keys(filters).map(key => {
          const filter = filters[key];
          const { name, label, operator, value } = filter;
          const paramValue = isSearchOperator(operator) ? value : formatValue(value, key);

          return (
            <Button key={name} variant="outline">
              <Row alignItems="center" gap="6">
                <Row alignItems="center" gap="2">
                  <Text weight="bold">{label}</Text>
                  <Text transform="uppercase" color="11" size="1">
                    {operatorLabels[operator]}
                  </Text>
                  <Text weight="bold">{paramValue}</Text>
                </Row>
                <Icon onClick={e => handleCloseFilter(name, e)}>
                  <Icons.Close />
                </Icon>
              </Row>
            </Button>
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
