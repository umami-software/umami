import { Button, Icon, Icons, DialogTrigger, Dialog, Modal, Text } from '@umami/react-zen';
import { FilterEditForm } from '@/components/common/FilterEditForm';
import { useMessages, useNavigation, useFilters } from '@/components/hooks';

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
  const { filters } = useFilters();

  const handleChange = (filters: any[]) => {
    const params = filters.reduce((obj, filter) => {
      const { name, operator, value } = filter;

      obj[name] = `${operator}.${value}`;

      return obj;
    }, {});

    const url = renderUrl(params);

    router.push(url);
  };

  return (
    <DialogTrigger>
      <Button variant="quiet">
        <Icon>
          <Icons.Plus />
        </Icon>
        {showText && <Text>{formatMessage(labels.filter)}</Text>}
      </Button>
      <Modal>
        <Dialog>
          {({ close }) => {
            return (
              <FilterEditForm
                websiteId={websiteId}
                data={filters}
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
