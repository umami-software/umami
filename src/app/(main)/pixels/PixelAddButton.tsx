import { useMessages } from '@/components/hooks';
import { Plus } from '@/components/icons';
import { DialogButton } from '@/components/input/DialogButton';
import { PixelEditForm } from './PixelEditForm';

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
