import { Button, Icon, DialogTrigger, Dialog, Modal, Text } from '@umami/react-zen';
import { ListFilter } from '@/components/icons';
import { FilterEditForm } from '@/components/input/FilterEditForm';
import { useMessages, useNavigation, useFilters } from '@/components/hooks';
import { filtersArrayToObject } from '@/lib/params';

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
  const {
    replaceParams,
    router,
    query: { segment },
  } = useNavigation();
  const { filters } = useFilters();

  const handleChange = ({ filters, segment }) => {
    const params = filtersArrayToObject(filters);

    const url = replaceParams({ ...params, segment });

    router.push(url);
  };

  return (
    <DialogTrigger>
      <Button variant="outline">
        <Icon>
          <ListFilter />
        </Icon>
        {showText && <Text>{formatMessage(labels.filter)}</Text>}
      </Button>
      <Modal>
        <Dialog title={formatMessage(labels.filters)} style={{ width: 800, minHeight: 600 }}>
          {({ close }) => {
            return (
              <FilterEditForm
                websiteId={websiteId}
                filters={filters}
                segmentId={segment}
                onChange={handleChange}
                onClose={close}
              />
            );
          }}
        </Dialog>
      </Modal>
    </DialogTrigger>
  );
}
