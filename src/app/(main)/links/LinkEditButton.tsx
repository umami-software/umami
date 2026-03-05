import { useMessages } from '@/components/hooks';
import { Edit } from '@/components/icons';
import { DialogButton } from '@/components/input/DialogButton';
import { LinkEditForm } from './LinkEditForm';

export function LinkEditButton({ linkId }: { linkId: string }) {
  const { t, labels } = useMessages();

  return (
    <DialogButton icon={<Edit />} title={t(labels.link)} variant="quiet" width="800px">
      {({ close }) => {
        return <LinkEditForm linkId={linkId} onClose={close} />;
      }}
    </DialogButton>
  );
}
