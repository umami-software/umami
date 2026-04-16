import { useMessages } from '@/components/hooks';
import { Plus } from '@/components/icons';
import { DialogButton } from '@/components/input/DialogButton';
import { GoalEditForm } from './GoalEditForm';

export function GoalAddButton({ websiteId }: { websiteId: string }) {
  const { t, labels } = useMessages();

  return (
    <DialogButton
      variant="primary"
      icon={<Plus />}
      label={t(labels.goal)}
      title={t(labels.goal)}
      minWidth="400px"
      minHeight="300px"
    >
      {({ close }) => <GoalEditForm websiteId={websiteId} onClose={close} />}
    </DialogButton>
  );
}
