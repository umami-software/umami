import { Column, Dialog, Modal, Text, useToast } from '@umami/react-zen';
import { PasswordEditForm } from '@/app/(main)/settings/security/PasswordEditForm';
import { ControlledDialog } from '@/components/common/ControlledDialog';
import { useLoginQuery, useMessages } from '@/components/hooks';

export function PasswordChangeRequiredModal() {
  const { user, setUser } = useLoginQuery();
  const { t, labels, messages } = useMessages();
  const { toast } = useToast();

  const handleSave = () => {
    setUser({ ...user, passwordChangeRequired: false });
    toast(t(messages.saved));
  };

  return (
    <ControlledDialog>
      <Modal isOpen={true} onOpenChange={() => {}}>
        <Dialog title={t(labels.changePassword)} style={{ width: 400 }}>
          {() => (
            <Column gap="4">
              <Text>{t(messages.passwordChangeRequired)}</Text>
              <PasswordEditForm required={true} onSave={handleSave} />
            </Column>
          )}
        </Dialog>
      </Modal>
    </ControlledDialog>
  );
}
