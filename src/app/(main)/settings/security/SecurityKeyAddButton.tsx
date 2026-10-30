import { useQueryClient } from '@tanstack/react-query';
import {
  Button,
  Dialog,
  DialogTrigger,
  Form,
  FormButtons,
  FormField,
  FormSubmitButton,
  Icon,
  Modal,
  Text,
  TextField,
} from '@umami/react-zen';
import { useMessages, useSecurityKeyRegisterMutation } from '@/components/hooks';
import { Plus } from '@/components/icons';

export function SecurityKeyAddButton({ isDisabled }: { isDisabled?: boolean }) {
  const { t, labels } = useMessages();

  return (
    <DialogTrigger>
      <Button variant="primary" isDisabled={isDisabled}>
        <Icon>
          <Plus />
        </Icon>
        <Text>{t(labels.addSecurityKey)}</Text>
      </Button>
      <Modal>
        <Dialog title={t(labels.addSecurityKey)} style={{ width: 420 }}>
          {({ close }) => <SecurityKeyAddForm onClose={close} />}
        </Dialog>
      </Modal>
    </DialogTrigger>
  );
}

function SecurityKeyAddForm({ onClose }: { onClose: () => void }) {
  const { t, labels, messages, getErrorMessage } = useMessages();
  const { mutateAsync, error, isPending } = useSecurityKeyRegisterMutation();
  const queryClient = useQueryClient();

  const handleSubmit = async ({ name }: { name: string }) => {
    await mutateAsync(
      { name },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['2fa-status'] });
          onClose();
        },
      },
    );
  };

  return (
    <Form onSubmit={handleSubmit} error={getErrorMessage(error)} defaultValues={{ name: '' }}>
      <Text>{t(messages.securityKeyAddDescription)}</Text>
      <FormField name="name" label={t(labels.name)} rules={{ required: t(labels.required) }}>
        <TextField autoComplete="off" maxLength={255} autoFocus />
      </FormField>
      <FormButtons>
        <Button isDisabled={isPending} onPress={onClose}>
          {t(labels.cancel)}
        </Button>
        <FormSubmitButton variant="primary" isDisabled={isPending}>
          {t(labels.continue)}
        </FormSubmitButton>
      </FormButtons>
    </Form>
  );
}
