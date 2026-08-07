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
  useMobile,
  useNavigation,
  useWebsiteSegmentQuery,
} from '@/components/hooks';
import { Bookmark, X } from '@/components/icons';
import {
  isSearchOperator,
  serializeSessionPropertyFilters,
  serializeUniversalEventPropertyFilters,
} from '@/lib/params';

export function FilterBar({ websiteId }: { websiteId?: string }) {
  const { t, labels } = useMessages();
  const { isMobile } = useMobile();
  const { formatValue } = useFormat();
  const { router, pathname, updateParams, replaceParams, query } = useNavigation();
  const { segment, cohort } = query;
  const { filters, eventPropertyFilters, sessionPropertyFilters, operatorLabels } = useFilters();
  const { data, isLoading } = useWebsiteSegmentQuery(websiteId, segment || cohort);
  const canSaveSegment =
    !!websiteId &&
    filters.length > 0 &&
    eventPropertyFilters.length === 0 &&
    sessionPropertyFilters.length === 0 &&
    !segment &&
    !cohort &&
    !pathname.includes('/share');

  const handleCloseFilter = (param: string) => {
    router.push(updateParams({ [param]: undefined }));
  };

  const handleResetFilter = () => {
    router.push(replaceParams());
  };

  const handleSessionPropertyFilterRemove = (index: number) => {
    const clearedSessionPropertyFilters = Object.fromEntries(
      Object.keys(query)
        .filter(key => /^spf\d+$/.test(key))
        .map(key => [key, undefined]),
    );
    const nextSessionPropertyFilters = sessionPropertyFilters.filter((_, i) => i !== index);

    router.push(
      updateParams({
        ...clearedSessionPropertyFilters,
        ...serializeSessionPropertyFilters(nextSessionPropertyFilters),
      }),
    );
  };

  const handleEventPropertyFilterRemove = (index: number) => {
    const clearedEventPropertyFilters = Object.fromEntries(
      Object.keys(query)
        .filter(key => /^epf\d+$/.test(key))
        .map(key => [key, undefined]),
    );
    const nextEventPropertyFilters = eventPropertyFilters.filter((_, i) => i !== index);

    router.push(
      updateParams({
        ...clearedEventPropertyFilters,
        ...serializeUniversalEventPropertyFilters(nextEventPropertyFilters),
      }),
    );
  };

  const handleSegmentRemove = (type: string) => {
    router.push(updateParams({ [type]: undefined }));
  };

  if (
    !filters.length &&
    !eventPropertyFilters.length &&
    !sessionPropertyFilters.length &&
    !segment &&
    !cohort
  ) {
    return null;
  }

  return (
    <Row
      gap
      alignItems="center"
      justifyContent="space-between"
      padding="2"
      backgroundColor="surface-sunken"
      wrap="wrap"
    >
      <Row alignItems="center" gap="2" wrap="wrap" width={{ base: '100%', md: 'auto' }}>
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
        {eventPropertyFilters.map((filter, index) => (
          <FilterItem
            key={`epf${index}`}
            name={`epf${index}`}
            label={`${t(labels.eventProperties)}: ${filter.propertyName}`}
            operator={operatorLabels[filter.operator]}
            value={filter.value}
            onRemove={() => handleEventPropertyFilterRemove(index)}
          />
        ))}
        {sessionPropertyFilters.map((filter, index) => (
          <FilterItem
            key={`spf${index}`}
            name={`spf${index}`}
            label={`${t(labels.sessionData)}: ${filter.propertyName}`}
            operator={operatorLabels[filter.operator]}
            value={filter.value}
            onRemove={() => handleSessionPropertyFilterRemove(index)}
          />
        ))}
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
          <Modal placement={isMobile ? 'fullscreen' : 'center'}>
            <Dialog
              title={t(labels.segment)}
              style={{
                width: isMobile ? '100%' : '800px',
                height: isMobile ? '100%' : undefined,
                minHeight: 300,
                maxHeight: isMobile ? '100%' : 'calc(100dvh - 40px)',
                overflowY: 'auto',
                padding: '32px',
              }}
            >
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
        <Row
          alignItems="center"
          gap="2"
          style={{ maxWidth: 'min(500px, calc(100vw - 10rem))', minWidth: 0, overflow: 'hidden' }}
        >
          <Text color="primary" weight="bold">
            {label}
          </Text>
          <Text color="muted">{operator}</Text>
          <Text
            color="primary"
            weight="bold"
            style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
          >
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
