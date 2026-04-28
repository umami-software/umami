import { useMessages } from '@/components/hooks';
import { Edit } from '@/components/icons';
import { DialogButton } from '@/components/input/DialogButton';
import { ShareEditForm } from './ShareEditForm';

export function ShareEditButton({ shareId }: { shareId: string }) {
  const { t, labels } = useMessages();

  return (
    <DialogButton icon={<Edit />} title={t(labels.share)} variant="quiet" width="600px">
      {({ close }) => {
        return <ShareEditForm shareId={shareId} onClose={close} />;
      }}
    </DialogButton>
  );
}
