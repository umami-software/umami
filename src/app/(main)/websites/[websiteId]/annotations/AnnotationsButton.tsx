import { useDateParameters, useMessages } from '@/components/hooks';
import { MessageSquareText } from '@/components/icons';
import { DialogButton } from '@/components/input/DialogButton';
import { AnnotationsModal } from './AnnotationsModal';

export function AnnotationsButton({ websiteId }: { websiteId: string }) {
  const { t, labels } = useMessages();
  const { startAt, endAt } = useDateParameters();

  return (
    <DialogButton
      icon={<MessageSquareText />}
      label={t(labels.notes)}
      title={null}
      variant="quiet"
      width="800px"
    >
      {({ close }) => (
        <AnnotationsModal websiteId={websiteId} range={{ startAt, endAt }} onClose={close} />
      )}
    </DialogButton>
  );
}
