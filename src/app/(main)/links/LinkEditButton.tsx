import { ActionButton } from '@/components/input/ActionButton';
import { Edit } from '@/components/icons';
import { Dialog } from '@umami/react-zen';
import { LinkEditForm } from './LinkEditForm';
import { useMessages } from '@/components/hooks';

export function LinkEditButton({ linkId }: { linkId: string }) {
  const { formatMessage, labels } = useMessages();

  return (
    <ActionButton title={formatMessage(labels.edit)} icon={<Edit />}>
      <Dialog title={formatMessage(labels.link)} style={{ width: 800 }}>
        {({ close }) => {
          return <LinkEditForm linkId={linkId} onClose={close} />;
        }}
      </Dialog>
    </ActionButton>
  );
}
