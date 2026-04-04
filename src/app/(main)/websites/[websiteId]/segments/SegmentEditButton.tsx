import { useMessages } from '@/components/hooks';
import { Edit } from '@/components/icons';
import { DialogButton } from '@/components/input/DialogButton';
import type { Filter } from '@/lib/types';
import { SegmentEditForm } from './SegmentEditForm';

export function SegmentEditButton({
  segmentId,
  websiteId,
  filters,
}: {
  segmentId: string;
  websiteId: string;
  filters?: Filter[];
}) {
  const { t, labels } = useMessages();

  return (
    <DialogButton icon={<Edit />} title={t(labels.segment)} variant="quiet" width="800px">
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
