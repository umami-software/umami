import {
  Form,
  FormField,
  FormFieldArray,
  TextField,
  Grid,
  FormController,
  FormButtons,
  FormSubmitButton,
  Button,
  RadioGroup,
  Radio,
  Text,
  Icon,
  Row,
  Loading,
} from '@umami/react-zen';
import { useMessages, useReportQuery, useUpdateQuery } from '@/components/hooks';
import { File, Lightning, Close, Plus } from '@/components/icons';

const FUNNEL_STEPS_MAX = 8;

export function FunnelEditForm({
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
  const { data } = useReportQuery(id);
  const { mutate, error, isPending, touch } = useUpdateQuery(`/reports${id ? `/${id}` : ''}`);

  const handleSubmit = async ({ name, ...parameters }) => {
    mutate(
      { ...data, id, name, type: 'funnel', websiteId, parameters },
      {
        onSuccess: async () => {
          touch('reports:funnel');
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
    window: data?.parameters?.window || 60,
    steps: data?.parameters?.steps || [{ type: 'page', value: '/' }],
  };

  return (
    <Form onSubmit={handleSubmit} error={error?.message} defaultValues={defaultValues}>
      <FormField
        name="name"
        label={formatMessage(labels.name)}
        rules={{ required: formatMessage(labels.required) }}
      >
        <TextField autoFocus />
      </FormField>
      <FormField
        name="window"
        label={formatMessage(labels.window)}
        rules={{ required: formatMessage(labels.required) }}
      >
        <TextField />
      </FormField>
      <FormFieldArray name="steps" label={formatMessage(labels.steps)}>
        {({ fields, append, remove, control }) => {
          return (
            <Grid gap>
              {fields.map((field: { id: string; type: string; value: string }, index: number) => {
                return (
                  <Row key={field.id} alignItems="center" justifyContent="space-between" gap>
                    <FormController control={control} name={`steps.${index}.type`}>
                      {({ field }) => {
                        return (
                          <RadioGroup
                            orientation="horizontal"
                            variant="box"
                            value={field.value}
                            onChange={field.onChange}
                          >
                            <Grid columns="1fr 1fr" flexGrow={1} gap>
                              <Radio id="page" value="page">
                                <Icon>
                                  <File />
                                </Icon>
                                <Text>{formatMessage(labels.page)}</Text>
                              </Radio>
                              <Radio id="event" value="event">
                                <Icon>
                                  <Lightning />
                                </Icon>
                                <Text>{formatMessage(labels.event)}</Text>
                              </Radio>
                            </Grid>
                          </RadioGroup>
                        );
                      }}
                    </FormController>
                    <FormController control={control} name={`steps.${index}.value`}>
                      {({ field }) => {
                        return (
                          <TextField
                            value={field.value}
                            onChange={field.onChange}
                            defaultValue={field.value}
                            style={{ flexGrow: 1 }}
                          />
                        );
                      }}
                    </FormController>
                    <Button variant="quiet" onPress={() => remove(index)}>
                      <Icon size="sm">
                        <Close />
                      </Icon>
                    </Button>
                  </Row>
                );
              })}
              <Row>
                <Button
                  onPress={() => append({ type: 'page', value: '/' })}
                  isDisabled={fields.length >= FUNNEL_STEPS_MAX}
                >
                  <Icon>
                    <Plus />
                  </Icon>
                  <Text>{formatMessage(labels.add)}</Text>
                </Button>
              </Row>
            </Grid>
          );
        }}
      </FormFieldArray>
      <FormButtons>
        <Button onPress={onClose} isDisabled={isPending}>
          {formatMessage(labels.cancel)}
        </Button>
        <FormSubmitButton>{formatMessage(labels.save)}</FormSubmitButton>
      </FormButtons>
    </Form>
  );
}
