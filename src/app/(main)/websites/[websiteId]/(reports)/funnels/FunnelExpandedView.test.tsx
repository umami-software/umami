import { screen, within } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import type { FunnelResult } from '@/queries/sql/funnels/getFunnel';
import { render } from '@/test/render';
import { FunnelMaximizeButton, getBottleneckIndex } from './FunnelExpandedView';

vi.mock('@/components/charts/Chart', () => ({ Chart: () => null }));

vi.mock('@/components/hooks', async importOriginal => {
  const actual = await importOriginal<typeof import('@/components/hooks')>();

  return {
    ...actual,
    useFunnelTimesQuery: () => ({ data: { total: 104, steps: [null, 19, 71, 300] } }),
    useFunnelChartQuery: () => ({ data: [], isLoading: false, error: null }),
    useFunnelBreakdownQuery: () => ({
      data: [{ name: 'mobile', visitors: [1000, 500, 300, 100] }],
      isLoading: false,
      error: null,
    }),
  };
});

const funnel = (counts: number[]): FunnelResult[] =>
  counts.map((visitors, i) => {
    const previous = i > 0 ? counts[i - 1] : 0;

    return {
      type: 'path',
      value: `/step-${i + 1}`,
      visitors,
      previous,
      dropped: previous > 0 ? previous - visitors : 0,
      dropoff: 1 - visitors / previous,
      remaining: visitors / counts[0],
    };
  });

// 1240 -> 893 loses 347 (28%), 893 -> 632 loses 261 (29%), 632 -> 347 loses 285 (45%).
const data = funnel([1240, 893, 632, 347]);

describe('getBottleneckIndex', () => {
  // A step that loses fewer visitors but a larger share of them is the bottleneck.
  test('picks the largest drop-off by share, not by visitor count', () => {
    expect(getBottleneckIndex(data)).toBe(3);
  });

  test('reports no bottleneck when no step loses visitors', () => {
    expect(getBottleneckIndex(funnel([100, 100, 100]))).toBe(-1);
  });

  test('ignores steps after an empty step, where drop-off is undefined', () => {
    expect(getBottleneckIndex(funnel([100, 0, 0]))).toBe(1);
  });
});

describe('FunnelMaximizeButton', () => {
  test('opens a full-screen funnel that switches between % of first and % of previous step', async () => {
    const { user } = render(
      <FunnelMaximizeButton websiteId="website-1" id="funnel-1" name="Checkout" data={data} />,
    );

    await user.click(screen.getByRole('button'));

    const dialog = await screen.findByRole('dialog', { name: 'Checkout' });
    const percents = () =>
      within(dialog)
        .getAllByText(/^\d+%$/)
        .map(el => el.textContent);

    expect(within(dialog).getByText('Biggest drop-off')).toBeInTheDocument();
    expect(percents()).toEqual(expect.arrayContaining(['100%', '72%', '51%', '28%']));

    await user.click(within(dialog).getByText('From previous step'));

    expect(percents()).toEqual(expect.arrayContaining(['100%', '72%', '71%', '55%']));
    expect(percents()).not.toContain('51%');

    await user.click(within(dialog).getByRole('button', { name: 'Close' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  // Step times sit between the steps they connect, and the breakdown follows the percent mode.
  test('shows time between steps and a breakdown that follows the percent mode', async () => {
    const { user } = render(
      <FunnelMaximizeButton websiteId="website-1" id="funnel-1" name="Checkout" data={data} />,
    );

    await user.click(screen.getByRole('button'));

    const dialog = await screen.findByRole('dialog', { name: 'Checkout' });

    expect(within(dialog).getByText('19s')).toBeInTheDocument();
    expect(within(dialog).getByText('1m 11s')).toBeInTheDocument();
    expect(within(dialog).getByText('5m')).toBeInTheDocument();

    // Breakdown is the default tab: it explains who drops off, which is the next question.
    expect(within(dialog).getByRole('tab', { name: 'Breakdown' })).toHaveAttribute(
      'aria-selected',
      'true',
    );

    const table = () => within(dialog).getByRole('tabpanel');

    // mobile: 1000 -> 500 -> 300 -> 100, measured against the 100% first step.
    expect(
      within(table())
        .getAllByText(/^\d+%$/)
        .map(el => el.textContent),
    ).toEqual(['100%', '50%', '30%', '10%', '10%']);

    await user.click(within(dialog).getByText('From previous step'));

    // 500 of 1000, 300 of 500, 100 of 300; overall conversion stays 10%.
    expect(
      within(table())
        .getAllByText(/^\d+%$/)
        .map(el => el.textContent),
    ).toEqual(['100%', '50%', '60%', '33%', '10%']);
  });

  // Two steps make both percent modes equal and the bottleneck trivial.
  test('hides the percent toggle and bottleneck for a two-step funnel', async () => {
    const { user } = render(
      <FunnelMaximizeButton
        websiteId="website-1"
        id="funnel-1"
        name="Signup"
        data={funnel([1240, 893])}
      />,
    );

    await user.click(screen.getByRole('button'));

    const dialog = await screen.findByRole('dialog', { name: 'Signup' });

    expect(within(dialog).getAllByText('72%').length).toBeGreaterThan(0);
    expect(within(dialog).queryByText('From previous step')).not.toBeInTheDocument();
    expect(within(dialog).queryByText('Biggest drop-off')).not.toBeInTheDocument();
  });
});
