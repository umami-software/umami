import { useMessages } from '@/components/hooks';
import { Share } from '@/components/icons';
import { DialogButton } from '@/components/input/DialogButton';
import { PixelShareDialog } from './PixelShareDialog';

export function PixelShareButton({ pixelId }: { pixelId: string }) {
  const { t, labels } = useMessages();

  return (
    <DialogButton icon={<Share />} label={t(labels.share)} title={null} width="900px">
      <PixelShareDialog pixelId={pixelId} />
    </DialogButton>
  );
}
