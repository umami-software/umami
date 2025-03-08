import { Button, Icon, Icons, Box, MenuTrigger, Popover, Text } from '@umami/react-zen';
import { PopupForm } from '@/app/(main)/reports/[reportId]/PopupForm';
import { FilterSelectForm } from '@/app/(main)/reports/[reportId]/FilterSelectForm';
import { useFields, useMessages, useNavigation, useDateRange } from '@/components/hooks';
import { OPERATOR_PREFIXES } from '@/lib/constants';
import styles from './WebsiteFilterButton.module.css';

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
      <Button className={styles.button} variant="quiet">
        <Icon>
          <Icons.Plus />
        </Icon>
        {showText && <Text>{formatMessage(labels.filter)}</Text>}
      </Button>
      <Popover placement="bottom end">
        {({ close }: any) => {
          return (
            <Box padding="3" backgroundColor="1">
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
            </Box>
          );
        }}
      </Popover>
    </MenuTrigger>
  );
}
