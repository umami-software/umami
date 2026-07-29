import { Button, Dialog, DialogTrigger, Icon, Modal, Text } from '@umami/react-zen';
import { SegmentEditForm } from '@/app/(main)/websites/[websiteId]/segments/SegmentEditForm';
import { useMessages, useMobile } from '@/components/hooks';
import { Plus } from '@/components/icons';

export function SegmentSaveButton({ websiteId }: { websiteId: string }) {
  const { t, labels } = useMessages();
  const { isMobile } = useMobile();

  return (
    <DialogTrigger>
      <Button variant="primary">
        <Icon>
          <Plus />
        </Icon>
        <Text>{t(labels.segment)}</Text>
      </Button>
      <Modal placement={isMobile ? 'fullscreen' : 'center'}>
        <Dialog
          variant={isMobile ? 'sheet' : undefined}
          title={t(labels.segment)}
          style={{
            width: isMobile ? '100%' : '800px',
            height: isMobile ? '100%' : undefined,
            maxHeight: isMobile ? '100%' : 'calc(100dvh - 40px)',
            overflowY: 'auto',
            padding: '32px',
          }}
        >
          {({ close }) => {
            return <SegmentEditForm websiteId={websiteId} onClose={close} />;
          }}
        </Dialog>
      </Modal>
    </DialogTrigger>
  );
}
