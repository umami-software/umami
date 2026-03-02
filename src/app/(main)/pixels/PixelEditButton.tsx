import { useMessages } from '@/components/hooks';
import { Edit } from '@/components/icons';
import { DialogButton } from '@/components/input/DialogButton';
import { PixelEditForm } from './PixelEditForm';

export function PixelEditButton({ pixelId }: { pixelId: string }) {
  const { t, labels } = useMessages();

  return (
    <DialogButton icon={<Edit />} title={t(labels.addPixel)} variant="quiet" width="600px">
      {({ close }) => {
        return <PixelEditForm pixelId={pixelId} onClose={close} />;
      }}
    </DialogButton>
  );
}
