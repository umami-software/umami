import { Dialog } from '@umami/react-zen';
import { ActionButton } from '@/components/input/ActionButton';
import { Edit } from '@/components/icons';
import { useMessages } from '@/components/hooks';
import { SegmentEditForm } from './SegmentEditForm';
import { Filter } from '@/lib/types';

export function SegmentEditButton({
  segmentId,
  websiteId,
  filters,
}: {
  segmentId: string;
  websiteId: string;
  filters?: Filter[];
}) {
  const { formatMessage, labels } = useMessages();

  return (
    <ActionButton title={formatMessage(labels.edit)} icon={<Edit />}>
      <Dialog title={formatMessage(labels.segment)} style={{ width: 800, minHeight: 300 }}>
        {({ close }) => {
          return (
            <SegmentEditForm
              segmentId={segmentId}
              websiteId={websiteId}
              filters={filters}
              onClose={close}
            />
          );
        }}
      </Dialog>
    </ActionButton>
  );
}
