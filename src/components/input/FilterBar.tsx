import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Icon,
  Row,
  Text,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@umami/react-zen';
import { useState } from 'react';
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
  const [showSaveSegment, setShowSaveSegment] = useState(false);
  const canSaveSegment =
    !!websiteId &&
    (filters.length > 0 || sessionPropertyFilters.length > 0) &&
    eventPropertyFilters.length === 0 &&
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
    <Row gap alignItems="center" justifyContent="space-between" wrap="wrap">
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
        {canSaveSegment && (
          <Tooltip>
            <TooltipTrigger
              delay={0}
              render={
                <Button
                  variant="ghost"
                  className="hover:bg-transparent"
                  aria-label={t(labels.saveSegment)}
                  onClick={() => setShowSaveSegment(true)}
                />
              }
            >
              <Icon>
                <Bookmark />
              </Icon>
            </TooltipTrigger>
            <TooltipContent>
              <Text>{t(labels.saveSegment)}</Text>
            </TooltipContent>
          </Tooltip>
        )}
        <Dialog open={showSaveSegment} onOpenChange={setShowSaveSegment}>
          <DialogContent
            showCloseButton={false}
            style={{
              width: isMobile ? '100%' : '800px',
              height: isMobile ? '100%' : undefined,
              minHeight: 300,
              maxWidth: isMobile ? '100%' : 'calc(100% - 2rem)',
              maxHeight: isMobile ? '100%' : 'calc(100dvh - 40px)',
              borderRadius: isMobile ? 0 : undefined,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            <DialogHeader>
              <DialogTitle>{t(labels.segment)}</DialogTitle>
            </DialogHeader>
            <SegmentEditForm
              websiteId={websiteId}
              onClose={() => setShowSaveSegment(false)}
              filters={filters}
              sessionPropertyFilters={sessionPropertyFilters}
            />
          </DialogContent>
        </Dialog>
        <Tooltip>
          <TooltipTrigger
            delay={0}
            render={
              <Button
                variant="ghost"
                className="hover:bg-transparent"
                onClick={handleResetFilter}
              />
            }
          >
            <Icon>
              <X />
            </Icon>
          </TooltipTrigger>
          <TooltipContent>
            <Text>{t(labels.clearAll)}</Text>
          </TooltipContent>
        </Tooltip>
      </Row>
    </Row>
  );
}

const FilterItem = ({ name, label, operator, value, onRemove }) => {
  return (
    <Row
      paddingX="2"
      paddingY="1"
      border
      borderRadius
      alignItems="center"
      justifyContent="space-between"
    >
      <Row alignItems="center" gap="4">
        <Row
          alignItems="center"
          gap="2"
          style={{ maxWidth: 'min(500px, calc(100vw - 10rem))', minWidth: 0, overflow: 'hidden' }}
        >
          <Text weight="medium">{label}</Text>
          <Text color="muted">{operator}</Text>
          <Text
            weight="medium"
            style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
          >
            {value}
          </Text>
        </Row>
        <Row
          color="muted"
          hover={{ color: 'foreground' }}
          onClick={() => onRemove(name)}
          style={{ cursor: 'pointer' }}
        >
          <Icon>
            <X />
          </Icon>
        </Row>
      </Row>
    </Row>
  );
};
