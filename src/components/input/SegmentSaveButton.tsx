import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Icon,
  Text,
} from '@umami/react-zen';
import { useState } from 'react';
import { SegmentEditForm } from '@/app/(main)/websites/[websiteId]/segments/SegmentEditForm';
import { useMessages, useMobile } from '@/components/hooks';
import { Plus } from '@/components/icons';

export function SegmentSaveButton({ websiteId }: { websiteId: string }) {
  const { t, labels } = useMessages();
  const { isMobile } = useMobile();
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>
        <Icon>
          <Plus />
        </Icon>
        <Text>{t(labels.segment)}</Text>
      </DialogTrigger>
      <DialogContent
        style={{
          width: isMobile ? '100%' : '800px',
          height: isMobile ? '100%' : undefined,
          maxWidth: isMobile ? '100%' : 'calc(100% - 2rem)',
          maxHeight: isMobile ? '100%' : 'calc(100dvh - 40px)',
          borderRadius: isMobile ? 0 : undefined,
          overflowY: 'auto',
          padding: '32px',
        }}
      >
        <DialogHeader>
          <DialogTitle>{t(labels.segment)}</DialogTitle>
        </DialogHeader>
        <SegmentEditForm websiteId={websiteId} onClose={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
