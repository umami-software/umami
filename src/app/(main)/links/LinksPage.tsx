'use client';
import { PageBody } from '@/components/common/PageBody';
import { Column } from '@umami/react-zen';
import { PageHeader } from '@/components/common/PageHeader';
import { BoardAddButton } from '@/app/(main)/boards/BoardAddButton';
import Link from 'next/link';
import { useMessages } from '@/components/hooks';

export function LinksPage() {
  const { formatMessage, labels } = useMessages();

  return (
    <PageBody>
      <Column>
        <PageHeader title={formatMessage(labels.links)}>
          <BoardAddButton />
        </PageHeader>
        <Link href="/teams/3a97e34a-7f9d-4de2-8754-ed81714b528d/boards/86d4095c-a2a8-4fc8-9521-103e858e2b41">
          Board 1
        </Link>
      </Column>
    </PageBody>
  );
}
