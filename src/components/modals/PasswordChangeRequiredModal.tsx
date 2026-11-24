import {
  Column,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Text,
  useToast,
} from '@umami/react-zen';
import { PasswordEditForm } from '@/app/(main)/settings/security/PasswordEditForm';
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
    <Dialog open={true}>
      <DialogContent style={{ width: 400 }} showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>{t(labels.changePassword)}</DialogTitle>
        </DialogHeader>
        <Column gap="4">
          <Text>{t(messages.passwordChangeRequired)}</Text>
          <PasswordEditForm required={true} onSave={handleSave} />
        </Column>
      </DialogContent>
    </Dialog>
  );
}
