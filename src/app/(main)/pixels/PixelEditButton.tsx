import { ActionButton } from '@/components/input/ActionButton';
import { Edit } from '@/components/icons';
import { Dialog } from '@umami/react-zen';
import { PixelEditForm } from './PixelEditForm';
import { useMessages } from '@/components/hooks';

export function PixelEditButton({ pixelId }: { pixelId: string }) {
  const { formatMessage, labels } = useMessages();

  return (
    <ActionButton title={formatMessage(labels.edit)} icon={<Edit />}>
      <Dialog title={formatMessage(labels.pixel)} style={{ width: 800 }}>
        {({ close }) => {
          return <PixelEditForm pixelId={pixelId} onClose={close} />;
        }}
      </Dialog>
    </ActionButton>
  );
}
