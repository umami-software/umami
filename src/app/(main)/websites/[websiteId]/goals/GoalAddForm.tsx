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
} from '@umami/react-zen';
import { useApi, useMessages, useModified, useReportQuery } from '@/components/hooks';
import { File, Lightning } from '@/components/icons';

const defaultValues = {
  name: '',
  type: 'page',
  value: '',
};

export function GoalAddForm({
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
    mutationFn: (params: any) => post(`/websites/${websiteId}/goals`, params),
  });

  const handleSubmit = async (data: any) => {
    mutate(
      { id, ...data },
      {
        onSuccess: async () => {
          onSave?.();
          onClose?.();
          touch('goals');
        },
      },
    );
  };

  if (id && !data) {
    return null;
  }

  return (
    <Form
      onSubmit={handleSubmit}
      error={error?.message}
      defaultValues={data?.parameters || defaultValues}
    >
      {({ watch }) => {
        const watchType = watch('type');
        return (
          <>
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
              name="name"
              label={formatMessage(labels.name)}
              rules={{ required: formatMessage(labels.required) }}
            >
              <TextField />
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
              <FormSubmitButton>{formatMessage(id ? labels.save : labels.add)}</FormSubmitButton>
            </FormButtons>
          </>
        );
      }}
    </Form>
  );
}
