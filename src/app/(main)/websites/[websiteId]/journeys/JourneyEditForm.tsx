import {
  Form,
  FormField,
  TextField,
  FormButtons,
  FormSubmitButton,
  Button,
  Select,
  ListItem,
  Loading,
} from '@umami/react-zen';
import { useApi, useMessages, useModified, useReportQuery } from '@/components/hooks';

const JOURNEY_STEPS = ['3', '4', '5', '6', '7'];

export function JourneyEditForm({
  id,
  websiteId,
  onSave,
  onClose,
}: {
  id?: string;
  websiteId: string;
  onSave?: () => void;
  onClose?: () => void;
}) {
  const { formatMessage, labels } = useMessages();
  const { touch } = useModified();
  const { post, useMutation } = useApi();
  const { data } = useReportQuery(id);
  const { mutate, error, isPending } = useMutation({
    mutationFn: (params: any) => post(`/reports${id ? `/${id}` : ''}`, params),
  });

  const handleSubmit = async ({ name, ...parameters }) => {
    mutate(
      { ...data, id, name, type: 'journey', websiteId, parameters },
      {
        onSuccess: async () => {
          if (id) touch(`report:${id}`);
          touch('reports:journey');
          onSave?.();
          onClose?.();
        },
      },
    );
  };

  if (id && !data) {
    return <Loading position="page" />;
  }

  const defaultValues = {
    name: data?.name || '',
    steps: data?.steps || '5',
    startStep: data?.parameters?.startStep || '',
    endStep: data?.parameters?.endStep || '',
  };

  return (
    <Form onSubmit={handleSubmit} error={error?.message} defaultValues={defaultValues}>
      <FormField
        name="name"
        label={formatMessage(labels.name)}
        rules={{ required: formatMessage(labels.required) }}
      >
        <TextField />
      </FormField>
      <FormField
        name="steps"
        label={formatMessage(labels.steps)}
        rules={{ required: formatMessage(labels.required) }}
      >
        <Select>
          {JOURNEY_STEPS.map(step => (
            <ListItem key={step} id={step}>
              {step}
            </ListItem>
          ))}
        </Select>
      </FormField>
      <FormField name="startStep" label={formatMessage(labels.startStep)}>
        <TextField />
      </FormField>
      <FormField name="endStep" label={formatMessage(labels.endStep)}>
        <TextField />
      </FormField>
      <FormButtons>
        <Button onPress={onClose} isDisabled={isPending}>
          {formatMessage(labels.cancel)}
        </Button>
        <FormSubmitButton>{formatMessage(labels.save)}</FormSubmitButton>
      </FormButtons>
    </Form>
  );
}
