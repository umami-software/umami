import { useQueryClient } from '@tanstack/react-query';
import {
  Button,
  Column,
  Form,
  FormField,
  FormSubmitButton,
  ListItem,
  Row,
  Select,
  Text,
  TextField,
} from '@umami/react-zen';
import { useState } from 'react';
import {
  useApi,
  useDateParameters,
  useDateRange,
  useFilterParameters,
  useMessages,
  useNavigation,
  useTimezone,
} from '@/components/hooks';
import { BoardSelect } from '@/components/input/BoardSelect';
import { DialogButton } from '@/components/input/DialogButton';
import { getBoardEntity, isOpenBoardType } from '@/lib/boards';
import {
  COMMERCE_COLUMNS,
  commerceReportParametersSchema,
  type SavedCommerceReport,
} from '@/lib/commerce-saved-reports';
import { CommerceSettingsForm } from './CommerceSettingsForm';

export function CommerceReportsToolbar({
  websiteId,
  currency,
}: {
  websiteId: string;
  currency: string;
}) {
  const { t } = useMessages();
  const { get, post, del, useQuery } = useApi();
  const client = useQueryClient();
  const { query, pathname, router, updateParams, replaceParams, teamId } = useNavigation();
  const dates = useDateParameters();
  const { dateRange } = useDateRange();
  const { fromUtc } = useTimezone();
  const settings = useQuery<{ windowHours: number }>({
    queryKey: ['commerce-settings', websiteId],
    queryFn: () => get(`/websites/${websiteId}/commerce/settings`),
  });
  const filters = useFilterParameters({ includePagination: false });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [boardId, setBoardId] = useState('');
  const { data } = useQuery<{ data: SavedCommerceReport[] }>({
    queryKey: ['commerce-saved-list', websiteId],
    queryFn: () => get(`/websites/${websiteId}/commerce/reports`, { pageSize: 1000 }),
  });
  const reports = data?.data || [];
  const selected = reports.find(report => report.id === (query.savedReport || query.editReport));
  const readonly = pathname.includes('/share/');
  const canSave = !readonly && !query.savedReport && ['products', 'checkout'].includes(query.tab);
  const run = async (task: () => Promise<void>) => {
    setError('');
    setBusy(true);
    try {
      await task();
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setBusy(false);
    }
  };
  const refresh = () =>
    client.invalidateQueries({
      predicate: query =>
        String(query.queryKey[0]).includes('commerce') ||
        query.queryKey[0] === 'board-component-report-options',
    });
  const saveForm = (saveAs: boolean, close: () => void) => (
    <Form
      error={error}
      defaultValues={{
        name: selected?.name || '',
        mode: /^\d+day$/.test(dateRange.value || '') ? 'rolling' : 'fixed',
        days: parseInt(dateRange.value, 10) || 30,
      }}
      onSubmit={values =>
        run(async () => {
          const parameters = commerceReportParametersSchema.parse({
            version: 1,
            type: query.tab,
            currency,
            market: query.market || undefined,
            category: query.category || undefined,
            productId: query.product || undefined,
            groupBy: query.group || 'product',
            sort: query.sort || 'revenue',
            minViews: Number(query.minViews) || 0,
            maxCartRate: query.maxCartRate === undefined ? 1 : Number(query.maxCartRate),
            windowHours: Number(query.windowHours) || settings.data?.windowHours || 24,
            columns: query.columns?.split(',') || [...COMMERCE_COLUMNS],
            search: query.search || '',
            filters: Object.fromEntries(
              Object.entries(filters)
                .filter(([key, value]) => key !== 'search' && value != null)
                .map(([key, value]) => [key, String(value)]),
            ),
            timezone: dates.timezone,
            date:
              values.mode === 'rolling'
                ? { mode: 'rolling', days: Number(values.days) }
                : { mode: 'fixed', startAt: dates.startAt, endAt: dates.endAt },
          });
          const report = await post(
            `/websites/${websiteId}/commerce/reports${!saveAs && selected ? `/${selected.id}` : ''}`,
            { name: values.name, description: selected?.description || '', parameters },
          );
          await refresh();
          close();
          router.replace(
            updateParams({ savedReport: report.id, editReport: undefined, page: undefined }),
          );
        })
      }
    >
      <FormField name="name" label={t('label.name')} rules={{ required: true }}>
        <TextField autoFocus maxLength={200} />
      </FormField>
      <FormField name="mode" label={t('commerce.datePolicy')}>
        <Select>
          <ListItem id="rolling">{t('commerce.rollingDates')}</ListItem>
          <ListItem id="fixed">{t('commerce.fixedDates')}</ListItem>
        </Select>
      </FormField>
      <FormField name="days" label={t('commerce.days')}>
        <TextField type="number" min={1} max={730} />
      </FormField>
      <FormSubmitButton isDisabled={busy}>{t('label.save')}</FormSubmitButton>
    </Form>
  );
  return (
    <Column gap>
      <Row gap wrap="wrap">
        <Select
          label={t('commerce.savedReports')}
          value={query.savedReport || 'current'}
          onChange={value =>
            router.replace(
              updateParams({
                savedReport: value === 'current' ? undefined : String(value),
                editReport: undefined,
                page: undefined,
              }),
            )
          }
        >
          <ListItem id="current">{t('commerce.currentView')}</ListItem>
          {reports.map(report => (
            <ListItem key={report.id} id={report.id}>
              {report.name}
            </ListItem>
          ))}
        </Select>
        {canSave && (
          <DialogButton label={t('label.save')} width="480px">
            {({ close }) => saveForm(false, close)}
          </DialogButton>
        )}
        {canSave && selected && (
          <DialogButton label={t('commerce.saveAs')} width="480px">
            {({ close }) => saveForm(true, close)}
          </DialogButton>
        )}
        {!readonly && query.savedReport && selected && (
          <Button
            onPress={() => {
              const p = selected.parameters;
              router.replace(
                replaceParams({
                  ...p.filters,
                  tab: p.type,
                  currency: p.currency,
                  market: p.market,
                  category: p.category,
                  group: p.groupBy,
                  sort: p.sort,
                  minViews: p.minViews,
                  maxCartRate: p.maxCartRate,
                  windowHours: p.windowHours,
                  columns: p.columns.join(','),
                  search: p.search,
                  editReport: selected.id,
                  date:
                    p.date.mode === 'rolling'
                      ? `${p.date.days}day`
                      : `range:${+fromUtc(p.date.startAt)}:${+fromUtc(p.date.endAt)}`,
                }),
              );
            }}
          >
            {t('commerce.editView')}
          </Button>
        )}
        {!readonly && query.savedReport && selected && (
          <DialogButton label={t('commerce.addToBoard')} width="480px">
            {({ close }) => (
              <Column gap>
                <BoardSelect
                  boardId={boardId}
                  teamId={teamId}
                  onChange={value => setBoardId(String(value))}
                />
                {error && <Text>{error}</Text>}
                <Button
                  isDisabled={!boardId || busy}
                  onPress={() =>
                    run(async () => {
                      const board = await get(`/boards/${boardId}`);
                      const entity = getBoardEntity(board);
                      if (
                        !isOpenBoardType(board.type) &&
                        (entity.entityType !== 'website' || entity.entityId !== websiteId)
                      )
                        throw new Error(t('commerce.boardWebsiteMismatch'));
                      const parameters = {
                        ...board.parameters,
                        rows: [
                          ...(board.parameters.rows || []),
                          {
                            id: crypto.randomUUID(),
                            columns: [
                              {
                                id: crypto.randomUUID(),
                                size: 1,
                                component: {
                                  type: 'CommerceReport',
                                  entityType: 'website',
                                  entityId: websiteId,
                                  title: selected.name,
                                  props: { reportId: selected.id, dateMode: 'saved' },
                                },
                              },
                            ],
                          },
                        ],
                      };
                      await post(`/boards/${boardId}`, { parameters });
                      await client.invalidateQueries({
                        predicate: query => String(query.queryKey[0]).includes('board'),
                      });
                      close();
                    })
                  }
                >
                  {t('commerce.addToBoard')}
                </Button>
              </Column>
            )}
          </DialogButton>
        )}
        {!readonly && query.savedReport && selected && (
          <DialogButton label={t('label.delete')} width="400px">
            {({ close }) => (
              <Column gap>
                <Text>{t('commerce.deleteReportPrompt')}</Text>
                <Button
                  isDisabled={busy}
                  onPress={() =>
                    run(async () => {
                      await del(`/websites/${websiteId}/commerce/reports/${selected.id}`);
                      await refresh();
                      close();
                      router.replace(updateParams({ savedReport: undefined }));
                    })
                  }
                >
                  {t('label.delete')}
                </Button>
                {error && <Text>{error}</Text>}
              </Column>
            )}
          </DialogButton>
        )}
        {!readonly && (
          <DialogButton label={t('commerce.setup')} width="600px">
            {({ close }) => <CommerceSettingsForm websiteId={websiteId} onClose={close} />}
          </DialogButton>
        )}
      </Row>
      {error && <Text>{error}</Text>}
    </Column>
  );
}
