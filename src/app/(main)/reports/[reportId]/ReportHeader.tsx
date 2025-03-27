import {
  Row,
  Column,
  Text,
  Heading,
  Icon,
  LoadingButton,
  InlineEditField,
  useToast,
} from '@umami/react-zen';
import { useMessages, useApi, useNavigation, useReport } from '@/components/hooks';
import { REPORT_TYPES } from '@/lib/constants';

export function ReportHeader({ icon }) {
  const { report, updateReport } = useReport();
  const { formatMessage, labels, messages } = useMessages();
  const { toast } = useToast();
  const { router, renderTeamUrl } = useNavigation();

  const { post, useMutation } = useApi();
  const { mutate: create, isPending: isCreating } = useMutation({
    mutationFn: (data: any) => post(`/reports`, data),
  });
  const { mutate: update, isPending: isUpdating } = useMutation({
    mutationFn: (data: any) => post(`/reports/${data.id}`, data),
  });

  const { name, description, parameters } = report || {};
  const { websiteId, dateRange } = parameters || {};
  const defaultName = formatMessage(labels.untitled);

  const handleSave = async () => {
    if (!report.id) {
      create(report, {
        onSuccess: async ({ id }) => {
          toast(formatMessage(messages.saved));
          router.push(renderTeamUrl(`/reports/${id}`));
        },
      });
    } else {
      update(report, {
        onSuccess: async () => {
          toast(formatMessage(messages.saved));
        },
      });
    }
  };

  const handleNameChange = (name: string) => {
    updateReport({ name: name || defaultName });
  };

  const handleDescriptionChange = (description: string) => {
    updateReport({ description });
  };

  if (!report) {
    return null;
  }

  return (
    <Column marginY="6" gap="3" gridColumn="1 / 3">
      <Row gap="3" alignItems="center">
        <Icon size="sm">{icon}</Icon>
        <Text transform="uppercase" weight="bold">
          {formatMessage(
            labels[Object.keys(REPORT_TYPES).find(key => REPORT_TYPES[key] === report?.type)],
          )}
        </Text>
      </Row>
      <Row justifyContent="space-between" alignItems="center">
        <Row gap="6">
          <Column gap="3">
            <Row gap="3" alignItems="center">
              <InlineEditField key={name} name="name" value={name} onCommit={handleNameChange}>
                <Heading>{name}</Heading>
              </InlineEditField>
            </Row>
            <InlineEditField
              key={description}
              name="description"
              value={description}
              onCommit={handleDescriptionChange}
            >
              <Text>{description || `+ ${formatMessage(labels.addDescription)}`}</Text>
            </InlineEditField>
          </Column>
        </Row>
        <LoadingButton
          variant="primary"
          isLoading={isCreating || isUpdating}
          isDisabled={!websiteId || !dateRange?.value || !name}
          onPress={handleSave}
        >
          {formatMessage(labels.save)}
        </LoadingButton>
      </Row>
    </Column>
  );
}
