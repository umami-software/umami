import { useMessages } from '@/components/hooks';
import { Edit } from '@/components/icons';
import { DialogButton } from '@/components/input/DialogButton';
import { SimpleShareEditForm } from './SimpleShareEditForm';

export function SimpleShareEditButton({ shareId }: { shareId: string }) {
  const { t, labels } = useMessages();

  return (
    <DialogButton icon={<Edit />} title={t(labels.share)} variant="quiet" width="600px">
      {({ close }) => <SimpleShareEditForm shareId={shareId} onClose={close} />}
    </DialogButton>
  );
}
