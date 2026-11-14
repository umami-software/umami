import { type DataTableProps, Row } from '@umami/react-zen';
import { ShareDeleteButton } from '@/app/(main)/websites/[websiteId]/settings/ShareDeleteButton';
import { SharedSharesTable } from '@/components/share/SharedSharesTable';
import { SimpleShareEditButton } from '@/components/share/SimpleShareEditButton';

export function BoardSharesTable(props: DataTableProps) {
  return (
    <SharedSharesTable
      data={props.data as any[]}
      renderActions={({ id, slug }) => (
        <Row>
          <SimpleShareEditButton shareId={id} />
          <ShareDeleteButton shareId={id} slug={slug} />
        </Row>
      )}
    />
  );
}
