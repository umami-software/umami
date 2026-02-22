import {
  Button,
  Dialog,
  DialogTrigger,
  Icon,
  Modal,
  Row,
  Text,
  Tooltip,
  TooltipTrigger,
} from '@umami/react-zen';
import { SegmentEditForm } from '@/app/(main)/websites/[websiteId]/segments/SegmentEditForm';
import {
  useFilters,
  useFormat,
  useMessages,
  useNavigation,
  useWebsiteSegmentQuery,
} from '@/components/hooks';
import { Bookmark, X } from '@/components/icons';
import { isSearchOperator } from '@/lib/params';

export function FilterBar({ websiteId }: { websiteId: string }) {
  const { t, labels } = useMessages();
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
    <Row
      gap
      alignItems="center"
      justifyContent="space-between"
      padding="2"
      backgroundColor="surface-sunken"
    >
      <Row alignItems="center" gap="2" wrap="wrap">
        {segment && !isLoading && (
          <FilterItem
            name="segment"
            label={t(labels.segment)}
            value={data?.name || segment}
            operator={operatorLabels.eq}
            onRemove={() => handleSegmentRemove('segment')}
          />
        )}
        {cohort && !isLoading && (
          <FilterItem
            name="cohort"
            label={t(labels.cohort)}
            value={data?.name || cohort}
            operator={operatorLabels.eq}
            onRemove={() => handleSegmentRemove('cohort')}
          />
        )}
        {filters.map(filter => {
          const { name, type, label, operator, value } = filter;
          const paramValue = isSearchOperator(operator)
            ? value
            : String(value)
                .split(',')
                .map(v => formatValue(v, type || name))
                .join(', ');

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
                <Text>{t(labels.saveSegment)}</Text>
              </Tooltip>
            </TooltipTrigger>
          )}
          <Modal>
            <Dialog title={t(labels.segment)} style={{ width: 800, minHeight: 300 }}>
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
            <Text>{t(labels.clearAll)}</Text>
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
          <Text color="primary" weight="bold">
            {label}
          </Text>
          <Text color="muted">{operator}</Text>
          <Text color="primary" weight="bold">
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
