import { useMessages, useShare } from '@/components/hooks';
import { MessageSquareText } from '@/components/icons';
import { DialogButton } from '@/components/input/DialogButton';
import { AnnotationsModal } from './AnnotationsModal';

export function AnnotationsButton({ websiteId }: { websiteId: string }) {
  const { t, labels } = useMessages();
  const share = useShare();

  if (share) {
    return null;
  }

  return (
    <DialogButton
      icon={<MessageSquareText />}
      label={t(labels.notes)}
      title={null}
      variant="quiet"
      width="800px"
    >
      {({ close }) => <AnnotationsModal websiteId={websiteId} onClose={close} />}
    </DialogButton>
  );
}
