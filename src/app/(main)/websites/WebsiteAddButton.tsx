import { useMessages, useModified } from '@/components/hooks';
import { useToast } from '@umami/react-zen';
import { Plus } from '@/components/icons';
import { WebsiteAddForm } from './WebsiteAddForm';
import { DialogButton } from '@/components/input/DialogButton';

export function WebsiteAddButton({ teamId, onSave }: { teamId: string; onSave?: () => void }) {
  const { formatMessage, labels, messages } = useMessages();
  const { toast } = useToast();
  const { touch } = useModified();

  const handleSave = async () => {
    toast(formatMessage(messages.saved));
    touch('websites');
    onSave?.();
  };

  return (
    <DialogButton
      icon={<Plus />}
      label={formatMessage(labels.addWebsite)}
      variant="primary"
      width="400px"
    >
      {({ close }) => <WebsiteAddForm teamId={teamId} onSave={handleSave} onClose={close} />}
    </DialogButton>
  );
}
