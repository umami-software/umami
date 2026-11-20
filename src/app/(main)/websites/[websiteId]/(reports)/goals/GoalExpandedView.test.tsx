import { screen, within } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { render } from '@/test/render';
import { GoalMaximizeButton } from './GoalExpandedView';

vi.mock('@/components/charts/Chart', () => ({ Chart: () => null }));

// Card values animate from 0, so skip the animation to read the final values.
vi.mock('@/components/hooks/useReducedMotion', () => ({ useReducedMotion: () => true }));

vi.mock('@/components/hooks', async importOriginal => {
  const actual = await importOriginal<typeof import('@/components/hooks')>();

  return {
    ...actual,
    useGoalSummaryQuery: () => ({ data: { completions: 420, median: 71 } }),
    useGoalChartQuery: () => ({ data: [], isLoading: false, error: null }),
    useGoalBreakdownQuery: () => ({
      data: [
        { name: 'desktop', visitors: 800, converted: 200 },
        { name: 'mobile', visitors: 1000, converted: 5 },
      ],
      isLoading: false,
      error: null,
    }),
  };
});

const renderGoal = () =>
  render(
    <GoalMaximizeButton
      websiteId="website-1"
      id="goal-1"
      name="Signups"
      type="event"
      value="signup"
      data={{ num: 300, total: 1200 }}
    />,
  );

describe('GoalMaximizeButton', () => {
  // The cards must match the normal goal view: 300 of 1200 is 25%.
  test('opens a full-screen goal with the same conversion as the normal view', async () => {
    const { user } = renderGoal();

    await user.click(screen.getByRole('button'));

    const dialog = await screen.findByRole('dialog', { name: 'Signups' });

    expect(within(dialog).getByText('signup')).toBeInTheDocument();
    expect(within(dialog).getAllByText('25%')).toHaveLength(2);
    expect(within(dialog).getByText('1.20k → 300')).toBeInTheDocument();
    // 420 completions by 300 converted visitors.
    expect(within(dialog).getByText('420')).toBeInTheDocument();
    expect(within(dialog).getByText('1.4 per visitor')).toBeInTheDocument();
    expect(within(dialog).getByText('1m 11s')).toBeInTheDocument();

    await user.click(within(dialog).getByRole('button', { name: 'Close' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  // Breakdown is the default tab, and small rates keep a decimal so they don't read as 0%.
  test('breaks conversion down by session attribute', async () => {
    const { user } = renderGoal();

    await user.click(screen.getByRole('button'));

    const dialog = await screen.findByRole('dialog', { name: 'Signups' });

    expect(within(dialog).getByRole('tab', { name: 'Breakdown' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(
      within(within(dialog).getByRole('tabpanel'))
        .getAllByText(/^[\d.]+%$/)
        .map(el => el.textContent),
    ).toEqual(['25%', '0.5%']);
  });
});
