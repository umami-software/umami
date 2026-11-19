import { describe, expect, test, vi } from 'vitest';
import { ROLES } from '@/lib/constants';
import { render, screen } from '@/test/render';
import { AdminTeamsTable } from './AdminTeamsTable';

vi.mock('@/components/hooks', () => ({
  useMessages: () => ({
    t: (value: string) => value,
    labels: {
      name: 'Name',
      members: 'Members',
      websites: 'Websites',
      owner: 'Owner',
      created: 'Created',
    },
  }),
}));

vi.mock('@/components/common/DateDistance', () => ({
  DateDistance: () => null,
}));

vi.mock('@/components/common/SortableLabel', () => ({
  SortableLabel: ({ label }: { label: string }) => label,
}));

vi.mock('../../teams/[teamId]/TeamDeleteForm', () => ({
  TeamDeleteForm: () => null,
}));

function createMember(id: string, username: string, role: string) {
  return { role, user: { id, username } };
}

describe('AdminTeamsTable', () => {
  test('shows the member with the team owner role as owner, regardless of member order', () => {
    render(
      <AdminTeamsTable
        showActions={false}
        data={[
          {
            id: 'team-1',
            name: 'Team',
            createdAt: '2026-01-01T00:00:00.000Z',
            _count: { members: 3, websites: 1 },
            members: [
              createMember('user-1', 'member', ROLES.teamMember),
              createMember('user-2', 'manager', ROLES.teamManager),
              createMember('user-3', 'owner', ROLES.teamOwner),
            ],
          },
        ]}
      />,
    );

    expect(screen.getByRole('link', { name: 'owner' })).toHaveAttribute(
      'href',
      '/admin/users/user-3',
    );
    expect(screen.queryByRole('link', { name: 'member' })).not.toBeInTheDocument();
  });
});
