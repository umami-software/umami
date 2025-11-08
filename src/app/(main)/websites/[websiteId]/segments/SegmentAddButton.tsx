import { useMessages } from '@/components/hooks';
import { Plus } from '@/components/icons';
import { SegmentEditForm } from './SegmentEditForm';
import { DialogButton } from '@/components/input/DialogButton';

export function SegmentAddButton({ websiteId }: { websiteId: string }) {
  const { formatMessage, labels } = useMessages();

  return (
    <DialogButton
      icon={<Plus />}
      label={formatMessage(labels.segment)}
      variant="primary"
      width="800px"
    >
      {({ close }) => {
        return <SegmentEditForm websiteId={websiteId} onClose={close} />;
      }}
    </DialogButton>
  );
}
