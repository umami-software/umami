import { Icon, MenuItem, Row, Text } from '@umami/react-zen';
import { expect, test, vi } from 'vitest';
import { Edit } from '@/components/icons';
import { render, screen } from '@/test/render';
import { MenuButton } from './MenuButton';

test('preserves child menu item actions while still notifying the parent handler', async () => {
  const onChildAction = vi.fn();
  const onMenuAction = vi.fn();
  const { user } = render(
    <MenuButton onAction={onMenuAction}>
      <MenuItem id="edit" onAction={onChildAction}>
        <Row alignItems="center" gap>
          <Icon>
            <Edit />
          </Icon>
          <Text>Edit</Text>
        </Row>
      </MenuItem>
    </MenuButton>,
  );

  const button = screen.getByRole('button');

  button.focus();
  await user.keyboard('{Enter}');
  await user.click(screen.getByRole('menuitem', { name: 'Edit' }));

  expect(onChildAction).toHaveBeenCalledWith('edit');
  expect(onMenuAction).toHaveBeenCalledWith('edit');
});
