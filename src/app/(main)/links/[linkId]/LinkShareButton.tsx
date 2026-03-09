import { useMessages } from '@/components/hooks';
import { Share } from '@/components/icons';
import { DialogButton } from '@/components/input/DialogButton';
import { LinkShareDialog } from './LinkShareDialog';

export function LinkShareButton({ linkId }: { linkId: string }) {
  const { t, labels } = useMessages();

  return (
    <DialogButton icon={<Share />} label={t(labels.share)} title={null} width="900px">
      <LinkShareDialog linkId={linkId} />
    </DialogButton>
  );
}
