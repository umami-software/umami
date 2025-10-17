import { Edit } from '@/components/icons';
import { PixelEditForm } from './PixelEditForm';
import { useMessages } from '@/components/hooks';
import { DialogButton } from '@/components/input/DialogButton';

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
