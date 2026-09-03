import {
  Button,
  Column,
  DataColumn,
  DataTable,
  Heading,
  Loading,
  Row,
  Text,
} from '@umami/react-zen';
import { useState } from 'react';
import { formatAnnotationDate } from '@/components/charts/ChartAnnotationMarkers';
import { Empty } from '@/components/common/Empty';
import { IconLabel } from '@/components/common/IconLabel';
import { Pager } from '@/components/common/Pager';
import { FilterButtons } from '@/components/input/FilterButtons';
import {
  useLocale,
  useMessages,
  useMobile,
  useNavigation,
  useShare,
  useTimezone,
  useWebsiteAnnotationsQuery,
} from '@/components/hooks';
import { Edit, Plus } from '@/components/icons';
import { type AnnotationRange, getAnnotationDateRangeValue } from '@/lib/annotations';
import { AnnotationDeleteButton } from './AnnotationDeleteButton';
import { type Annotation, AnnotationEditForm } from './AnnotationEditForm';

const PAGE_SIZE = 20;

const RANGE_FILTER = 'range';
const ALL_FILTER = 'all';

type View = { mode: 'list' } | { mode: 'add' } | { mode: 'edit'; annotation: Annotation };

export function AnnotationsModal({
  websiteId,
  range,
  onClose,
}: {
  websiteId: string;
  range: AnnotationRange;
  onClose?: () => void;
}) {
  const { t, labels } = useMessages();
  const { locale } = useLocale();
  const { localFromUtc } = useTimezone();
  const { isMobile } = useMobile();
  const share = useShare();
  const { router, updateParams } = useNavigation();
  const [view, setView] = useState<View>({ mode: 'list' });
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState(RANGE_FILTER);
  const { data, isLoading } = useWebsiteAnnotationsQuery(websiteId, {
    page,
    pageSize: PAGE_SIZE,
    ...(filter === RANGE_FILTER && range),
  });

  const showList = () => setView({ mode: 'list' });

  const toLocalDate = (annotation: Annotation) => localFromUtc(new Date(annotation.date));

  const handleFilterChange = (value: string) => {
    setFilter(value);
    setPage(1);
  };

  const handleSelect = (annotation: Annotation) => {
    router.push(
      updateParams({
        date: getAnnotationDateRangeValue(toLocalDate(annotation), annotation.allDay),
        offset: undefined,
      }),
    );
    onClose?.();
  };

  if (view.mode !== 'list') {
    return (
      <Column gap>
        <Heading size="xl">{t(labels.notes)}</Heading>
        <AnnotationEditForm
          websiteId={websiteId}
          annotation={view.mode === 'edit' ? view.annotation : undefined}
          onSave={showList}
          onClose={showList}
        />
      </Column>
    );
  }

  if (isLoading && !data) {
    return <Loading placement="absolute" />;
  }

  const rows: Annotation[] = data?.data || [];

  return (
    <Column gap>
      <Row alignItems="center" justifyContent="space-between">
        <Heading size="xl">{t(labels.notes)}</Heading>
        {!share && (
          <Button variant="primary" onPress={() => setView({ mode: 'add' })}>
            <Plus />
            {t(labels.addNote)}
          </Button>
        )}
      </Row>
      <FilterButtons
        value={filter}
        onChange={handleFilterChange}
        items={[
          { id: RANGE_FILTER, label: `${t(labels.current)} ${t(labels.dateRange)}` },
          { id: ALL_FILTER, label: `${t(labels.all)} ${t(labels.notes)}` },
        ]}
      />
      {rows.length === 0 ? (
        <Empty />
      ) : (
        <DataTable data={rows} displayMode={isMobile ? 'cards' : 'table'}>
          <DataColumn id="date" label={t(labels.date)} width="200px">
            {(row: Annotation) => (
              <Button onPress={() => handleSelect(row)}>
                {formatAnnotationDate(
                  { id: row.id, date: toLocalDate(row), label: row.note, allDay: row.allDay },
                  locale,
                )}
              </Button>
            )}
          </DataColumn>
          <DataColumn id="note" label={t(labels.note)}>
            {(row: Annotation) => <Text style={{ whiteSpace: 'pre-wrap' }}>{row.note}</Text>}
          </DataColumn>
          {!share && (
            <DataColumn id="action" align="end" width="100px">
              {(row: Annotation) => (
                <Row>
                  <Button
                    variant="quiet"
                    onPress={() => setView({ mode: 'edit', annotation: row })}
                  >
                    <IconLabel icon={<Edit />} />
                  </Button>
                  <AnnotationDeleteButton annotationId={row.id} websiteId={websiteId} />
                </Row>
              )}
            </DataColumn>
          )}
        </DataTable>
      )}
      {data?.count > PAGE_SIZE && (
        <Pager page={page} pageSize={PAGE_SIZE} count={data.count} onPageChange={setPage} />
      )}
      {onClose && (
        <Row justifyContent="flex-end">
          <Button onPress={onClose}>{t(labels.close)}</Button>
        </Row>
      )}
    </Column>
  );
}
