import { useMessages, useModified } from '@/components/hooks';
import {
  Button,
  Icon,
  Modal,
  Dialog,
  DialogTrigger,
  Text,
  Column,
  useToast,
} from '@umami/react-zen';
import { Plus } from '@/components/icons';
import { WebsiteAddForm } from './WebsiteAddForm';

export function WebsiteAddButton({ teamId, onSave }: { teamId: string; onSave?: () => void }) {
  const { formatMessage, labels, messages } = useMessages();
  const { toast } = useToast();
  const { touch } = useModified();

  const handleSave = async () => {
    toast(formatMessage(messages.saved));
    touch('websites');
    onSave?.();
  };

  return (
    <DialogTrigger>
      <Button data-test="button-website-add" variant="primary">
        <Icon>
          <Plus />
        </Icon>
        <Text>{formatMessage(labels.addWebsite)}</Text>
      </Button>
      <Modal>
        <Dialog title={formatMessage(labels.addWebsite)} style={{ width: 400 }}>
          {({ close }) => (
            <Column width="300px">
              <WebsiteAddForm teamId={teamId} onSave={handleSave} onClose={close} />
            </Column>
          )}
        </Dialog>
      </Modal>
    </DialogTrigger>
  );
}
