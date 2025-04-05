import { Button, Icon, Icons, MenuTrigger, Popover, Text } from '@umami/react-zen';
import { FilterSelectForm } from '@/app/(main)/reports/[reportId]/FilterSelectForm';
import { useFields, useMessages, useNavigation, useDateRange } from '@/components/hooks';
import { OPERATOR_PREFIXES } from '@/lib/constants';

export function WebsiteFilterButton({
  websiteId,
  showText = true,
}: {
  websiteId: string;
  position?: 'bottom' | 'top' | 'left' | 'right';
  alignment?: 'end' | 'center' | 'start';
  showText?: boolean;
}) {
  const { formatMessage, labels } = useMessages();
  const { renderUrl, router } = useNavigation();
  const { fields } = useFields();
  const {
    dateRange: { startDate, endDate },
  } = useDateRange(websiteId);

  const handleAddFilter = ({ name, operator, value }) => {
    const prefix = OPERATOR_PREFIXES[operator];

    router.push(renderUrl({ [name]: prefix + value }));
  };

  return (
    <MenuTrigger>
      <Button variant="quiet">
        <Icon>
          <Icons.Plus />
        </Icon>
        {showText && <Text>{formatMessage(labels.filter)}</Text>}
      </Button>
      <Popover placement="bottom start">
        {({ close }: any) => {
          return (
            <FilterSelectForm
              websiteId={websiteId}
              fields={fields}
              startDate={startDate}
              endDate={endDate}
              onChange={value => {
                handleAddFilter(value);
                close();
              }}
            />
          );
        }}
      </Popover>
    </MenuTrigger>
  );
}
