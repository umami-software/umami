import { useMessages } from '@/components/hooks';
import { Plus } from '@/components/icons';
import { PixelEditForm } from './PixelEditForm';
import { DialogButton } from '@/components/input/DialogButton';

export function PixelAddButton({ teamId }: { teamId?: string }) {
  const { formatMessage, labels } = useMessages();

  return (
    <DialogButton
      icon={<Plus />}
      label={formatMessage(labels.addPixel)}
      variant="primary"
      width="600px"
    >
      {({ close }) => <PixelEditForm teamId={teamId} onClose={close} />}
    </DialogButton>
  );
}
