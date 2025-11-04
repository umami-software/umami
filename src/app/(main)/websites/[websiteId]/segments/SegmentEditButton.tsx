import { Edit } from '@/components/icons';
import { useMessages } from '@/components/hooks';
import { SegmentEditForm } from './SegmentEditForm';
import { Filter } from '@/lib/types';
import { DialogButton } from '@/components/input/DialogButton';

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
    <DialogButton
      icon={<Edit />}
      title={formatMessage(labels.segment)}
      variant="quiet"
      width="800px"
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
    </DialogButton>
  );
}
