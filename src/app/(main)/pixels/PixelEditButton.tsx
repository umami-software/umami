import { useMessages } from '@/components/hooks';
import { Edit } from '@/components/icons';
import { DialogButton } from '@/components/input/DialogButton';
import { PixelEditForm } from './PixelEditForm';

export function PixelEditButton({ pixelId }: { pixelId: string }) {
  const { formatMessage, labels } = useMessages();

  return (
    <DialogButton
      icon={<Edit />}
      title={formatMessage(labels.addPixel)}
      variant="quiet"
      width="600px"
    >
      {({ close }) => {
        return <PixelEditForm pixelId={pixelId} onClose={close} />;
      }}
    </DialogButton>
  );
}
