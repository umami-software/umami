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
import { ROLES } from '@/lib/constants';

export function TeamMemberEditForm({
  teamId,
  userId,
  role,
  onSave,
  onClose,
}: {
  teamId: string;
  userId: string;
  role: string;
  onSave?: () => void;
  onClose?: () => void;
}) {
  const { mutateAsync, error, isPending } = useUpdateQuery(`/teams/${teamId}/users/${userId}`);
  const { t, labels, getErrorMessage } = useMessages();

  const roles = [
    { value: ROLES.teamManager, label: t(labels.manager) },
    { value: ROLES.teamMember, label: t(labels.member) },
    { value: ROLES.teamViewOnly, label: t(labels.viewOnly) },
  ];

  const handleSubmit = async (data: any) => {
    await mutateAsync(data, {
      onSuccess: async () => {
        onSave();
        onClose();
      },
    });
  };

  return (
    <Form onSubmit={handleSubmit} error={getErrorMessage(error)} defaultValues={{ role }}>
      <FormField name="role" rules={{ required: t(labels.required) }} label={t(labels.role)}>
        <Select items={roles}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent alignItemWithTrigger={false}>
            <SelectGroup>
              {roles.map(({ value, label }) => (
                <SelectItem key={value} value={value}>
                  {label}
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
        <FormSubmitButton disabled={false}>{t(labels.save)}</FormSubmitButton>
      </DialogFooter>
    </Form>
  );
}
