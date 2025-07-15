import {
  Form,
  FormField,
  TextField,
  Grid,
  FormButtons,
  FormSubmitButton,
  Button,
  RadioGroup,
  Radio,
  Text,
  Icon,
  Loading,
} from '@umami/react-zen';
import { useApi, useMessages, useModified, useReportQuery } from '@/components/hooks';
import { File, Lightning } from '@/components/icons';

export function GoalEditForm({
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
      { ...data, id, name, type: 'goal', websiteId, parameters },
      {
        onSuccess: async () => {
          if (id) touch(`report:${id}`);
          touch('reports:goal');
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
    type: data?.parameters?.type || 'page',
    value: data?.parameters?.value || '',
  };

  return (
    <Form onSubmit={handleSubmit} error={error?.message} defaultValues={defaultValues}>
      {({ watch }) => {
        const watchType = watch('type');
        return (
          <>
            <FormField
              name="name"
              label={formatMessage(labels.name)}
              rules={{ required: formatMessage(labels.required) }}
            >
              <TextField autoFocus />
            </FormField>
            <FormField
              name="type"
              label={formatMessage(labels.type)}
              rules={{ required: formatMessage(labels.required) }}
            >
              <RadioGroup orientation="horizontal" variant="box">
                <Grid columns="1fr 1fr" flexGrow={1} gap>
                  <Radio value="page">
                    <Icon>
                      <File />
                    </Icon>
                    <Text>{formatMessage(labels.page)}</Text>
                  </Radio>
                  <Radio value="event">
                    <Icon>
                      <Lightning />
                    </Icon>
                    <Text>{formatMessage(labels.event)}</Text>
                  </Radio>
                </Grid>
              </RadioGroup>
            </FormField>
            <FormField
              name="value"
              label={formatMessage(watchType === 'event' ? labels.eventName : labels.path)}
              rules={{ required: formatMessage(labels.required) }}
            >
              <TextField />
            </FormField>
            <FormButtons>
              <Button onPress={onClose} isDisabled={isPending}>
                {formatMessage(labels.cancel)}
              </Button>
              <FormSubmitButton>{formatMessage(labels.save)}</FormSubmitButton>
            </FormButtons>
          </>
        );
      }}
    </Form>
  );
}
