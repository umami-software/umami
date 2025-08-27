import {
  Button,
  Form,
  FormButtons,
  FormField,
  FormSubmitButton,
  TextField,
  Label,
  Loading,
  Column,
  ComboBox,
  Select,
  ListItem,
  Grid,
  useDebounce,
} from '@umami/react-zen';
import {
  useMessages,
  useUpdateQuery,
  useWebsiteCohortQuery,
  useWebsiteValuesQuery,
} from '@/components/hooks';
import { DateFilter } from '@/components/input/DateFilter';
import { FieldFilters } from '@/components/input/FieldFilters';
import { SetStateAction, useMemo, useState } from 'react';
import { endOfDay, subMonths } from 'date-fns';
import { Empty } from '@/components/common/Empty';

export function CohortEditForm({
  cohortId,
  websiteId,
  filters = [],
  onSave,
  onClose,
}: {
  cohortId?: string;
  websiteId: string;
  filters?: any[];
  showFilters?: boolean;
  onSave?: () => void;
  onClose?: () => void;
}) {
  const [action, setAction] = useState('path');
  const [search, setSearch] = useState('');
  const searchValue = useDebounce(search, 300);
  const { data } = useWebsiteCohortQuery(websiteId, cohortId);
  const { formatMessage, labels, messages } = useMessages();
  const startDate = subMonths(endOfDay(new Date()), 6);
  const endDate = endOfDay(new Date());

  const { data: searchResults, isLoading } = useWebsiteValuesQuery({
    websiteId,
    type: action,
    search: searchValue,
    startDate,
    endDate,
  });

  const { mutate, error, isPending, touch, toast } = useUpdateQuery(
    `/websites/${websiteId}/segments${cohortId ? `/${cohortId}` : ''}`,
    {
      type: 'cohort',
    },
  );

  const items: string[] = useMemo(() => {
    return searchResults?.map(({ value }) => value) || [];
  }, [searchResults]);

  const handleSubmit = async (formData: any) => {
    mutate(formData, {
      onSuccess: async () => {
        toast(formatMessage(messages.saved));
        touch('cohorts');
        onSave?.();
        onClose?.();
      },
    });
  };

  const handleSearch = (value: SetStateAction<string>) => {
    setSearch(value);
  };

  if (cohortId && !data) {
    return <Loading position="page" />;
  }

  return (
    <Form
      error={error}
      onSubmit={handleSubmit}
      defaultValues={
        data || { parameters: { filters, dateRange: '30day', action: { type: 'path' } } }
      }
    >
      <FormField
        name="name"
        label={formatMessage(labels.name)}
        rules={{ required: formatMessage(labels.required) }}
      >
        <TextField autoFocus />
      </FormField>

      <Column>
        <Label>{formatMessage(labels.action)}</Label>
        <Grid columns="260px 1fr" gap>
          <Column>
            <FormField
              name="parameters.action.type"
              rules={{ required: formatMessage(labels.required) }}
            >
              <Select onSelectionChange={(value: any) => setAction(value)}>
                <ListItem id="path">{formatMessage(labels.viewedPage)}</ListItem>
                <ListItem id="event">{formatMessage(labels.triggeredEvent)}</ListItem>
              </Select>
            </FormField>
          </Column>
          <Column>
            <FormField
              name="parameters.action.value"
              rules={{ required: formatMessage(labels.required) }}
            >
              {({ field }) => {
                return (
                  <ComboBox
                    aria-label="action"
                    items={items}
                    inputValue={field?.value}
                    onInputChange={value => {
                      handleSearch(value);
                      field?.onChange?.(value);
                    }}
                    formValue="text"
                    allowsEmptyCollection
                    allowsCustomValue
                    renderEmptyState={() =>
                      isLoading ? (
                        <Loading position="center" icon="dots" />
                      ) : (
                        <Empty message={formatMessage(messages.noResultsFound)} />
                      )
                    }
                  >
                    {items.map(item => (
                      <ListItem key={item} id={item}>
                        {item}
                      </ListItem>
                    ))}
                  </ComboBox>
                );
              }}
            </FormField>
          </Column>
        </Grid>
      </Column>

      <Column width="260px">
        <Label>{formatMessage(labels.dateRange)}</Label>
        <FormField name="parameters.dateRange" rules={{ required: formatMessage(labels.required) }}>
          <DateFilter placement="bottom start" />
        </FormField>
      </Column>

      <Column>
        <Label>{formatMessage(labels.filters)}</Label>
        <FormField name="parameters.filters" rules={{ required: formatMessage(labels.required) }}>
          <FieldFilters websiteId={websiteId} exclude={['path', 'event']} />
        </FormField>
      </Column>

      <FormButtons>
        <Button isDisabled={isPending} onPress={onClose}>
          {formatMessage(labels.cancel)}
        </Button>
        <FormSubmitButton variant="primary" data-test="button-submit" isDisabled={isPending}>
          {formatMessage(labels.save)}
        </FormSubmitButton>
      </FormButtons>
    </Form>
  );
}
