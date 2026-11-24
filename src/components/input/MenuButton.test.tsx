import { DropdownMenuItem, Icon, Row, Text } from '@umami/react-zen';
import { expect, test, vi } from 'vitest';
import { Edit } from '@/components/icons';
import { render, screen } from '@/test/render';
import { MenuButton } from './MenuButton';

test('opens the menu and runs the chosen item', async () => {
  const onEdit = vi.fn();
  const { user } = render(
    <MenuButton>
      <DropdownMenuItem onClick={onEdit}>
        <Row alignItems="center" gap>
          <Icon>
            <Edit />
          </Icon>
          <Text>Edit</Text>
        </Row>
      </DropdownMenuItem>
    </MenuButton>,
  );

  await user.click(screen.getByRole('button', { name: 'menu' }));
  await user.click(await screen.findByRole('menuitem', { name: 'Edit' }));

  expect(onEdit).toHaveBeenCalledTimes(1);
});
