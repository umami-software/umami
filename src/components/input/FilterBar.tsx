import {
  Button,
  Icon,
  Text,
  Row,
  TooltipTrigger,
  Tooltip,
  Modal,
  Dialog,
  DialogTrigger,
} from '@umami/react-zen';
import {
  useNavigation,
  useMessages,
  useFormat,
  useFilters,
  useWebsiteSegmentQuery,
} from '@/components/hooks';
import { X, Bookmark } from '@/components/icons';
import { isSearchOperator } from '@/lib/params';
import { SegmentEditForm } from '@/app/(main)/websites/[websiteId]/segments/SegmentEditForm';

export function FilterBar({ websiteId }: { websiteId: string }) {
  const { formatMessage, labels } = useMessages();
  const { formatValue } = useFormat();
  const {
    router,
    pathname,
    updateParams,
    replaceParams,
    query: { segment, cohort },
  } = useNavigation();
  const { filters, operatorLabels } = useFilters();
  const { data, isLoading } = useWebsiteSegmentQuery(websiteId, segment || cohort);
  const canSaveSegment = filters.length > 0 && !segment && !cohort && !pathname.includes('/share');

  const handleCloseFilter = (param: string) => {
    router.push(updateParams({ [param]: undefined }));
  };

  const handleResetFilter = () => {
    router.push(replaceParams());
  };

  const handleSegmentRemove = (type: string) => {
    router.push(updateParams({ [type]: undefined }));
  };

  if (!filters.length && !segment && !cohort) {
    return null;
  }

  return (
    <Row gap alignItems="center" justifyContent="space-between" padding="2" backgroundColor="3">
      <Row alignItems="center" gap="2" wrap="wrap">
        {segment && !isLoading && (
          <FilterItem
            name="segment"
            label={formatMessage(labels.segment)}
            value={data?.name || segment}
            operator={operatorLabels.eq}
            onRemove={() => handleSegmentRemove('segment')}
          />
        )}
        {cohort && !isLoading && (
          <FilterItem
            name="cohort"
            label={formatMessage(labels.cohort)}
            value={data?.name || cohort}
            operator={operatorLabels.eq}
            onRemove={() => handleSegmentRemove('cohort')}
          />
        )}
        {filters.map(filter => {
          const { name, label, operator, value } = filter;
          const paramValue = isSearchOperator(operator) ? value : formatValue(value, name);

          return (
            <FilterItem
              key={name}
              name={name}
              label={label}
              operator={operatorLabels[operator]}
              value={paramValue}
              onRemove={(name: string) => handleCloseFilter(name)}
            />
          );
        })}
      </Row>
      <Row alignItems="center">
        <DialogTrigger>
          {canSaveSegment && (
            <TooltipTrigger delay={0}>
              <Button variant="zero">
                <Icon>
                  <Bookmark />
                </Icon>
              </Button>
              <Tooltip>
                <Text>{formatMessage(labels.saveSegment)}</Text>
              </Tooltip>
            </TooltipTrigger>
          )}
          <Modal>
            <Dialog title={formatMessage(labels.segment)} style={{ width: 800, minHeight: 300 }}>
              {({ close }) => {
                return <SegmentEditForm websiteId={websiteId} onClose={close} filters={filters} />;
              }}
            </Dialog>
          </Modal>
        </DialogTrigger>
        <TooltipTrigger delay={0}>
          <Button variant="zero" onPress={handleResetFilter}>
            <Icon>
              <X />
            </Icon>
          </Button>
          <Tooltip>
            <Text>{formatMessage(labels.clearAll)}</Text>
          </Tooltip>
        </TooltipTrigger>
      </Row>
    </Row>
  );
}

const FilterItem = ({ name, label, operator, value, onRemove }) => {
  return (
    <Row
      border
      padding="2"
      color
      backgroundColor
      borderRadius
      alignItems="center"
      justifyContent="space-between"
      theme="dark"
    >
      <Row alignItems="center" gap="4">
        <Row alignItems="center" gap="2">
          <Text color="12" weight="bold">
            {label}
          </Text>
          <Text color="11">{operator}</Text>
          <Text color="12" weight="bold">
            {value}
          </Text>
        </Row>
        <Icon onClick={() => onRemove(name)} size="xs" style={{ cursor: 'pointer' }}>
          <X />
        </Icon>
      </Row>
    </Row>
  );
};
