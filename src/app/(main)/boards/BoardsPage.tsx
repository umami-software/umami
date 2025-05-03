import { Column } from '@umami/react-zen';
import Link from 'next/link';
import { PageHeader } from '@/components/common/PageHeader';

export function BoardsPage() {
  return (
    <Column>
      <PageHeader title="My Boards" />
      <Link href="/teams/3a97e34a-7f9d-4de2-8754-ed81714b528d/boards/86d4095c-a2a8-4fc8-9521-103e858e2b41">
        Board 1
      </Link>
    </Column>
  );
}
