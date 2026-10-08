import { describe, expect, test } from 'vitest';
import { render } from '@/test/render';
import { useWebsiteNavItems } from './useWebsiteNavItems';

function NavItemIds() {
  const { items } = useWebsiteNavItems('website-1');

  return (
    <div data-test="ids">
      {items.flatMap(section => section.items.map(item => item.id)).join(',')}
    </div>
  );
}

describe('useWebsiteNavItems', () => {
  test('includes commerce when the commerce flag is on', () => {
    const { getByTestId } = render(<NavItemIds />, { flags: { commerce: true } });

    expect(getByTestId('ids').textContent.split(',')).toContain('commerce');
  });

  test('omits commerce when the commerce flag is off', () => {
    const { getByTestId } = render(<NavItemIds />, { flags: { commerce: false } });
    const ids = getByTestId('ids').textContent.split(',');

    expect(ids).not.toContain('commerce');
    expect(ids).toContain('revenue');
  });
});
