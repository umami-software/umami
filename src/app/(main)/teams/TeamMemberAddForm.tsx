import {
  Button,
  DialogFooter,
  Form,
  FormField,
  FormSubmitButton,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@umami/react-zen';
import { useMessages, useUpdateQuery } from '@/components/hooks';
import { UserSelect } from '@/components/input/UserSelect';
import { ROLES } from '@/lib/constants';

const roles = [ROLES.teamManager, ROLES.teamMember, ROLES.teamViewOnly];

export function TeamMemberAddForm({
  teamId,
  onSave,
  onClose,
}: {
  teamId: string;
  onSave?: () => void;
  onClose?: () => void;
}) {
  const { t, labels, getErrorMessage } = useMessages();
  const { mutateAsync, error, isPending } = useUpdateQuery(`/teams/${teamId}/users`);

  const handleSubmit = async (data: any) => {
    await mutateAsync(data, {
      onSuccess: async () => {
        onSave?.();
        onClose?.();
      },
    });
  };

  const renderRole = role => {
    switch (role) {
      case ROLES.teamManager:
        return t(labels.manager);
      case ROLES.teamMember:
        return t(labels.member);
      case ROLES.teamViewOnly:
        return t(labels.viewOnly);
    }
  };

  return (
    <Form onSubmit={handleSubmit} error={getErrorMessage(error)}>
      <FormField name="userId" label={t(labels.username)} rules={{ required: 'Required' }}>
        <UserSelect teamId={teamId} />
      </FormField>
      <FormField name="role" label={t(labels.role)} rules={{ required: 'Required' }}>
        <Select items={roles.map(value => ({ value, label: renderRole(value) }))}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent alignItemWithTrigger={false}>
            <SelectGroup>
              {roles.map(value => (
                <SelectItem key={value} value={value}>
                  {renderRole(value)}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </FormField>
      <DialogFooter>
        <Button variant="outline" disabled={isPending} onClick={onClose}>
          {t(labels.cancel)}
        </Button>
        <FormSubmitButton disabled={isPending}>{t(labels.save)}</FormSubmitButton>
      </DialogFooter>
    </Form>
  );
}
