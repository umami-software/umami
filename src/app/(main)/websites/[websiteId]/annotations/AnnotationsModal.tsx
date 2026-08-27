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
import {
  useLocale,
  useMessages,
  useNavigation,
  useTimezone,
  useWebsiteAnnotationsQuery,
} from '@/components/hooks';
import { Edit, Plus } from '@/components/icons';
import { getAnnotationDateRangeValue } from '@/lib/annotations';
import { AnnotationDeleteButton } from './AnnotationDeleteButton';
import { type Annotation, AnnotationEditForm } from './AnnotationEditForm';

const PAGE_SIZE = 20;

type View = { mode: 'list' } | { mode: 'add' } | { mode: 'edit'; annotation: Annotation };

export function AnnotationsModal({
  websiteId,
  onClose,
}: {
  websiteId: string;
  onClose?: () => void;
}) {
  const { t, labels } = useMessages();
  const { locale } = useLocale();
  const { localFromUtc } = useTimezone();
  const { router, updateParams } = useNavigation();
  const [view, setView] = useState<View>({ mode: 'list' });
  const [page, setPage] = useState(1);
  const { data, isLoading } = useWebsiteAnnotationsQuery(websiteId, {
    page,
    pageSize: PAGE_SIZE,
  });

  const showList = () => setView({ mode: 'list' });

  const toLocalDate = (annotation: Annotation) => localFromUtc(new Date(annotation.date));

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
        <Button variant="primary" onPress={() => setView({ mode: 'add' })}>
          <Plus />
          {t(labels.addNote)}
        </Button>
      </Row>
      {rows.length === 0 ? (
        <Empty />
      ) : (
        <DataTable data={rows}>
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
          <DataColumn id="action" align="end" width="100px">
            {(row: Annotation) => (
              <Row>
                <Button variant="quiet" onPress={() => setView({ mode: 'edit', annotation: row })}>
                  <IconLabel icon={<Edit />} />
                </Button>
                <AnnotationDeleteButton
                  annotationId={row.id}
                  websiteId={websiteId}
                  name={row.note}
                />
              </Row>
            )}
          </DataColumn>
        </DataTable>
      )}
      {data?.count > PAGE_SIZE && (
        <Pager page={page} pageSize={PAGE_SIZE} count={data.count} onPageChange={setPage} />
      )}
    </Column>
  );
}
