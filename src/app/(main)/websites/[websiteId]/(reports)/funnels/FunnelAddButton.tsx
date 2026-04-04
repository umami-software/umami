import { useMessages } from '@/components/hooks';
import { Plus } from '@/components/icons';
import { DialogButton } from '@/components/input/DialogButton';
import { FunnelEditForm } from './FunnelEditForm';

export function FunnelAddButton({ websiteId }: { websiteId: string }) {
  const { t, labels } = useMessages();

  return (
    <DialogButton
      variant="primary"
      icon={<Plus />}
      label={t(labels.funnel)}
      title={t(labels.funnel)}
      width="700px"
      height="600px"
    >
      {({ close }) => <FunnelEditForm websiteId={websiteId} onClose={close} />}
    </DialogButton>
  );
}
