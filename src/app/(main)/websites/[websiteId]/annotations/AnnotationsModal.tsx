import {
  Button,
  Column,
  DataColumn,
  DataTable,
  DialogFooter,
  Heading,
  Loading,
  Row,
  Tabs,
  TabsList,
  TabsTrigger,
  Text,
} from '@umami/react-zen';
import { useState } from 'react';
import { formatAnnotationDate } from '@/components/charts/ChartAnnotationMarkers';
import { Empty } from '@/components/common/Empty';
import { IconLabel } from '@/components/common/IconLabel';
import { Pager } from '@/components/common/Pager';
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
  const { fromUtc } = useTimezone();
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

  const toLocalDate = (annotation: Annotation) => fromUtc(new Date(annotation.date));

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
    <Column gap flexGrow={1}>
      <Row alignItems="center" justifyContent="space-between">
        <Heading size="xl">{t(labels.notes)}</Heading>
        {!share && (
          <Button onClick={() => setView({ mode: 'add' })}>
            <Plus />
            {t(labels.addNote)}
          </Button>
        )}
      </Row>
      <Tabs value={filter} onValueChange={value => handleFilterChange(value as string)}>
        <TabsList>
          <TabsTrigger value={RANGE_FILTER}>
            {`${t(labels.current)} ${t(labels.dateRange)}`}
          </TabsTrigger>
          <TabsTrigger value={ALL_FILTER}>{`${t(labels.all)} ${t(labels.notes)}`}</TabsTrigger>
        </TabsList>
      </Tabs>
      {rows.length === 0 ? (
        <Empty />
      ) : (
        <DataTable data={rows} displayMode={isMobile ? 'cards' : 'table'}>
          <DataColumn id="date" label={t(labels.date)} width="200px">
            {(row: Annotation) => (
              <Button variant="secondary" onClick={() => handleSelect(row)}>
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
                    variant="ghost"
                    onClick={() => setView({ mode: 'edit', annotation: row })}
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
        <DialogFooter style={{ marginTop: 'auto' }}>
          <Button variant="secondary" onClick={onClose}>
            {t(labels.close)}
          </Button>
        </DialogFooter>
      )}
    </Column>
  );
}
