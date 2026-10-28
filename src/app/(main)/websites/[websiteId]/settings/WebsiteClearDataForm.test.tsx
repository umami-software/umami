import { useMutation, useQuery } from '@tanstack/react-query';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { render, screen, waitFor, within } from '@/test/render';
import { WebsiteClearDataForm } from './WebsiteClearDataForm';

const { getMock, postMock, dateRange } = vi.hoisted(() => ({
  getMock: vi.fn(),
  postMock: vi.fn(),
  dateRange: { startDate: null as Date | null, isLoading: false },
}));

vi.mock('@/components/hooks', async importOriginal => ({
  ...(await importOriginal<typeof import('@/components/hooks')>()),
  useApi: () => ({ get: getMock, post: postMock, useQuery, useMutation }),
  useDateRangeQuery: () => ({ ...dateRange, endDate: null }),
}));

const counts = (values: Partial<Record<string, number>>) => ({
  events: 0,
  eventData: 0,
  sessions: 0,
  revenue: 0,
  replays: 0,
  heatmaps: 0,
  ...values,
});

function deferred<T>() {
  let resolve: (value: T) => void = () => {};
  const promise = new Promise<T>(r => {
    resolve = r;
  });
  return { promise, resolve };
}

const at = (year: number, month: number, day: number) => new Date(year, month, day).getTime();
const twoMonths = { from: new Date(2026, 8, 15), to: new Date(2026, 9, 3) };
const twoMonthsRange = { startAt: at(2026, 8, 15), endAt: at(2026, 9, 4) };

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date(2026, 9, 23, 15, 30));
  getMock.mockReset();
  postMock.mockReset();
  dateRange.startDate = new Date(2025, 10, 12, 8);
  dateRange.isLoading = false;
});

afterEach(() => {
  vi.useRealTimers();
});

const renderPeriod = (props: Partial<Parameters<typeof WebsiteClearDataForm>[0]> = {}) =>
  render(
    <WebsiteClearDataForm
      websiteId="website-1"
      defaultMode="period"
      defaultRange={twoMonths}
      {...props}
    />,
  );

async function confirmDelete(user: ReturnType<typeof render>['user']) {
  await user.click(screen.getByRole('button', { name: 'Continue' }));
  await user.type(await screen.findByLabelText('Confirm'), 'DELETE');
  await user.click(screen.getByRole('button', { name: 'Delete' }));
}

describe('WebsiteClearDataForm', () => {
  test('defaults to deleting data older than 6 months', async () => {
    getMock.mockResolvedValue(counts({ events: 3 }));
    const { user } = render(<WebsiteClearDataForm websiteId="website-1" />);

    expect(screen.getByRole('tab', { name: 'Older than', selected: true })).toBeInTheDocument();
    expect(screen.getByLabelText('Amount')).toHaveValue(6);
    expect(screen.getByRole('combobox', { name: 'Unit' })).toHaveTextContent('Months');
    expect(
      screen.getByText('Data recorded before Apr 23, 2026 will be deleted.'),
    ).toBeInTheDocument();
    expect(screen.queryByText('From')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Continue' }));

    expect(
      await screen.findByText('Data recorded before Apr 23, 2026 will be permanently deleted:'),
    ).toBeInTheDocument();
    expect(getMock).toHaveBeenCalledWith('/websites/website-1/clear', {
      startAt: at(2025, 10, 1),
      endAt: at(2026, 3, 23),
    });
  });

  test('updates the cutoff and the preview range when the amount changes', async () => {
    getMock.mockResolvedValue(counts({ events: 3 }));
    const { user } = render(<WebsiteClearDataForm websiteId="website-1" />);

    await user.clear(screen.getByLabelText('Amount'));
    await user.type(screen.getByLabelText('Amount'), '3');

    expect(
      screen.getByText('Data recorded before Jul 23, 2026 will be deleted.'),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Continue' }));

    expect(getMock).toHaveBeenCalledWith('/websites/website-1/clear', {
      startAt: at(2025, 10, 1),
      endAt: at(2026, 6, 23),
    });
  });

  test('updates the cutoff and the preview range when the unit changes', async () => {
    getMock.mockResolvedValue(counts({ events: 3 }));
    const { user } = render(<WebsiteClearDataForm websiteId="website-1" />);

    await user.click(screen.getByRole('combobox', { name: 'Unit' }));
    await user.click(await screen.findByRole('option', { name: 'Weeks' }));

    expect(
      screen.getByText('Data recorded before Sep 11, 2026 will be deleted.'),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Continue' }));

    expect(getMock).toHaveBeenCalledWith('/websites/website-1/clear', {
      startAt: at(2025, 10, 1),
      endAt: at(2026, 8, 11),
    });
  });

  test('blocks continuing with an invalid amount', async () => {
    const { user } = render(<WebsiteClearDataForm websiteId="website-1" />);

    await user.clear(screen.getByLabelText('Amount'));
    await user.type(screen.getByLabelText('Amount'), '0');

    expect(screen.getByText('Enter a whole number of 1 or more.')).toBeInTheDocument();
    expect(screen.queryByText(/will be deleted\./)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled();
  });

  test('waits for the first data date before continuing', () => {
    dateRange.isLoading = true;
    render(<WebsiteClearDataForm websiteId="website-1" />);

    expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled();
  });

  test('shows the empty message without a preview when no data is older than the cutoff', async () => {
    dateRange.startDate = new Date(2026, 6, 1);
    const { user } = render(<WebsiteClearDataForm websiteId="website-1" />);

    await user.click(screen.getByRole('button', { name: 'Continue' }));

    expect(screen.getByText('No data older than Apr 23, 2026.')).toBeInTheDocument();
    expect(screen.queryByLabelText('Confirm')).not.toBeInTheDocument();
    expect(getMock).not.toHaveBeenCalled();
  });

  test('previews a period with From and To fields', async () => {
    getMock.mockResolvedValue(counts({ events: 1 }));
    const { user } = render(
      <WebsiteClearDataForm websiteId="website-1" defaultRange={twoMonths} />,
    );

    await user.click(screen.getByRole('tab', { name: 'Period' }));

    expect(screen.getByText('From')).toBeInTheDocument();
    expect(screen.getByText('To')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Continue' }));

    expect(
      await screen.findByText(
        'The following data recorded between Sep 15, 2026 and Oct 3, 2026 will be permanently deleted:',
      ),
    ).toBeInTheDocument();
    expect(getMock).toHaveBeenCalledWith('/websites/website-1/clear', twoMonthsRange);
  });

  test('lists non-zero counts and requires typing DELETE', async () => {
    getMock.mockResolvedValue(counts({ events: 1234, sessions: 56 }));
    const { user } = renderPeriod();

    await user.click(screen.getByRole('button', { name: 'Continue' }));

    const events = await screen.findByTestId('clear-data-count-events');
    expect(within(events).getByText('Events')).toBeInTheDocument();
    expect(within(events).getByText('1,234')).toBeInTheDocument();
    expect(within(screen.getByTestId('clear-data-count-sessions')).getByText('56')).toBeVisible();
    expect(screen.queryByTestId('clear-data-count-eventData')).not.toBeInTheDocument();
    expect(screen.getByText('This cannot be undone.')).toBeInTheDocument();

    const deleteButton = screen.getByRole('button', { name: 'Delete' });
    expect(deleteButton).toBeDisabled();

    await user.type(screen.getByLabelText('Confirm'), 'DELET');
    expect(deleteButton).toBeDisabled();
    await user.click(deleteButton);
    expect(postMock).not.toHaveBeenCalled();

    await user.type(screen.getByLabelText('Confirm'), 'E');
    expect(deleteButton).toBeEnabled();
  });

  test('offers to delete a period that only holds heatmap events', async () => {
    getMock.mockResolvedValue(counts({ heatmaps: 12 }));
    const { user } = renderPeriod();

    await user.click(screen.getByRole('button', { name: 'Continue' }));

    const heatmaps = await screen.findByTestId('clear-data-count-heatmaps');
    expect(within(heatmaps).getByText('12')).toBeInTheDocument();
    expect(screen.getByLabelText('Confirm')).toBeInTheDocument();
  });

  test('goes back to the range step', async () => {
    getMock.mockResolvedValue(counts({ events: 1 }));
    const { user } = renderPeriod();

    await user.click(screen.getByRole('button', { name: 'Continue' }));
    await screen.findByLabelText('Confirm');
    await user.click(screen.getByRole('button', { name: 'Back' }));

    expect(screen.getByRole('tab', { name: 'Period', selected: true })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Continue' })).toBeInTheDocument();
  });

  test('shows a message and no confirmation when the period is empty', async () => {
    getMock.mockResolvedValue(counts({}));
    const { user } = renderPeriod();

    await user.click(screen.getByRole('button', { name: 'Continue' }));

    expect(await screen.findByText('No data found in this date range.')).toBeInTheDocument();
    expect(screen.queryByLabelText('Confirm')).not.toBeInTheDocument();
  });

  test('shows the preview error', async () => {
    getMock.mockRejectedValue(new Error('Preview failed'));
    const { user } = renderPeriod();

    await user.click(screen.getByRole('button', { name: 'Continue' }));

    expect(await screen.findByText('Preview failed')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Back' })).toBeInTheDocument();
  });

  test('deletes month by month with progress and reports the counts actually deleted', async () => {
    getMock.mockResolvedValue(counts({ events: 9999, sessions: 999 }));
    const september = deferred<ReturnType<typeof counts>>();
    const october = deferred<ReturnType<typeof counts>>();
    postMock.mockReturnValueOnce(september.promise).mockReturnValueOnce(october.promise);
    const onBusyChange = vi.fn();
    const onSave = vi.fn();
    const onClose = vi.fn();
    const { user } = renderPeriod({ onBusyChange, onSave, onClose });

    await confirmDelete(user);

    expect(await screen.findByText('Deleting September 2026 (1 of 2)')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    expect(screen.getByTestId('clear-data-animation-deleting')).toBeInTheDocument();
    expect(onBusyChange).toHaveBeenLastCalledWith(true);

    september.resolve(counts({ events: 10, sessions: 2 }));
    expect(await screen.findByText('Deleting October 2026 (2 of 2)')).toBeInTheDocument();
    expect(screen.getByText('Deleted so far: 10 events, 2 sessions.')).toBeInTheDocument();

    october.resolve(counts({ events: 5, sessions: 1 }));
    expect(await screen.findByText('Data deleted: 15 events, 3 sessions.')).toBeInTheDocument();
    expect(screen.getByTestId('clear-data-animation-done')).toBeInTheDocument();
    await waitFor(() => expect(onBusyChange).toHaveBeenLastCalledWith(false));

    await user.click(screen.getByRole('button', { name: 'Close' }));
    expect(onSave).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });

  test('stops after the current month', async () => {
    getMock.mockResolvedValue(counts({ events: 2 }));
    const september = deferred<ReturnType<typeof counts>>();
    postMock.mockReturnValueOnce(september.promise);
    const { user } = renderPeriod();

    await confirmDelete(user);
    await screen.findByText('Deleting September 2026 (1 of 2)');
    await user.click(screen.getByRole('button', { name: 'Stop' }));

    expect(screen.getByRole('button', { name: 'Stop' })).toBeDisabled();

    september.resolve(counts({ events: 1 }));

    expect(
      await screen.findByText('Deletion stopped. Data after September 2026 was not deleted.'),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Retry' })).not.toBeInTheDocument();
    expect(postMock).toHaveBeenCalledTimes(1);
  });

  test('offers retry after a failed month', async () => {
    getMock.mockResolvedValue(counts({ events: 5 }));
    postMock
      .mockRejectedValueOnce(new Error('Request timed out'))
      .mockResolvedValueOnce(counts({ events: 5 }))
      .mockResolvedValueOnce(counts({ events: 1 }));
    const { user } = renderPeriod();

    await confirmDelete(user);

    expect(
      await screen.findByText(
        'Failed to delete data for September 2026. Earlier months were deleted.',
      ),
    ).toBeInTheDocument();
    expect(screen.getByText('Request timed out')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Retry' }));

    expect(await screen.findByText('Data deleted: 6 events, 0 sessions.')).toBeInTheDocument();
    expect(postMock).toHaveBeenCalledTimes(3);
  });
});
