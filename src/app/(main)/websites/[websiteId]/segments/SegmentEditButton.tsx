import { ActionButton } from '@/components/input/ActionButton';
import { Edit } from '@/components/icons';
import { Dialog } from '@umami/react-zen';
import { SegmentEditForm } from '@/app/(main)/websites/[websiteId]/segments/SegmentEditForm';
import { useMessages } from '@/components/hooks';

export function SegmentEditButton({
  segmentId,
  websiteId,
  filters,
}: {
  segmentId: string;
  websiteId: string;
  filters?: any[];
}) {
  const { formatMessage, labels } = useMessages();

  return (
    <ActionButton title={formatMessage(labels.edit)} icon={<Edit />}>
      <Dialog
        title={formatMessage(labels.segment)}
        style={{ width: 800, minHeight: 300, maxHeight: '90vh' }}
      >
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
