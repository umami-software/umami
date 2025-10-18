import { ListFilter } from '@/components/icons';
import { FilterEditForm } from '@/components/input/FilterEditForm';
import { DialogButton } from '@/components/input/DialogButton';
import { useMessages, useNavigation } from '@/components/hooks';
import { filtersArrayToObject } from '@/lib/params';

export function WebsiteFilterButton({
  websiteId,
}: {
  websiteId: string;
  position?: 'bottom' | 'top' | 'left' | 'right';
  alignment?: 'end' | 'center' | 'start';
}) {
  const { formatMessage, labels } = useMessages();
  const { updateParams, router } = useNavigation();

  const handleChange = ({ filters, segment, cohort }: any) => {
    const params = filtersArrayToObject(filters);

    const url = updateParams({ ...params, segment, cohort });

    router.push(url);
  };

  return (
    <DialogButton icon={<ListFilter />} label={formatMessage(labels.filter)} variant="outline">
      {({ close }) => {
        return <FilterEditForm websiteId={websiteId} onChange={handleChange} onClose={close} />;
      }}
    </DialogButton>
  );
}
