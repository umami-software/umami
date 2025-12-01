import { Edit } from '@/components/icons';
import { LinkEditForm } from './LinkEditForm';
import { useMessages } from '@/components/hooks';
import { DialogButton } from '@/components/input/DialogButton';

export function LinkEditButton({ linkId }: { linkId: string }) {
  const { formatMessage, labels } = useMessages();

  return (
    <DialogButton icon={<Edit />} title={formatMessage(labels.link)} variant="quiet" width="800px">
      {({ close }) => {
        return <LinkEditForm linkId={linkId} onClose={close} />;
      }}
    </DialogButton>
  );
}
