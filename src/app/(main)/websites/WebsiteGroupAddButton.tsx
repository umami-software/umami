import { useToast } from '@umami/react-zen';
import { useMessages, useModified } from '@/components/hooks';
import { FolderPlus } from '@/components/icons';
import { DialogButton } from '@/components/input/DialogButton';
import { WebsiteGroupAddForm } from './WebsiteGroupAddForm';

export function WebsiteGroupAddButton({
  teamId,
  parentId,
  onSave,
}: {
  teamId?: string;
  parentId?: string | null;
  onSave?: () => void;
}) {
  const { t, labels, messages } = useMessages();
  const { toast } = useToast();
  const { touch } = useModified();

  const handleSave = async () => {
    toast(t(messages.saved));
    touch('website-groups');
    touch('websites');
    onSave?.();
  };

  return (
    <DialogButton icon={<FolderPlus />} label={t(labels.addGroup)} width="400px">
      {({ close }) => (
        <WebsiteGroupAddForm
          teamId={teamId}
          parentId={parentId}
          onSave={handleSave}
          onClose={close}
        />
      )}
    </DialogButton>
  );
}
