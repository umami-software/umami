import { useMessages } from '@/components/hooks';
import { Plus } from '@/components/icons';
import { LinkEditForm } from './LinkEditForm';
import { DialogButton } from '@/components/input/DialogButton';

export function LinkAddButton({ teamId }: { teamId?: string }) {
  const { formatMessage, labels } = useMessages();

  return (
    <DialogButton
      icon={<Plus />}
      label={formatMessage(labels.addLink)}
      variant="primary"
      width="600px"
    >
      {({ close }) => <LinkEditForm teamId={teamId} onClose={close} />}
    </DialogButton>
  );
}
