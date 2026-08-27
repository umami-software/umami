import {
  Button,
  Column,
  DatePicker,
  Form,
  FormButtons,
  FormField,
  FormSubmitButton,
  Label,
  TextField,
} from '@umami/react-zen';
import { startOfDay } from 'date-fns';
import { useMemo, useState } from 'react';
import { useLocale, useMessages, useTimezone, useUpdateQuery } from '@/components/hooks';

export interface Annotation {
  id: string;
  websiteId: string;
  date: string;
  allDay: boolean;
  note: string;
}

export function AnnotationEditForm({
  annotation,
  websiteId,
  onSave,
  onClose,
}: {
  annotation?: Annotation;
  websiteId: string;
  onSave?: () => void;
  onClose?: () => void;
}) {
  const { t, labels, messages, getErrorMessage } = useMessages();
  const { locale } = useLocale();
  const { localToUtc, localFromUtc } = useTimezone();

  const initialDate = useMemo(
    () => (annotation ? localFromUtc(new Date(annotation.date)) : new Date()),
    [annotation],
  );
  const [date, setDate] = useState<Date>(startOfDay(initialDate));

  const { mutateAsync, error, isPending, touch, toast } = useUpdateQuery(
    `/websites/${websiteId}/annotations${annotation ? `/${annotation.id}` : ''}`,
  );

  const handleSubmit = async ({ note }: { note: string }) => {
    await mutateAsync(
      {
        date: localToUtc(startOfDay(date)).toISOString(),
        allDay: true,
        note,
      },
      {
        onSuccess: async () => {
          toast(t(messages.saved));
          touch('annotations');
          onSave?.();
          onClose?.();
        },
      },
    );
  };

  return (
    <Form
      error={getErrorMessage(error)}
      onSubmit={handleSubmit}
      defaultValues={{ note: annotation?.note || '' }}
    >
      <Column gap>
        <Column>
          <Label>{t(labels.date)}</Label>
          <DatePicker value={date} locale={locale} onChange={value => value && setDate(value)} />
        </Column>

        <FormField
          name="note"
          label={t(labels.note)}
          rules={{ required: t(labels.required), maxLength: 500 }}
        >
          <TextField asTextArea autoFocus />
        </FormField>

        <FormButtons>
          <Button isDisabled={isPending} onPress={onClose}>
            {t(labels.cancel)}
          </Button>
          <FormSubmitButton variant="primary" isDisabled={isPending}>
            {t(labels.save)}
          </FormSubmitButton>
        </FormButtons>
      </Column>
    </Form>
  );
}
